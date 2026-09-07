import express from '../frontend/node_modules/express/index.js';
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
const app = express();
const root = fileURLToPath(new URL('../frontend/dist/frontend/browser/', import.meta.url));
app.use('/api', (req,res)=>{
  const upstream=http.request({hostname:'127.0.0.1',port:8080,path:'/api'+req.url,method:req.method,headers:req.headers},response=>{
    res.writeHead(response.statusCode,response.headers); response.pipe(res);
  });
  upstream.on('error',()=>res.status(502).json({error:'Backend unavailable'}));
  req.pipe(upstream);
});
const compressed = new Map();
app.use((req,res,next)=>{
  const name=decodeURIComponent(req.path==='/'?'/index.html':req.path);
  const target=resolve(root,'.'+name);
  if(!target.startsWith(root.endsWith(sep)?root:root+sep)) return res.sendStatus(400);
  if(/\.(js|css|html|svg|json|txt)$/.test(target)&&existsSync(target)&&statSync(target).isFile()&&req.acceptsEncodings('gzip')) {
    const key=target+statSync(target).mtimeMs;
    if(!compressed.has(key)) compressed.set(key,gzipSync(readFileSync(target)));
    res.type(extname(target));res.set('Content-Encoding','gzip');res.set('Vary','Accept-Encoding');
    return res.send(compressed.get(key));
  }
  next();
});
app.use(express.static(root));
app.use((req,res,next)=>extname(req.path)?res.sendStatus(404):next());
app.use((req,res)=>res.sendFile('index.html',{root}));
app.listen(4300,'127.0.0.1',()=>console.log('Production preview: http://127.0.0.1:4300'));
