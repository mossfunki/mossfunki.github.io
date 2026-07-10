const CATEGORY_LABELS = {
  all: 'All',
  logistics: 'Logistics & Supply Chain',
  gis: 'GIS & Spatial Analysis',
  economics: 'Economics & Analytics',
};

const CATEGORY_ORDER = ['all', 'logistics', 'gis', 'economics'];

let activeCategory = null;

export function initWorkTabs() {
  const tabBar = document.getElementById('work-tabs');
  if (!tabBar) return;

  tabBar.innerHTML = '';
  CATEGORY_ORDER.forEach(category => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'work-tab-btn';
    btn.dataset.category = category;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = CATEGORY_LABELS[category];
    btn.addEventListener('click', () => setActiveTab(category));
    tabBar.appendChild(btn);
  });

  setActiveTab('all');
}

export function setActiveTab(category) {
  const tabBar = document.getElementById('work-tabs');
  if (!tabBar) return;

  activeCategory = category;

  tabBar.querySelectorAll('.work-tab-btn').forEach(btn => {
    const isActive = btn.dataset.category === category;
    btn.classList.toggle('work-tab-btn--active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('.work-card').forEach(card => {
    const cardCategories = (card.dataset.categories || '').split(',').map(s => s.trim());
    const visible = category === 'all' || cardCategories.includes(category);
    card.style.display = visible ? '' : 'none';
  });
}

export function getActiveTab() {
  return activeCategory;
}
