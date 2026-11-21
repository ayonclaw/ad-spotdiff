document.addEventListener('DOMContentLoaded', function mountHuntHud() {
  const body = document.body;
  if (!body) return;
  const remaining = document.querySelector('#remaining, .remaining');
  const penalties = document.querySelector('#penalties, .penalties');
  const victory = document.querySelector('#win, .win-screen');
  const host = document.querySelector('#hud, .hud, .toolbar') || createBar();
  const timer = findReadout('#elapsed, .elapsed', 'hunt-elapsed');
  const counter = findReadout('#hunt-counts, .hunt-counts', 'hunt-counts');
  const initialTotal = readNumber(remaining, 0);
  const state = { found: 0, total: initialTotal, penalties: 0, start: null, elapsed: 0, won: false };

  function createBar() {
    const bar = document.createElement('aside');
    bar.id = 'hud';
    bar.setAttribute('aria-label', 'Hunt progress');
    bar.style.cssText = 'display:flex;gap:1rem;padding:.6rem;flex-wrap:wrap';
    body.append(bar);
    return bar;
  }
  function findReadout(selector, id) {
    const existing = document.querySelector(selector);
    if (existing) return existing;
    const span = document.createElement('span');
    span.id = id;
    host.append(span);
    return span;
  }
  function readNumber(element, fallback) {
    const match = element?.textContent.match(/\d+/);
    return match ? Number(match[0]) : fallback;
  }
  function renderHud() {
    const elapsed = state.elapsed + (state.start === null ? 0 : performance.now() - state.start);
    timer.textContent = `Time ${Math.floor(elapsed / 1000)}s · R to reset`;
    counter.textContent = `${state.found}/${state.total} found · ${state.penalties} penalties`;
  }
  function beginTimer() {
    if (!state.won && state.start === null) state.start = performance.now();
    renderHud();
  }
  function pauseOnWin() {
    if (state.start !== null) state.elapsed += performance.now() - state.start;
    state.start = null;
    state.won = true;
    renderHud();
  }
  function resetHud() {
    Object.assign(state, { found: 0, penalties: 0, start: null, elapsed: 0, won: false });
    renderHud();
  }
  function receiveCounts(event) {
    if (!event.detail || typeof event.detail !== 'object') return;
    for (const key of ['found', 'total', 'penalties']) {
      const value = event.detail[key];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) state[key] = value;
    }
    renderHud();
  }
  function syncGameStatus() {
    if (remaining) state.found = Math.max(0, state.total - readNumber(remaining, state.total));
    if (penalties) state.penalties = readNumber(penalties, state.penalties);
    if (body.matches('.won, .win, .hunt-won, .game-won') || (victory && !victory.hidden)) pauseOnWin();
    else renderHud();
  }
  function handleKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (event.target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || '')) return;
    if (event.key.toLowerCase() === 'r') resetHud();
    else beginTimer();
  }
  function handleClick(event) {
    if (event.target?.closest?.('#restart, #again')) resetHud();
    beginTimer();
  }
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKey);
  document.addEventListener('hunt:found', receiveCounts);
  document.addEventListener('hunt:penalty', receiveCounts);
  document.addEventListener('hunt:win', pauseOnWin);
  const observer = new MutationObserver(syncGameStatus);
  for (const element of [remaining, penalties]) {
    if (element) observer.observe(element, { childList: true, characterData: true, subtree: true });
  }
  observer.observe(body, { attributes: true, attributeFilter: ['class'] });
  if (victory) observer.observe(victory, { attributes: true, attributeFilter: ['hidden'] });
  setInterval(renderHud, 250);
  syncGameStatus();
});
