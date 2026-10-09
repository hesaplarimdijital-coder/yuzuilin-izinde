/* =========================================================================
   Yüzyılın İzinde — çizim temel kitaplığı (1/3)
   Şekil yardımcıları, bayrak, insan siluetleri, kalabalık, ağaçlar, arazi.
   Koordinatlar dünya birimidir (WU); y yukarı doğru negatiftir, zemin y=0.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U;
  const P = (IZ.P = IZ.P || {});
  const TAU = U.TAU;

  // Sahne içi derinlik tonları (sis katmanları bunları renklendirir)
  P.TONE = ['#6a6a6a', '#4c4c4c', '#333333', '#232323', '#161616', '#0d0d0d'];
  P.LIGHT = '#ffd690';
  P.LIGHT_COOL = '#cfe2ff';
  P.FLAG_RED = '#e30a17';

  // -------------------------------------------------------------- şekiller
  P.capsule = function (ctx, x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
    if (d <= Math.abs(r1 - r2) + 0.01) {
      const big = r1 >= r2;
      const r = big ? r1 : r2, cx = big ? x1 : x2, cy = big ? y1 : y2;
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, TAU);
      return;
    }
    const a = Math.atan2(dy, dx), th = Math.acos(U.clamp((r1 - r2) / d, -1, 1));
    ctx.moveTo(x1 + r1 * Math.cos(a + th), y1 + r1 * Math.sin(a + th));
    ctx.arc(x1, y1, r1, a + th, a - th + TAU);
    ctx.lineTo(x2 + r2 * Math.cos(a - th), y2 + r2 * Math.sin(a - th));
    ctx.arc(x2, y2, r2, a - th, a + th);
    ctx.closePath();
  };

  P.rrect = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  };

  P.fillRR = function (ctx, x, y, w, h, r) { ctx.beginPath(); P.rrect(ctx, x, y, w, h, r); ctx.fill(); };
  P.fillRect = function (ctx, x, y, w, h) { ctx.fillRect(x, y, w, h); };
  P.fillCircle = function (ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
  P.fillEllipse = function (ctx, x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill(); };

  P.poly = function (ctx, pts, close) {
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    if (close !== false) ctx.closePath();
  };
  P.fillPoly = function (ctx, pts) { ctx.beginPath(); P.poly(ctx, pts); ctx.fill(); };

  P.starPath = function (ctx, x, y, R, r, n, rot) {
    n = n || 5; rot = rot === undefined ? -Math.PI / 2 : rot;
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r : R, a = rot + (i * Math.PI) / n;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  // Kalın bir çizgiyi (yuvarlak uçlu) dolgu olarak çiz
  P.line = function (ctx, x1, y1, x2, y2, w) {
    ctx.beginPath(); P.capsule(ctx, x1, y1, w / 2, x2, y2, w / 2); ctx.fill();
  };
  P.stroke = function (ctx, pts, w, color) {
    ctx.save();
    if (color) ctx.strokeStyle = color;
    ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); P.poly(ctx, pts, false); ctx.stroke();
    ctx.restore();
  };

  // ------------------------------------------------------------- ışıklar
  P.glow = function (em, x, y, r, color, a) {
    if (!em) return;
    const c = U.hex(color || P.LIGHT);
    const g = em.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.rgba(c, a === undefined ? 0.9 : a));
    g.addColorStop(0.35, U.rgba(c, (a === undefined ? 0.9 : a) * 0.35));
    g.addColorStop(1, U.rgba(c, 0));
    em.fillStyle = g;
    em.fillRect(x - r, y - r, r * 2, r * 2);
  };
  P.lightRect = function (em, x, y, w, h, color, a) {
    if (!em) return;
    em.fillStyle = U.rgba(U.hex(color || P.LIGHT), a === undefined ? 0.85 : a);
    em.fillRect(x, y, w, h);
  };

  // Pencere ızgarası: ctx'te hafif açık pencereler, em'de yanan ışıklar
  P.windows = function (ctx, em, x, y, w, h, cols, rows, o, rng) {
    o = o || {};
    const padX = o.padX === undefined ? w * 0.12 : o.padX, padY = o.padY === undefined ? h * 0.08 : o.padY;
    const cw = (w - padX * 2) / cols, ch = (h - padY * 2) / rows;
    const ww = cw * (o.ww || 0.5), wh = ch * (o.wh || 0.55);
    const lit = o.lit === undefined ? 0.35 : o.lit;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = x + padX + c * cw + (cw - ww) / 2;
        const wy = y + padY + r * ch + (ch - wh) / 2;
        if (o.tone) {
          ctx.save(); ctx.fillStyle = o.tone;
          if (o.arch) { ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + ww / 2); ctx.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww, wy + wh); ctx.closePath(); ctx.fill(); }
          else ctx.fillRect(wx, wy, ww, wh);
          ctx.restore();
        }
        if (em && rng && rng() < lit) {
          const warm = rng() < 0.8;
          const col = o.color || (warm ? P.LIGHT : (o.tv ? '#9ec4ff' : '#ffe9c4'));
          P.lightRect(em, wx, wy, ww, wh, col, 0.45 + rng() * 0.5);
        }
      }
    }
  };

  // ------------------------------------------------------------- bayrak
  const flagTex = {};
  P.flagTexture = function (red) {
    red = red || P.FLAG_RED;
    if (flagTex[red]) return flagTex[red];
    const G = 120, L = 180;
    const c = U.canvas(L, G), x = c.getContext('2d');
    x.fillStyle = red; x.fillRect(0, 0, L, G);
    x.fillStyle = '#ffffff';
    x.beginPath(); x.arc(0.5 * G, 0.5 * G, 0.25 * G, 0, TAU); x.fill();
    x.fillStyle = red;
    x.beginPath(); x.arc(0.5625 * G, 0.5 * G, 0.2 * G, 0, TAU); x.fill();
    x.fillStyle = '#ffffff';
    x.beginPath(); P.starPath(x, 0.8208 * G, 0.5 * G, 0.125 * G, 0.125 * G * 0.382, 5, Math.PI); x.fill();
    // hafif kumaş dokusu
    for (let i = 0; i < 40; i++) {
      x.fillStyle = 'rgba(0,0,0,' + (0.02 + Math.random() * 0.03) + ')';
      x.fillRect(0, Math.random() * G, L, 1);
    }
    flagTex[red] = c;
    return c;
  };
  const plainTex = {};
  P.plainFlagTexture = function (col, emblem) {
    const key = col + (emblem || '');
    if (plainTex[key]) return plainTex[key];
    const c = U.canvas(180, 120), x = c.getContext('2d');
    x.fillStyle = col; x.fillRect(0, 0, 180, 120);
    if (emblem === 'nato') {
      x.strokeStyle = 'rgba(255,255,255,.85)'; x.fillStyle = 'rgba(255,255,255,.9)';
      x.lineWidth = 3; x.beginPath(); x.arc(90, 60, 22, 0, TAU); x.stroke();
      x.beginPath(); P.starPath(x, 90, 60, 34, 7, 4, -Math.PI / 2); x.fill();
    } else if (emblem === 'eu') {
      x.fillStyle = '#ffd34d';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; x.beginPath(); P.starPath(x, 90 + Math.cos(a) * 34, 60 + Math.sin(a) * 34, 6, 2.4, 5); x.fill(); }
    } else if (emblem === 'un') {
      // basit dünya ve zeytin dalı
      x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 2.4;
      x.beginPath(); x.arc(90, 58, 20, 0, TAU); x.stroke();
      x.beginPath(); x.moveTo(70, 58); x.lineTo(110, 58); x.moveTo(90, 38); x.lineTo(90, 78); x.stroke();
      x.beginPath(); x.ellipse(90, 58, 9, 20, 0, 0, TAU); x.stroke();
      x.beginPath(); x.arc(90, 62, 31, Math.PI * 0.62, Math.PI * 1.32); x.stroke();
      x.beginPath(); x.arc(90, 62, 31, -Math.PI * 0.32, Math.PI * 0.38); x.stroke();
    } else if (emblem === 'stripes') {
      x.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 3; i++) x.fillRect(0, 20 + i * 36, 180, 14);
    }
    plainTex[key] = c;
    return c;
  };

  // Dalgalanan bayrak. x,y: direğin bayrağın bağlandığı üst noktası. w: bayrak uzunluğu.
  P.flag = function (ctx, x, y, w, t, o) {
    o = o || {};
    const tex = o.tex || P.flagTexture(o.red);
    const h = w / 1.5, dir = o.dir || 1;
    const N = Math.max(6, Math.min(26, Math.round(w / 3)));
    const amp = (o.amp === undefined ? 0.09 : o.amp) * w, k = 2.2, sp = o.speed || 6;
    const droop = o.droop || 0;
    const sw = w / N;
    // her şerit, sol ve sağ kenarı dalganın kendi yüksekliğine oturacak şekilde eğilir (kayma dönüşümü):
    // böylece bayrağın üst ve alt kenarı merdiven gibi değil, kesintisiz bir dalga olarak görünür
    ctx.save();
    ctx.translate(x, y);
    if (dir < 0) ctx.scale(-1, 1);
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N;
      const ph0 = u0 * k * TAU / 2 - t * sp, ph1 = u1 * k * TAU / 2 - t * sp;
      const dy0 = Math.sin(ph0) * amp * u0 + droop * u0 * u0 * h;
      const dy1 = Math.sin(ph1) * amp * u1 + droop * u1 * u1 * h;
      const slope = (dy1 - dy0) / sw;
      ctx.save();
      ctx.transform(1, slope, 0, 1, u0 * w, dy0);
      // şeritler arasında ince boşluk kalmasın diye bir sonrakinin altına hafifçe taşar (aynı ölçekte)
      const ov = i === N - 1 ? 0 : Math.min(0.7, sw * 0.5);
      ctx.drawImage(tex, u0 * tex.width, 0, (sw + ov) * tex.width / w, tex.height, 0, 0, sw + ov, h);
      const shade = Math.cos((ph0 + ph1) / 2) * 0.22 * (0.3 + (u0 + u1) / 2);
      if (Math.abs(shade) > 0.02) {
        ctx.fillStyle = shade > 0 ? 'rgba(0,0,0,' + shade.toFixed(3) + ')' : 'rgba(255,255,255,' + (-shade * 0.5).toFixed(3) + ')';
        ctx.fillRect(0, 0, sw, h);
      }
      ctx.restore();
    }
    ctx.restore();
  };

  P.pole = function (ctx, x, y, h, w) {
    w = w || Math.max(1.2, h * 0.012);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, y); ctx.lineTo(x - w * 0.4, y - h); ctx.lineTo(x + w * 0.4, y - h); ctx.lineTo(x + w * 0.6, y);
    ctx.closePath(); ctx.fill();
    P.fillCircle(ctx, x, y - h - w * 0.8, w * 1.1);
  };

  // ------------------------------------------------------------- insanlar
  /* Pozlar: açılar radyan. 0 = aşağı, pozitif = yüzün baktığı yöne doğru.
     tl: gövde eğimi, hd: baş, tn/kn: ön bacak kalça/diz, tf/kf: arka bacak,
     an/en: ön kol omuz/dirsek, af/ef: arka kol. */
  P.POSES = {
    stand: { tl: 0.02, hd: 0, tn: 0.04, kn: 0.04, tf: -0.05, kf: 0.06, an: 0.1, en: 0.18, af: -0.08, ef: 0.15 },
    stand2: { tl: -0.02, hd: -0.05, tn: 0.14, kn: 0.12, tf: -0.08, kf: 0.02, an: 0.05, en: 0.6, af: 0.05, ef: 0.6 },
    walk1: { tl: 0.06, hd: 0, tn: 0.38, kn: 0.12, tf: -0.32, kf: 0.4, an: -0.35, en: 0.35, af: 0.32, ef: 0.35 },
    walk2: { tl: 0.06, hd: 0, tn: -0.28, kn: 0.35, tf: 0.34, kf: 0.1, an: 0.32, en: 0.35, af: -0.32, ef: 0.35 },
    run: { tl: 0.28, hd: -0.15, tn: 0.85, kn: 1.2, tf: -0.55, kf: 0.6, an: -0.9, en: 1.5, af: 0.8, ef: 1.4 },
    wave: { tl: 0.0, hd: -0.1, tn: 0.06, kn: 0.04, tf: -0.06, kf: 0.05, an: 2.6, en: 0.5, af: -0.05, ef: 0.2 },
    cheer: { tl: -0.06, hd: -0.25, tn: 0.12, kn: 0.08, tf: -0.12, kf: 0.06, an: 2.75, en: 0.25, af: 2.55, ef: 0.3 },
    fist: { tl: 0.0, hd: -0.15, tn: 0.08, kn: 0.04, tf: -0.08, kf: 0.06, an: 2.95, en: 0.05, af: -0.05, ef: 0.25 },
    flag: { tl: -0.02, hd: -0.1, tn: 0.08, kn: 0.05, tf: -0.08, kf: 0.05, an: 2.25, en: 0.45, af: 0.6, ef: 1.0 },
    torch: { tl: 0.0, hd: -0.05, tn: 0.1, kn: 0.05, tf: -0.1, kf: 0.05, an: 2.1, en: 0.6, af: 0.0, ef: 0.2 },
    point: { tl: 0.0, hd: -0.05, tn: 0.12, kn: 0.04, tf: -0.06, kf: 0.05, an: 1.6, en: 0.0, af: -0.05, ef: 0.2 },
    carry: { tl: 0.04, hd: 0, tn: 0.2, kn: 0.1, tf: -0.15, kf: 0.2, an: 0.25, en: 1.2, af: 0.2, ef: 1.1 },
    suitcase: { tl: 0.03, hd: 0, tn: 0.25, kn: 0.1, tf: -0.22, kf: 0.3, an: 0.05, en: 0.05, af: 0.15, ef: 0.2 },
    mourn: { tl: 0.06, hd: 0.45, tn: 0.03, kn: 0.03, tf: -0.03, kf: 0.03, an: 0.35, en: 0.85, af: 0.3, ef: 0.85 },
    sit: { tl: -0.05, hd: 0, tn: 1.5, kn: 1.5, tf: 1.4, kf: 1.45, an: 0.5, en: 0.9, af: 0.4, ef: 0.9, sit: 1 },
    sitground: { tl: -0.15, hd: 0, tn: 1.45, kn: 2.4, tf: 1.25, kf: 2.2, an: 0.6, en: 0.6, af: -0.3, ef: 0.1, sit: 2 },
    dig: { tl: 0.7, hd: 0.3, tn: 0.45, kn: 0.6, tf: -0.25, kf: 0.25, an: 1.0, en: 0.4, af: 0.7, ef: 0.6 },
    hug: { tl: 0.12, hd: 0.2, tn: 0.12, kn: 0.08, tf: -0.08, kf: 0.06, an: 1.35, en: 1.4, af: 1.3, ef: 1.6 },
    phone: { tl: 0.0, hd: -0.2, tn: 0.06, kn: 0.04, tf: -0.06, kf: 0.05, an: 2.6, en: 0.2, af: -0.05, ef: 0.2 },
    spike: { tl: -0.35, hd: -0.4, tn: 0.6, kn: 1.4, tf: 0.1, kf: 1.3, an: 3.0, en: -0.6, af: 1.2, ef: 0.6 },
    kneel: { tl: 0.25, hd: 0.25, tn: 1.3, kn: 1.55, tf: 0.1, kf: 1.9, an: 0.6, en: 0.8, af: 0.4, ef: 0.8, kneel: 1 },
    pray: { tl: 0.15, hd: 0.25, tn: 0.05, kn: 0.04, tf: -0.04, kf: 0.03, an: 0.6, en: 1.3, af: 0.55, ef: 1.3 },
    clap: { tl: 0.0, hd: -0.1, tn: 0.06, kn: 0.04, tf: -0.06, kf: 0.05, an: 1.25, en: 1.0, af: 1.15, ef: 1.25 },
    // gökyüzüne bakanlar (tutulma): başı yukarıda; gözlüğü gözüne tutan; yukarıyı gösteren
    lookup: { tl: -0.1, hd: -0.62, tn: 0.06, kn: 0.04, tf: -0.06, kf: 0.05, an: 0.18, en: 0.3, af: -0.06, ef: 0.25 },
    glasses: { tl: -0.12, hd: -0.66, tn: 0.08, kn: 0.05, tf: -0.07, kf: 0.05, an: 2.02, en: 1.98, af: 1.96, ef: 2.06 },
    pointup: { tl: -0.08, hd: -0.52, tn: 0.1, kn: 0.04, tf: -0.06, kf: 0.05, an: 2.6, en: 0.05, af: 0.1, ef: 0.25 },
    // serinlenen / gölgede oturan
    fan: { tl: 0.04, hd: 0.08, tn: 0.06, kn: 0.04, tf: -0.06, kf: 0.05, an: 1.45, en: 1.75, af: 0.12, ef: 0.3 },
  };

  // Döneme göre şapka/saç dağılımları
  P.eraHats = function (year, g) {
    if (g === 'm') {
      if (year < 1925.9) return { fez: 3, kalpak: 2, turban: 1, kasket: 1 };
      if (year < 1950) return { fedora: 4, kasket: 3, none: 1 };
      if (year < 1972) return { kasket: 3, fedora: 1, none: 3 };
      if (year < 1992) return { none: 5, kasket: 2, cap: 1 };
      return { none: 7, cap: 2 };
    }
    if (year < 1930) return { scarf: 4, cloche: 2 };
    if (year < 1950) return { scarf: 2, cloche: 2, bun: 2 };
    if (year < 1972) return { scarf: 2, bun: 2, bob: 2, long: 1 };
    if (year < 1992) return { long: 3, bob: 2, scarf: 2, curly: 1 };
    return { long: 3, bob: 1, scarf: 2, pony: 2 };
  };

  function limbDir(a, dir) { return [Math.sin(a) * dir, Math.cos(a)]; }

  /* İnsan silueti. (x,y) = ayakların ortası (zemin). h = boy (WU).
     o: {g:'m'|'f', pose, dir, hat, skirt, coat, kid, bag, hold, em, light, t} */
  P.person = function (ctx, x, y, h, o) {
    o = o || {};
    const pose = typeof o.pose === 'object' ? o.pose : (P.POSES[o.pose || 'stand'] || P.POSES.stand);
    const dir = o.dir || 1;
    const kid = !!o.kid;
    const s = h / 100;
    const female = o.g === 'f';
    const headR = (kid ? 8.2 : 6.4) * s;
    const torsoL = (kid ? 25 : 30) * s, thighL = (kid ? 20 : 24) * s, shinL = (kid ? 19 : 23) * s;
    const uaL = (kid ? 14 : 17) * s, faL = (kid ? 12 : 15) * s;
    const legW = (female ? 4.6 : 5.2) * s, armW = (female ? 3.3 : 3.8) * s;
    const shoulderW = (female ? 6.2 : 7.6) * s;
    let hipY = y - (thighL + shinL + 2.5 * s);
    if (pose.sit === 1) hipY = y - (shinL + 4 * s);
    if (pose.sit === 2) hipY = y - 6 * s;
    if (pose.kneel) hipY = y - (shinL * 0.5 + thighL * 0.5 + 4 * s);
    const hipX = x;
    const tl = pose.tl || 0;
    const shX = hipX + Math.sin(tl) * torsoL * dir, shY = hipY - Math.cos(tl) * torsoL;
    const hdA = tl + (pose.hd || 0);
    const neckL = 3.2 * s;
    const hx = shX + Math.sin(hdA) * (neckL + headR) * dir, hy = shY - Math.cos(hdA) * (neckL + headR);

    ctx.beginPath();
    // bacaklar
    const legs = [[pose.tf, pose.kf], [pose.tn, pose.kn]];
    const feet = [];
    for (let i = 0; i < 2; i++) {
      const ta = legs[i][0], ka = legs[i][1];
      const d1 = limbDir(ta, dir);
      const kx = hipX + d1[0] * thighL, ky = hipY + d1[1] * thighL;
      let d2 = limbDir(ta - ka, dir);
      let ax = kx + d2[0] * shinL, ay = ky + d2[1] * shinL;
      if (pose.kneel && i === 0) { ay = Math.min(ay, y - 2 * s); }
      if (pose.sit === 1 || pose.sit === 2) { ay = Math.min(ay, y - 2 * s); }
      P.capsule(ctx, hipX, hipY, legW * 1.15, kx, ky, legW * 0.85);
      P.capsule(ctx, kx, ky, legW * 0.85, ax, ay, legW * 0.62);
      // ayak
      P.capsule(ctx, ax - dir * 1.5 * s, ay + 1.2 * s, legW * 0.5, ax + dir * 6 * s, ay + 1.6 * s, legW * 0.42);
      feet.push([kx, ky, ax, ay]);
    }
    ctx.fill();
    ctx.beginPath();
    // gövde
    const px = Math.cos(tl) * dir, py = Math.sin(tl);
    const waistW = (female ? 4.6 : 5.6) * s;
    const hipW = (female ? 6.4 : 5.8) * s;
    ctx.moveTo(hipX - px * hipW - py * 0, hipY - py * hipW);
    ctx.quadraticCurveTo(
      (hipX + shX) / 2 - px * waistW * 1.05, (hipY + shY) / 2 - py * waistW,
      shX - px * shoulderW, shY - py * shoulderW + 1.5 * s
    );
    ctx.quadraticCurveTo(shX, shY - 2.4 * s, shX + px * shoulderW, shY + py * shoulderW + 1.5 * s);
    ctx.quadraticCurveTo(
      (hipX + shX) / 2 + px * (female ? waistW * 1.25 : waistW * 1.12), (hipY + shY) / 2 + py * waistW,
      hipX + px * hipW, hipY + py * hipW
    );
    ctx.quadraticCurveTo(hipX, hipY + 4.5 * s, hipX - px * hipW, hipY - py * hipW);
    ctx.closePath();
    ctx.fill();
    // boyun + baş
    ctx.beginPath();
    P.capsule(ctx, shX, shY, 2.6 * s, hx - Math.sin(hdA) * headR * 0.6 * dir, hy + Math.cos(hdA) * headR * 0.6, 2.4 * s);
    ctx.moveTo(hx + headR, hy);
    ctx.ellipse(hx, hy, headR * 0.95, headR, hdA * dir, 0, TAU);
    ctx.fill();
    // çene / burun çıkıntısı
    ctx.beginPath();
    ctx.moveTo(hx + dir * headR * 0.85, hy - headR * 0.05);
    ctx.lineTo(hx + dir * headR * 1.12, hy + headR * 0.2);
    ctx.lineTo(hx + dir * headR * 0.8, hy + headR * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    // kollar
    const arms = [[pose.af, pose.ef], [pose.an, pose.en]];
    const hands = [];
    for (let i = 0; i < 2; i++) {
      const sa = arms[i][0] + tl, ea = arms[i][1];
      const sx = shX + (i === 0 ? -1 : 1) * 0.6 * s * dir, sy = shY + 1.2 * s;
      const d1 = limbDir(sa, dir);
      const ex = sx + d1[0] * uaL, ey = sy + d1[1] * uaL;
      const d2 = limbDir(sa + ea, dir);
      const wx = ex + d2[0] * faL, wy = ey + d2[1] * faL;
      P.capsule(ctx, sx, sy, armW, ex, ey, armW * 0.82);
      P.capsule(ctx, ex, ey, armW * 0.82, wx, wy, armW * 0.62);
      ctx.moveTo(wx + armW * 0.8, wy);
      ctx.arc(wx, wy, armW * 0.8, 0, TAU);
      hands.push([wx, wy, sa + ea]);
    }
    ctx.fill();

    // etek / palto
    if (o.skirt || o.coat) {
      const len = o.coat ? (o.coat === 'short' ? 0.45 : 0.85) : (o.skirt === 'long' ? 0.85 : o.skirt === 'mini' ? 0.32 : 0.55);
      const k0 = feet[0], k1 = feet[1];
      const lerpP = (k, t) => [hipX + (k[0] - hipX) * Math.min(1, t * 2) + (t > 0.5 ? (k[2] - k[0]) * (t - 0.5) * 2 : 0), hipY + (k[1] - hipY) * Math.min(1, t * 2) + (t > 0.5 ? (k[3] - k[1]) * (t - 0.5) * 2 : 0)];
      const a = lerpP(k0, len), b = lerpP(k1, len);
      const backX = Math.min(a[0], b[0]) * (dir > 0 ? 1 : 0) + Math.max(a[0], b[0]) * (dir > 0 ? 0 : 1);
      const frontX = Math.max(a[0], b[0]) * (dir > 0 ? 1 : 0) + Math.min(a[0], b[0]) * (dir > 0 ? 0 : 1);
      const hemY = Math.max(a[1], b[1]) + 1 * s;
      const flare = (o.coat ? 4 : 5.5) * s;
      const topY = o.coat ? shY + 4 * s : hipY - 3 * s;
      const topW = o.coat ? shoulderW * 0.95 : waistW;
      ctx.beginPath();
      ctx.moveTo(hipX - dir * topW, topY);
      ctx.lineTo(hipX + dir * topW, topY);
      ctx.quadraticCurveTo(frontX + dir * flare * 0.6, (topY + hemY) / 2, frontX + dir * flare, hemY);
      ctx.quadraticCurveTo((frontX + backX) / 2, hemY + 1.5 * s, backX - dir * flare * 1.2, hemY - 0.5 * s);
      ctx.quadraticCurveTo(backX - dir * flare * 0.5, (topY + hemY) / 2, hipX - dir * topW, topY);
      ctx.fill();
    }

    // şapka / saç
    P.headwear(ctx, hx, hy, headR, hdA, dir, o.hat || 'none', s, o.t || 0);

    // eşyalar
    const hand = hands[1], hand2 = hands[0];
    if (o.hold === 'flag' || pose === P.POSES.flag) {
      const ph = 34 * s;
      ctx.save(); ctx.lineWidth = 1.1 * s; ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(hand[0], hand[1] + 8 * s); ctx.lineTo(hand[0] + dir * 2 * s, hand[1] - ph); ctx.stroke();
      ctx.restore();
      if (!o.noFlagColor) P.flag(ctx, hand[0] + dir * 2 * s, hand[1] - ph, 20 * s, o.t || x * 0.13, { dir: -dir, amp: 0.12, red: o.red });
    }
    if (o.hold === 'torch' || pose === P.POSES.torch) {
      ctx.save(); ctx.lineWidth = 1.4 * s; ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(hand[0], hand[1] + 3 * s); ctx.lineTo(hand[0] + dir * 3 * s, hand[1] - 12 * s); ctx.stroke(); ctx.restore();
      if (o.em) { P.glow(o.em, hand[0] + dir * 3 * s, hand[1] - 15 * s, 16 * s, '#ffb04a', 0.9); P.glow(o.em, hand[0] + dir * 3 * s, hand[1] - 14 * s, 5 * s, '#fff1c2', 1); }
    }
    if (o.hold === 'phone' || pose === P.POSES.phone) {
      if (o.em) { P.glow(o.em, hand[0], hand[1] - 2 * s, 9 * s, '#e9f2ff', 0.8); P.lightRect(o.em, hand[0] - 1.2 * s, hand[1] - 4 * s, 2.4 * s, 4 * s, '#ffffff', 1); }
    }
    if (o.hold === 'suitcase' || pose === P.POSES.suitcase) {
      const hx2 = hand2[0], hy2 = hand2[1];
      P.fillRR(ctx, hx2 - 7 * s, hy2 + 1 * s, 14 * s, 11 * s, 1.5 * s);
    }
    if (o.hold === 'bundle') { P.fillEllipse(ctx, shX - dir * 6 * s, shY + 2 * s, 8 * s, 7 * s, 0.3); }
    if (o.hold === 'bag' || o.bag) { P.fillRR(ctx, hipX - dir * 6 * s, hipY - 4 * s, 9 * s, 10 * s, 2 * s); }
    if (o.hold === 'gas') { P.fillRR(ctx, hand2[0] - 4.5 * s, hand2[1], 9 * s, 16 * s, 3 * s); }
    if (o.hold === 'bread') { P.fillEllipse(ctx, hand[0], hand[1] - 1 * s, 6 * s, 2.6 * s, 0.4 * dir); }
    if (o.hold === 'helmetlamp' && o.em) { P.glow(o.em, hx + dir * headR * 0.6, hy - headR * 0.8, 14 * s, '#fff0c0', 0.8); }
    if (o.hold === 'rifle') {
      ctx.save(); ctx.lineWidth = 1.6 * s; ctx.strokeStyle = ctx.fillStyle; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(shX - dir * 4 * s, shY - 10 * s); ctx.lineTo(hipX + dir * 2 * s, hipY + 6 * s); ctx.stroke(); ctx.restore();
    }
    if (o.hold === 'shovel') {
      ctx.save(); ctx.lineWidth = 1.4 * s; ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(hand2[0], hand2[1]); ctx.lineTo(hand[0] + dir * 14 * s, hand[1] + 14 * s); ctx.stroke(); ctx.restore();
      P.fillEllipse(ctx, hand[0] + dir * 16 * s, hand[1] + 17 * s, 3.5 * s, 5 * s, 0.4);
    }
    if (o.hold === 'umbrella') {
      ctx.save(); ctx.lineWidth = 1 * s; ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(hand[0], hand[1]); ctx.lineTo(hand[0], hand[1] - 24 * s); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(hand[0] - 18 * s, hand[1] - 20 * s);
      ctx.quadraticCurveTo(hand[0], hand[1] - 38 * s, hand[0] + 18 * s, hand[1] - 20 * s);
      ctx.quadraticCurveTo(hand[0] + 9 * s, hand[1] - 23 * s, hand[0], hand[1] - 20 * s);
      ctx.quadraticCurveTo(hand[0] - 9 * s, hand[1] - 23 * s, hand[0] - 18 * s, hand[1] - 20 * s);
      ctx.fill();
    }
    return { hx: hx, hy: hy, hand: hand, hand2: hand2, shX: shX, shY: shY, hipY: hipY };
  };

  // Başlık / saç çizimi
  P.headwear = function (ctx, hx, hy, r, a, dir, hat, s, t) {
    if (!hat || hat === 'none') {
      // kısa saç tepesi
      ctx.beginPath();
      ctx.ellipse(hx - dir * r * 0.1, hy - r * 0.35, r * 1.02, r * 0.75, 0, Math.PI, TAU);
      ctx.fill();
      return;
    }
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(a * dir * 0.6);
    ctx.scale(dir, 1);
    ctx.beginPath();
    switch (hat) {
      case 'fez':
        ctx.moveTo(-r * 0.85, -r * 0.45); ctx.lineTo(-r * 0.7, -r * 1.7); ctx.lineTo(r * 0.7, -r * 1.7); ctx.lineTo(r * 0.85, -r * 0.45); ctx.closePath();
        ctx.fill(); ctx.beginPath();
        ctx.moveTo(-r * 0.1, -r * 1.7); ctx.quadraticCurveTo(-r * 0.9, -r * 1.5, -r * 1.05, -r * 0.7); ctx.lineTo(-r * 0.95, -r * 0.7); ctx.quadraticCurveTo(-r * 0.75, -r * 1.35, -r * 0.1, -r * 1.55);
        break;
      case 'kalpak':
        ctx.moveTo(-r * 1.02, -r * 0.3);
        ctx.quadraticCurveTo(-r * 1.14, -r * 1.0, -r * 0.98, -r * 1.58);
        for (let i = 0; i <= 12; i++) { const u = i / 12; ctx.lineTo(-r * 0.98 + u * r * 1.96, -r * 1.58 - Math.sin(u * Math.PI) * r * 0.12 - (i % 2 ? r * 0.08 : 0)); }
        ctx.quadraticCurveTo(r * 1.14, -r * 1.0, r * 1.02, -r * 0.3);
        ctx.closePath();
        break;
      case 'fedora':
        ctx.ellipse(0, -r * 0.55, r * 1.75, r * 0.26, 0, 0, TAU);
        ctx.moveTo(-r * 0.92, -r * 0.6); ctx.quadraticCurveTo(-r * 0.95, -r * 1.6, -r * 0.2, -r * 1.55);
        ctx.quadraticCurveTo(0, -r * 1.3, r * 0.2, -r * 1.55); ctx.quadraticCurveTo(r * 0.95, -r * 1.6, r * 0.92, -r * 0.6); ctx.closePath();
        break;
      case 'kasket':
        ctx.moveTo(-r * 1.05, -r * 0.35); ctx.quadraticCurveTo(-r * 1.1, -r * 1.3, r * 0.1, -r * 1.25);
        ctx.quadraticCurveTo(r * 1.1, -r * 1.2, r * 1.05, -r * 0.55); ctx.lineTo(r * 1.75, -r * 0.42); ctx.lineTo(r * 1.0, -r * 0.3); ctx.closePath();
        break;
      case 'cap':
        ctx.moveTo(-r * 1.0, -r * 0.3); ctx.quadraticCurveTo(-r * 1.0, -r * 1.35, r * 0.1, -r * 1.3);
        ctx.quadraticCurveTo(r * 1.05, -r * 1.25, r * 1.0, -r * 0.45); ctx.lineTo(r * 1.9, -r * 0.35); ctx.lineTo(r * 1.0, -r * 0.2); ctx.closePath();
        break;
      case 'helmet':
        ctx.ellipse(0, -r * 0.35, r * 1.3, r * 1.15, 0, Math.PI, TAU);
        ctx.moveTo(-r * 1.45, -r * 0.3); ctx.lineTo(r * 1.45, -r * 0.3); ctx.lineTo(r * 1.3, -r * 0.15); ctx.lineTo(-r * 1.3, -r * 0.15); ctx.closePath();
        break;
      case 'turban':
        ctx.ellipse(0, -r * 0.75, r * 1.25, r * 0.85, 0, 0, TAU);
        break;
      case 'scarf':
        ctx.moveTo(-r * 1.15, r * 0.9); ctx.quadraticCurveTo(-r * 1.45, -r * 1.35, r * 0.1, -r * 1.25);
        ctx.quadraticCurveTo(r * 1.25, -r * 1.15, r * 1.05, r * 0.05); ctx.quadraticCurveTo(r * 0.5, r * 0.75, r * 0.65, r * 1.2);
        ctx.lineTo(-r * 0.9, r * 1.45); ctx.closePath();
        break;
      case 'cloche':
        ctx.moveTo(-r * 1.25, -r * 0.05); ctx.quadraticCurveTo(-r * 1.2, -r * 1.55, r * 0.05, -r * 1.45);
        ctx.quadraticCurveTo(r * 1.25, -r * 1.4, r * 1.2, -r * 0.2); ctx.quadraticCurveTo(r * 1.35, -r * 0.05, r * 1.15, r * 0.05); ctx.lineTo(-r * 1.3, r * 0.1); ctx.closePath();
        break;
      case 'bun':
        ctx.ellipse(-r * 0.1, -r * 0.3, r * 1.03, r * 0.85, 0, Math.PI, TAU);
        ctx.moveTo(-r * 0.75 + r * 0.55, -r * 0.6); ctx.arc(-r * 0.95, -r * 0.6, r * 0.55, 0, TAU);
        break;
      case 'bob':
        ctx.moveTo(-r * 1.15, r * 0.55); ctx.quadraticCurveTo(-r * 1.4, -r * 1.25, r * 0.15, -r * 1.12);
        ctx.quadraticCurveTo(r * 1.1, -r * 1.0, r * 0.95, -r * 0.2); ctx.lineTo(r * 0.3, -r * 0.35); ctx.lineTo(-r * 0.2, r * 0.7); ctx.closePath();
        break;
      case 'long':
        ctx.moveTo(-r * 1.1, r * 2.3); ctx.quadraticCurveTo(-r * 1.55, -r * 1.25, r * 0.15, -r * 1.12);
        ctx.quadraticCurveTo(r * 1.1, -r * 1.0, r * 0.95, -r * 0.2); ctx.lineTo(r * 0.25, -r * 0.4); ctx.quadraticCurveTo(-r * 0.2, r * 1.0, -r * 0.1, r * 2.4); ctx.closePath();
        break;
      case 'curly':
        for (let i = 0; i < 9; i++) { const aa = Math.PI * 0.7 + (i / 8) * Math.PI * 1.45; ctx.moveTo(Math.cos(aa) * r * 1.05 + r * 0.55, Math.sin(aa) * r * 1.05 - r * 0.2); ctx.arc(Math.cos(aa) * r * 1.05, Math.sin(aa) * r * 1.05 - r * 0.2, r * 0.55, 0, TAU); }
        break;
      case 'pony':
        ctx.ellipse(-r * 0.1, -r * 0.3, r * 1.03, r * 0.85, 0, Math.PI, TAU);
        ctx.fill(); ctx.beginPath();
        ctx.moveTo(-r * 0.8, -r * 0.7); ctx.quadraticCurveTo(-r * 2.2, -r * 0.6, -r * 1.9, r * 1.4); ctx.quadraticCurveTo(-r * 1.5, r * 0.2, -r * 0.8, -r * 0.2); ctx.closePath();
        break;
      default:
        ctx.ellipse(0, -r * 0.35, r * 1.02, r * 0.75, 0, Math.PI, TAU);
    }
    ctx.fill();
    ctx.restore();
  };

  /* Kalabalık. x0..x1 aralığını insanlarla doldurur. o:
     {year, rows, h, spacing, poses:{stand:3,...}, flags, torches, phones, kids, dir, em, rowRise, mood} */
  P.crowd = function (ctx, x0, x1, y, rng, o) {
    o = o || {};
    const rows = o.rows || 2, H = o.h || 46, year = o.year || 1950;
    const poses = o.poses || { stand: 4, stand2: 2, walk1: 1, walk2: 1 };
    const out = [];
    for (let r = rows - 1; r >= 0; r--) {
      const scale = 1 - r * 0.07, rowY = y - r * (o.rowRise === undefined ? H * 0.12 : o.rowRise);
      let x = x0 + rng() * (o.spacing || H * 0.32);
      while (x < x1) {
        const g = rng() < (o.female === undefined ? 0.5 : o.female) ? 'f' : 'm';
        const kid = rng() < (o.kids === undefined ? 0.08 : o.kids);
        const hats = o.hats ? o.hats[g] || o.hats : P.eraHats(year, g);
        let pose = U.rng ? rng.weighted(poses) : 'stand';
        let hold = null;
        if (o.flags && rng() < o.flags) { pose = 'flag'; hold = 'flag'; }
        else if (o.torches && rng() < o.torches) { pose = 'torch'; hold = 'torch'; }
        else if (o.phones && rng() < o.phones) { pose = 'phone'; hold = 'phone'; }
        else if (o.hold && rng() < (o.holdP || 0.3)) hold = o.hold;
        const skirt = g === 'f' && (year < 1960 || rng() < 0.45) ? (year < 1935 ? 'long' : 'knee') : null;
        const coat = g === 'm' && year < 1960 && rng() < 0.35 ? 'long' : null;
        const hh = H * scale * (kid ? 0.62 : U.lerp(0.9, 1.07, rng()));
        const dir = o.dir ? (rng() < 0.85 ? o.dir : -o.dir) : rng.sign();
        P.person(ctx, x, rowY, hh, {
          g: g, pose: pose, dir: dir, hat: kid && g === 'm' ? (year < 1960 ? 'kasket' : 'none') : rng.weighted(hats),
          skirt: skirt, coat: coat, kid: kid, hold: hold, em: o.em, t: rng() * 10, red: o.red,
        });
        out.push(x);
        x += (o.spacing || H * 0.32) * U.lerp(0.55, 1.35, rng());
      }
    }
    return out;
  };

  // ------------------------------------------------------------- ağaçlar
  function blob(ctx, x, y, r) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }

  P.tree = function (ctx, x, y, h, type, rng, o) {
    o = o || {};
    switch (type) {
      case 'poplar': return P.poplar(ctx, x, y, h, rng);
      case 'cypress': return P.cypress(ctx, x, y, h, rng);
      case 'pine': return P.umbrellaPine(ctx, x, y, h, rng);
      case 'fir': return P.fir(ctx, x, y, h, rng, o.snow);
      case 'bare': return P.bareTree(ctx, x, y, h, rng);
      case 'palm': return P.palm(ctx, x, y, h, rng);
      case 'young': return P.youngTree(ctx, x, y, h, rng);
      default: return P.broadTree(ctx, x, y, h, rng, o);
    }
  };

  P.poplar = function (ctx, x, y, h, rng) {
    ctx.beginPath();
    P.capsule(ctx, x, y, h * 0.018, x, y - h * 0.45, h * 0.009);
    const top = y - h, bot = y - h * 0.14;
    const W = h * 0.082;
    const lean = (rng() - 0.5) * h * 0.04;
    const n = 46;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const yy = U.lerp(bot, top + h * 0.03, u);
      const env = Math.pow(Math.sin(Math.PI * U.lerp(0.1, 1, u)), 0.7) * (u > 0.85 ? 1 - (u - 0.85) * 3 : 1);
      const w = W * env * (0.8 + rng() * 0.35);
      const cxx = x + lean * u + (rng() - 0.5) * w * 0.7;
      blob(ctx, cxx, yy, w * (0.5 + rng() * 0.32));
      if (rng() < 0.75) blob(ctx, cxx + (rng() < 0.5 ? -1 : 1) * w * U.lerp(0.55, 0.95, rng()), yy + (rng() - 0.5) * h * 0.025, w * U.lerp(0.16, 0.3, rng()));
    }
    ctx.fill();
  };

  P.cypress = function (ctx, x, y, h, rng) {
    ctx.beginPath();
    P.capsule(ctx, x, y, h * 0.02, x, y - h * 0.2, h * 0.015);
    const n = 22, W = h * 0.085;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const yy = U.lerp(y - h * 0.1, y - h, u);
      const w = W * Math.pow(1 - u, 0.65) * Math.min(1, u * 6 + 0.4) * (0.85 + rng() * 0.25) + h * 0.004;
      blob(ctx, x + (rng() - 0.5) * w * 0.4, yy, w);
    }
    ctx.fill();
  };

  P.branch = function (ctx, x, y, len, ang, w, depth, rng, tips, spread) {
    const ex = x + Math.sin(ang) * len, ey = y - Math.cos(ang) * len;
    P.capsule(ctx, x, y, w, ex, ey, w * 0.68);
    if (depth <= 0) { tips.push([ex, ey, len]); return; }
    const n = rng() < 0.35 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const da = (i - (n - 1) / 2) * (spread || 0.62) + (rng() - 0.5) * 0.45;
      P.branch(ctx, ex, ey, len * U.lerp(0.64, 0.82, rng()), ang + da, w * 0.68, depth - 1, rng, tips, spread);
    }
  };

  P.broadTree = function (ctx, x, y, h, rng, o) {
    o = o || {};
    ctx.beginPath();
    const tips = [];
    P.branch(ctx, x, y, h * 0.34, (rng() - 0.5) * 0.12, h * 0.04, 3, rng, tips, 0.6);
    ctx.fill();
    if (o.bare) return;
    // taç: birbirinden hafifçe ayrılan 3-5 yaprak kümesi
    const cx = x + (rng() - 0.5) * h * 0.06, cy = y - h * 0.64;
    const RX = h * U.lerp(0.4, 0.5, rng()), RY = h * 0.25;
    const nl = 4 + Math.floor(rng() * 3);
    const lobes = [];
    for (let i = 0; i < nl; i++) {
      const a = Math.PI + 0.15 + (i + 0.5) / nl * (Math.PI - 0.3) + (rng() - 0.5) * 0.35;
      const d = U.lerp(0.45, 0.8, rng());
      lobes.push([cx + Math.cos(a) * RX * d, cy + Math.sin(a) * RY * d * 0.8 + RY * 0.35, RX * U.lerp(0.3, 0.46, rng()), RY * U.lerp(0.45, 0.65, rng())]);
    }
    lobes.push([cx + (rng() - 0.5) * RX * 0.3, cy - RY * 0.25, RX * 0.42, RY * 0.55]);
    ctx.beginPath();
    lobes.forEach((L) => {
      for (let i = 0; i < 26; i++) {
        const a = rng() * TAU, d = Math.pow(rng(), 0.55);
        const bx = L[0] + Math.cos(a) * L[2] * d, by = L[1] + Math.sin(a) * L[3] * d;
        const br = h * U.lerp(0.03, 0.068, rng()) * (1.2 - d * 0.45);
        blob(ctx, bx, by, br);
        // kenarı kıran küçük yaprak tutamları
        if (d > 0.6) for (let s = 0; s < 3; s++) { const sa = a + (rng() - 0.5) * 1.6; blob(ctx, bx + Math.cos(sa) * br * 1.05, by + Math.sin(sa) * br * 1.05, br * U.lerp(0.18, 0.34, rng())); }
      }
    });
    tips.forEach((t) => { for (let k = 0; k < 3; k++) blob(ctx, t[0] + (rng() - 0.5) * h * 0.07, t[1] + (rng() - 0.5) * h * 0.05, h * U.lerp(0.025, 0.05, rng())); });
    ctx.fill();
  };

  P.bareTree = function (ctx, x, y, h, rng) {
    ctx.beginPath();
    const tips = [];
    P.branch(ctx, x, y, h * 0.3, (rng() - 0.5) * 0.15, h * 0.035, 5, rng, tips, 0.55);
    ctx.fill();
  };

  P.youngTree = function (ctx, x, y, h, rng) {
    ctx.beginPath();
    P.capsule(ctx, x, y, h * 0.025, x, y - h * 0.55, h * 0.015);
    for (let i = 0; i < 9; i++) blob(ctx, x + (rng() - 0.5) * h * 0.3, y - h * 0.62 - rng() * h * 0.3, h * U.lerp(0.08, 0.15, rng()));
    ctx.fill();
  };

  P.umbrellaPine = function (ctx, x, y, h, rng) {
    ctx.beginPath();
    const lean = (rng() - 0.5) * 0.3;
    const tx = x + Math.sin(lean) * h * 0.7, ty = y - h * 0.72;
    ctx.moveTo(x - h * 0.03, y);
    ctx.quadraticCurveTo(x + (tx - x) * 0.3 - h * 0.02, y - h * 0.4, tx - h * 0.012, ty);
    ctx.lineTo(tx + h * 0.012, ty);
    ctx.quadraticCurveTo(x + (tx - x) * 0.3 + h * 0.03, y - h * 0.4, x + h * 0.03, y);
    ctx.closePath();
    // şemsiye taç
    for (let i = 0; i < 26; i++) {
      const u = rng();
      const bx = tx + (u - 0.5) * h * 0.85, by = ty - h * 0.06 - Math.sin(u * Math.PI) * h * 0.14 + rng() * h * 0.04;
      ctx.moveTo(bx + h * 0.1, by);
      ctx.ellipse(bx, by, h * U.lerp(0.07, 0.13, rng()), h * U.lerp(0.035, 0.06, rng()), 0, 0, TAU);
    }
    ctx.fill();
  };

  P.fir = function (ctx, x, y, h, rng, snow) {
    ctx.beginPath();
    P.capsule(ctx, x, y, h * 0.03, x, y - h * 0.2, h * 0.025);
    ctx.fill();
    ctx.beginPath();
    const layers = 7;
    for (let i = 0; i < layers; i++) {
      const u = i / layers;
      const by = y - h * 0.12 - u * h * 0.8, w = h * 0.34 * (1 - u * 0.85);
      ctx.moveTo(x - w, by);
      for (let k = 0; k <= 6; k++) { const xx = x - w + (k / 6) * w * 2; ctx.lineTo(xx, by + (k % 2 ? h * 0.025 : 0)); }
      ctx.lineTo(x, by - h * 0.2);
      ctx.closePath();
    }
    ctx.fill();
  };

  P.palm = function (ctx, x, y, h, rng) {
    ctx.beginPath();
    ctx.moveTo(x - h * 0.025, y); ctx.quadraticCurveTo(x + h * 0.08, y - h * 0.5, x + h * 0.05, y - h * 0.9); ctx.lineTo(x + h * 0.07, y - h * 0.9); ctx.quadraticCurveTo(x + h * 0.1, y - h * 0.5, x + h * 0.025, y); ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.42;
      P.leaf(ctx, x + h * 0.06, y - h * 0.9, h * 0.38, a);
    }
  };
  P.leaf = function (ctx, x, y, L, a) {
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L + L * 0.25;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo((x + ex) / 2 + Math.cos(a - 1.2) * L * 0.18, (y + ey) / 2 + Math.sin(a - 1.2) * L * 0.18 - L * 0.12, ex, ey);
    ctx.quadraticCurveTo((x + ex) / 2 + Math.cos(a + 1.2) * L * 0.1, (y + ey) / 2 + Math.sin(a + 1.2) * L * 0.1 - L * 0.12, x, y);
    ctx.fill();
  };

  P.bush = function (ctx, x, y, w, h, rng) {
    ctx.beginPath();
    for (let i = 0; i < 9; i++) blob(ctx, x + (rng() - 0.5) * w, y - h * 0.35 - rng() * h * 0.4, h * U.lerp(0.25, 0.5, rng()));
    ctx.rect(x - w * 0.5, y - h * 0.3, w, h * 0.3);
    ctx.fill();
  };

  // Çim tutamları (zemin boyunca)
  P.grass = function (ctx, x0, x1, y, h, rng, dens) {
    ctx.beginPath();
    const n = Math.floor((x1 - x0) * (dens || 0.35));
    for (let i = 0; i < n; i++) {
      const x = x0 + rng() * (x1 - x0);
      const hh = h * U.lerp(0.35, 1.2, rng() * rng());
      const lean = (rng() - 0.5) * hh * 0.7;
      const w = U.lerp(0.7, 1.8, rng());
      ctx.moveTo(x - w, y + 1);
      ctx.quadraticCurveTo(x + lean * 0.3, y - hh * 0.6, x + lean, y - hh);
      ctx.quadraticCurveTo(x + lean * 0.3 + w * 0.4, y - hh * 0.55, x + w, y + 1);
      ctx.closePath();
    }
    ctx.fill();
  };

  // ------------------------------------------------------------- arazi
  P.hills = function (ctx, x0, x1, y, amp, rng, o) {
    o = o || {};
    // o.seed + o.gx verilirse yüzey dünya koordinatında süreklidir (şerit parçaları birbirine dikişsiz bağlanır)
    const seed = o.seed !== undefined ? o.seed : Math.floor(rng() * 1000);
    const freq = o.freq || 0.0022;
    const gx = o.gx || 0;
    const bottom = y + (o.bottom || 400);
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    const step = o.step || 8;
    const surf = (x) => {
      const n = U.fbm1((x + gx) * freq + (o.off || 0), seed, 4);
      return y - amp * (o.sharp ? Math.pow(n, 1.6) * 1.6 : n);
    };
    for (let x = x0; x <= x1 + step; x += step) ctx.lineTo(x, surf(x));
    ctx.lineTo(x1, bottom);
    ctx.closePath();
    ctx.fill();
    // yüzey yüksekliği: üstüne yerleştirilen yapıların tabanı tepeye otursun
    return surf;
  };

  // Bir sıra yapıyı tepe yüzeyine, birbirinin içine girmeden yerleştirir.
  // size(r) -> [w, h]; draw(x, y, w, h) ; y: yapının tabanı (yüzeye birkaç birim gömülü)
  P.onHills = function (surf, x0, x1, r, n, size, draw, o) {
    o = o || {};
    const out = [];
    let x = x0 + r() * 60;
    let guard = 0;
    while (out.length < n && x < x1 && guard++ < 200) {
      const wh = size(r);
      const w = wh[0];
      const cx = x + w / 2;
      if (cx + w / 2 > x1) break;
      // yokuşta alçak taraf: yapı yüzeyin altına gömülür, havada kalmaz
      const base = Math.max(surf(cx - w * 0.45), surf(cx), surf(cx + w * 0.45)) + (o.sink === undefined ? 3 : o.sink);
      draw(cx, base, w, wh[1]);
      out.push(cx);
      x += w + U.lerp(o.gapMin === undefined ? 14 : o.gapMin, o.gapMax === undefined ? 90 : o.gapMax, r());
    }
    return out;
  };

  // Belirli tepe noktalarından geçen dağ silueti
  P.mountains = function (ctx, x0, x1, y, peaks, rng, o) {
    o = o || {};
    const bottom = y + (o.bottom || 400);
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    ctx.lineTo(x0, y - (peaks[0] ? peaks[0][1] * 0.3 : 0));
    let px = x0, py = y;
    const pts = [[x0, y - 20]].concat(peaks.map((p) => [p[0], y - p[1]])).concat([[x1, y - 30]]);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const seg = 14;
      for (let k = 1; k <= seg; k++) {
        const u = k / seg;
        // vadi: iki tepe arasında aşağı sark
        const sag = Math.sin(u * Math.PI) * Math.abs(b[0] - a[0]) * (o.sag || 0.28);
        const jit = (rng() - 0.5) * (o.jag || 10);
        ctx.lineTo(U.lerp(a[0], b[0], u), U.lerp(a[1], b[1], u) + sag + jit);
      }
      px = b[0]; py = b[1];
    }
    ctx.lineTo(x1, bottom);
    ctx.closePath();
    ctx.fill();
  };

  // Karlı zirve kapakları (açık tonla)
  P.snowCaps = function (ctx, peaks, y, color, rng) {
    ctx.save(); ctx.fillStyle = color;
    peaks.forEach((p) => {
      const px = p[0], py = y - p[1];
      const w = p[1] * 0.35;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + w * 0.55, py + w * 0.45);
      for (let i = 0; i < 5; i++) ctx.lineTo(px + w * 0.55 - (i / 4) * w * 1.1, py + w * (0.42 + (i % 2 ? 0.12 : 0) + rng() * 0.08));
      ctx.lineTo(px - w * 0.55, py + w * 0.45);
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  };

  // Su: şeffaf bırakılan alanda koyu dalga çizgileri + yansımalar
  P.waterLines = function (ctx, x0, x1, y0, y1, rng, color) {
    ctx.save();
    ctx.fillStyle = color || 'rgba(20,20,20,.55)';
    for (let yy = y0 + 3; yy < y1; yy += U.lerp(5, 10, rng()) * (1 + (yy - y0) / (y1 - y0 + 1))) {
      let x = x0;
      while (x < x1) {
        const L = U.lerp(10, 60, rng()) * (1 + (yy - y0) / 60);
        const th = U.lerp(0.6, 1.8, rng()) * (1 + (yy - y0) / 120);
        if (rng() < 0.7) { ctx.beginPath(); P.capsule(ctx, x, yy, th / 2, x + L, yy, th / 2); ctx.fill(); }
        x += L + U.lerp(6, 40, rng());
      }
    }
    ctx.restore();
  };

  P.rocks = function (ctx, x0, x1, y, size, rng, n) {
    ctx.beginPath();
    for (let i = 0; i < (n || 6); i++) {
      const x = x0 + rng() * (x1 - x0), r = size * U.lerp(0.4, 1, rng());
      ctx.moveTo(x - r, y + 2);
      ctx.quadraticCurveTo(x - r * 0.9, y - r * 0.8, x - r * 0.1, y - r * U.lerp(0.7, 1, rng()));
      ctx.quadraticCurveTo(x + r * 0.8, y - r * 0.75, x + r, y + 2);
      ctx.closePath();
    }
    ctx.fill();
  };

  // Ayrıntılı yazı (tabela vb.)
  P.text = function (ctx, str, x, y, size, o) {
    o = o || {};
    ctx.save();
    ctx.font = (o.weight || '700') + ' ' + size + 'px ' + (o.font || 'Georgia, "Times New Roman", serif');
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.base || 'alphabetic';
    if (o.color) ctx.fillStyle = o.color;
    if (o.spacing && 'letterSpacing' in ctx) ctx.letterSpacing = o.spacing + 'px';
    ctx.fillText(str, x, y);
    ctx.restore();
  };
})();
