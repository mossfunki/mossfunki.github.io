import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { initSidebar, setActiveModule } from './components/sidebar.js';
import { initStatCards, updateStatCards } from './components/stat-cards.js';
import { initChartPanel, renderChart } from './components/chart-panel.js';
import FinancialFlowsModule from './modules/financial-flows.js';
import RealEstateModule from './modules/real-estate.js';
import LaborMarketsModule from './modules/labor-markets.js';
import RiskIndexModule from './modules/risk-index.js';
import './style.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW = { center: [-98.35, 39.5], zoom: 4, pitch: 0, bearing: 0 };

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  ...INITIAL_VIEW,
  antialias: true
});

const overlay = new MapboxOverlay({ layers: [] });
map.addControl(overlay);

const MODULES = {
  'financial-flows': new FinancialFlowsModule(),
  'real-estate':     new RealEstateModule(),
  'labor-markets':   new LaborMarketsModule(),
  'risk-index':      new RiskIndexModule()
};

const MODULE_ORDER = ['financial-flows', 'real-estate', 'labor-markets', 'risk-index'];
let currentModuleId = null;

const loading = document.createElement('div');
loading.id = 'loading';
loading.textContent = 'Loading…';
document.getElementById('main').appendChild(loading);

async function activateModule(id) {
  const module = MODULES[id];
  if (!module) return;
  currentModuleId = id;
  setActiveModule(id);
  loading.classList.add('visible');
  try {
    await module.load();
    overlay.setProps({ layers: module.getLayers() });
    updateStatCards(module.getStats());
    renderChart(module.getChartConfig());
    if (module.viewState) {
      map.easeTo({ ...module.viewState, duration: 800 });
    }
  } catch (err) {
    console.error(`Module "${id}" failed to load:`, err);
  } finally {
    loading.classList.remove('visible');
  }
}

window.addEventListener('re-module-update', () => {
  const module = MODULES[currentModuleId];
  if (module) {
    overlay.setProps({ layers: module.getLayers() });
    renderChart(module.getChartConfig());
  }
});

map.on('load', () => {
  initSidebar(MODULE_ORDER, activateModule);
  initStatCards(document.getElementById('stat-cards'));
  initChartPanel(document.getElementById('chart-panel'));
  activateModule('financial-flows');
});
