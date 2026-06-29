let _container = null;

export function initStatCards(el) {
  _container = el;
}

export function updateStatCards({ cards }) {
  if (!_container) return;
  _container.innerHTML = cards.map(card => `
    <div class="stat-card glass-panel">
      <div class="stat-label">${card.label}</div>
      <div class="stat-value stat-value--${card.accent}">${card.value}</div>
    </div>
  `).join('');
}
