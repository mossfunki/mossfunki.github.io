const MODULE_LABELS = {
  'financial-flows': 'Financial Flows',
  'real-estate':     'Real Estate',
  'labor-markets':   'Labor Markets',
  'risk-index':      'Risk Index'
};

let _onActivate = null;
let _activeId = null;

export function initSidebar(moduleIds, onActivate) {
  _onActivate = onActivate;
  const aside = document.getElementById('sidebar');
  aside.innerHTML = `
    <div class="sidebar-brand">Benjamin Lab</div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">Analysis Modules</div>
      ${moduleIds.map(id => `
        <button class="sidebar-btn" data-module="${id}">
          ${MODULE_LABELS[id] || id}
        </button>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
      <a href="archive/Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a>
    </div>
  `;
  aside.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_onActivate) _onActivate(btn.dataset.module);
    });
  });
}

export function setActiveModule(id) {
  _activeId = id;
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.classList.toggle('sidebar-btn--active', btn.dataset.module === id);
  });
}

export function getActiveModule() {
  return _activeId;
}
