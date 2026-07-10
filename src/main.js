import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import scrollama from 'scrollama';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initChartPanel, renderChart } from './components/chart-panel.js';
import { initWorkTabs } from './components/work-tabs.js';
import FinancialFlowsModule from './modules/financial-flows.js';
import RealEstateModule from './modules/real-estate.js';
import LaborMarketsModule from './modules/labor-markets.js';
import RiskIndexModule from './modules/risk-index.js';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Map init ──────────────────────────────────────────── */

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const CHAPTER_VIEW = {
  'financial-flows': { center: [-96, 38],   zoom: 3.4, pitch: 0,  bearing: 0   },
  'real-estate':     { center: [-110, 36],  zoom: 4.2, pitch: 45, bearing: -8  },
  'labor-markets':   { center: [-96, 38],   zoom: 3.6, pitch: 28, bearing: 5   },
  'risk-index':      { center: [-96, 38],   zoom: 3.5, pitch: 40, bearing: -5  },
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-96, 38],
  zoom: 3.4,
  pitch: 0,
  bearing: 0,
  antialias: true,
  interactive: false,
});

const overlay = new MapboxOverlay({ layers: [] });
map.addControl(overlay);

/* ── Modules ───────────────────────────────────────────── */

const MODULES = {
  'financial-flows': new FinancialFlowsModule(),
  'real-estate':     new RealEstateModule(),
  'labor-markets':   new LaborMarketsModule(),
  'risk-index':      new RiskIndexModule(),
};

const MODULE_ORDER = ['financial-flows', 'real-estate', 'labor-markets', 'risk-index'];
let currentModuleId = null;

/* ── UI helpers ────────────────────────────────────────── */

const loading = document.getElementById('loading');

function showLoading() { loading.classList.add('visible'); }
function hideLoading() { loading.classList.remove('visible'); }

function updateChapterStats(moduleId, module) {
  const card = document.querySelector(`.chapter-card[data-chapter="${moduleId}"] .chapter-stats`);
  if (!card) return;
  const stats = module.getStats();
  if (!stats?.cards?.length) { card.innerHTML = ''; return; }
  card.innerHTML = stats.cards.map(c => `
    <div class="chapter-stat-row">
      <span class="chapter-stat-label">${c.label}</span>
      <span class="chapter-stat-value chapter-stat-value--${c.accent || 'cyan'}">${c.value}</span>
    </div>
  `).join('');
}

function setActiveChapter(moduleId) {
  document.querySelectorAll('.chapter-card').forEach(el => el.classList.remove('active'));
  const card = document.querySelector(`.chapter-card[data-chapter="${moduleId}"]`);
  if (card) card.classList.add('active');

  document.querySelectorAll('.progress-dot').forEach(el => {
    el.classList.toggle('active', el.dataset.chapter === moduleId);
  });
}

async function activateModule(id) {
  if (id === currentModuleId) return;

  const prev = MODULES[currentModuleId];
  if (prev?.deactivate) prev.deactivate();

  currentModuleId = id;

  const module = MODULES[id];
  if (!module) return;

  setActiveChapter(id);

  showLoading();
  try {
    await module.load();
    overlay.setProps({ layers: module.getLayers() });
    if (module.activate) module.activate();
    updateChapterStats(id, module);
    renderChart(module.getChartConfig());
    const view = CHAPTER_VIEW[id];
    if (view) map.flyTo({ ...view, duration: 1400, essential: true });
  } catch (err) {
    console.error(`Module "${id}" failed to load:`, err);
  } finally {
    hideLoading();
  }
}

/* ── Map ready: start scroll logic ─────────────────────── */

map.on('load', () => {
  initChartPanel(document.getElementById('chart-panel'));

  Object.values(MODULES).forEach(m => { if (m.bindMap) m.bindMap(map); });

  /* First chapter loads silently on map ready */
  activateModule('financial-flows');

  /* Scrollama — chapter spacers drive map transitions */
  const scroller = scrollama();
  scroller
    .setup({ step: '.chapter-spacer', offset: 0.45, debug: false })
    .onStepEnter(({ element }) => {
      activateModule(element.dataset.module);
    });

  window.addEventListener('resize', scroller.resize);
});

/* ── Re-render on real-estate click ────────────────────── */

window.addEventListener('re-module-update', () => {
  const module = MODULES[currentModuleId];
  if (!module) return;
  overlay.setProps({ layers: module.getLayers() });
  renderChart(module.getChartConfig());
});

/* ── GSAP hero entrance ─────────────────────────────────── */

const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
heroTl
  .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
  .to('.hero-title',   { opacity: 1, y: 0, duration: 1.0 }, '-=0.5')
  .to('.hero-subtitle',{ opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
  .to('.hero-cta',     { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
  .to('.hero-tools',   { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

/* ── GSAP proof strip count-up ──────────────────────────── */

ScrollTrigger.create({
  trigger: '#proof-strip',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    document.querySelectorAll('.proof-number').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      gsap.fromTo(el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate() {
            const val = Math.round(parseFloat(this.targets()[0].innerText));
            el.textContent = val.toLocaleString() + suffix;
          },
          onComplete() {
            el.textContent = target.toLocaleString() + suffix;
          }
        }
      );
    });
  }
});

/* ── GSAP work cards stagger ────────────────────────────── */

gsap.from('.work-card', {
  scrollTrigger: { trigger: '#featured-work', start: 'top 75%', once: true },
  opacity: 0,
  y: 32,
  duration: 0.7,
  stagger: 0.12,
  ease: 'power3.out',
});

/* ── Featured work tabs ─────────────────────────────────── */

initWorkTabs();

/* ── GSAP skill cards stagger ───────────────────────────── */

gsap.from('.skill-card', {
  scrollTrigger: { trigger: '#skills', start: 'top 80%', once: true },
  opacity: 0,
  y: 24,
  duration: 0.6,
  stagger: 0.1,
  ease: 'power2.out',
});

/* ── GSAP map intro ─────────────────────────────────────── */

gsap.from('.map-intro-inner > *', {
  scrollTrigger: { trigger: '#map-intro', start: 'top 80%', once: true },
  opacity: 0,
  y: 20,
  duration: 0.7,
  stagger: 0.15,
  ease: 'power2.out',
});
