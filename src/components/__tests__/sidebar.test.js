import { describe, it, expect, beforeEach, vi } from 'vitest';

// jsdom is the environment — we can manipulate the DOM
document.body.innerHTML = '<aside id="sidebar"></aside>';

const { initSidebar, setActiveModule, getActiveModule } = await import('../sidebar.js');

describe('sidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = '<aside id="sidebar"></aside>';
    vi.resetModules();
  });

  it('renders a button for each module id', async () => {
    const { initSidebar } = await import('../sidebar.js');
    initSidebar(['financial-flows', 'risk-index'], vi.fn());
    const buttons = document.querySelectorAll('.sidebar-btn');
    expect(buttons.length).toBe(2);
  });

  it('calls onActivate with the module id when a button is clicked', async () => {
    const { initSidebar } = await import('../sidebar.js');
    const onActivate = vi.fn();
    initSidebar(['financial-flows'], onActivate);
    document.querySelector('[data-module="financial-flows"]').click();
    expect(onActivate).toHaveBeenCalledWith('financial-flows');
  });

  it('sets active class on the correct button', async () => {
    const { initSidebar, setActiveModule } = await import('../sidebar.js');
    initSidebar(['financial-flows', 'risk-index'], vi.fn());
    setActiveModule('risk-index');
    const active = document.querySelectorAll('.sidebar-btn--active');
    expect(active.length).toBe(1);
    expect(active[0].dataset.module).toBe('risk-index');
  });

  it('getActiveModule returns the last activated id', async () => {
    const { initSidebar, setActiveModule, getActiveModule } = await import('../sidebar.js');
    initSidebar(['financial-flows', 'risk-index'], vi.fn());
    setActiveModule('risk-index');
    expect(getActiveModule()).toBe('risk-index');
  });
});
