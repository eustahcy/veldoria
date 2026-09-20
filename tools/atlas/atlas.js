const puppeteer = require('puppeteer');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => { if (m.type() !== 'log') console.log(m.type(), m.text().slice(0,120)); });
  await p.goto('http://127.0.0.1:8777/atlas.html', { waitUntil: 'networkidle0' });
  await p.waitForFunction('window.ATLAS !== null', { timeout: 120000 });
  const a = await p.evaluate(() => window.ATLAS);
  const repo = 'D:/Dev/veldoria/margo';
  const dirPng = path.join(repo, 'original/MAEGONEM_pliki/kafle');
  fs.mkdirSync(dirPng, { recursive: true });
  fs.writeFileSync(path.join(dirPng, 'atlas.png'), Buffer.from(a.png.split(',')[1], 'base64'));
  // jako modul JS, zeby dzialal i w Vite, i w zwyklej przegladarce (podglad)
  const nl = String.fromCharCode(10);
  const naglowek = "// Plik generowany skryptem scratchpad/browser/atlas.js - nie edytowac recznie.";
  const dane = JSON.stringify({ plik: '/assets/kafle/atlas.png', w: a.w, h: a.h, sprity: a.mapa, barwy: a.barwy }, null, 1);
  const tresc = [naglowek, "export default " + dane + ";", ""].join(nl);
  fs.writeFileSync(path.join(repo, 'client/src/engine/atlas.js'), tresc);
  fs.mkdirSync('../podglad/assets/kafle', { recursive: true });
  fs.copyFileSync(path.join(dirPng, 'atlas.png'), '../podglad/assets/kafle/atlas.png');
  fs.copyFileSync(path.join(repo, 'client/src/engine/atlas.js'), '../podglad/atlas.js');
  console.log('atlas:', a.w, 'x', a.h, '| sprite\'ow:', a.ile, '| kB:', Math.round(a.png.length * 0.75 / 1024));
  await b.close();
})();
