#!/usr/bin/env node
/* =========================================================================
   Yüzyılın İzinde — yayın öncesi denetim
   GitHub Actions her yayından önce bu betiği çalıştırır; bilgisayarınızda
   da `node tools/denetle.js` ile deneyebilirsiniz (Node 18+).
   - Bütün js/ dosyalarında sözdizimi hatası arar.
   - js/timeline.js içindeki olay listesini (EVENTS) doğrular.
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ORDER = ['core', 'timeline', 'art-base', 'art-arch', 'art-vehicles', 'scenes-1', 'scenes-2', 'art-world', 'art-bg', 'world-text', 'character', 'audio', 'game', 'render', 'ui', 'main', 'platform', 'debug'];
const errors = [];
const warns = [];

// 1) sözdizimi
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ORDER.forEach((n) => {
  const rel = 'js/' + n + '.js';
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { errors.push(rel + ' bulunamadı.'); return; }
  if (html.indexOf('src="' + rel + '"') < 0) errors.push('index.html, ' + rel + ' dosyasını yüklemiyor.');
  try { new vm.Script(fs.readFileSync(file, 'utf8'), { filename: rel }); }
  catch (e) {
    const where = (e.stack || '').split('\n')[0];
    errors.push('Sözdizimi hatası → ' + where + '\n    ' + e.message);
  }
});

// 2) olay listesi
if (!errors.length) {
  const sandbox = { console: console, location: { search: '' }, Math: Math };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const run = (n) => vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/' + n + '.js'), 'utf8'), sandbox, { filename: 'js/' + n + '.js' });
  try {
    run('core'); run('timeline');
  } catch (e) {
    errors.push('js/timeline.js yüklenirken hata: ' + e.message);
  }
  let scenes = null;
  try { run('art-base'); run('art-arch'); run('art-vehicles'); run('scenes-1'); run('scenes-2'); scenes = sandbox.IZ.SCENES; }
  catch (e) { warns.push('Sahne listesi okunamadı, sahne adları denetlenmedi (' + e.message + ').'); }

  const IZ = sandbox.IZ || {};
  const EV = IZ.EVENTS || [];
  const FX = ['shake', 'slow', 'siren', 'fireworks', 'cheer', 'whistle', 'cannon', 'blackout'];
  if (!EV.length) errors.push('EVENTS listesi boş ya da okunamadı.');
  let prev = -Infinity;
  EV.forEach((e, i) => {
    const tag = '#' + i + (e && e.t ? ' “' + e.t + '”' : '');
    if (!e || typeof e !== 'object') { errors.push(tag + ': olay bir nesne değil.'); return; }
    if (typeof e.d !== 'string' || !/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(e.d)) errors.push(tag + ': tarih (d) "YYYY", "YYYY-AA" ya da "YYYY-AA-GG" biçiminde olmalı.');
    if (!IZ.CATS || !IZ.CATS[e.c]) errors.push(tag + ': kategori (c) S, T, E, D ya da F olmalı.');
    if (!e.t || typeof e.t !== 'string') errors.push(tag + ': başlık (t) eksik.');
    if (!e.x || typeof e.x !== 'string') errors.push(tag + ': açıklama (x) eksik.');
    else if (e.x.length > 260) warns.push(tag + ': açıklama uzun (' + e.x.length + ' karakter); ekranda kalabalık görünebilir.');
    if (e.t && e.t.length > 48) warns.push(tag + ': başlık uzun (' + e.t.length + ' karakter).');
    if (scenes && e.s && !scenes[e.s]) errors.push(tag + ': "' + e.s + '" adlı bir sahne yok. Var olanlar: ' + Object.keys(scenes).sort().join(', '));
    if (!e.s) warns.push(tag + ': sahne (s) belirtilmemiş; genel sahne kullanılacak.');
    if (e.m && IZ.MOODS && !IZ.MOODS[e.m]) errors.push(tag + ': "' + e.m + '" adlı bir atmosfer yok. Var olanlar: ' + Object.keys(IZ.MOODS).join(', '));
    (e.fx || []).forEach((f) => { if (FX.indexOf(f) < 0) errors.push(tag + ': bilinmeyen efekt "' + f + '". Var olanlar: ' + FX.join(', ')); });
    const BG = IZ.BG_NAMES || [];
    if (e.b && BG.indexOf(e.b) < 0) errors.push(tag + ': "' + e.b + '" adlı bir arka plan dekoru yok. Var olanlar: ' + BG.join(', '));
    if (!e.b && e.s && IZ.SCENE_BG && !IZ.SCENE_BG[e.s]) warns.push(tag + ': "' + e.s + '" sahnesi için arka plan dekoru tanımlı değil (SCENE_BG); "kent" kullanılacak.');
    if (e.yas !== undefined && typeof e.yas !== 'boolean') errors.push(tag + ': yas alanı true ya da false olmalı.');
    if (typeof e.dec === 'number') {
      if (e.dec < prev) errors.push(tag + ': olaylar tarih sırasına göre dizilmeli (bir önceki olaydan daha eski).');
      prev = e.dec;
    }
  });
  if (EV.length && !EV[EV.length - 1].final) warns.push('Son olay "final: true" değil; gelecek kartı kullanılmıyor.');
  // engel adları: dönem listeleri ve olaylara özel engeller (o: [...]) var olan engellerden olmalı
  let OBS = null;
  try { run('art-world'); OBS = sandbox.IZ.ART && sandbox.IZ.ART.OBS; } catch (e) { warns.push('Engel listesi okunamadı (' + e.message + ').'); }
  if (OBS) {
    (IZ.ERAS || []).forEach((era) => {
      Object.keys(era.obs || {}).forEach((k) => { if (!OBS[k]) errors.push('Dönem "' + era.name + '": "' + k + '" adlı bir engel yok.'); });
      if (era.tall && !OBS[era.tall]) errors.push('Dönem "' + era.name + '": yüksek engel "' + era.tall + '" yok.');
      if (era.tower && !OBS[era.tower]) errors.push('Dönem "' + era.name + '": kule engeli "' + era.tower + '" yok.');
    });
    EV.forEach((e, i) => (e.o || []).forEach((k) => { if (!OBS[k]) errors.push('#' + i + ' “' + e.t + '”: "' + k + '" adlı bir engel yok. Var olanlar: ' + Object.keys(OBS).join(', ')); }));
  }
  if (!errors.length) console.log('✓ ' + EV.length + ' olay denetlendi.');
}

warns.forEach((w) => console.warn('! ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error('\nDenetim başarısız: ' + errors.length + ' hata. Lütfen düzeltip yeniden gönderin.');
  process.exit(1);
}
console.log('✓ Denetim tamam.');
