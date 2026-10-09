/* =========================================================================
   Yüzyılın İzinde — dünyaya yerleşik yazılar
   Olay tarihleri, başlıkları ve açıklamaları ayrı bir arayüz kutusunda değil,
   sahnenin katmanları arasında, büyük tipografiyle çizilir. Yıl geçişleri ise
   uzak tepelerin üstünde dev rakamlar olarak görünür.
   Yazılar bir kez tuvale çizilip saklanır; her karede yalnızca konumlandırılır.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U;
  const WT = (IZ.WT = {});

  // Yazı tipleri oyunla birlikte gelir (style.css → assets/fonts): kalın, düşük kontrastlı bir
  // başlık yazısı (Libre Baskerville) ve iri gövdeli, okunaklı bir metin yazısı (Fira Sans).
  const F = {
    display: '"Libre Baskerville", Baskerville, Georgia, "Times New Roman", serif',
    body: '"Fira Sans", "Segoe UI", Roboto, "Helvetica Neue", system-ui, sans-serif',
    mono: '"Fira Sans", "Segoe UI", Roboto, "Helvetica Neue", system-ui, sans-serif',
  };
  WT.F = F;
  WT.version = 0; // yazı tipleri yüklenince artar: önbellekler yenilenir

  const scratch = U.canvas(4, 4).getContext('2d');
  function font(ctx, weight, size, fam) { ctx.font = weight + ' ' + size + 'px ' + fam; }
  function spacing(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

  // Satır kırma: boşluklardan; sığmayan uzun sözcükler tire ya da uzun çizgiden bölünür
  // ("Çaldıran-Muradiye" → "Çaldıran-" / "Muradiye")
  function wrap(ctx, text, maxW) {
    const raw = String(text).split(/\s+/);
    const words = [];
    raw.forEach((w) => {
      if (ctx.measureText(w).width <= maxW || !/[-–]/.test(w)) { words.push(w); return; }
      const parts = w.split(/(?<=[-–])/);
      parts.forEach((p) => words.push(p));
    });
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const glue = line && !/[-–]$/.test(line) ? ' ' : '';
      const test = line ? line + glue + words[i] : words[i];
      if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function dayMonth(ev) {
    const p = IZ.parseDate(ev.d);
    if (p.day) return p.day + ' ' + IZ.MONTHS[p.m - 1];
    if (p.m) return IZ.MONTHS[p.m - 1];
    return '';
  }

  // Bir olayın yazı bloğu. s: başlık ölçeği (WU başına), sb: açıklama ölçeği (telefonda daha iri),
  // maxW: metin sütunu genişliği (WU), d: tuval yoğunluğu.
  // İki mürekkep: açık (koyu zemin için) ve koyu (açık zemin için); çizerken gökyüzüne göre karışır.
  // Yazının arkasında kenarları yumuşak, yarı saydam bir perde vardır: sahne ne kadar kalabalık
  // olursa olsun (ışıklı pencereler, ağaçlar) satırlar zeminden ayrışır.
  WT.eventBlock = function (ev, s, maxW, d, sb) {
    sb = sb || s;
    const cat = IZ.CATS[ev.c] || IZ.CATS.T;
    const meta = (ev.final ? 'BUGÜNDEN SONRA' : [dayMonth(ev), cat.name].filter(Boolean).join('  ·  '));
    const year = ev.final ? String(ev.year) + ' →' : String(ev.year);
    // (bir tık küçük: yıl 90, başlık 36, açıklama 17,5 birim; telefonda açıklama ≈ 14 css px)
    const sz = { meta: 14 * sb, year: 90 * s, title: 36 * s, body: 17.5 * sb };
    const lh = { title: sz.title * 1.16, body: sz.body * 1.48 };
    const pad = 48 * Math.max(s, sb);
    // ölçüm
    font(scratch, '600', sz.meta, F.mono); spacing(scratch, sz.meta * 0.16);
    const metaW = scratch.measureText(meta).width;
    spacing(scratch, 0);
    font(scratch, '700', sz.year, F.display);
    const yearW = scratch.measureText(year).width;
    font(scratch, '700', sz.title, F.display);
    const tLines = wrap(scratch, ev.t, maxW);
    let tW = 0; tLines.forEach((l) => { tW = Math.max(tW, scratch.measureText(l).width); });
    font(scratch, '500', sz.body, F.body);
    const bLines = wrap(scratch, ev.x, maxW);
    let bW = 0; bLines.forEach((l) => { bW = Math.max(bW, scratch.measureText(l).width); });
    const textW = Math.max(metaW, yearW, tW, bW);
    const w = Math.ceil(textW + pad * 2);
    // dikey düzen: rakamların ve büyük harflerin gerçek yüksekliğine göre (Libre Baskerville ≈ 0,78 em)
    const yMeta = pad + sz.meta * 0.72;
    const yYear = yMeta + 10 * sb + sz.year * 0.78;
    const yTitle0 = yYear + 18 * s + sz.title * 0.8;
    const yBody0 = yTitle0 + (tLines.length - 1) * lh.title + sz.title * 0.27 + 12 * sb + sz.body * 0.72;
    const h = Math.ceil(yBody0 + (bLines.length - 1) * lh.body + sz.body * 0.28 + pad);

    const make = (dark) => {
      const c = U.canvas(Math.ceil(w * d), Math.ceil(h * d)), x = c.getContext('2d');
      x.setTransform(d, 0, 0, d, 0, 0);
      x.textBaseline = 'alphabetic';
      // perde: gölge hilesiyle bulanık dikdörtgen (dikdörtgenin kendisi tuvalin dışında kalır).
      // Yazının çevresine taşan, yumuşak kenarlı ve yeterince örtücü bir panel: arkadaki sahne ve
      // yıl rakamları yazıyla üst üste binse de yazı ayrışır.
      const OFF = 6000;
      const inset = pad * 0.46;
      x.save();
      x.shadowColor = dark ? 'rgba(246,238,222,0.55)' : 'rgba(9,8,6,0.6)';
      x.shadowBlur = pad * 1.05 * d;
      x.shadowOffsetX = OFF * d;
      x.fillStyle = '#000';
      x.fillRect(inset - OFF, inset, w - inset * 2, h - inset * 2);
      x.restore();
      const ink = dark ? '#16120d' : '#f6eddb';
      const halo = dark ? 'rgba(255,248,236,0.85)' : 'rgba(8,6,4,0.7)';
      // açık gökyüzünde küçük tarih satırı okunsun diye kategori rengi belirgin biçimde koyulaştırılır
      const catCol = U.rgb(U.mix(U.hex(cat.color), dark ? [20, 16, 12] : [255, 250, 240], dark ? 0.5 : 0.1));
      x.shadowColor = halo; x.shadowBlur = 14 * s * d; x.shadowOffsetX = 0; x.shadowOffsetY = 0;
      // tarih · kategori
      x.fillStyle = catCol;
      font(x, '600', sz.meta, F.mono); spacing(x, sz.meta * 0.16);
      x.fillText(meta, pad, yMeta);
      spacing(x, 0);
      // büyük yıl
      x.fillStyle = ink;
      font(x, '700', sz.year, F.display);
      x.fillText(year, pad - sz.year * 0.03, yYear);
      // başlık
      font(x, '700', sz.title, F.display);
      tLines.forEach((l, i) => x.fillText(l, pad, yTitle0 + i * lh.title));
      // açıklama
      x.shadowBlur = 10 * sb * d;
      font(x, '500', sz.body, F.body);
      bLines.forEach((l, i) => x.fillText(l, pad, yBody0 + i * lh.body));
      return c;
    };
    return { light: make(false), dark: make(true), w: w, h: h, pad: pad };
  };

  // Yıl işareti: uzak tepelerin sırtında duran dev rakamlar.
  // Tuvalin alt kenarı = rakamların taban çizgisi (tepe sırtına oturur); dönem adı rakamların üstünde.
  // İki mürekkep: koyu (açık gökyüzü, uzak siluet tonu) ve açık (gece/karanlık gökyüzü).
  WT.YEAR_SIZE = 250;
  WT.yearMark = function (year, eraName, d) {
    const sz = WT.YEAR_SIZE, nsz = 28;
    font(scratch, '700', sz, F.display);
    const yw = scratch.measureText(String(year)).width;
    let nw = 0;
    if (eraName) { font(scratch, '600', nsz, F.mono); spacing(scratch, nsz * 0.3); nw = scratch.measureText(eraName.toUpperCase()).width; spacing(scratch, 0); }
    const pad = 24;
    const top = (eraName ? nsz * 2.1 : 0) + pad;
    const base = top + sz * 0.79; // taban çizgisi (rakamlar düz hizalı, yüksekliği ≈ 0,78 em)
    const w = Math.ceil(Math.max(yw, nw) + 40 + pad * 2), h = Math.ceil(base + sz * 0.08 + pad);
    const make = (light) => {
      const c = U.canvas(Math.ceil(w * d), Math.ceil(h * d)), x = c.getContext('2d');
      x.setTransform(d, 0, 0, d, 0, 0);
      x.textAlign = 'center';
      // hafif hale: rakamların kenarı sisli tepelerden ayrışsın
      x.shadowColor = light ? 'rgba(255,244,226,0.35)' : 'rgba(255,248,236,0.4)';
      x.shadowBlur = 18 * d;
      x.fillStyle = light ? 'rgba(244,234,214,0.66)' : '#312f2c';
      if (eraName) {
        font(x, '600', nsz, F.mono); spacing(x, nsz * 0.3);
        x.fillText(eraName.toUpperCase(), w / 2, top - nsz * 1.05);
        spacing(x, 0);
      }
      font(x, '700', sz, F.display);
      x.fillText(String(year), w / 2, base);
      return c;
    };
    return { dark: make(false), light: make(true), w: w, h: h, base: base };
  };

  // Bir yılın dönem adı (o yıl bir dönemin ilk yılıysa)
  WT.eraNameForYear = function (y) {
    for (let i = 0; i < IZ.ERAS.length; i++) {
      const f = IZ.ERAS[i].from;
      const first = f % 1 === 0 ? f : Math.ceil(f);
      if (first === y) return IZ.ERAS[i].name;
    }
    return '';
  };

  // Yazı tipleri yüklendiğinde önbellekleri yenile
  WT.watchFonts = function (onReady) {
    if (!document.fonts || !document.fonts.load) return;
    const loads = [
      document.fonts.load('700 40px "Libre Baskerville"', 'İĞŞ 1923 ğış'),
      document.fonts.load('500 16px "Fira Sans"', 'İĞŞ 1923 ğış'),
      document.fonts.load('600 14px "Fira Sans"', 'İĞŞ 1923 ğış'),
    ];
    Promise.all(loads).then(() => { WT.version++; onReady && onReady(); }).catch(() => {});
  };
})();
