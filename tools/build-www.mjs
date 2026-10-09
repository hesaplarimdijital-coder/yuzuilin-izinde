#!/usr/bin/env node
/* =========================================================================
   Yüzyılın İzinde — uygulama dosyalarını www/ klasörüne kopyalar
   Android (Capacitor) uygulaması ve GitHub Pages yayını yalnızca oyunun kendi
   dosyalarını içersin diye: index.html, style.css, js/, assets/ (fontlar ve
   simgeler), manifest ve gizlilik politikası. Test sayfaları, README görselleri,
   android/ ve store/ klasörleri kopyalanmaz.
   Kullanım: node tools/build-www.mjs [--app] [hedef-klasör]   (varsayılan: www)
     --app  Android uygulaması için: test sayfası (debug.html) kopyalanmaz
   ========================================================================= */
import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const APP = args.includes('--app');
const OUT = join(ROOT, args.find((a) => !a.startsWith('--')) || 'www');

const FILES = ['index.html', 'style.css', 'manifest.webmanifest', 'privacy.html', 'bagis.html'].concat(APP ? [] : ['debug.html']);
const DIRS = ['js', 'assets'];
// www/ içine girmeyecekler (README ekran görüntüleri, büyük kaynaklar)
const SKIP = new Set(['assets/ekran']);

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let n = 0, bytes = 0;
for (const f of FILES) {
  const src = join(ROOT, f);
  if (!existsSync(src)) continue;
  cpSync(src, join(OUT, f));
  n++; bytes += statSync(src).size;
}
for (const d of DIRS) {
  cpSync(join(ROOT, d), join(OUT, d), {
    recursive: true,
    filter: (src) => {
      const rel = relative(ROOT, src).split('\\').join('/');
      if (SKIP.has(rel)) return false;
      if (statSync(src).isFile()) { n++; bytes += statSync(src).size; }
      return true;
    },
  });
}
// GitHub Pages: Jekyll işlemesin (alt çizgiyle başlayan dosyalar da yayınlansın)
writeFileSync(join(OUT, '.nojekyll'), '');
console.log(`www hazır: ${n} dosya, ${(bytes / 1024).toFixed(0)} KB → ${relative(ROOT, OUT) || '.'}`);
