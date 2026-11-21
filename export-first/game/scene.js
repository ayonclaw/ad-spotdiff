// Shared deterministic artwork. Each variant changes only the five declared regions.
export const differences = [
  {x:405,y:85,r:26,name:'The moon dial'},
  {x:117,y:250,r:25,name:'The hanging bloom'},
  {x:268,y:337,r:25,name:'The watering can'},
  {x:414,y:391,r:22,name:'The pot emblem'},
  {x:80,y:439,r:22,name:'The fallen leaf'}
];
export function conservatory(variant = false) {
  const s = [];
  const add = text => s.push(text);
  const rect = (x,y,w,h,fill,rx=0) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`);
  const path = (d,fill,stroke='#304e48',width=2) => add(`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const circle = (x,y,r,fill) => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`);
  add('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#173f43"/><stop offset="1" stop-color="#8daf9b"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#e7c69a"/><stop offset="1" stop-color="#b48a66"/></linearGradient></defs>');
  rect(0,0,500,500,'#e9d6af');
  rect(24,22,452,332,'url(#sky)',160);
  // Garden silhouettes seen through the glass.
  for(let i=0;i<19;i++) {
    const x=25+i*25, h=35+(i*37%93);
    path(`M ${x} 354 Q ${x-40} ${354-h} ${x+7} ${306-h} Q ${x+38} ${345-h} ${x+12} 354`,'#527869','none');
  }
  for(const x of [90,170,250,330,410]) path(`M ${x} 350 L ${x} ${x===250?26:55}`,'none','#d7bc87',6);
  path('M24 178 H476 M24 274 H476 M250 24 L24 178 M250 24 L476 178','none','#d7bc87',5);
  path('M24 354 V179 Q24 22 250 22 Q476 22 476 179 V354','none','#8e714f',9);
  rect(0,354,500,146,'url(#floor)');
  for(const y of [382,423,470]) path(`M0 ${y} H500`,'none','#a58160',1);
  for(const x of [-200,-80,40,160,280,400,520,640]) path(`M250 354 L${x} 500`,'none','#a58160',1);
  // Moon dial, changed crescent orientation.
  circle(405,85,24,'#d7b978'); circle(405,85,19,'#284c4b');
  circle(405,85,12,'#f3db9b'); circle(variant?400:411,81,11,'#284c4b');
  // Hanging plants.
  for(const x of [117,354]) {
    path(`M${x-27} 49 L${x-17} 189 H${x+17} L${x+27} 49`,'none','#d8b87c',2);
    path(`M${x-25} 182 H${x+25} L${x+17} 207 H${x-17} Z`,'#c48258');
    for(let i=0;i<6;i++) {
      let q=x-18+i*7;
      path(`M${q} 194 Q${q-17} 228 ${q+3} 262 Q${q+20} 235 ${q} 219`,'#507c51');
    }
  }
  circle(117,250,9,variant?'#e8c44f':'#d47e77');
  for(let a=0;a<5;a++) {let t=a*Math.PI*2/5;circle((117+Math.cos(t)*10).toFixed(3),(250+Math.sin(t)*10).toFixed(3),6,variant?'#e8c44f':'#d47e77');}
  circle(117,250,4,'#f9df9c');
  // Potting bench and drawer handles.
  rect(143,348,210,16,'#785640',3);rect(155,364,12,87,'#785640');rect(329,364,12,87,'#785640');
  rect(166,365,161,31,'#af7c55');
  for(const x of [194,275]) {rect(x,376,25,5,'#d5b67d',2);}
  rect(166,425,161,9,'#785640');
  // Books and seed packets.
  for(let i=0;i<5;i++) rect(180+i*17,403,12,22,'#'+['55715c','8e5145','c4a169','4e6f72','937552'][i]);
  rect(179,323,40,25,'#e1c28c',2);path('M186 340 L199 328 L211 340','none','#5a7356');
  // Watering can: spout angle is one whole difference.
  rect(249,321,38,27,'#73958a',5);
  path('M284 326 Q311 314 302 339 L286 339','none','#476d66',5);
  path(variant?'M250 331 L232 308 L225 312 L248 342':'M250 331 L229 323 L225 329 L248 342','#73958a');
  path('M259 321 L263 313 H275 L279 321','none','#476d66',3);
  // Large specimen plants.
  for(const [x,y] of [[67,379],[414,367]]) {
    path(`M${x} ${y} Q${x-9} ${y-92} ${x+12} ${y-162}`,'none','#365a43',5);
    for(let i=0;i<7;i++) {
      const yy=y-22-i*19, side=i%2?1:-1;
      path(`M${x} ${yy} Q${x+side*70} ${yy-60} ${x+side*63} ${yy-15} Q${x+side*40} ${yy+10} ${x} ${yy}`,(i%2?'#5e8652':'#789454'));
      path(`M${x} ${yy} L${x+side*49} ${yy-22}`,'none','#a7b174',1);
    }
    path(`M${x-29} ${y} H${x+29} L${x+20} ${y+54} H${x-20} Z`,'#ba7051');
    rect(x-33,y-4,66,12,'#d49368',3);
  }
  if(variant) path('M414 380 L424 391 L414 402 L404 391 Z','#e7bd86','none');
  else circle(414,391,9,'#e7bd86');
  // Terrarium on the foreground stool.
  rect(176,454,68,8,'#805d46',3);rect(184,461,7,30,'#805d46');rect(229,461,7,30,'#805d46');
  path('M183 445 L190 415 H229 L237 445 Z','#aec4a1','#ece0b5',3);
  path('M189 440 L200 421 L208 440 L222 425 L232 440 Z','#527557');rect(194,409,31,7,'#a17f57');
  path(variant?'M68 444 Q72 420 95 432 Q90 449 68 444':'M68 444 Q81 419 97 433 Q86 450 68 444',variant?'#7b854b':'#d6a14f','#716443',1);
  path('M69 444 L91 433','none','#716443',1);
  // Small brass label and foreground border.
  rect(295,464,82,22,'#e7cf9b',3);
  add('<text x="336" y="479" text-anchor="middle" font-family="serif" font-size="10" fill="#67543c">BRASSWATER</text>');
  rect(0,494,500,6,'#6d5641');
  add('</svg>');
  return s.join('\n');
}
