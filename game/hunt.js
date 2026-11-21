document.addEventListener('DOMContentLoaded', () => {
  const byId = id => document.getElementById(id);
  const view = {
    remaining: byId('remaining'),
    penalties: byId('penalties'),
    status: byId('status'),
    intro: byId('intro'),
    win: byId('win'),
    result: byId('result')
  };
  const panels = ['left', 'right'].map(id => {
    const element = byId(id);
    return element ? {
      element,
      marks: element.querySelector('.marks'),
      cursor: element.querySelector('.cursor'),
      x: 250,
      y: 250
    } : null;
  }).filter(Boolean);
  if (!panels.length) return;

  // These centers are the five changed regions declared by scene.js.
  const differences = [
    { x: 405, y: 85, name: 'The moon dial' },
    { x: 117, y: 250, name: 'The hanging bloom' },
    { x: 268, y: 337, name: 'The watering can' },
    { x: 414, y: 391, name: 'The pot emblem' },
    { x: 80, y: 439, name: 'The fallen leaf' }
  ];
  const round = { found: new Set(), penalties: 0, started: 0, active: false };
  let selected = panels[0];
  const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const score = () => Math.max(0, 1000 - round.penalties * 50);
  const message = text => { if (view.status) view.status.textContent = text; };

  function updateReadouts() {
    const left = differences.length - round.found.size;
    if (view.remaining) view.remaining.textContent = `${left} differences remain`;
    if (view.penalties) view.penalties.textContent = `${round.penalties} penalties · Score: ${score()}`;
  }

  function badge(panel, x, y, className, number) {
    if (!panel.marks) return null;
    const marker = document.createElement('span');
    marker.className = className;
    marker.style.left = `${x / 5}%`;
    marker.style.top = `${y / 5}%`;
    if (number !== undefined) marker.dataset.number = String(number);
    panel.marks.append(marker);
    return marker;
  }

  function placeCursor(panel, visible = true) {
    if (!panel.cursor) return;
    panel.cursor.hidden = !visible || !round.active || panel !== selected;
    panel.cursor.style.left = `${panel.x / 5}%`;
    panel.cursor.style.top = `${panel.y / 5}%`;
  }

  function endRound() {
    round.active = false;
    const seconds = ((clock() - round.started) / 1000).toFixed(1);
    const summary = `All five found in ${seconds} seconds with ${round.penalties} penalties. Score: ${score()}.`;
    if (view.result) view.result.textContent = summary;
    if (view.win) view.win.hidden = false;
    panels.forEach(panel => placeCursor(panel, false));
    message(summary);
    const again = byId('again');
    if (again) again.focus();
  }

  function discover(index, hinted = false) {
    if (round.found.has(index)) return;
    round.found.add(index);
    const target = differences[index];
    panels.forEach(panel => {
      if (panel.marks) panel.marks.querySelectorAll('.pulse').forEach(item => item.remove());
      badge(panel, target.x, target.y, 'mark', round.found.size);
    });
    updateReadouts();
    if (round.found.size === differences.length) {
      endRound();
    } else {
      const remaining = differences.length - round.found.size;
      message(`${target.name}${hinted ? ' revealed' : ' found'}. ${remaining} still hidden.`);
    }
  }

  function inspect(x, y, panel) {
    if (!round.active) return;
    const hit = differences.findIndex((point, index) =>
      !round.found.has(index) && Math.hypot(point.x - x, point.y - y) <= 22);
    if (hit >= 0) {
      discover(hit);
      return;
    }
    round.penalties += 1;
    updateReadouts();
    message('No new difference there. One penalty added.');
    const marker = badge(panel, x, y, 'miss');
    if (marker) setTimeout(() => marker.remove(), 650);
  }

  function startRound() {
    round.found.clear();
    round.penalties = 0;
    round.started = clock();
    round.active = true;
    if (view.intro) view.intro.hidden = true;
    if (view.win) view.win.hidden = true;
    panels.forEach(panel => {
      if (panel.marks) panel.marks.replaceChildren();
      panel.x = 250;
      panel.y = 250;
      placeCursor(panel, false);
    });
    updateReadouts();
    message('Find five changed details. Use Tab to switch pictures; Shift + arrows moves precisely.');
    selected = panels[0];
    selected.element.focus();
    placeCursor(selected);
  }

  function revealOne() {
    if (!round.active) return;
    const index = differences.findIndex((_, i) => !round.found.has(i));
    if (index < 0) return;
    round.penalties += 2;
    updateReadouts();
    discover(index, true);
    if (round.active) message(`${differences[index].name} revealed. Two penalties added.`);
  }

  panels.forEach((panel, panelIndex) => {
    panel.element.addEventListener('click', event => {
      if (!round.active) return;
      const rect = panel.element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      selected = panel;
      panel.element.focus();
      panel.x = Math.max(0, Math.min(500, (event.clientX - rect.left) * 500 / rect.width));
      panel.y = Math.max(0, Math.min(500, (event.clientY - rect.top) * 500 / rect.height));
      placeCursor(panel);
      inspect(panel.x, panel.y, panel);
    });
    panel.element.addEventListener('focus', () => {
      if (!round.active) return;
      selected = panel;
      panels.forEach(item => placeCursor(item));
    });
    panel.element.addEventListener('blur', () => placeCursor(panel, false));
    panel.element.addEventListener('keydown', event => {
      if (!round.active) return;
      if (event.key === 'Tab') {
        event.preventDefault();
        selected = panels[(panelIndex + 1) % panels.length];
        selected.element.focus();
        panels.forEach(item => placeCursor(item));
        return;
      }
      const direction = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        ArrowUp: [0, -1], ArrowDown: [0, 1]
      }[event.key];
      if (direction) {
        event.preventDefault();
        const step = event.shiftKey ? 2 : 12;
        panel.x = Math.max(0, Math.min(500, panel.x + direction[0] * step));
        panel.y = Math.max(0, Math.min(500, panel.y + direction[1] * step));
        placeCursor(panel);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        inspect(panel.x, panel.y, panel);
      }
    });
  });

  ['start', 'restart', 'again'].forEach(id => {
    const button = byId(id);
    if (button) button.addEventListener('click', startRound);
  });
  const hint = byId('hint');
  if (hint) hint.addEventListener('click', revealOne);
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const target = event.target;
    if (target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '')) return;
    const key = event.key.toLowerCase();
    if (key === 'r') {
      event.preventDefault();
      startRound();
    } else if (key === 'h') {
      event.preventDefault();
      revealOne();
    }
  });

  updateReadouts();
});
