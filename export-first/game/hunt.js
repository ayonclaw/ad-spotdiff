import { differences } from './scene.js';
const $ = id => document.getElementById(id);
const pictures = [...document.querySelectorAll('.picture')];
let found = new Set(), penalties = 0, playing = false, hintTimer;
const cursor = {x:250,y:250};
function announce(text) { $('status').textContent = text; }
function updateCounters() {
  $('remaining').textContent = `${differences.length-found.size} differences remain`;
  $('penalties').textContent = `${penalties} penalties`;
}
function clearHints() {
  clearTimeout(hintTimer);
  document.querySelectorAll('.pulse').forEach(node => node.remove());
}
function marker(pic, point, kind) {
  const node = document.createElement('span');
  node.className = kind;
  node.style.left = `${point.x/5}%`;
  node.style.top = `${point.y/5}%`;
  pic.querySelector('.marks').append(node);
  return node;
}
function startHunt() {
  found = new Set(); penalties = 0; playing = true; clearHints();
  cursor.x = 250; cursor.y = 250;
  pictures.forEach(pic => {
    pic.querySelector('.marks').replaceChildren();
    pic.querySelector('.cursor').hidden = true;
  });
  $('intro').hidden = true; $('win').hidden = true;
  pictures[0].focus();
  updateCounters(); announce('Look closely. Five small things have changed.');
}
function inspect(x,y,pic) {
  if(!playing) return;
  const index = differences.findIndex(p => Math.hypot(x-p.x,y-p.y)<=p.r);
  if(index<0) {
    penalties++; updateCounters(); announce('Not a difference. One penalty added.');
    const miss = marker(pic,{x,y},'miss'); setTimeout(()=>miss.remove(),600); return;
  }
  if(found.has(index)) {announce('You already recorded that detail.');return;}
  found.add(index); clearHints();
  for(const panel of pictures) marker(panel,differences[index],'mark').dataset.number=found.size;
  updateCounters(); announce(`${differences[index].name}, found. ${differences.length-found.size} remain.`);
  if(found.size===differences.length) {
    playing=false;
    $('result').textContent=`All five differences found with ${penalties} penalties.`;
    $('win').hidden=false; $('again').focus();
  }
}
function showHint() {
  if(!playing) return;
  clearHints(); penalties+=2; updateCounters();
  const point=differences.find((_,i)=>!found.has(i));
  pictures.forEach(pic=>marker(pic,point,'pulse'));
  announce('A brass ring points to a changed detail. Two penalties added.');
  hintTimer=setTimeout(clearHints,2500);
}
for(const pic of pictures) {
  pic.addEventListener('click',event=>{
    const bounds=pic.getBoundingClientRect();
    inspect((event.clientX-bounds.left)*500/bounds.width,(event.clientY-bounds.top)*500/bounds.height,pic);
  });
  pic.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Enter'||event.key===' ')inspect(cursor.x,cursor.y,pic);
    else {
      const step=event.shiftKey?5:15;
      cursor.x=Math.max(0,Math.min(500,cursor.x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0)));
      cursor.y=Math.max(0,Math.min(500,cursor.y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0)));
    }
    const cross=pic.querySelector('.cursor');cross.hidden=false;cross.style.left=`${cursor.x/5}%`;cross.style.top=`${cursor.y/5}%`;
  });
  pic.addEventListener('blur',()=>pic.querySelector('.cursor').hidden=true);
}
$('start').onclick=startHunt; $('restart').onclick=startHunt; $('again').onclick=startHunt; $('hint').onclick=showHint;
document.addEventListener('keydown',event=>{
  if(event.key.toLowerCase()==='r')startHunt();
  if(event.key.toLowerCase()==='h')showHint();
});
