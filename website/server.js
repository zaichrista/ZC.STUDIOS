// Tiny zero-dependency static server for local preview:  npm start  ->  http://localhost:3000
// (Adobe Fonts only serves the Sets Grotesk kit to allowed domains, and localhost is one of them.)
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  p = p.replace(/^\/ZC\.STUDIOS(?=\/|$)/, '') || '/';   // live site is served under /ZC.STUDIOS/
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT) || /(^|[\\/])(server\.js|build\.js|package\.json|_archive)([\\/]|$)/.test(path.relative(ROOT, file))) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`ZC Studios running at http://localhost:${PORT}/ZC.STUDIOS/`));
