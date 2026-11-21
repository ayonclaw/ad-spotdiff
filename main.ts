import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';
import { conservatory } from './game/scene.js';

const project = dirname(fileURLToPath(import.meta.url));
const output = process.argv.includes('--prepare')
  ? project
  : resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const gameFiles = ['index.html', 'style.css', 'scene.js', 'hunt.js', 'hud.js'];

function makeParent(file: string): void {
  mkdirSync(dirname(file), { recursive: true });
}
function writeArtifact(relative: string, contents: Uint8Array | string): void {
  const file = join(output, relative);
  makeParent(file);
  writeFileSync(file, contents);
}
function mirrorArtifact(from: string, relative: string): void {
  const to = join(output, relative);
  makeParent(to);
  if (from !== to) copyFileSync(from, to);
}

export function assembleEntry(): void {
  let count = 0;
  for (const name of gameFiles) {
    mirrorArtifact(join(project, 'game', name), `game/${name}`);
    count++;
  }
  writeArtifact('game/original.svg', conservatory(false));
  writeArtifact('game/altered.svg', conservatory(true));
  count += 2;
  for (const name of readdirSync(join(project, 'screenshots')).sort()) {
    mirrorArtifact(join(project, 'screenshots', name), `screenshots/${name}`);
    count++;
  }
  writeArtifact('dossier.json', buildDossier(output, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }));
  console.error(`Wrote ${count + 1} files to ${output}`);
}
assembleEntry();
