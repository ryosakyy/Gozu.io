import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const frontend=fileURLToPath(new URL('../frontend/',import.meta.url));
const names=new Set();
async function scan(dir) {
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) await scan(file);
    else if(/\.(html|ts|scss)$/.test(file)) {
      for(const match of (await readFile(file,'utf8')).matchAll(/\bbi-[a-z0-9-]+/g)) names.add(match[0]);
    }
  }
}
await scan(path.join(frontend,'src/app'));
let css='/* Generated from installed Bootstrap Icons (MIT). Run quality/build-icons.mjs after adding icons. */\n.bi::before,[class^="bi-"]::before,[class*=" bi-"]::before{content:"";display:inline-block;width:1em;height:1em;vertical-align:-.125em;background-color:currentColor;mask:var(--gozu-icon) center/contain no-repeat;-webkit-mask:var(--gozu-icon) center/contain no-repeat}\n';
for(const name of [...names].sort()) {
  const svg=await readFile(path.join(frontend,'node_modules/bootstrap-icons/icons',name.slice(3)+'.svg'),'utf8');
  css+=`.${name}{--gozu-icon:url("data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}")}\n`;
}
await writeFile(path.join(frontend,'src/icons.css'),css);
console.log(`Generated ${names.size} icons; ${Buffer.byteLength(css)} bytes; no icon font required.`);
