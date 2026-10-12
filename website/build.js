// Copies only what the live site needs into dist/  ->  upload / deploy THAT folder.
// Leaves out mockups, assets/ and dev files.  Run:  npm run build
const fs = require('fs'), path = require('path');
const ROOT = __dirname, OUT = path.join(ROOT, 'dist');
const INCLUDE = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt', 'favicon.svg', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'favicon-512.png', 'css', 'js', 'data', 'og', 'cases',
  'about', 'services', 'work', 'contact', 'privacy', 'brand-identity', 'website-design', 'menu-and-print-design',
  'venue-diagnosis', 'monthly-partnership', 'founding-clients'];

let files = 0, bytes = 0;
function copy(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) { fs.mkdirSync(dest, { recursive: true }); fs.readdirSync(src).forEach(f => copy(path.join(src, f), path.join(dest, f))); }
  else { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(src, dest); files++; bytes += st.size; }
}
fs.rmSync(OUT, { recursive: true, force: true });
INCLUDE.forEach(p => copy(path.join(ROOT, p), path.join(OUT, p)));
console.log(`dist/ ready: ${files} files, ${(bytes / 1048576).toFixed(2)} MB`);
