import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';
import { conservatory } from './game/scene.js';
const root = dirname(fileURLToPath(import.meta.url));
const target = process.argv.includes('--prepare') ? root : (process.env.MAKEFUN_OUTPUT_DIR || '/output');
function emit(path, bytes) {
  const dest = join(target,path);
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,bytes);
}
for(const name of ['index.html','style.css','hunt.js','scene.js']) {
  emit(`game/${name}`,readFileSync(join(root,'game',name)));
}
emit('game/original.svg',conservatory(false));
emit('game/altered.svg',conservatory(true));
if(!process.argv.includes('--prepare')) {
  for(const name of readdirSync(join(root,'screenshots')).sort()) {
    emit(`screenshots/${name}`,readFileSync(join(root,'screenshots',name)));
  }
  emit('dossier.json',buildDossier(target,{
    text_max_bytes:163840,
    screenshots:{max:4,max_bytes:262144},
    game_max_files:993,game_max_bytes:50331648,game_path_max_bytes:1000
  }));
}
