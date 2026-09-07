import { createRequire } from 'node:module';
const sharp = createRequire(new URL('./tools/package.json', import.meta.url))('sharp');
import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const folder=fileURLToPath(new URL('../frontend/public/images/',import.meta.url));
let original=0, optimized=0;
for(const name of await readdir(folder)) {
  if(!name.endsWith('.jpg')) continue;
  const input=folder+name, output=input.replace(/\.jpg$/,'.webp');
  original+=(await stat(input)).size;
  await sharp(input).resize({width:1280,withoutEnlargement:true}).webp({quality:76,effort:5}).toFile(output);
  optimized+=(await stat(output)).size;
}
console.log(JSON.stringify({originalBytes:original,webpBytes:optimized,reductionPercent:Math.round((1-optimized/original)*100)}));
