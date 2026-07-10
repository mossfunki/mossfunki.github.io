import { describe, it, expect, beforeEach, vi } from 'vitest';

function markup() {
  return `
    <div class="work-tabs" id="work-tabs"></div>
    <div class="work-grid">
      <div class="work-card" data-categories="gis,economics" data-testid="tod"></div>
      <div class="work-card" data-categories="logistics" data-testid="hydrogen"></div>
      <div class="work-card" data-categories="economics" data-testid="demand"></div>
    </div>
  `;
}

describe('work-tabs', () => {
  beforeEach(() => {
    document.body.innerHTML = markup();
    vi.resetModules();
  });

  it('renders one button per category plus All, with All active by default', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    const buttons = document.querySelectorAll('.work-tab-btn');
    expect(buttons.length).toBe(4);
    expect(document.querySelector('.work-tab-btn--active').dataset.category).toBe('all');
  });

  it('shows all cards when "all" is active', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    document.querySelectorAll('.work-card').forEach(card => {
      expect(card.style.display).not.toBe('none');
    });
  });

  it('filters cards by category on tab click', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    document.querySelector('[data-category="gis"]').click();
    expect(document.querySelector('[data-testid="tod"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-testid="hydrogen"]').style.display).toBe('none');
    expect(document.querySelector('[data-testid="demand"]').style.display).toBe('none');
  });

  it('a card with multiple categories appears under each of its tabs', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    document.querySelector('[data-category="economics"]').click();
    expect(document.querySelector('[data-testid="tod"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-testid="demand"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-testid="hydrogen"]').style.display).toBe('none');
  });

  it('getActiveTab returns the current category and updates on click', async () => {
    const { initWorkTabs, getActiveTab } = await import('../work-tabs.js');
    initWorkTabs();
    expect(getActiveTab()).toBe('all');
    document.querySelector('[data-category="logistics"]').click();
    expect(getActiveTab()).toBe('logistics');
  });

  it('gives every tab button role="tab"', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    const buttons = document.querySelectorAll('.work-tab-btn');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(btn => {
      expect(btn.getAttribute('role')).toBe('tab');
    });
  });

  it('sets aria-selected="true" on the initially-active "All" tab and "false" on the rest', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    expect(document.querySelector('[data-category="all"]').getAttribute('aria-selected')).toBe('true');
    ['logistics', 'gis', 'economics'].forEach(category => {
      expect(document.querySelector(`[data-category="${category}"]`).getAttribute('aria-selected')).toBe('false');
    });
  });

  it('flips aria-selected between the previously-active and newly-active tab on setActiveTab', async () => {
    const { initWorkTabs, setActiveTab } = await import('../work-tabs.js');
    initWorkTabs();
    setActiveTab('gis');
    expect(document.querySelector('[data-category="all"]').getAttribute('aria-selected')).toBe('false');
    expect(document.querySelector('[data-category="gis"]').getAttribute('aria-selected')).toBe('true');
  });
});
