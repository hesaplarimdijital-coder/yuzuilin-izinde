/* =========================================================================
   Yüzyılın İzinde — çizim motoru
   Gökyüzü → uzak/orta şeritler → sahneler (arka/ön) → yakın şerit →
   oyun katmanı → hava durumu → ön plan → film efektleri.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, A = IZ.ART, P = IZ.P;
  const R = (IZ.R = {});
  const TAU = U.TAU;
  let G;

  R.q = 1;
  R.chunks = { far: new Map(), mid: new Map(), near: new Map() };
  R.styles = { far: {}, mid: {}, near: {} };

  R.init = function (canvas) {
    G = IZ.G;
    // Yeni bir koşu (ya da menüde dönem değişimi) başka bir yıldan başlayabilir: şerit parçalarının
    // dizinleri aynı kalsa da dekorları farklıdır, bu yüzden önbellek boşaltılır. (Parçalar tohumla
    // üretildiği için aynı yer ve yılda yeniden üretilen parça birebir aynıdır.)
    G.on('reset', () => { R.chunks.far.clear(); R.chunks.mid.clear(); R.chunks.near.clear(); });
    R.canvas = canvas;
    R.ctx = canvas.getContext('2d', { alpha: false });
    R.grains = A.grain(3);
    R.scan = A.scanlines();
    R.halo = A.halo();
    R.clouds = [A.cloud(11, 520, 200), A.cloud(29, 640, 230), A.cloud(47, 420, 170)];
    R.stars = [];
    const r = U.rng(5);
    for (let i = 0; i < 160; i++) R.stars.push([r(), Math.pow(r(), 1.6) * 0.75, U.lerp(0.4, 1.6, r()), r() * 10]);
    R.atm = null;
    R.weather = [];
    for (let i = 0; i < 220; i++) R.weather.push({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() });
    R.motes = [];
    for (let i = 0; i < 40; i++) R.motes.push({ x: Math.random(), y: Math.random(), z: Math.random(), p: Math.random() * 10 });
    R.fgList = [];
    R.fgNext = 0;
    R.resize();
  };

  R.resize = function () {
    const cssW = window.innerWidth, cssH = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2) * R.q;
    const maxPx = 2.6e6 * R.q;
    if (cssW * cssH * dpr * dpr > maxPx) dpr = Math.sqrt(maxPx / (cssW * cssH));
    const W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
    if (R.canvas.width !== W || R.canvas.height !== H) { R.canvas.width = W; R.canvas.height = H; }
    R.canvas.style.width = cssW + 'px'; R.canvas.style.height = cssH + 'px';
    R.W = W; R.H = H; R.cssW = cssW; R.cssH = cssH; R.dpr = dpr;
    const portrait = cssH > cssW * 1.05;
    R.portrait = portrait;
    const baseH = cssH < 520 && !portrait ? 620 : 720;
    const k = Math.min(H / baseH, W / 900);
    const oldK = R.k;
    R.k = k;
    R.viewW = W / k; R.viewH = H / k;
    R.gyFrac = portrait ? 0.68 : 0.8;
    R.gy = Math.round(H * R.gyFrac);
    G.viewW = R.viewW;
    R.tabDens = Math.min(k, 1.6);
    R.chunkDens = Math.min(k, 1.4);
    if (!oldK || Math.abs(oldK - k) / k > 0.12) { R.flush(); }
    R.makeVignette();
  };

  R.flush = function () {
    R.chunks.far.clear(); R.chunks.mid.clear(); R.chunks.near.clear();
    R.groundTiles = {};
    R.fgSprites = {};
    A.clearCaches();
    R.clearText();
    if (G && G.story) G.story.queue.forEach((it) => { if (it.state === 'ready' || it.state === 'drawn' || it.state === 'bloomed') { it.state = 'pending'; it.T = null; if (G.buildQueue.indexOf(it) < 0) G.buildQueue.push(it); } });
  };
  // yazı önbellekleri (yazı tipi yüklenince ya da ölçek değişince)
  R.markCache = new Map();
  R.textRects = [];
  R.clearText = function () {
    R.markCache.clear();
    if (G && G.story) G.story.queue.forEach((it) => { it.text = null; });
  };

  R.makeVignette = function () {
    const c = U.canvas(R.W, R.H), x = c.getContext('2d');
    const g = x.createRadialGradient(R.W / 2, R.H * 0.48, Math.min(R.W, R.H) * 0.25, R.W / 2, R.H * 0.5, Math.hypot(R.W, R.H) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.65, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
    x.fillStyle = g; x.fillRect(0, 0, R.W, R.H);
    R.vig = c;
  };

  // ------------------------------------------------------------- atmosfer
  function targetAtm() {
    const S = G.story;
    const era = IZ.ERAS[S.eraIdx];
    const ev = S.curEv || IZ.EVENTS[S.startIdx];
    let mood = (ev && ev.m) || 'day';
    if (G.mode === 'menu' && !S.curEv) mood = (IZ.EVENTS[S.startIdx].m) || 'day';
    const p = Object.assign({ darkness: 0, stars: 0, rain: 0, snow: 0, embers: 0, ash: 0, dust: 0, moon: 0, sunVis: 1, rays: 0.3 }, era.pal, IZ.MOODS[mood] || {});
    const gr = era.grade;
    const C = (k) => U.grade(U.hex(p[k]), gr);
    return {
      skyTop: C('skyTop'), skyMid: C('skyMid'), skyBot: C('skyBot'), fog: C('fog'), sun: C('sun'),
      sunX: p.sunX === undefined ? 0.72 : p.sunX, sunY: p.sunY === undefined ? 300 : p.sunY, sunVis: p.sunVis, rays: p.rays,
      darkness: p.darkness, stars: p.stars, moon: p.moon, rain: p.rain, snow: p.snow, embers: p.embers, ash: p.ash, dust: p.dust,
      grain: era.film.grain, scratch: era.film.scratch, flicker: era.film.flicker, filmDust: era.film.dust, vignette: era.film.vignette, scan: era.film.scan,
      red: U.grade(U.hex('#c8161e'), { desat: gr.sepia ? 0.25 : gr.gray ? 0.35 : 0 }),
    };
  }
  const COLS = ['skyTop', 'skyMid', 'skyBot', 'fog', 'sun', 'red'];
  function stepAtm(dt) {
    const tgt = targetAtm();
    if (!R.atm) { R.atm = tgt; return; }
    const a = R.atm, k = 1 - Math.exp(-dt * 1.1);
    COLS.forEach((c) => { a[c] = U.mix(a[c], tgt[c], k); });
    for (const key in tgt) if (typeof tgt[key] === 'number') a[key] = U.lerp(a[key], tgt[key], k);
  }
  R.snapAtm = function () { R.atm = null; stepAtm(0); R.inkDark = undefined; };

  // ------------------------------------------------------------- yardımcılar
  // Bir parçanın ekranın ortasına geldiği andaki kamera konumu: dekor ve yıl o ana göre seçilir
  function chunkCenterCam(layer, idx) { return ((idx + 0.5) * A.CHUNK - 0.5 * R.viewW) / A.LAYERS[layer].p; }
  function getChunk(layer, idx, gen) {
    const m = R.chunks[layer];
    let c = m.get(idx);
    if (!c && gen) {
      const bg = G.bgAt(chunkCenterCam(layer, idx));
      c = A.genBgChunk(layer, bg.s, idx, bg.y, R.chunkDens);
      m.set(idx, c);
    }
    return c;
  }
  R.chunkInfo = function (layer) {
    // hata ayıklama: ekranın ortasındaki parçanın dekoru
    const L = A.LAYERS[layer];
    const c = R.chunks[layer].get(Math.floor((G.camX * L.p + 0.5 * R.viewW) / A.CHUNK));
    return c ? c.setting + ' ' + Math.floor(c.year) : '-';
  };
  // önden hazırlık: görünür olacak bir sonraki parçayı üret (kare başına en fazla bir iş)
  R.prepare = function () {
    const layers = ['near', 'mid', 'far'];
    for (let li = 0; li < layers.length; li++) {
      const name = layers[li], L = A.LAYERS[name];
      const off = G.camX * L.p;
      const i1 = Math.floor((off + R.viewW + A.CHUNK * 0.6) / A.CHUNK);
      for (let i = Math.floor(off / A.CHUNK); i <= i1; i++) {
        if (!R.chunks[name].has(i)) { getChunk(name, i, true); return true; }
      }
      // eskileri sil
      R.chunks[name].forEach((v, k) => { if ((k + 1) * A.CHUNK < off - 200) R.chunks[name].delete(k); });
    }
    return false;
  };

  function fogBand(ctx, col, alpha, baseWU) {
    if (alpha <= 0.003) return;
    // tam piksel sınırı: geçiş satırı iki kez boyanmasın (ekran boyunca ince bir çizgi görünürdü)
    const yb = Math.round(R.gy + baseWU * R.k);
    const g = ctx.createLinearGradient(0, 0, 0, yb);
    g.addColorStop(0, U.rgba(col, alpha * 0.16));
    g.addColorStop(0.75, U.rgba(col, alpha * 0.55));
    g.addColorStop(1, U.rgba(col, alpha));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, R.W, yb);
    // zemin çizgisinin altı oyun katmanında opak zeminle örtülür: oraya boşuna dolgu yapma
    const yEnd = Math.min(R.H, R.gy + 4 * R.k + 4);
    if (yEnd > yb) { ctx.fillStyle = U.rgba(col, alpha); ctx.fillRect(0, yb, R.W, yEnd - yb); }
  }

  // ------------------------------------------------------------- kare
  R.frame = function (dt) {
    const ctx = R.ctx, k = R.k, a = (stepAtm(dt), R.atm);
    const t = G.t;
    const W = R.W, H = R.H, gy = R.gy;
    const shake = G.fx.shake * G.fx.shake * 13 * k + (G.mode === 'dying' ? 0 : 0);
    const sx = shake ? (U.noise1(t * 27, 1) - 0.5) * 2 * shake : 0;
    const sy = shake ? (U.noise1(t * 31, 7) - 0.5) * 2 * shake : 0;
    const emA = U.clamp(0.22 + a.darkness * 0.95, 0, 1.15);
    const ev = G.story.curEv;
    const def = ev ? IZ.SCENES[ev.s] : null;
    const blackout = def && def.emAlpha ? def.emAlpha(t) : 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    // ---- gökyüzü
    const sg = ctx.createLinearGradient(0, 0, 0, gy - 120 * k);
    sg.addColorStop(0, U.rgb(a.skyTop)); sg.addColorStop(0.62, U.rgb(a.skyMid)); sg.addColorStop(1, U.rgb(a.skyBot));
    // zeminin altı oyun katmanında opak zeminle örtülür (sarsıntı payı dahil)
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, Math.min(H, gy + 8 * k + 8));
    // yıldızlar
    if (a.stars > 0.02) {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < R.stars.length; i++) {
        const s = R.stars[i];
        const tw = 0.55 + 0.45 * Math.sin(t * 1.3 + s[3]);
        ctx.globalAlpha = a.stars * tw * 0.8 * (1 - s[1]);
        ctx.fillRect(s[0] * W, s[1] * (gy - 140 * k), s[2] * R.dpr * 0.9, s[2] * R.dpr * 0.9);
      }
      ctx.globalAlpha = 1;
    }
    // güneş / ay
    const sunX = a.sunX * W, sunY = gy - a.sunY * k;
    if (a.sunVis > 0.01) {
      const rr = 420 * k;
      const g1 = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, rr);
      g1.addColorStop(0, U.rgba(a.sun, 0.75 * a.sunVis)); g1.addColorStop(0.06, U.rgba(a.sun, 0.45 * a.sunVis));
      g1.addColorStop(0.3, U.rgba(a.sun, 0.14 * a.sunVis)); g1.addColorStop(1, U.rgba(a.sun, 0));
      ctx.fillStyle = g1; ctx.fillRect(sunX - rr, sunY - rr, rr * 2, rr * 2);
      ctx.globalAlpha = a.sunVis;
      ctx.fillStyle = U.rgba(U.mix(a.sun, [255, 255, 255], 0.55), a.moon > 0.5 ? 0.9 : 0.95);
      ctx.beginPath(); ctx.arc(sunX, sunY, (a.moon > 0.5 ? 16 : 26) * k, 0, TAU); ctx.fill();
      if (a.moon > 0.5) { ctx.fillStyle = U.rgba(a.skyTop, 0.12); ctx.beginPath(); ctx.arc(sunX + 5 * k, sunY - 3 * k, 5 * k, 0, TAU); ctx.arc(sunX - 6 * k, sunY + 5 * k, 3 * k, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    // bulutlar
    ctx.globalAlpha = 0.18 + 0.32 * (1 - a.sunVis) * (1 - a.darkness * 0.7);
    for (let i = 0; i < 4; i++) {
      const cl = R.clouds[i % 3];
      const cw = cl.width * k * 1.4, ch = cl.height * k * 1.4;
      const span = W + cw;
      const cx = U.wrap(i * span * 0.29 - (G.camX * 0.03 + t * 6) * k, span) - cw;
      ctx.drawImage(cl, cx, gy - (360 + i * 70) * k, cw, ch);
    }
    ctx.globalAlpha = 1;
    // ışık huzmeleri: yalnızca gökyüzünde, tepelerin ARKASINDA. Güneş tepelerin ardına inince
    // huzmeler de onların ardında kalır; manzaranın üstünden geçen çizgiler olmaz.
    if (a.rays > 0.02 && a.sunVis > 0.05 && R.q > 0.65) drawRays(ctx, sunX, sunY, a, t);

    ctx.save();
    ctx.translate(sx, sy);
    // sahne gökyüzü animasyonları (havai fişek vb.)
    drawSky(ctx, t);
    // ---- uzak ve orta şerit (şerit pencereleri gündüz sönük: ışık katmanını yalnızca karanlıkta çiz)
    const chunkEm = emA * U.smoothstep(0, 0.14, a.darkness);
    drawChunks(ctx, 'far', chunkEm * 0.7);
    fogBand(ctx, a.fog, 0.5 * (1 - a.darkness * 0.35), A.LAYERS.far.base + 30);
    // yıl geçişleri: uzak tepelerin üstünde, orta şeridin ARKASINDA dev rakamlar. Orta şerit
    // (evler, ağaçlar) rakamların yalnızca alt kenarını örter; rakamlar okunur kalır.
    updateInk(a);
    drawYearMarks(ctx);
    drawChunks(ctx, 'mid', chunkEm * 0.8);
    fogBand(ctx, a.fog, 0.4 * (1 - a.darkness * 0.35), A.LAYERS.mid.base + 30);
    // ---- sahneler
    drawTableaux(ctx, 'back', emA * blackout, t);
    fogBand(ctx, a.fog, 0.3 * (1 - a.darkness * 0.3), -100);
    drawTableaux(ctx, 'main', emA * blackout, t);
    fogBand(ctx, a.fog, 0.17 * (1 - a.darkness * 0.3), -60);
    // ---- yakın şerit
    drawChunks(ctx, 'near', chunkEm * blackout);
    // yakın katman biraz sisli: süsler engellerden (koyu + kenar ışıklı) açıkça ayrışır
    fogBand(ctx, a.fog, 0.17 * (1 - a.darkness * 0.4), -8);
    // olay yazıları: sahnenin ve yakın şeridin (ağaçlar, direkler) önünde, oyuncunun arkasında;
    // hiçbir süs satırların üstüne düşmez
    drawEventTexts(ctx, a);
    // havadaki toz zerreleri
    drawMotes(ctx, a, t);
    // ---- oyun katmanı
    drawGame(ctx, a, t);
    ctx.restore();

    // ---- hava durumu
    drawWeather(ctx, a, t, dt);
    // ---- ön plan
    drawForeground(ctx, a);
    // ---- efektler
    post(ctx, a, t, blackout);
  };

  function drawChunks(ctx, name, emA) {
    const L = A.LAYERS[name], k = R.k;
    const off = G.camX * L.p;
    const i0 = Math.floor(off / A.CHUNK), i1 = Math.floor((off + R.viewW) / A.CHUNK);
    const y = R.gy + (L.base - L.up) * k, h = (L.up + L.down) * k;
    const items = [];
    for (let i = i0; i <= i1; i++) {
      const c = getChunk(name, i, true);
      const x = (i * A.CHUNK - off) * k;
      ctx.drawImage(c.c, Math.floor(x), y, Math.ceil(A.CHUNK * k) + 1, h);
      items.push([c, x]);
    }
    if (emA > 0.02) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, emA);
      items.forEach((it) => ctx.drawImage(it[0].ec, Math.floor(it[1]), y, Math.ceil(A.CHUNK * k) + 1, h));
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // sahne panolarının ekrandaki yeri dünyaya bağlı, sabit paralaks (game.js: G.tabX)
  function tableauLeft(it, layer) { return G.tabLeft(it, layer); }

  function drawSky(ctx, t) {
    const k = R.k;
    G.story.queue.forEach((it) => {
      if (it.state !== 'ready' || !it.T.sky.length) return;
      const left = tableauLeft(it, 'main');
      if (left > R.viewW + 200 || left + it.W < -200) return;
      ctx.save();
      ctx.setTransform(k, 0, 0, k, left * k + (ctx.getTransform ? ctx.getTransform().e : 0), R.gy + (-75) * k);
      ctx.globalCompositeOperation = 'lighter';
      it.T.sky.forEach((s) => s.fn(ctx, t));
      ctx.restore();
    });
  }

  function drawTableaux(ctx, layer, emA, t) {
    const k = R.k;
    const base = layer === 'back' ? -110 : -75;
    const tx0 = ctx.getTransform ? ctx.getTransform() : { e: 0, f: 0 };
    G.story.queue.forEach((it) => {
      const left = tableauLeft(it, layer);
      if (left > R.viewW + 20 || left + it.W < -20) return;
      if (it.state !== 'ready') { if (left < R.viewW) G.buildNow(it, R.tabDens); else return; } // görünür olmak üzere: hemen tamamla
      const T = it.T, L = T.layers[layer];
      if (!L) return;
      const X = left * k, Y = R.gy + (base - T.H) * k;
      ctx.drawImage(L.c, X, Y, T.W * k, (T.H + T.B) * k);
      const info = { k: U.clamp((R.viewW - left) / (R.viewW + it.W), 0, 1) };
      const anims = T.anims.filter((an) => an.layer === layer);
      if (anims.length) {
        ctx.save();
        ctx.setTransform(k, 0, 0, k, X + tx0.e, R.gy + base * k + tx0.f);
        anims.forEach((an) => { if (!an.em) an.fn(ctx, t, info); });
        ctx.restore();
      }
      if (emA > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.min(1, emA);
        ctx.drawImage(L.ec, X, Y, T.W * k, (T.H + T.B) * k);
        ctx.setTransform(k, 0, 0, k, X + tx0.e, R.gy + base * k + tx0.f);
        ctx.globalAlpha = Math.min(1, 0.35 + emA * 0.75);
        anims.forEach((an) => { if (an.em) an.fn(ctx, t, info); });
        ctx.restore();
      }
    });
  }

  // ------------------------------------------------------------- dünyaya yerleşik yazılar
  const P_YEAR = A.LAYERS.mid.p, P_TEXT = 0.3;
  function markOf(y, name, d) {
    const key = y + '|' + name + '|' + d.toFixed(2) + '|' + IZ.WT.version;
    let m = R.markCache.get(key);
    if (!m) {
      m = IZ.WT.yearMark(y, name, d);
      R.markCache.set(key, m);
      if (R.markCache.size > 12) R.markCache.delete(R.markCache.keys().next().value);
    }
    return m;
  }
  function drawYearMarks(ctx) {
    const S = G.story;
    if (G.attract || G.mode === 'menu' || !S.points.length) return;
    const k = R.k, d = Math.min(k, 1.2) * 0.75;
    const range = (0.5 * R.viewW + 420) / P_YEAR;
    // taban: zeminin ~300 birim üstü (orta şeridin tipik silueti 230–330: evler ve ağaçlar rakamların
    // yalnızca alt kenarını örter). Kısa ekranlarda işaret ekranın üst kenarına sığacak kadar iner.
    const viewTop = R.gy / k;
    const ink = inkMix();
    const draw = (y, x, name) => {
      const cx = 0.5 * R.viewW + (x - G.camX) * P_YEAR;
      const m = markOf(y, name, d);
      if (cx + m.w / 2 < -20 || cx - m.w / 2 > R.viewW + 20) return;
      // yıl rakamı ekranın bir ucundan öbür ucuna aynı netlikte kayar ve ekrandan çıkarak kaybolur
      // (solarak kaybolmaz); olay yazısının arkasında kalırsa yazının perdesi onu biraz örter
      const al = 0.86;
      const baseWU = Math.max(-300, 10 - viewTop + m.base);
      const X = (cx - m.w / 2) * k, Y = R.gy + (baseWU - m.base) * k;
      if (ink.aD > 0.01) { ctx.globalAlpha = al * ink.aD; ctx.drawImage(m.dark, X, Y, m.w * k, m.h * k); }
      if (ink.aL > 0.01) { ctx.globalAlpha = al * ink.aL; ctx.drawImage(m.light, X, Y, m.w * k, m.h * k); }
    };
    // açılış: başlangıç yılı ve dönemin adı
    const p0 = S.points[0];
    const openX = p0.x + 0.15 * R.viewW / P_YEAR;
    const y0 = Math.floor(p0.dec);
    if (Math.abs(openX - G.camX) < range) draw(y0, openX, IZ.ERAS[IZ.eraIndex(p0.dec)].name);
    // her yıl geçişi
    const ya = Math.floor(G.yearAtX(G.camX - range)), yb = Math.ceil(G.yearAtX(G.camX + range));
    for (let y = Math.max(ya, y0 + 1); y <= Math.min(yb, ya + 8); y++) {
      const x = G.xAtYear(y);
      if (x === null || Math.abs(x - G.camX) > range) continue;
      draw(y, x, IZ.WT.eraNameForYear(y));
    }
    ctx.globalAlpha = 1;
  }

  // Gökyüzü açıksa koyu mürekkep, koyuysa açık mürekkep. İki mürekkep aynı anda yarı yarıya
  // karışınca yazı griye döner; bu yüzden eşikli (gecikmeli) karar verilir, geçiş kısa sürer.
  function updateInk(a) {
    const L = U.lum(U.mix(U.mix(a.skyMid, a.skyTop, 0.35), a.fog, 0.3));
    if (R.inkDark === undefined) R.inkDark = L > 0.53 ? 1 : 0;
    const target = L > 0.56 ? 1 : L < 0.5 ? 0 : (R.inkDark > 0.5 ? 1 : 0);
    R.inkDark = U.damp(R.inkDark, target, 5, 1 / 60);
  }
  function inkMix() {
    const v = R.inkDark === undefined ? 1 : R.inkDark;
    const dark = v < 0.03 ? 0 : v > 0.97 ? 1 : v;
    // önce eski mürekkep söner, sonra yenisi belirir
    return { aL: U.clamp(1 - 2 * dark, 0, 1), aD: U.clamp(2 * dark - 1, 0, 1) };
  }

  function drawEventTexts(ctx, a) {
    const S = G.story;
    R.textRects.length = 0;
    if (G.attract || G.mode === 'menu' || !S.queue.length) return;
    const k = R.k;
    // açıklama yazısı ekranda en az ~15,5 css pikseli olsun (telefonlarda büyür);
    // yıl ve başlık daha az büyür ki blok küçük ekranlarda sahneyi kapatmasın
    const cssPerWU = k / R.dpr;
    const ts = U.clamp(13.5 / (19 * cssPerWU), 1, 1.8);
    const tb = U.clamp(15.5 / (19 * cssPerWU), 1, 2);
    const maxW = Math.max(260, Math.min(560 * tb, R.viewW * 0.84 - 92 * tb));
    const d = Math.min(k, 2);
    const key = ts.toFixed(2) + '|' + tb.toFixed(2) + '|' + Math.round(maxW) + '|' + d.toFixed(2) + '|' + IZ.WT.version;
    const ink = inkMix();
    S.queue.forEach((it) => {
      if (it.state === 'dead') return;
      const dd = it.F - G.camX;
      // durgunluk genişliği olayın sabit nominal hızına bağlı: oyuncu yavaşlasa da yazı yerinden oynamaz
      const D = 1.9 * (it.vNom || Math.max(300, G.speed));
      // uzaktan yavaşça kayar, ortaya gelince birkaç saniye neredeyse durur, sonra yine kayar
      const g = P_TEXT * (dd - D * Math.tanh(dd / D));
      const cx = R.viewW * 0.5 + g;
      if (Math.abs(g) > R.viewW * 1.4) return;
      if (!it.text || it.textKey !== key) {
        // blok ekrana sığmıyorsa (dar dikey telefon, kısa yatay telefon) yazı adım adım küçültülür
        let B = null, f = 1;
        for (let n = 0; n < 4; n++) {
          B = IZ.WT.eventBlock(it.ev, ts * f, maxW, d, tb * f);
          // ölçüt: yazının (perde payı hariç) alt kenarı karakterin başının üstünde kalsın
          if (B.w <= R.viewW - 12 && B.h - B.pad <= R.gy / k - 96) break;
          f *= 0.86;
        }
        it.text = B; it.textKey = key;
      }
      const B = it.text;
      if (cx + B.w / 2 < 0 || cx - B.w / 2 > R.viewW) return;
      const al = 1 - U.smoothstep(0.26, 0.5, Math.abs(cx - R.viewW * 0.5) / R.viewW);
      if (al < 0.01) return;
      // dikey: zemin çizgisinin üzerinde sabit bir yükseklikte, ekrana sığacak şekilde
      const topWU = U.clamp(R.gy / k - B.h - 230, 8, R.gy / k - B.h - 90);
      const x = (cx - B.w / 2) * k, y = topWU * k;
      if (ink.aL > 0.01) { ctx.globalAlpha = al * ink.aL; ctx.drawImage(B.light, x, y, B.w * k, B.h * k); }
      if (ink.aD > 0.01) { ctx.globalAlpha = al * ink.aD; ctx.drawImage(B.dark, x, y, B.w * k, B.h * k); }
      // yıl işaretleri bir sonraki karede bu alanla çakışırsa geri çekilir
      R.textRects.push({ x0: cx - B.w / 2 + B.pad, x1: cx + B.w / 2 - B.pad, y0: topWU, y1: topWU + B.h, a: al });
    });
    ctx.globalAlpha = 1;
  }

  function drawRays(ctx, sx, sy, a, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // yelpaze yukarı doğru açılır (yatay ışın yok: ufukta çizgi gibi durmasın)
    const n = 7, k = R.k;
    for (let i = 0; i < n; i++) {
      const ang = Math.PI * 1.14 + (i / (n - 1)) * Math.PI * 0.48 + Math.sin(t * 0.13 + i * 1.7) * 0.03;
      const len = 1400 * k, wdt = (0.018 + 0.02 * ((i * 7) % 3) / 2);
      const g = ctx.createLinearGradient(sx, sy, sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      const al = a.rays * a.sunVis * (0.085 + 0.05 * Math.sin(t * 0.4 + i * 2.3)) * (1 - a.darkness * 0.6);
      g.addColorStop(0, U.rgba(a.sun, al)); g.addColorStop(1, U.rgba(a.sun, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang - wdt) * len, sy + Math.sin(ang - wdt) * len);
      ctx.lineTo(sx + Math.cos(ang + wdt) * len, sy + Math.sin(ang + wdt) * len);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawMotes(ctx, a, t) {
    if (R.q < 0.7) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const col = U.mix(a.sun, [255, 255, 255], 0.3);
    for (let i = 0; i < R.motes.length; i++) {
      const m = R.motes[i];
      const x = U.wrap(m.x * R.W - G.camX * R.k * (0.6 + m.z * 0.5) * 0.15 + Math.sin(t * 0.3 + m.p) * 20, R.W);
      const y = (m.y * 0.8 + 0.05) * R.gy + Math.sin(t * 0.5 + m.p * 3) * 12;
      const al = (0.25 + 0.25 * Math.sin(t + m.p)) * (0.4 + a.sunVis * 0.6) * 0.6;
      ctx.fillStyle = U.rgba(col, al);
      ctx.beginPath(); ctx.arc(x, y, (1 + m.z * 1.6) * R.k, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------- oyun katmanı
  function silColor(a) { return U.rgb(U.mix([10, 9, 8], a.fog, 0.05)); }
  function groundTile() {
    const style = IZ.ERAS[G.story.eraIdx].ground;
    R.groundTiles = R.groundTiles || {};
    if (!R.groundTiles[style]) R.groundTiles[style] = A.groundTile(style, Math.min(R.k, 1.6));
    return R.groundTiles[style];
  }

  function drawGame(ctx, a, t) {
    const k = R.k, gy = R.gy;
    const cam = G.camX;
    const X = (wx) => (wx - cam) * k;
    const sil = silColor(a);
    const rimCol = U.mix(a.sun, [255, 255, 255], 0.35);
    // zemin
    const tile = groundTile();
    const vis0 = cam - 50, vis1 = cam + R.viewW + 50;
    // çukur: dibi görünmeyen karanlık bir uçurum, ağzında hafif sis
    G.segs.forEach((s, i) => {
      const nx = G.segs[i + 1];
      if (!nx || s.x1 > vis1 || nx.x0 < vis0) return;
      const x0 = X(s.x1) - 1, x1 = X(nx.x0) + 1;
      const deep = U.mix([6, 5, 5], a.fog, 0.1);
      const g = ctx.createLinearGradient(0, gy - 30 * k, 0, gy + 220 * k);
      g.addColorStop(0, U.rgba(U.mix(deep, a.fog, 0.35), 1)); g.addColorStop(0.35, U.rgba(U.mix(deep, a.fog, 0.12), 1)); g.addColorStop(1, U.rgba(deep, 1));
      ctx.fillStyle = g; ctx.fillRect(x0, gy - 2, x1 - x0, R.H - gy + 2 + 40 * k);
      ctx.fillStyle = sil;
    });
    ctx.fillStyle = sil;
    G.segs.forEach((s) => {
      if (s.x1 < vis0 || s.x0 > vis1) return;
      const x0 = Math.max(s.x0, vis0), x1 = Math.min(s.x1, vis1);
      ctx.fillRect(X(x0), gy - 1, (x1 - x0) * k, R.H - gy + 2 + 40 * k);
      // kenar dokusu
      ctx.save();
      ctx.beginPath(); ctx.rect(X(x0), gy - tile.up * k, (x1 - x0) * k, (tile.up + tile.down) * k); ctx.clip();
      const tw = tile.W;
      const start = Math.floor(x0 / tw) * tw;
      for (let tx = start; tx < x1; tx += tw) ctx.drawImage(tile.c, X(tx), gy - tile.up * k, tw * k + 1, (tile.up + tile.down) * k);
      ctx.restore();
      // uçurum kenarları
      if (isFinite(s.x0) && s.x0 > vis0 && s.x0 < vis1) cliff(ctx, X(s.x0), gy, k, -1);
      if (isFinite(s.x1) && s.x1 > vis0 && s.x1 < vis1) cliff(ctx, X(s.x1), gy, k, 1);
    });
    // tile siyahını zeminle aynı tona getir (tile siyah çizildi): üstüne ince ışık çizgisi
    ctx.globalAlpha = 0.16 + a.darkness * 0.1;
    ctx.fillStyle = U.rgb(rimCol);
    G.segs.forEach((s) => {
      if (s.x1 < vis0 || s.x0 > vis1) return;
      const x0 = Math.max(s.x0, vis0), x1 = Math.min(s.x1, vis1);
      ctx.fillRect(X(x0), gy - 1.2 * k, (x1 - x0) * k, 1.1 * k);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = sil;

    const dens = Math.min(k, 1.6);
    // engellerin ve platformların arkasında yumuşak ışıma: arka plandaki süslerden ayrışsınlar
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const haloA = U.clamp(0.16 + a.darkness * 0.22, 0, 0.4);
    const halo = (cx, cy, w, h) => { ctx.globalAlpha = haloA; ctx.drawImage(R.halo, X(cx) - w * k, gy + cy * k - h * k, w * 2 * k, h * 2 * k); };
    G.plats.forEach((pl) => { if (pl.x > vis1 || pl.x + pl.w < vis0) return; halo(pl.x + pl.w / 2, -pl.h * 0.6, pl.w * 0.75, pl.h * 1.1); });
    G.obs.forEach((o) => { if (!o.alive || o.x > vis1 || o.x + o.w < vis0) return; halo(o.x + o.w / 2, o.y - o.h * 0.55, Math.max(o.w, 60) * 0.95, Math.max(o.h, 50) * 1.15); });
    ctx.restore();
    // platformlar
    G.plats.forEach((pl) => {
      if (pl.x > vis1 || pl.x + pl.w < vis0) return;
      const sp = A.obsSprite(pl.type, dens);
      ctx.drawImage(sp.c, X(pl.x - sp.pad), gy + (-sp.h - sp.pad) * k, (sp.w + sp.pad * 2) * k, (sp.h + sp.pad * 2) * k);
    });
    // engeller
    G.obs.forEach((o) => {
      if (!o.alive || o.x > vis1 || o.x + o.w < vis0) return;
      const sp = A.obsSprite(o.type, dens);
      ctx.drawImage(sp.c, X(o.x - sp.pad), gy + (o.y - sp.h - sp.pad) * k, (sp.w + sp.pad * 2) * k, (sp.h + sp.pad * 2) * k);
    });
    // ışıklar (toplanabilir)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lc = U.mix(a.sun, [255, 236, 190], 0.5);
    G.lights.forEach((l) => {
      if (l.x < vis0 || l.x > vis1) return;
      const bob = Math.sin(l.t * 3) * 4;
      let s = 1, al = 1;
      if (l.got) { const u = (l.gt || 0) / 0.5; s = 1 + u * 2; al = 1 - u; }
      const x = X(l.x), y = gy + (l.y + bob) * k;
      const r = 15 * k * s;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, U.rgba([255, 252, 240], 0.95 * al)); g.addColorStop(0.18, U.rgba(lc, 0.7 * al)); g.addColorStop(1, U.rgba(lc, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    });
    ctx.restore();
    // parçacıklar
    G.parts.forEach((q) => {
      const x = X(q.x), y = gy + q.y * k, u = q.life / q.max;
      if (q.kind === 'spark') {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = U.rgba(lc, u); ctx.beginPath(); ctx.arc(x, y, q.size * k, 0, TAU); ctx.fill(); ctx.restore();
      } else if (q.kind === 'debris') {
        ctx.fillStyle = sil; ctx.save(); ctx.translate(x, y); ctx.rotate(q.x * 0.05); ctx.fillRect(-q.size * k / 2, -q.size * k / 2, q.size * k, q.size * k * 0.6); ctx.restore();
      } else {
        ctx.fillStyle = U.rgba(U.mix(a.fog, [60, 56, 50], 0.4), 0.35 * u);
        ctx.beginPath(); ctx.arc(x, y, q.size * k * (1.6 - u * 0.6), 0, TAU); ctx.fill();
      }
    });
    // oyuncu
    const p = G.player;
    const inv = p.invT > 0 && p.alive && Math.floor(p.invT * 14) % 2 === 0;
    ctx.save();
    ctx.setTransform(k, 0, 0, k, X(p.x) + (ctx.getTransform ? ctx.getTransform().e : 0), gy + p.y * k + (ctx.getTransform ? ctx.getTransform().f : 0));
    G.char.draw(ctx, 0, 0, {
      sil: sil, far: U.rgb(U.mix([10, 9, 8], a.fog, 0.14)), rim: U.rgba(rimCol, G.fx.hit > 0.3 ? 0.95 : 0.5), rimOff: [1.5, -1.0],
      scarf: U.rgb(a.red), scarfDark: U.rgb(U.mul(a.red, 0.55)), alpha: inv ? 0.35 : 1,
    });
    ctx.restore();
  }

  function cliff(ctx, x, gy, k, side) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, gy - 2 * k);
    ctx.quadraticCurveTo(x + side * 10 * k, gy + 20 * k, x + side * 2 * k, gy + 60 * k);
    ctx.quadraticCurveTo(x - side * 4 * k, gy + 110 * k, x + side * 6 * k, gy + 200 * k);
    ctx.lineTo(x - side * 30 * k, R.H);
    ctx.lineTo(x - side * 30 * k, gy - 2 * k);
    ctx.closePath(); ctx.fill();
    // sarkan kökler
    ctx.lineWidth = 1.2 * k; ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const yy = gy + (6 + i * 9) * k; ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + side * (8 + i * 3) * k, yy + 10 * k, x + side * (4 + i * 2) * k, yy + (24 + i * 8) * k); }
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------- hava durumu
  function drawWeather(ctx, a, t, dt) {
    const W = R.W, H = R.H, k = R.k;
    const wv = R.weather;
    const camShift = G.camX * k;
    if (a.rain > 0.03) {
      ctx.save(); ctx.strokeStyle = U.rgba(U.mix(a.fog, [220, 225, 235], 0.5), 0.28 * a.rain); ctx.lineWidth = 1.1 * R.dpr;
      ctx.beginPath();
      const n = Math.floor(wv.length * a.rain);
      for (let i = 0; i < n; i++) {
        const w = wv[i];
        const x = U.wrap(w.x * W - camShift * (0.9 + w.z) * 0.5 - t * 80 * k, W);
        const y = U.wrap(w.y * H + t * (900 + w.z * 600) * k, H);
        const L = (18 + w.z * 22) * k;
        ctx.moveTo(x, y); ctx.lineTo(x - L * 0.18, y + L);
      }
      ctx.stroke(); ctx.restore();
    }
    if (a.snow > 0.03) {
      ctx.save(); ctx.fillStyle = U.rgba([245, 247, 252], 0.75 * a.snow);
      const n = Math.floor(wv.length * a.snow);
      for (let i = 0; i < n; i++) {
        const w = wv[i];
        const x = U.wrap(w.x * W - camShift * (0.3 + w.z * 0.9) * 0.6 + Math.sin(t * 0.8 + w.s * 10) * 30 * k, W);
        const y = U.wrap(w.y * H + t * (40 + w.z * 60) * k, H);
        ctx.globalAlpha = 0.4 + w.z * 0.6;
        ctx.beginPath(); ctx.arc(x, y, (1 + w.z * 2.4) * k, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    if (a.embers > 0.03) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const n = Math.floor(90 * a.embers);
      for (let i = 0; i < n; i++) {
        const w = wv[i];
        const x = U.wrap(w.x * W - camShift * 0.7 + Math.sin(t * 2 + w.s * 9) * 20 * k, W);
        const y = U.wrap(w.y * H - t * (60 + w.z * 90) * k, H);
        const al = (0.5 + 0.5 * Math.sin(t * 7 + w.s * 20)) * a.embers;
        ctx.fillStyle = 'rgba(255,' + (120 + Math.floor(w.s * 80)) + ',50,' + al.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, (1 + w.z * 1.8) * k, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    if (a.ash > 0.03) {
      ctx.save(); ctx.fillStyle = 'rgba(70,64,60,' + (0.5 * a.ash).toFixed(3) + ')';
      for (let i = 0; i < 70 * a.ash; i++) {
        const w = wv[i + 90];
        const x = U.wrap(w.x * W - camShift * 0.5 + Math.sin(t + w.s * 7) * 40 * k, W);
        const y = U.wrap(w.y * H + t * (20 + w.z * 30) * k, H);
        ctx.fillRect(x, y, (2 + w.z * 3) * k, (1 + w.z) * k);
      }
      ctx.restore();
    }
    // deprem tozu
    const qd = Math.max(a.dust, G.fx.shake * 0.8);
    if (qd > 0.03) {
      ctx.save(); ctx.fillStyle = U.rgba(U.mix(a.fog, [150, 135, 115], 0.5), 0.12 * qd); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = U.rgba([120, 110, 95], 0.5 * qd);
      for (let i = 0; i < 60; i++) {
        const w = wv[i + 40];
        const x = U.wrap(w.x * W - camShift * 0.8, W), y = U.wrap(w.y * H + t * (30 + w.z * 120) * k, H);
        ctx.fillRect(x, y, (1 + w.z * 2) * k, (1 + w.z * 2) * k);
      }
      ctx.restore();
    }
  }

  // ------------------------------------------------------------- ön plan
  function drawForeground(ctx, a) {
    if (R.q < 0.62) return;
    const k = R.k, p = 1.45;
    const off = G.camX * p;
    R.fgSprites = R.fgSprites || {};
    // yeni öğe üret
    if (R.fgNext < off - 2000) R.fgNext = off + R.viewW + 300;
    while (R.fgNext < off + R.viewW + 600) {
      const era = IZ.ERAS[G.story.eraIdx];
      const kinds = era.ground === 'dirt' || era.ground === 'meadow' ? ['grass', 'grass', 'thistle'] : ['grass', 'grass'];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      R.fgList.push({ x: R.fgNext, kind: kind, seed: Math.floor(Math.random() * 999), flip: Math.random() < 0.5 });
      R.fgNext += U.lerp(1800, 3600, Math.random());
    }
    R.fgList = R.fgList.filter((f) => f.x > off - 800);
    R.fgList.forEach((f) => {
      const key = f.kind + f.seed % 3;
      if (!R.fgSprites[key]) R.fgSprites[key] = A.fgSprite(f.kind, Math.min(k, 1.4), f.seed % 3 + 1);
      const sp = R.fgSprites[key];
      // ön plan öğeleri zemin çizgisinin altında kalır; yalnızca uçları oyun alanına uzanır
      const x = (f.x - off - sp.ox) * k, y = R.gy + (125 - sp.up) * k;
      if (x > R.W || x + sp.W * k < 0) return;
      ctx.save();
      ctx.globalAlpha = 0.85;
      if (f.flip) { ctx.translate(x + sp.W * k, 0); ctx.scale(-1, 1); ctx.drawImage(sp.c, 0, y, sp.W * k, (sp.up + sp.down) * k); }
      else ctx.drawImage(sp.c, x, y, sp.W * k, (sp.up + sp.down) * k);
      ctx.restore();
    });
  }

  // ------------------------------------------------------------- son efektler
  function post(ctx, a, t, blackout) {
    const W = R.W, H = R.H;
    if (blackout < 0.99) { ctx.fillStyle = 'rgba(0,0,0,' + ((1 - blackout) * 0.32).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    // vinyet
    ctx.globalAlpha = U.clamp(a.vignette + 0.15 * a.darkness, 0, 1);
    ctx.drawImage(R.vig, 0, 0);
    ctx.globalAlpha = 1;
    // eski film: titreşim, çizik, toz
    if (a.flicker > 0.01) {
      const f = (Math.random() - 0.5) * a.flicker * 0.09;
      ctx.fillStyle = f > 0 ? 'rgba(255,248,230,' + f.toFixed(3) + ')' : 'rgba(0,0,0,' + (-f).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    if (a.scratch > 0.01 && R.q > 0.6) {
      ctx.save();
      if (Math.random() < a.scratch * 0.6) {
        const x = Math.random() * W;
        ctx.fillStyle = 'rgba(245,238,220,' + (0.1 + Math.random() * 0.15).toFixed(3) + ')';
        ctx.fillRect(x, 0, Math.max(1, R.dpr * 0.8), H);
      }
      if (Math.random() < a.scratch * 0.3) {
        const x = Math.random() * W;
        ctx.fillStyle = 'rgba(20,16,12,0.18)';
        ctx.fillRect(x, 0, Math.max(1, R.dpr), H);
      }
      ctx.restore();
    }
    if (a.filmDust > 0.01 && R.q > 0.6) {
      ctx.save();
      const n = Math.floor(Math.random() * 5 * a.filmDust);
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(10,8,6,0.5)' : 'rgba(250,244,230,0.35)';
        ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, (0.5 + Math.random() * 2.2) * R.dpr, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    // gren
    if (a.grain > 0.005 && R.q > 0.6) {
      const g = R.grains[Math.floor(t * 24) % R.grains.length];
      const pat = ctx.createPattern(g, 'repeat');
      ctx.save();
      ctx.globalAlpha = a.grain * 0.9;
      ctx.globalCompositeOperation = 'overlay';
      const ox = Math.floor(Math.random() * 160), oy = Math.floor(Math.random() * 160);
      ctx.translate(-ox, -oy);
      ctx.fillStyle = pat; ctx.fillRect(0, 0, W + ox, H + oy);
      ctx.restore();
    }
    // VHS tarama çizgileri
    if (a.scan > 0.01) {
      ctx.save();
      ctx.globalAlpha = a.scan * 0.32;
      ctx.fillStyle = ctx.createPattern(R.scan, 'repeat');
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    // darbe kırmızısı
    if (G.fx.hit > 0.01) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.6);
      g.addColorStop(0, 'rgba(160,20,20,0)'); g.addColorStop(1, 'rgba(160,20,20,' + (0.45 * G.fx.hit).toFixed(3) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (G.fx.flash > 0.01) { ctx.fillStyle = 'rgba(0,0,0,' + (G.fx.flash * 0.9).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    // oyun sonu: renk solması
    if (G.mode === 'dying' || G.mode === 'over') {
      const u = G.mode === 'over' ? 1 : U.clamp(G.player.deadT / 1.4, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'rgba(128,128,128,' + (0.9 * u).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * u).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
    }
  }
})();
