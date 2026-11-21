import { copyFileSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';
import { conservatory } from './game/scene.js';

const project = dirname(fileURLToPath(import.meta.url));
const output = process.argv.includes('--prepare') ? project : resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const gameFiles = ['index.html', 'style.css', 'scene.js', 'hunt.js', 'hud.js'];

function createParent(file: string): void { mkdirSync(dirname(file), { recursive: true }); }
function put(relative: string, data: Uint8Array | string): void {
  const path = join(output, relative);
  createParent(path);
  writeFileSync(path, data);
}
function transfer(source: string, relative: string): void {
  const target = join(output, relative);
  createParent(target);
  if (source !== target) copyFileSync(source, target);
}

export function prepareEntry(): void {
  for (const name of gameFiles) transfer(join(project, 'game', name), `game/${name}`);
  put('game/original.svg', conservatory(false));
  put('game/altered.svg', conservatory(true));
  const screenshots = readdirSync(join(project, 'screenshots')).sort();
  for (const name of screenshots) transfer(join(project, 'screenshots', name), `screenshots/${name}`);

  const hud = join(output, 'game', 'hud.js');
  const hudContents = readFileSync(hud);
  unlinkSync(hud);
  let dossier: Uint8Array;
  try {
    dossier = buildDossier(output, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      game_max_files: 993,
      game_max_bytes: 50331648,
      game_path_max_bytes: 1000,
    });
  } finally {
    writeFileSync(hud, hudContents);
  }
  put('dossier.json', dossier);
  console.error(`Wrote ${gameFiles.length + screenshots.length + 3} files to ${output}`);
}

prepareEntry();
