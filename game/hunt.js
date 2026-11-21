// Coordinates in scene.js's 500-unit SVG canvas; artwork stays in local SVG files.
document.addEventListener('DOMContentLoaded', () => {
  const ui = Object.fromEntries(['left', 'right', 'remaining', 'penalties', 'status',
    'intro', 'start', 'restart', 'hint', 'win', 'result', 'again']
    .map(name => [name, document.getElementById(name)]));
  if (Object.values(ui).some(element => !element)) return;
  const boards = [ui.left, ui.right];
  if (boards.some(board => !board.querySelector('.marks') || !board.querySelector('.cursor'))) return;
  const clues = [
    [405, 85, 'The moon dial'], [117, 250, 'The hanging bloom'],
    [268, 337, 'The watering can'], [414, 391, 'The pot emblem'],
    [80, 439, 'The fallen leaf']
  ];
  let round;
  const positions = new Map(boards.map(board => [board, { x: 250, y: 250 }]));
  const say = message => { ui.status.textContent = message; };
  const tally = () => {
    ui.remaining.textContent = `${clues.length - round.discovered.size} differences remain`;
    ui.penalties.textContent = `${round.faults} penalties`;
  };
  function draw(board, x, y, className, label) {
    const badge = document.createElement('span');
    badge.className = className;
    badge.style.left = `${x / 5}%`;
    badge.style.top = `${y / 5}%`;
    if (label !== undefined) badge.dataset.number = String(label);
    board.querySelector('.marks').append(badge);
    return badge;
  }
  function aim(board, visible = true) {
    const pointer = board.querySelector('.cursor');
    const location = positions.get(board);
    pointer.hidden = !visible;
    pointer.style.left = `${location.x / 5}%`;
    pointer.style.top = `${location.y / 5}%`;
  }
  function begin() {
    round = { discovered: new Set(), faults: 0, since: performance.now(), active: true };
    ui.intro.hidden = true;
    ui.win.hidden = true;
    boards.forEach(board => {
      board.querySelector('.marks').replaceChildren();
      positions.set(board, { x: 250, y: 250 });
      aim(board, false);
    });
    tally();
    say('Find five changed details. Shift + arrows moves the cursor precisely.');
    ui.left.focus();
  }
  function record(number) {
    round.discovered.add(number);
    const [x, y, description] = clues[number];
    boards.forEach(board => {
      board.querySelectorAll('.pulse').forEach(badge => badge.remove());
      draw(board, x, y, 'mark', round.discovered.size);
    });
    tally();
    say(`${description} recorded. ${clues.length - round.discovered.size} still hidden.`);
    if (round.discovered.size !== clues.length) return;
    round.active = false;
    const seconds = ((performance.now() - round.since) / 1000).toFixed(1);
    ui.result.textContent = `All five found in ${seconds} seconds with ${round.faults} penalties.`;
    say(ui.result.textContent);
    ui.win.hidden = false;
    ui.again.focus();
  }
  function examine(board, x, y) {
    if (!round?.active) return;
    const number = clues.findIndex(([cx, cy], index) =>
      !round.discovered.has(index) && Math.hypot(cx - x, cy - y) <= 22);
    if (number !== -1) { record(number); return; }
    round.faults += 1;
    tally();
    say('No new difference there. One penalty added.');
    const flash = draw(board, x, y, 'miss');
    setTimeout(() => flash.remove(), 650);
  }
  function reveal() {
    if (!round?.active) return;
    const number = clues.findIndex((_, index) => !round.discovered.has(index));
    if (number === -1) return;
    round.faults += 2;
    record(number);
    if (round.active) say(`${clues[number][2]} revealed. Two penalties added.`);
  }
  boards.forEach(board => {
    board.addEventListener('click', event => {
      const box = board.getBoundingClientRect();
      if (!box.width || !box.height || !round?.active) return;
      board.focus();
      examine(board, (event.clientX - box.left) * 500 / box.width,
        (event.clientY - box.top) * 500 / box.height);
    });
    board.addEventListener('focus', () => { if (round?.active) aim(board); });
    board.addEventListener('blur', () => aim(board, false));
    board.addEventListener('keydown', event => {
      if (!round?.active) return;
      const movement = { ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!movement && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const location = positions.get(board);
      if (movement) {
        const stride = event.shiftKey ? 2 : 12;
        location.x = Math.max(0, Math.min(500, location.x + movement[0] * stride));
        location.y = Math.max(0, Math.min(500, location.y + movement[1] * stride));
      } else examine(board, location.x, location.y);
      aim(board);
    });
  });
  [ui.start, ui.restart, ui.again].forEach(button => button.addEventListener('click', begin));
  ui.hint.addEventListener('click', reveal);
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const target = event.target;
    if (target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '')) return;
    const shortcut = event.key.toLowerCase();
    if (shortcut !== 'r' && shortcut !== 'h') return;
    event.preventDefault();
    if (shortcut === 'r') begin();
    else reveal();
  });
  round = { discovered: new Set(), faults: 0, active: false };
  tally();
}, { once: true });
