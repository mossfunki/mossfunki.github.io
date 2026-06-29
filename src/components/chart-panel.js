import * as d3 from 'd3';

let _container = null;
let _svg = null;
let _title = null;
const W = 268;
const H = 180;

export function initChartPanel(el) {
  _container = el;
  el.classList.add('glass-panel');
  el.innerHTML = `<div class="chart-title"></div><svg width="${W}" height="${H}"></svg>`;
  _title = el.querySelector('.chart-title');
  _svg = d3.select(el.querySelector('svg'));
}

export function renderChart(config) {
  if (!_svg || !config) return;
  _title.textContent = config.title;
  _svg.selectAll('*').remove();

  switch (config.type) {
    case 'bar':     _renderBar(config);     break;
    case 'line':    _renderLine(config);    break;
    case 'scatter': _renderScatter(config); break;
    case 'donut':   _renderDonut(config);   break;
  }
}

function _renderBar({ data }) {
  // data: Array<{ name: string, value: number }>
  const m = { top: 8, right: 16, bottom: 8, left: 72 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;
  const g = _svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const extent = d3.extent(data, d => d.value);
  const x = d3.scaleLinear().domain([Math.min(0, extent[0]), Math.max(0, extent[1])]).range([0, w]);
  const y = d3.scaleBand().domain(data.map(d => d.name)).range([0, h]).padding(0.25);

  g.selectAll('rect').data(data).join('rect')
    .attr('y', d => y(d.name))
    .attr('height', y.bandwidth())
    .attr('x', d => d.value < 0 ? x(d.value) : x(0))
    .attr('width', d => Math.abs(x(d.value) - x(0)))
    .attr('fill', d => d.value >= 0 ? 'var(--accent-cyan)' : 'var(--accent-amber)')
    .attr('rx', 2);

  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', h)
    .attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1);

  g.append('g').call(d3.axisLeft(y).tickSize(0).tickPadding(6))
    .select('.domain').remove();
}

function _renderLine({ data }) {
  // data: Array<{ date: Date, value: number }>
  if (!data.length) return;
  const m = { top: 8, right: 16, bottom: 24, left: 44 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;
  const g = _svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, w]);
  const yExtent = d3.extent(data, d => d.value);
  const y = d3.scaleLinear().domain([yExtent[0] * 0.95, yExtent[1] * 1.05]).range([h, 0]);

  g.append('path').datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'var(--accent-cyan)')
    .attr('stroke-width', 2)
    .attr('d', d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX));

  // Area fill
  g.append('path').datum(data)
    .attr('fill', 'url(#line-grad)')
    .attr('d', d3.area().x(d => x(d.date)).y0(h).y1(d => y(d.value)).curve(d3.curveMonotoneX));

  const defs = _svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', 'line-grad').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
  grad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--accent-cyan)').attr('stop-opacity', 0.2);
  grad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--accent-cyan)').attr('stop-opacity', 0);

  g.append('g').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%b %y')));
  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${(d / 1000).toFixed(0)}k`));
  g.selectAll('.domain').remove();
}

function _renderScatter({ data }) {
  // data: Array<{ name: string, wage: number, col: number, gigShare: number }>
  if (!data.length) return;
  const m = { top: 8, right: 16, bottom: 24, left: 44 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;
  const g = _svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.col)).nice().range([0, w]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.wage)).nice().range([h, 0]);
  const color = d3.scaleSequential(d3.interpolateCool).domain([0, 1]);

  g.selectAll('circle').data(data).join('circle')
    .attr('cx', d => x(d.col))
    .attr('cy', d => y(d.wage))
    .attr('r', 4)
    .attr('fill', d => color(d.gigShare))
    .attr('opacity', 0.75);

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(4));
  g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${(d / 1000).toFixed(0)}k`));
  g.selectAll('.domain').remove();
}

function _renderDonut({ data }) {
  // data: Array<{ label: string, count: number, color: string }>
  const radius = Math.min(W, H) / 2 - 24;
  const g = _svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`);

  const pie = d3.pie().value(d => d.count).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

  g.selectAll('path').data(pie(data)).join('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', 'var(--bg)')
    .attr('stroke-width', 2);

  // Labels on large slices
  g.selectAll('text').data(pie(data)).join('text')
    .filter(d => (d.endAngle - d.startAngle) > 0.5)
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', 'rgba(255,255,255,0.7)')
    .text(d => d.data.label);
}
