const puppeteer = require('puppeteer');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'wyciete');
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8777/tnij.html', { waitUntil: 'networkidle0' });
  await p.waitForFunction('window.SPRITY !== null', { timeout: 120000 });
  const sprity = await p.evaluate(() => window.SPRITY);
  const manifest = [];
  const licznik = {};
  for (const s of sprity) {
    licznik[s.panel] = (licznik[s.panel] || 0) + 1;
    const nazwa = `${s.panel}_${String(licznik[s.panel]).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(OUT, nazwa), Buffer.from(s.png.split(',')[1], 'base64'));
    manifest.push({ plik: nazwa, panel: s.panel, w: s.w, h: s.h, x: s.x, y: s.y });
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  const wg = {};
  for (const m of manifest) { wg[m.panel] = (wg[m.panel] || 0) + 1; }
  console.log('wyciete sprity:', manifest.length, JSON.stringify(wg));
  const rozm = manifest.map(m => `${m.w}x${m.h}`);
  const hist = {}; rozm.forEach(r => hist[r] = (hist[r]||0)+1);
  console.log('najczestsze rozmiary:', JSON.stringify(Object.entries(hist).sort((a,b)=>b[1]-a[1]).slice(0,12)));
  await b.close();
})();
