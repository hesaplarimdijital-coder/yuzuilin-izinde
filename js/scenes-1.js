/* =========================================================================
   Yüzyılın İzinde — olay sahneleri (tablolar) 1/2
   Altyapı + 1920–1980 sahneleri.
   Her sahne iki katmanlıdır: 'back' (uzak, yavaş) ve 'main' (yakın).
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P;
  const TAU = U.TAU;
  const SCN = (IZ.SCENES = IZ.SCENES || {});
  const SC = (IZ.SC = IZ.SC || {});

  // ------------------------------------------------------------- inşa edici
  IZ.buildTableau = function (ev, dens) {
    const def = SCN[ev.s] || SCN.generic;
    const W = def.w || 1200, H = def.h || 560, B = 150;
    const T = { ev: ev, W: W, H: H, B: B, layers: {}, anims: [], sky: [], emAlpha: null };
    const S = {
      W: W, H: H, B: B, ev: ev, p: ev.p || {}, year: ev.year, dec: ev.dec,
      rng: U.rng(9137 + ev.i * 7919 + (ev.year | 0)),
    };
    S.layer = function (name) {
      if (!T.layers[name]) {
        const d = name === 'back' ? dens * 0.7 : dens;
        const ed = d * 0.5;
        const c = U.canvas(W * d, (H + B) * d), ctx = c.getContext('2d');
        ctx.setTransform(d, 0, 0, d, 0, H * d);
        const ec = U.canvas(W * ed, (H + B) * ed), em = ec.getContext('2d');
        em.setTransform(ed, 0, 0, ed, 0, H * ed);
        T.layers[name] = { name: name, c: c, ctx: ctx, ec: ec, em: em, d: d, ed: ed };
      }
      const L = T.layers[name];
      S.ctx = L.ctx; S.em = L.em; S.cur = name;
      return S;
    };
    S.tone = function (i) { S.ctx.fillStyle = P.TONE[i]; return S; };
    S.ground = function (i, o) {
      o = o || {};
      S.ctx.fillStyle = P.TONE[i === undefined ? 3 : i];
      S.ctx.beginPath();
      S.ctx.moveTo(0, B + 10);
      for (let x = 0; x <= W; x += 20) S.ctx.lineTo(x, (o.bump === false ? 0 : Math.sin(x * 0.013 + S.rng() * 0.6) * 2.2) + (o.y || 0));
      S.ctx.lineTo(W, B + 10);
      S.ctx.closePath(); S.ctx.fill();
    };
    S.anim = function (fn, emissive) { T.anims.push({ layer: S.cur, fn: fn, em: !!emissive }); };
    S.skyAnim = function (fn) { T.sky.push({ layer: S.cur, fn: fn }); };
    S.flag = function (x, y, len, o) {
      o = o || {};
      const ctx = S.ctx;
      if (o.pole !== false) { const save = ctx.fillStyle; ctx.fillStyle = P.TONE[o.poleTone === undefined ? 4 : o.poleTone]; P.pole(ctx, x, o.base === undefined ? 0 : o.base, (o.base === undefined ? 0 : o.base) - y, o.poleW); ctx.fillStyle = save; }
      const fy = o.half ? y + ((o.base === undefined ? 0 : o.base) - y) * 0.42 : y + 1;
      const tex = o.tex || null;
      const ph = S.rng() * 10;
      S.anim(function (c, t) { P.flag(c, x + 0.5, fy, len, t + ph, { amp: o.amp === undefined ? 0.1 : o.amp, speed: o.speed || 5.5, tex: tex, red: o.red, dir: o.dir || 1, droop: o.droop || 0 }); });
    };
    S.smoke = function (x, y, o) {
      o = o || {};
      const n = o.n || 9, life = o.life || 7, size = o.size || 18, drift = o.drift === undefined ? 14 : o.drift, rise = o.rise || 22;
      const col = o.color || 'rgba(120,118,112,';
      const ph = S.rng() * 10;
      S.anim(function (c, t) {
        for (let i = 0; i < n; i++) {
          const u = ((t + ph) / life + i / n) % 1;
          const px = x + drift * u * life * 0.6 + Math.sin(u * 6 + i) * size * 0.3 * u;
          const py = y - rise * u * life * 0.55;
          const r = size * (0.35 + u * 1.3);
          const a = (o.alpha || 0.38) * Math.sin(u * Math.PI) * (1 - u * 0.3);
          c.fillStyle = col + a.toFixed(3) + ')';
          c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill();
        }
      });
    };
    S.flame = function (x, y, w, h, o) {
      o = o || {};
      const ph = S.rng() * 10;
      S.anim(function (c, t) {
        const tt = t + ph;
        for (let i = 0; i < 6; i++) {
          const fx = x + (i / 5 - 0.5) * w * 0.8 + Math.sin(tt * 7 + i * 2.1) * w * 0.06;
          const fh = h * (0.55 + 0.45 * Math.abs(Math.sin(tt * (5 + i) + i)));
          const g = c.createRadialGradient(fx, y - fh * 0.3, 0, fx, y - fh * 0.3, fh * 0.7);
          g.addColorStop(0, 'rgba(255,230,160,0.9)'); g.addColorStop(0.35, 'rgba(255,140,50,0.55)'); g.addColorStop(1, 'rgba(255,60,20,0)');
          c.fillStyle = g;
          c.beginPath(); c.ellipse(fx, y - fh * 0.35, w * 0.16, fh * 0.6, 0, 0, TAU); c.fill();
        }
        P.glowRaw(c, x, y - h * 0.3, w * 1.6 + h * 0.6, 'rgba(255,140,60,', 0.25 + 0.08 * Math.sin(tt * 9));
      }, true);
    };
    S.blink = function (x, y, r, color, period, phase, duty) {
      const c0 = U.hex(color);
      S.anim(function (c, t) {
        const u = ((t + (phase || 0)) / (period || 1)) % 1;
        if (u > (duty || 0.5)) return;
        P.glowRaw(c, x, y, r, 'rgba(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ',', 0.9);
      }, true);
    };

    const tA = performance.now();
    def.draw(S, S.p);
    const tB = performance.now();
    T.finish = function () { finishTableau(T); };
    T.bloom = function () { bloomTableau(T); };
    T.drawMs = tB - tA;
    if (!IZ.deferFinish) T.finish();
    return T;
  };

  // Kenar yumuşatma + ışık parlaması (ayrı adım olarak çağrılabilir)
  function edgeFade(cnv, W) {
    const cx = cnv.getContext('2d');
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.globalCompositeOperation = 'destination-in';
    const g = cx.createLinearGradient(0, 0, cnv.width, 0);
    const f = Math.min(0.16, 170 / W);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(f, 'rgba(0,0,0,1)'); g.addColorStop(1 - f, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, cnv.width, cnv.height);
    cx.restore();
  }
  // 1. adım: ışık parlaması (ucuz küçült-büyüt bulanıklığı)
  function bloomTableau(T) {
    if (T.bloomed) return;
    for (const k in T.layers) {
      const L = T.layers[k];
      const sm = U.canvas(Math.max(1, L.ec.width / 4), Math.max(1, L.ec.height / 4));
      const sx = sm.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(L.ec, 0, 0, sm.width, sm.height);
      L.em.save(); L.em.setTransform(1, 0, 0, 1, 0, 0); L.em.globalCompositeOperation = 'lighter'; L.em.imageSmoothingEnabled = true; L.em.drawImage(sm, 0, 0, L.ec.width, L.ec.height); L.em.restore();
    }
    T.bloomed = true;
  }
  // 2. adım: arka katman yumuşatma + kenar geçişleri
  function finishTableau(T) {
    if (T.finished) return;
    bloomTableau(T);
    for (const k in T.layers) {
      const L = T.layers[k];
      if (k === 'back') { L.c = U.blurCanvas(L.c, 1.1 * L.d); }
      edgeFade(L.c, T.W); edgeFade(L.ec, T.W);
    }
    T.finished = true;
  }

  P.glowRaw = function (c, x, y, r, rgbaPrefix, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgbaPrefix + a + ')'); g.addColorStop(0.4, rgbaPrefix + a * 0.3 + ')'); g.addColorStop(1, rgbaPrefix + '0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // ------------------------------------------------------------- arka planlar
  SC.steppe = function (S, o) {
    o = o || {};
    S.layer('back');
    S.tone(0); P.hills(S.ctx, 0, S.W, -40, 120, S.rng, { freq: 0.0016 });
    S.tone(1); P.hills(S.ctx, 0, S.W, 0, 70, S.rng, { freq: 0.003 });
    for (let i = 0; i < (o.poplars || 8); i++) { const x = S.rng() * S.W; P.poplar(S.ctx, x, 6, U.lerp(60, 110, S.rng()), S.rng); }
  };

  SC.ankaraOld = function (S, o) {
    o = o || {};
    S.layer('back');
    S.tone(0); P.hills(S.ctx, 0, S.W, -30, 110, S.rng, { freq: 0.0018 });
    S.tone(1);
    P.castle(S.ctx, S.em, S.W * (o.cx || 0.72), 4, o.cs || 170, S.rng);
    P.hills(S.ctx, 0, S.W, 4, 30, S.rng, { freq: 0.004 });
    for (let i = 0; i < 16; i++) { const x = S.rng() * S.W; P.house(S.ctx, S.em, x, 6, U.lerp(28, 46, S.rng()), U.lerp(22, 34, S.rng()), { floors: S.rng() < 0.5 ? 2 : 1, lit: 0.3 }, S.rng); }
    for (let i = 0; i < 9; i++) P.poplar(S.ctx, S.rng() * S.W, 8, U.lerp(70, 120, S.rng()), S.rng);
  };

  SC.istanbul = function (S, o) {
    o = o || {};
    S.layer('back');
    S.tone(0); P.hills(S.ctx, 0, S.W, -10, 70, S.rng, { freq: 0.002 });
    S.tone(1);
    P.hills(S.ctx, 0, S.W, 0, 40, S.rng, { freq: 0.003, bottom: 10 });
    const rng = S.rng;
    // evler
    for (let i = 0; i < 40; i++) { const x = rng() * S.W; P.building(S.ctx, S.em, x, 4, U.lerp(18, 34, rng()), U.lerp(16, 40, rng()), { roof: rng() < 0.5 ? 'hip' : 'flat', roofH: 6, cornice: false, lit: o.lit === undefined ? 0.25 : o.lit, cols: 2 }, rng); }
    // camiler
    const ms = o.mosques || [[0.22, 34, 4], [0.5, 42, 6], [0.8, 30, 2]];
    ms.forEach((m) => P.mosque(S.ctx, S.em, S.W * m[0], 2, m[1], { minarets: m[2], lit: o.minLit }, rng));
    if (o.galata !== false) P.galata(S.ctx, S.em, S.W * (o.galataX || 0.66), 4, 110, { lit: o.lit !== 0 });
    if (o.towers) for (let i = 0; i < o.towers; i++) P.tower(S.ctx, S.em, S.W * U.lerp(0.05, 0.4, rng()), 4, U.lerp(18, 30, rng()), U.lerp(90, 170, rng()), { kind: rng.pick(['box', 'slant', 'taper', 'step']), lit: 0.25 }, rng);
    // su
    if (o.water !== false) { S.ctx.clearRect(0, 6, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 8, S.B, rng, 'rgba(30,30,30,.4)'); }
  };

  SC.ankaraModern = function (S, o) {
    o = o || {};
    S.layer('back');
    S.tone(0); P.hills(S.ctx, 0, S.W, -40, 90, S.rng, { freq: 0.002 });
    S.tone(1);
    const rng = S.rng;
    for (let i = 0; i < 22; i++) P.apartment(S.ctx, S.em, rng() * S.W, 4, U.lerp(40, 70, rng()), rng.int(5, 11), { year: S.year, lit: 0.3 }, rng);
    P.atakule(S.em ? S.ctx : S.ctx, S.em, S.W * (o.atakule || 0.25), 4, 110);
    P.mosque(S.ctx, S.em, S.W * (o.kocatepe || 0.62), 4, 34, { minarets: 4, minH: 120, lit: 0.2 }, rng);
    for (let i = 0; i < (o.towers === undefined ? 5 : o.towers); i++) P.tower(S.ctx, S.em, S.W * U.lerp(0.72, 0.98, rng()), 4, U.lerp(24, 36, rng()), U.lerp(140, 230, rng()), { kind: rng.pick(['box', 'slant', 'step', 'taper']), spire: rng() < 0.3 ? 20 : 0 }, rng);
  };

  SC.cityApartments = function (S, o) {
    o = o || {};
    S.layer('back');
    S.tone(0); P.hills(S.ctx, 0, S.W, -30, 80, S.rng, { freq: 0.002 });
    S.tone(1);
    const rng = S.rng;
    for (let i = 0; i < (o.n || 26); i++) P.apartment(S.ctx, S.em, rng() * S.W, 4, U.lerp(36, 64, rng()), rng.int(o.minF || 4, o.maxF || 9), { year: o.year || S.year, lit: o.lit === undefined ? 0.3 : o.lit }, rng);
    if (o.minaret) P.mosque(S.ctx, S.em, S.W * 0.55, 4, 24, { minarets: 2 }, rng);
    if (o.towers) for (let i = 0; i < o.towers; i++) P.tower(S.ctx, S.em, rng() * S.W, 4, U.lerp(24, 36, rng()), U.lerp(130, 240, rng()), { kind: rng.pick(['box', 'slant', 'step', 'taper', 'round']), spire: rng() < 0.3 ? 18 : 0 }, rng);
  };

  SC.mountainsBack = function (S, o) {
    o = o || {};
    S.layer('back');
    const rng = S.rng;
    const peaks = [];
    const n = o.n || 6;
    for (let i = 0; i < n; i++) peaks.push([S.W * (i + 0.5) / n + (rng() - 0.5) * 80, U.lerp(o.min || 140, o.max || 280, rng())]);
    S.tone(o.tone === undefined ? 0 : o.tone); P.mountains(S.ctx, 0, S.W, 10, peaks, rng, { sag: 0.22, jag: 8 });
    if (o.snow) P.snowCaps(S.ctx, peaks, 10, o.snowTone || '#9a9a9a', rng);
    return peaks;
  };

  // Boğaz kıyılarına evler ve ağaçlar (köprü sahneleri)
  SC.shoreLife = function (S, sparse) {
    const rng = S.rng, W = S.W;
    S.tone(3);
    const yL = (x) => -40 + Math.max(0, (x - 40) / 150) * 46;
    const yR = (x) => -60 + Math.max(0, (W - 80 - x) / 150) * 66;
    for (let i = 0; i < (sparse ? 2 : 4); i++) { const x = 18 + i * 34; P.house(S.ctx, S.em, x, yL(x) + 2, 30, 24, { floors: 2, door: false, lit: 0.55, chimney: false }, rng); }
    for (let i = 0; i < 5; i++) { const x = W - 30 - i * 40; P.house(S.ctx, S.em, x, yR(x) + 2, 34, U.lerp(22, 34, rng()), { floors: 2, door: false, lit: 0.55, chimney: false }, rng); }
    S.tone(4);
    for (let i = 0; i < 3; i++) P.cypress(S.ctx, 60 + i * 50, yL(60 + i * 50) + 2, U.lerp(50, 80, rng()), rng);
    for (let i = 0; i < 4; i++) { const x = W - 50 - i * 52; P.tree(S.ctx, x, yR(x) + 2, U.lerp(50, 80, rng()), i % 2 ? 'cypress' : 'broad', rng); }
  };

  // Hareketli öğeler sahnenin yumuşatılmış kenarlarına yaklaştıkça saydamlaşır
  // (sahne kenarları sise karışırken araçların havada asılı kalmaması için)
  SC.edgeA = function (x, W) { return U.smoothstep(40, 230, x) * U.smoothstep(40, 230, W - x); };

  SC.trees = function (S, x0, x1, n, types, hmin, hmax, y) {
    for (let i = 0; i < n; i++) P.tree(S.ctx, U.lerp(x0, x1, S.rng()), y || 2, U.lerp(hmin, hmax, S.rng()), S.rng.pick(types), S.rng);
  };

  SC.fireworksSky = function (S, xs, o) {
    o = o || {};
    S.skyAnim(function (c, t) {
      for (let k = 0; k < xs.length; k++) {
        const period = 2.6 + k * 0.37;
        const u = ((t + k * 1.13) % period) / period;
        const bx = xs[k][0], by = xs[k][1];
        const cols = o.colors || ['255,90,80', '255,230,170', '255,255,255', '255,170,90'];
        const col = cols[k % cols.length];
        if (u < 0.22) {
          const ry = U.lerp(0, by, u / 0.22);
          c.fillStyle = 'rgba(' + col + ',0.9)'; c.beginPath(); c.arc(bx, ry, 1.6, 0, TAU); c.fill();
        } else {
          const v = (u - 0.22) / 0.78, R = 70 * U.easeOutCubic(v) * (o.size || 1), a = 1 - v;
          const n = 22;
          for (let i = 0; i < n; i++) {
            const ang = (i / n) * TAU + k;
            const px = bx + Math.cos(ang) * R, py = by + Math.sin(ang) * R + v * v * 30;
            P.glowRaw(c, px, py, 7, 'rgba(' + col + ',', a * 0.9);
          }
          if (v < 0.15) P.glowRaw(c, bx, by, 60, 'rgba(' + col + ',', (0.15 - v) * 3);
        }
      }
    });
  };

  // ------------------------------------------------------------- 1920 – 1938
  SCN.generic = {
    draw(S) {
      SC.steppe(S);
      S.layer('main'); S.ground(3);
      S.tone(3); P.crowd(S.ctx, 200, 1000, 0, S.rng, { year: S.year, rows: 2, h: 46 });
    },
  };

  SCN.tbmm1920 = {
    draw(S, p) {
      SC.ankaraOld(S, { cx: 0.82, cs: 150 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(2); for (let i = 0; i < 6; i++) P.poplar(S.ctx, U.lerp(20, 1180, rng()), 2, U.lerp(150, 220, rng()), rng);
      S.tone(3);
      const b = P.tbmm1920(S.ctx, S.em, 560, 0, 210, rng, { lit: p.anthem ? 0.95 : 0.6 });
      S.flag(b.poleX, b.poleY - 70, 46, { base: b.poleY, poleTone: 3 });
      S.tone(4);
      if (p.anthem) {
        // marşı ayakta dinleyen kalabalık ve gökyüzüne yükselen notalar
        P.crowd(S.ctx, 280, 880, 4, rng, { year: 1921, rows: 3, h: 46, flags: 0.12, poses: { stand: 6, stand2: 2 }, dir: 1 });
        S.anim(function (c, t) {
          for (let i = 0; i < 9; i++) {
            const u = ((t * 0.09 + i / 9) % 1);
            const x = 420 + i * 52 + Math.sin(t * 0.8 + i * 1.7) * 26, y = -150 - u * 330;
            c.globalAlpha = Math.sin(u * Math.PI) * 0.85;
            c.fillStyle = '#f4ead6';
            c.beginPath(); c.ellipse(x, y, 5.5, 4, -0.4, 0, TAU); c.fill();
            c.fillRect(x + 4, y - 20, 1.6, 20);
            if (i % 2) { c.beginPath(); c.moveTo(x + 5.6, y - 20); c.quadraticCurveTo(x + 14, y - 14, x + 11, y - 6); c.lineTo(x + 10, y - 7); c.quadraticCurveTo(x + 11, y - 13, x + 5.6, y - 15); c.fill(); }
          }
          c.globalAlpha = 1;
        }, true);
        return;
      }
      P.crowd(S.ctx, 300, 860, 4, rng, { year: 1920, rows: 3, h: 46, flags: 0.05, poses: { stand: 4, stand2: 2, wave: 1, cheer: 1 }, dir: 1 });
      P.oxcart(S.ctx, 150, 4, 150, { load: true });
      P.person(S.ctx, 240, 4, 46, { g: 'f', pose: 'walk1', hat: 'scarf', skirt: 'long' });
      P.horse(S.ctx, 1030, 4, 1.2, { dir: -1 });
      P.person(S.ctx, 1080, 4, 48, { pose: 'stand', hat: 'kalpak', coat: 'long', dir: -1 });
    },
  };

  SCN.lausanne = {
    draw(S) {
      const peaks = SC.mountainsBack(S, { n: 7, min: 170, max: 320, snow: true, snowTone: '#a8a8a8' });
      S.ctx.clearRect(0, 12, S.W, S.B);
      P.waterLines(S.ctx, 0, S.W, 14, S.B, S.rng, 'rgba(40,40,40,.35)');
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(2);
      P.building(S.ctx, S.em, 330, 0, 230, 140, { roof: 'mansard', floors: 4, cols: 9, lit: 0.3 }, rng);
      P.building(S.ctx, S.em, 820, 0, 210, 130, { roof: 'mansard', floors: 4, cols: 8, lit: 0.3 }, rng);
      S.tone(3);
      const top = P.classical(S.ctx, S.em, 575, 0, 260, 230, { cols: 8, domeTop: true, attic: true, lit: 0.4 }, rng);
      S.flag(470, -300, 34, { base: -200 });
      SC.trees(S, 20, 260, 4, ['broad'], 120, 180);
      SC.trees(S, 950, 1180, 4, ['broad', 'cypress'], 120, 190);
      S.tone(4);
      for (let i = 0; i < 9; i++) P.person(S.ctx, 470 + i * 26 + rng() * 8, 0, 48, { pose: rng.pick(['stand', 'stand2', 'walk1']), hat: rng() < 0.5 ? 'fedora' : 'none', coat: 'long', dir: rng.sign() });
      P.car(S.ctx, S.em, 230, 0, 70, 'old');
    },
  };

  SCN.ankara = {
    draw(S) {
      SC.steppe(S, { poplars: 6 });
      S.layer('back'); S.tone(1);
      P.locomotive(S.ctx, S.em, 80, 10, 60, 'steam');
      for (let i = 0; i < 3; i++) P.wagon(S.ctx, S.em, 80 - (i + 1) * 64, 10, 62, 'old', S.rng);
      S.smoke(127, -30, { n: 6, size: 10, drift: -10, rise: 16, alpha: 0.25 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.castle(S.ctx, S.em, 640, 2, 330, rng);
      S.flag(642, -420, 40, { base: -330 });
      S.tone(2); for (let i = 0; i < 7; i++) P.poplar(S.ctx, 60 + i * 50 + rng() * 20, 2, U.lerp(140, 200, rng()), rng);
      S.tone(4);
      P.oxcart(S.ctx, 300, 4, 140, { load: true, dir: 1 });
      P.person(S.ctx, 395, 4, 46, { pose: 'walk1', hat: 'kalpak' });
      P.horse(S.ctx, 980, 4, 1.15);
      P.person(S.ctx, 940, 4, 47, { pose: 'walk2', hat: 'fez', coat: 'long' });
      P.crowd(S.ctx, 1040, 1180, 4, rng, { year: 1923, rows: 1, h: 45 });
    },
  };

  SCN.republic = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.2, cs: 140 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      const b = P.tbmm1920(S.ctx, S.em, 700, 0, 180, rng, { lit: 0.9 });
      S.flag(b.poleX, b.poleY - 60, 40, { base: b.poleY });
      // tepe ve toplar
      S.ctx.beginPath(); S.ctx.moveTo(0, 4); S.ctx.quadraticCurveTo(120, -70, 260, 4); S.ctx.fill();
      S.tone(4);
      P.cannon(S.ctx, 90, -48, 1.6, {}); P.cannon(S.ctx, 170, -42, 1.6, {});
      S.anim(function (c, t) {
        for (let k = 0; k < 2; k++) {
          const u = ((t * 0.55 + k * 0.5) % 1);
          const x = [135, 210][k], y = [-78, -70][k];
          if (u < 0.08) P.glowRaw(c, x, y, 40, 'rgba(255,220,150,', (0.08 - u) * 10);
          for (let i = 0; i < 4; i++) { const v = (u + i * 0.25) % 1; c.fillStyle = 'rgba(200,196,186,' + (0.35 * (1 - v)).toFixed(3) + ')'; c.beginPath(); c.arc(x + v * 40, y - v * 50, 8 + v * 26, 0, TAU); c.fill(); }
        }
      });
      S.flag(330, -220, 52, { base: 0 });
      P.crowd(S.ctx, 280, 1180, 4, rng, { year: 1923, rows: 3, h: 46, flags: 0.1, torches: 0.18, poses: { cheer: 3, wave: 2, stand: 2, fist: 1 }, em: S.em });
    },
  };

  SCN.school = {
    draw(S) {
      SC.steppe(S, { poplars: 10 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.building(S.ctx, S.em, 640, 0, 330, 150, { roof: 'hip', roofH: 60, floors: 2, cols: 9, lit: 0.4 }, rng);
      S.ctx.fillRect(610, -150, 60, 150);
      S.ctx.beginPath(); S.ctx.moveTo(600, -150); S.ctx.lineTo(640, -186); S.ctx.lineTo(680, -150); S.ctx.fill();
      S.flag(860, -240, 40, { base: 0 });
      S.tone(2); SC.trees(S, 20, 300, 4, ['broad', 'poplar'], 140, 220); SC.trees(S, 980, 1180, 3, ['broad'], 140, 200);
      S.tone(4);
      for (let i = 0; i < 9; i++) P.person(S.ctx, 300 + i * 30, 2, 32, { kid: true, g: i % 2 ? 'f' : 'm', pose: i % 2 ? 'walk1' : 'walk2', hat: i % 2 ? 'scarf' : 'kasket', skirt: i % 2 ? 'knee' : null, hold: 'bag' });
      P.person(S.ctx, 280, 2, 50, { pose: 'walk1', hat: 'fez', coat: 'long' });
      P.person(S.ctx, 590, 2, 48, { g: 'f', pose: 'wave', hat: 'scarf', skirt: 'long', dir: -1 });
    },
  };

  SCN.hats = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.15, cs: 120 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      let hx = 70;
      for (let i = 0; i < 6; i++) { const w = U.lerp(150, 210, rng()); if (hx + w / 2 > 520 && hx - w / 2 < 690) { hx = 760; } P.house(S.ctx, S.em, hx + w / 2, 0, w, U.lerp(120, 175, rng()), { floors: rng() < 0.3 ? 3 : 2, lit: 0.35 }, rng); hx += w + U.lerp(10, 40, rng()); if (hx > 1150) break; }
      // şapkacı dükkânı: üst katta yanan pencereler, zemin katta tente ve vitrin
      // (ışıklar elle yakılır ki zemin kat pencerelerinin parıltısı tentenin/vitrinin üstüne taşmasın)
      const SW = 190, SH = 190;
      P.building(S.ctx, null, 605, 0, SW, SH, { roof: 'hip', roofH: 40, floors: 2, cols: 4 }, rng);
      {
        const padX = SW * 0.06, padY = SH * 0.02, cw = (SW - padX * 2) / 4, ch = (SH - padY * 2) / 2, ww = cw * 0.5, wh = ch * 0.55;
        for (let c = 0; c < 4; c++) if (rng() < 0.6) P.lightRect(S.em, 605 - SW / 2 + padX + c * cw + (cw - ww) / 2, -SH + padY + (ch - wh) / 2, ww, wh, P.LIGHT, 0.5 + rng() * 0.4);
      }
      S.tone(2); S.ctx.beginPath(); S.ctx.moveTo(500, -114); S.ctx.lineTo(710, -114); S.ctx.lineTo(724, -94); S.ctx.lineTo(486, -94); S.ctx.closePath(); S.ctx.fill();
      S.tone(3);
      // şapkacı vitrini
      S.ctx.save(); S.ctx.fillStyle = '#3f3f3d'; S.ctx.fillRect(522, -94, 156, 70); S.ctx.restore();
      P.lightRect(S.em, 522, -94, 156, 70, '#ffd690', 0.35);
      S.tone(4);
      for (let i = 0; i < 4; i++) { const hx = 545 + i * 36; S.ctx.fillRect(hx - 1, -48, 2, 22); P.headwear(S.ctx, hx, -54, 8, 0, 1, i % 2 ? 'fedora' : 'cloche', 1, 0); }
      // asılı şapka tabelası
      S.ctx.fillRect(690, -170, 40, 3); S.ctx.fillRect(728, -170, 2, 14);
      P.headwear(S.ctx, 729, -146, 13, 0, 1, 'fedora', 1, 0);
      P.crowd(S.ctx, 60, 1160, 4, rng, { year: 1926, rows: 2, h: 47, hats: { m: { fedora: 6, kasket: 2, fez: 1 }, f: { cloche: 3, scarf: 2 } }, poses: { walk1: 3, walk2: 3, stand: 2 }, dir: 1 });
      // yerde bir fes
      P.headwear(S.ctx, 470, 6, 7, 1.4, 1, 'fez', 1, 0);
    },
  };

  SCN.civil = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.85, cs: 120 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.classical(S.ctx, S.em, 600, 0, 300, 260, { cols: 6, scales: true, lit: 0.4 }, rng);
      S.tone(2); SC.trees(S, 40, 330, 4, ['cypress', 'broad'], 150, 230); SC.trees(S, 880, 1180, 4, ['cypress', 'broad'], 150, 230);
      S.tone(4);
      // gelin ve damat
      P.person(S.ctx, 585, 0, 50, { pose: 'hug', hat: 'fedora', coat: 'long', dir: 1 });
      const bride = P.person(S.ctx, 612, 0, 47, { g: 'f', pose: 'stand2', hat: 'bun', skirt: 'long', dir: -1 });
      S.ctx.save(); S.ctx.fillStyle = '#7a7a76';
      S.ctx.beginPath(); S.ctx.moveTo(bride.hx + 3, bride.hy - 6); S.ctx.quadraticCurveTo(bride.hx + 22, bride.hy + 20, bride.hx + 16, 0); S.ctx.lineTo(bride.hx + 4, 0); S.ctx.quadraticCurveTo(bride.hx + 8, bride.hy + 14, bride.hx - 2, bride.hy - 4); S.ctx.fill(); S.ctx.restore();
      P.crowd(S.ctx, 380, 540, 2, rng, { year: 1926, rows: 2, h: 46, poses: { clap: 3, stand: 2, wave: 1 }, dir: 1 });
      P.crowd(S.ctx, 660, 830, 2, rng, { year: 1926, rows: 2, h: 46, poses: { clap: 3, stand: 2, wave: 1 }, dir: -1 });
    },
  };

  SCN.alphabet = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.6, cs: 130 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(2); SC.trees(S, 30, 1170, 7, ['broad'], 200, 280);
      S.tone(4);
      P.blackboard(S.ctx, 560, 0, 300, 120, ['A B C Ç D E F G', 'Ğ H I İ J K Ö Ş Ü'], {});
      P.person(S.ctx, 380, 0, 52, { pose: 'point', hat: 'fedora', coat: 'long', dir: 1 });
      // sıralarda yetişkin öğrenciler
      for (let i = 0; i < 4; i++) { S.ctx.fillRect(200 + i * 0 - 160, -14, 0, 0); }
      for (let i = 0; i < 2; i++) { S.ctx.fillRect(760 + i * 200, -18, 170, 4); S.ctx.fillRect(764 + i * 200, -18, 3, 18); S.ctx.fillRect(926 + i * 200, -18, 3, 18); }
      for (let i = 0; i < 12; i++) P.person(S.ctx, 775 + i * 30, 0, 46, { pose: 'sit', g: i % 3 ? 'm' : 'f', hat: i % 3 ? rng.pick(['fedora', 'kasket', 'fez']) : 'scarf', skirt: i % 3 ? null : 'long', dir: -1 });
      P.crowd(S.ctx, 60, 300, 2, rng, { year: 1928, rows: 2, h: 46, dir: 1 });
    },
  };

  SCN.crash = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.3, cs: 120 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      for (let i = 0; i < 3; i++) P.house(S.ctx, S.em, 150 + i * 400, 0, 220, 140, { floors: 2, lit: 0.2 }, rng);
      S.tone(4);
      P.sacks(S.ctx, 380, 2, 150, rng); P.sacks(S.ctx, 560, 2, 120, rng); P.sacks(S.ctx, 900, 2, 170, rng);
      P.crowd(S.ctx, 420, 860, 2, rng, { year: 1929, rows: 2, h: 47, poses: { mourn: 4, stand: 2 }, hats: { m: { fez: 1, kasket: 3, fedora: 2 }, f: { scarf: 4 } } });
      P.oxcart(S.ctx, 1080, 4, 130, { load: true, dir: -1 });
      P.chart(S.em, 760, -330, 320, 150, [0.95, 0.9, 0.97, 0.8, 0.83, 0.6, 0.62, 0.35, 0.4, 0.18, 0.12], '#ff5a4a');
    },
  };

  SCN.train = {
    w: 1400,
    draw(S) {
      SC.mountainsBack(S, { n: 6, min: 120, max: 230 });
      S.layer('back'); S.tone(1); P.hills(S.ctx, 0, S.W, 10, 60, S.rng, { freq: 0.003 });
      S.layer('main');
      const rng = S.rng;
      // sığ vadi ve dere
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -46); S.ctx.quadraticCurveTo(260, -40, 420, -6); S.ctx.quadraticCurveTo(700, 16, 980, -6); S.ctx.quadraticCurveTo(1140, -40, 1400, -46); S.ctx.lineTo(1400, S.B); S.ctx.closePath(); S.ctx.fill();
      S.ctx.clearRect(580, 4, 240, 26);
      P.waterLines(S.ctx, 580, 820, 6, 28, rng, 'rgba(30,30,30,.45)');
      S.tone(2); SC.trees(S, 360, 540, 4, ['poplar'], 110, 160, 0); SC.trees(S, 860, 1040, 4, ['poplar'], 110, 160, 0);
      // viyadük iki yamacın arasında; tren bir tünelden çıkıp öbürüne girer
      const PL = 190, PR = 1210, DECK = 30 - 230 - 14;
      S.tone(4);
      P.viaduct(S.ctx, PL - 40, PR + 40, 30, 230, 7, { deckH: 14 });
      // raylar ve traversler
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.4);
      S.ctx.fillRect(PL - 40, DECK - 2.2, PR - PL + 80, 1.4);
      for (let x = PL - 36; x < PR + 40; x += 9) S.ctx.fillRect(x, DECK - 1, 4, 1.2);
      S.ctx.restore();
      // yamaçlar (önde) ve tünel ağızları
      const hill = (dir) => {
        const X = (v) => (dir > 0 ? v : S.W - v);
        S.ctx.beginPath();
        S.ctx.moveTo(X(-10), S.B); S.ctx.lineTo(X(-10), -420);
        S.ctx.quadraticCurveTo(X(90), -400, X(150), -352);
        S.ctx.quadraticCurveTo(X(PL + 10), -322, X(PL + 26), -270);
        S.ctx.lineTo(X(PL + 22), DECK + 6);
        S.ctx.quadraticCurveTo(X(PL + 80), DECK + 70, X(PL + 120), -90);
        S.ctx.quadraticCurveTo(X(PL + 170), -40, X(PL + 250), -30);
        S.ctx.lineTo(X(PL + 250), S.B);
        S.ctx.closePath(); S.ctx.fill();
      };
      S.tone(3); hill(1); hill(-1);
      const portal = (cx) => {
        // taş kemer ve karanlık tünel içi
        S.ctx.save();
        S.ctx.fillStyle = P.lighter(S.ctx, 1.6);
        S.ctx.beginPath(); S.ctx.moveTo(cx - 44, DECK); S.ctx.lineTo(cx - 44, DECK - 70); S.ctx.arc(cx, DECK - 70, 44, Math.PI, 0); S.ctx.lineTo(cx + 44, DECK); S.ctx.closePath(); S.ctx.fill();
        S.ctx.fillStyle = '#060606';
        S.ctx.beginPath(); S.ctx.moveTo(cx - 34, DECK); S.ctx.lineTo(cx - 34, DECK - 70); S.ctx.arc(cx, DECK - 70, 34, Math.PI, 0); S.ctx.lineTo(cx + 34, DECK); S.ctx.closePath(); S.ctx.fill();
        S.ctx.restore();
      };
      portal(PL); portal(PR);
      S.tone(2); for (let i = 0; i < 5; i++) { P.cypress(S.ctx, 30 + i * 26, -352 + i * 12 + rng() * 10, U.lerp(50, 80, rng()), rng); P.cypress(S.ctx, S.W - 30 - i * 26, -352 + i * 12 + rng() * 10, U.lerp(50, 80, rng()), rng); }
      // tren (hareketli): yalnızca iki tünel ağzının arasında görünür
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        const x = U.lerp(PL - 10, PR + 470, U.clamp(k * 1.3 - 0.12, 0, 1));
        c.save();
        c.beginPath(); c.rect(PL, DECK - 140, PR - PL, 150); c.clip();
        c.fillStyle = P.TONE[4];
        const loco = P.locomotive(c, null, x, DECK + 2, 90, 'steam', { flags: true });
        for (let i = 0; i < 4; i++) P.wagon(c, null, x - 40 * 0.9 - (i + 1) * 84, DECK + 2, 82, 'old');
        c.restore();
        // duman yalnızca baca açıktayken, tünel ağızlarına yaklaşınca söner
        const a = U.smoothstep(PL, PL + 60, loco.stackX) * (1 - U.smoothstep(PR - 60, PR, loco.stackX));
        if (a > 0.01) {
          for (let i = 0; i < 7; i++) {
            const u = ((t * 0.9 + i / 7) % 1);
            c.fillStyle = 'rgba(210,206,196,' + (0.42 * (1 - u) * a).toFixed(3) + ')';
            c.beginPath(); c.arc(loco.stackX - u * 120, loco.stackY - u * 60 - Math.sin(u * 5) * 6, 8 + u * 30, 0, TAU); c.fill();
          }
        }
        // tünel kemerinin ön yüzü trenin üstünde kalır
        c.fillStyle = P.TONE[3];
        [PL, PR].forEach((cx) => { c.beginPath(); c.moveTo(cx - 44, DECK - 70); c.arc(cx, DECK - 70, 44, Math.PI, 0); c.lineTo(cx + 34, DECK - 70); c.arc(cx, DECK - 70, 34, 0, Math.PI, true); c.closePath(); c.fill(); });
      });
    },
  };

  SCN.surname = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.75 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.building(S.ctx, S.em, 520, 0, 380, 170, { roof: 'hip', roofH: 50, floors: 2, cols: 11, lit: 0.4 }, rng);
      S.tone(2); P.signboard(S.ctx, S.em, 520, -176, 150, 26, 'NÜFUS', { posts: false, color: '#d9d2bf' });
      S.tone(2); SC.trees(S, 860, 1180, 4, ['poplar', 'broad'], 160, 230);
      S.tone(4);
      // kuyruk
      for (let i = 0; i < 16; i++) {
        const g = rng() < 0.45 ? 'f' : 'm';
        P.person(S.ctx, 500 - i * 27, 2, i % 5 === 3 ? 30 : 47, { g: g, kid: i % 5 === 3, pose: rng.pick(['stand', 'stand2']), hat: g === 'f' ? rng.pick(['scarf', 'cloche', 'bun']) : rng.pick(['fedora', 'kasket']), skirt: g === 'f' ? 'long' : null, dir: 1 });
      }
      P.table(S.ctx, 610, 0, 60, 22); P.person(S.ctx, 650, 0, 46, { pose: 'sit', hat: 'fedora', dir: -1 });
    },
  };

  SCN.suffrage = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.15 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      const b = P.tbmm2(S.ctx, S.em, 720, 0, 200, rng);
      S.flag(b.poleX, b.poleY - 60, 40, { base: b.poleY });
      S.tone(2); SC.trees(S, 20, 260, 4, ['broad', 'cypress'], 150, 220);
      S.tone(4);
      P.table(S.ctx, 470, 0, 70, 24); P.ballotBox(S.ctx, S.em, 470, -24, 34, 'wood');
      for (let i = 0; i < 11; i++) P.person(S.ctx, 430 - i * 26, 2, 46, { g: 'f', pose: i === 0 ? 'point' : rng.pick(['stand', 'stand2']), hat: rng.pick(['cloche', 'bun', 'scarf']), skirt: i % 4 === 0 ? 'long' : 'knee', dir: 1 });
      P.crowd(S.ctx, 560, 1100, 2, rng, { year: 1934, rows: 2, h: 47, poses: { clap: 2, stand: 3 }, dir: -1, female: 0.3 });
    },
  };

  SCN.factory = {
    w: 1300,
    draw(S, p) {
      SC.steppe(S, { poplars: 5 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.factoryHall(S.ctx, S.em, 470, 0, 560, 130, rng);
      P.factoryHall(S.ctx, S.em, 980, 0, 300, 110, rng, { teeth: 5 });
      P.chimney(S.ctx, 820, 0, 26, 300); P.chimney(S.ctx, 880, 0, 22, 250);
      S.smoke(820, -305, { n: 10, size: 20, drift: 22, rise: 26, alpha: 0.42 });
      S.smoke(880, -255, { n: 9, size: 16, drift: 22, rise: 24, alpha: 0.38 });
      P.waterTower(S.ctx, 140, 0, 130);
      S.flag(470, -250, 36, { base: -150 });
      S.tone(4);
      if (p.march) {
        // iş bırakıp yürüyen işçiler, ellerinde yazısız pankartlar
        const xs = P.crowd(S.ctx, 60, 1240, 4, rng, { year: 1970, rows: 4, h: 46, poses: { walk1: 3, walk2: 3, fist: 2 }, dir: 1, female: 0.25, hats: { m: { kasket: 3, none: 3 }, f: { scarf: 2, bob: 1 } } });
        for (let i = 0; i < 6; i++) {
          const x = 140 + i * 190 + rng() * 40;
          S.ctx.fillRect(x - 1.5, -112, 3, 112); S.ctx.fillRect(x + 58, -112, 3, 112);
          S.ctx.save(); S.ctx.fillStyle = i % 2 ? '#b8b0a0' : '#8f2a26'; S.ctx.fillRect(x - 2, -134, 64, 30); S.ctx.restore();
        }
        return;
      }
      P.crowd(S.ctx, 500, 800, 2, rng, { year: 1935, rows: 2, h: 46, poses: { walk1: 3, walk2: 3 }, dir: -1, hats: { m: { kasket: 4, fedora: 1 }, f: { scarf: 4 } } });
      for (let i = 0; i < 3; i++) P.wagon(S.ctx, S.em, 1010 + i * 92, 0, 90, 'freight', rng);
    },
  };

  SCN.straits = {
    w: 1300,
    draw(S) {
      S.layer('back');
      S.tone(0); P.hills(S.ctx, 0, S.W, -10, 110, S.rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 26; i++) P.house(S.ctx, S.em, S.rng() * S.W, -U.lerp(0, 50, S.rng()) + 6, U.lerp(24, 36, S.rng()), U.lerp(18, 30, S.rng()), { floors: 2, door: false }, S.rng);
      SC.trees(S, 0, S.W, 10, ['cypress', 'broad'], 40, 80, 6);
      S.ctx.clearRect(0, 8, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 10, S.B, S.rng);
      S.layer('main');
      const rng = S.rng;
      S.tone(3);
      // Rumeli Hisarı yamacı
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -230); S.ctx.quadraticCurveTo(260, -210, 430, 0); S.ctx.lineTo(430, S.B); S.ctx.fill();
      // surlar ve kuleler
      S.ctx.beginPath(); S.ctx.moveTo(40, -200); S.ctx.lineTo(380, -30); S.ctx.lineTo(380, -10); S.ctx.lineTo(40, -180); S.ctx.fill();
      [[80, -205, 44, 120], [250, -120, 52, 140], [360, -40, 40, 100]].forEach((t) => {
        S.ctx.fillRect(t[0] - t[2] / 2, t[1] - t[3], t[2], t[3] + 40);
        S.ctx.beginPath(); S.ctx.moveTo(t[0] - t[2] / 2 - 3, t[1] - t[3]); S.ctx.lineTo(t[0], t[1] - t[3] - t[2] * 0.9); S.ctx.lineTo(t[0] + t[2] / 2 + 3, t[1] - t[3]); S.ctx.fill();
        for (let k = 0; k < 4; k++) S.ctx.fillRect(t[0] - t[2] / 2 + k * (t[2] / 4) + 2, t[1] - t[3] - 6, t[2] / 8, 6);
      });
      S.flag(250, -330, 40, { base: -260 });
      S.tone(2); SC.trees(S, 0, 200, 4, ['cypress'], 100, 170, -150);
      S.ctx.clearRect(430, 0, 870, S.B);
      P.waterLines(S.ctx, 430, 1300, 2, S.B, rng);
      S.tone(4);
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        c.fillStyle = P.TONE[4];
        P.ship(c, null, U.lerp(1350, 500, k), 6, 260, 'steam', { dir: -1, flag: true, t: t });
        c.fillStyle = P.TONE[3];
        P.ship(c, null, U.lerp(700, 1250, k), 2, 90, 'boat');
      });
    },
  };

  SCN.dolmabahce = {
    w: 1300,
    draw(S) {
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, 0, 90, S.rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 4; i++) P.mosque(S.ctx, S.em, 200 + i * 300, 4, 20, { minarets: 2 }, S.rng);
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      const b = P.dolmabahce(S.ctx, S.em, 760, 0, 230, rng);
      S.flag(b.poleX, b.poleY - 30, 44, { base: b.poleY + 40, half: true, amp: 0.05, speed: 2.5 });
      P.clockTower(S.ctx, S.em, 200, 0, 230, { hour: 9, minute: 5, faceColor: '#8a8a86' });
      S.tone(4);
      P.crowd(S.ctx, 300, 1250, 4, rng, { year: 1938, rows: 3, h: 46, poses: { mourn: 6, stand: 1 }, hold: 'umbrella', holdP: 0.25 });
    },
  };

  SCN.cankaya = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.3, cs: 110 });
      S.layer('main');
      const rng = S.rng;
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, 0); S.ctx.quadraticCurveTo(600, -150, 1200, 0); S.ctx.lineTo(1200, S.B); S.ctx.fill();
      // köşk
      P.building(S.ctx, S.em, 600, -110, 220, 110, { roof: 'hip', roofH: 50, floors: 2, cols: 7, lit: 0.6 }, rng);
      S.ctx.fillRect(650, -290, 60, 180); S.ctx.beginPath(); S.ctx.moveTo(640, -290); S.ctx.lineTo(680, -320); S.ctx.lineTo(720, -290); S.ctx.fill();
      S.flag(470, -320, 42, { base: -105 });
      S.tone(2); SC.trees(S, 300, 470, 4, ['pine', 'cypress'], 130, 200, -80); SC.trees(S, 760, 1000, 5, ['pine', 'cypress'], 130, 200, -80);
      S.tone(4);
      for (let i = 0; i < 4; i++) P.person(S.ctx, 530 + i * 50, -110, 46, { pose: 'stand', hat: 'helmet', hold: 'rifle', coat: 'short', dir: i < 2 ? 1 : -1 });
      P.car(S.ctx, S.em, 900, -54, 90, 'old', { dir: -1 });
    },
  };

  SCN.hatay = {
    draw(S) {
      SC.mountainsBack(S, { n: 6, min: 170, max: 300 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      for (let i = 0; i < 10; i++) P.building(S.ctx, S.em, 70 + i * 115, 0, U.lerp(80, 110, rng()), U.lerp(70, 120, rng()), { roof: rng() < 0.5 ? 'flat' : 'hip', roofH: 30, cols: 3, lit: 0.3 }, rng);
      // cami (kubbeli; minaresi sağında)
      P.mosque(S.ctx, S.em, 330, 0, 50, { minarets: 1, minH: 210, lit: 0.25 }, rng);
      // çan kulesi
      S.ctx.fillRect(820, -200, 40, 200); S.ctx.beginPath(); S.ctx.moveTo(814, -200); S.ctx.lineTo(840, -250); S.ctx.lineTo(866, -200); S.ctx.fill();
      S.ctx.fillRect(838, -275, 4, 26); S.ctx.fillRect(831, -266, 18, 4);
      S.flag(610, -300, 46, { base: -110 });
      S.tone(4);
      P.crowd(S.ctx, 120, 1100, 4, rng, { year: 1939, rows: 3, h: 46, flags: 0.12, poses: { cheer: 3, wave: 2, stand: 2 } });
    },
  };

  SCN.quake = {
    w: 1300,
    draw(S, p) {
      const v = p.v || 1999;
      const rng = S.rng;
      if (v === 1939) {
        SC.mountainsBack(S, { n: 6, min: 160, max: 300, snow: true, snowTone: '#a2a2a2' });
      } else if (v === 1966) {
        SC.mountainsBack(S, { n: 6, min: 150, max: 260 });
      } else if (v === 1976) {
        // Doğu Anadolu yaylası: alçak sıradağlar ve geniş, karlı bir volkan konisi (Tendürek)
        SC.mountainsBack(S, { n: 5, min: 110, max: 190, snow: true, snowTone: '#a6a6a6' });
        S.layer('back'); S.tone(0);
        const cx = 930, top = -330, crater = 46;
        S.ctx.beginPath(); S.ctx.moveTo(470, 12);
        S.ctx.bezierCurveTo(700, -40, cx - crater - 70, top + 40, cx - crater, top);
        S.ctx.lineTo(cx - crater * 0.4, top + 7); S.ctx.lineTo(cx + crater * 0.3, top + 4); S.ctx.lineTo(cx + crater, top + 2);
        S.ctx.bezierCurveTo(cx + crater + 80, top + 46, 1150, -40, 1300, 12);
        S.ctx.closePath(); S.ctx.fill();
        S.ctx.save(); S.ctx.fillStyle = '#a9a9a6';
        S.ctx.beginPath(); S.ctx.moveTo(cx - crater - 34, top + 22);
        for (let i = 0; i <= 10; i++) { const u = i / 10; S.ctx.lineTo(U.lerp(cx - crater - 34, cx + crater + 40, u), top + 26 + Math.sin(u * 17) * 7 + (i % 2) * 9); }
        S.ctx.lineTo(cx + crater, top + 2); S.ctx.lineTo(cx + crater * 0.3, top + 4); S.ctx.lineTo(cx - crater * 0.4, top + 7); S.ctx.lineTo(cx - crater, top);
        S.ctx.closePath(); S.ctx.fill(); S.ctx.restore();
      } else if (v === 2011) {
        SC.mountainsBack(S, { n: 5, min: 180, max: 330, snow: true, snowTone: '#9a9a9a' });
        S.layer('back'); S.tone(1); for (let i = 0; i < 16; i++) P.apartment(S.ctx, S.em, rng() * S.W, 8, U.lerp(36, 60, rng()), rng.int(3, 6), { year: 2011, lit: 0.1 }, rng);
      } else {
        SC.cityApartments(S, { n: 22, minF: 4, maxF: 9, lit: 0.05, year: v });
        if (v === 1999) { S.layer('back'); S.flame(980, -10, 120, 160); S.smoke(980, -120, { n: 9, size: 40, drift: 30, rise: 30, alpha: 0.45, color: 'rgba(40,36,32,' }); }
      }
      S.layer('main'); S.ground(3);
      S.tone(3);
      const snow = v === 1939 || v === 2023 || v === 1976;
      if (v === 1976 || v === 1966) {
        // yıkılmış kerpiç köy, Kızılay çadırları, yardım kamyonu ve ateş başında ısınanlar
        for (let i = 0; i < 6; i++) P.adobe(S.ctx, S.em, 50 + i * 92 + rng() * 26, 0, U.lerp(64, 96, rng()), U.lerp(44, 62, rng()), rng, { broken: rng() < 0.8 });
        P.adobe(S.ctx, S.em, 1230, 0, 96, 58, rng, { broken: true });
        S.tone(2); for (let i = 0; i < 4; i++) P.bareTree(S.ctx, U.lerp(40, 1260, rng()), 0, U.lerp(110, 170, rng()), rng);
        const tents = [[700, 74, 54], [790, 66, 48], [1010, 78, 56], [1110, 68, 50]];
        tents.forEach((tt, k) => {
          P.tent(S.ctx, tt[0], 0, tt[1], tt[2], '#5f5f5b');
          S.ctx.save();
          S.ctx.fillStyle = '#c8161e';
          S.ctx.beginPath(); S.ctx.arc(tt[0] - tt[1] * 0.2, -tt[2] * 0.42, 4.6, 0, TAU); S.ctx.fill();
          S.ctx.fillStyle = '#5f5f5b';
          S.ctx.beginPath(); S.ctx.arc(tt[0] - tt[1] * 0.2 + 1.9, -tt[2] * 0.42, 3.8, 0, TAU); S.ctx.fill();
          S.ctx.restore();
          // soba borusu ve dumanı
          if (k % 2 === 0) { S.ctx.fillRect(tt[0] + tt[1] * 0.22, -tt[2] * 0.62 - 16, 2.4, 18); S.smoke(tt[0] + tt[1] * 0.23, -tt[2] * 0.62 - 20, { n: 6, size: 9, drift: 10, rise: 16, alpha: 0.32 }); }
        });
        S.tone(4);
        P.truck(S.ctx, S.em, 905, 2, 150, 'old', { dir: -1 });
        S.ctx.save(); S.ctx.fillStyle = P.TONE[3]; P.sacks(S.ctx, 905 + 20, -42, 66, rng); S.ctx.restore();
        P.sacks(S.ctx, 838, 2, 40, rng);
        P.person(S.ctx, 860, 0, 45, { pose: 'carry', hat: 'kasket', dir: -1, hold: 'bundle' });
        P.person(S.ctx, 958, -40, 45, { pose: 'carry', hat: 'kasket', dir: -1 });
        S.flame(470, 0, 30, 44); S.smoke(470, -40, { n: 7, size: 12, rise: 18, alpha: 0.3 });
        for (let i = 0; i < 6; i++) {
          const g = i % 3 === 1 ? 'f' : 'm';
          P.person(S.ctx, 410 + i * 24 + (i > 2 ? 22 : 0), 0, i === 4 ? 30 : 44, { g: g, kid: i === 4, pose: i % 2 ? 'mourn' : 'stand2', hat: g === 'f' ? 'scarf' : 'kasket', skirt: g === 'f' ? 'long' : null, coat: g === 'm' && i !== 4 ? 'long' : null, dir: i > 2 ? -1 : 1 });
        }
        P.crowd(S.ctx, 120, 330, 4, rng, { year: v, rows: 2, h: 44, poses: { dig: 3, carry: 2, mourn: 1 }, hats: { m: { kasket: 3, none: 1 }, f: { scarf: 1 } } });
      } else if (v === 1939) {
        for (let i = 0; i < 11; i++) P.adobe(S.ctx, S.em, 60 + i * 115 + rng() * 30, 0, U.lerp(70, 110, rng()), U.lerp(50, 70, rng()), rng, { broken: rng() < 0.7 });
        S.tone(2); for (let i = 0; i < 5; i++) P.bareTree(S.ctx, rng() * 1300, 0, U.lerp(120, 180, rng()), rng);
        S.tone(4);
        S.flame(640, 0, 34, 50); S.smoke(640, -40, { n: 6, size: 12, rise: 18, alpha: 0.3 });
        for (let i = 0; i < 5; i++) P.person(S.ctx, 590 + i * 22 + (i > 2 ? 30 : 0), 0, 44, { pose: i % 2 ? 'mourn' : 'stand2', hat: i % 2 ? 'scarf' : 'kalpak', g: i % 2 ? 'f' : 'm', skirt: i % 2 ? 'long' : null, coat: i % 2 ? null : 'long', dir: i > 2 ? -1 : 1 });
        P.crowd(S.ctx, 200, 420, 4, rng, { year: 1939, rows: 2, h: 44, poses: { dig: 3, mourn: 2, stand: 1 } });
      } else {
        // yıkık ve eğik binalar
        const xs = [80, 260, 430, 640, 840, 1020, 1200];
        xs.forEach((x, i) => {
          const kind = rng();
          if (kind < 0.45) {
            // pankek çöküş: üst üste eğik döşemeler
            S.ctx.save(); S.ctx.translate(x, 0); S.ctx.rotate((rng() - 0.5) * 0.12);
            for (let f = 0; f < 5; f++) { S.ctx.save(); S.ctx.translate(0, -f * 13 - 6); S.ctx.rotate((rng() - 0.5) * 0.2); S.ctx.fillRect(-60, -4, 120, 8); S.ctx.restore(); }
            S.ctx.restore();
            P.rubble(S.ctx, x - 90, x + 90, 2, 46, rng);
          } else if (kind < 0.75) {
            P.apartment(S.ctx, S.em, x, 0, U.lerp(90, 120, rng()), rng.int(4, 7), { year: v, lit: v === 2023 ? 0 : 0.05, tilt: (rng() < 0.5 ? -1 : 1) * U.lerp(0.06, 0.16, rng()), balcony: true }, rng);
          } else {
            P.rubble(S.ctx, x - 100, x + 100, 2, 90, rng);
          }
        });
        S.tone(2);
        if (v !== 1939) P.crane(S.ctx, 560, 0, 260, 200, { hook: 0.55, drop: 0.5, load: 30, em: S.em });
        S.tone(4);
        // kurtarma ekipleri: insan zinciri
        for (let i = 0; i < 9; i++) P.person(S.ctx, 300 + i * 20, 0, 44, { pose: i % 2 ? 'carry' : 'dig', hat: 'helmet', dir: 1, hold: i === 4 ? 'helmetlamp' : null, em: S.em });
        P.crowd(S.ctx, 900, 1150, 4, rng, { year: v, rows: 2, h: 45, poses: { mourn: 4, stand: 2, hug: 1 } });
        // projektörler
        [[180, -150], [1080, -160]].forEach((pp, k) => {
          S.ctx.fillRect(pp[0] - 1.5, pp[1], 3, -pp[1]);
          S.ctx.fillRect(pp[0] - 9, pp[1] - 6, 18, 8);
          S.anim(function (c, t) {
            const a0 = k ? 2.2 : 0.95;
            const a = a0 + Math.sin(t * 0.4 + k) * 0.18;
            const L = 300;
            [[0.2, 0.1], [0.07, 0.18]].forEach((w) => {
              const g = c.createLinearGradient(pp[0], pp[1], pp[0] + Math.cos(a) * L, pp[1] + Math.sin(a) * L);
              g.addColorStop(0, 'rgba(235,242,255,' + w[1] + ')'); g.addColorStop(0.7, 'rgba(235,242,255,' + (w[1] * 0.35) + ')'); g.addColorStop(1, 'rgba(235,242,255,0)');
              c.fillStyle = g;
              c.beginPath(); c.moveTo(pp[0], pp[1]); c.lineTo(pp[0] + Math.cos(a - w[0]) * L, pp[1] + Math.sin(a - w[0]) * L); c.lineTo(pp[0] + Math.cos(a + w[0]) * L, pp[1] + Math.sin(a + w[0]) * L); c.closePath(); c.fill();
            });
            P.glowRaw(c, pp[0], pp[1] - 3, 26, 'rgba(240,246,255,', 0.9);
          }, true);
        });
        S.blink(700, -40, 22, '#ff3b30', 0.8, 0, 0.5); S.blink(740, -40, 22, '#3b8bff', 0.8, 0.4, 0.5);
        if (v === 2023 || v === 2011) for (let i = 0; i < 4; i++) P.tent(S.ctx, 1180 + i * 40 - 120, 0, 40, 30, '#6a6a66');
      }
      if (snow) {
        S.ctx.save(); S.ctx.fillStyle = '#8f8f8b';
        for (let i = 0; i < 40; i++) { const x = rng() * S.W; S.ctx.fillRect(x, -rng() * 3, U.lerp(6, 30, rng()), 2); }
        S.ctx.restore();
      }
    },
  };

  SCN.village = {
    draw(S) {
      SC.steppe(S, { poplars: 12 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.building(S.ctx, S.em, 330, 0, 300, 90, { roof: 'gable', roofH: 46, floors: 1, cols: 8, lit: 0.3 }, rng);
      P.building(S.ctx, S.em, 820, 0, 260, 84, { roof: 'gable', roofH: 42, floors: 1, cols: 7, lit: 0.3 }, rng);
      S.flag(580, -220, 38, { base: 0 });
      S.tone(2); SC.trees(S, 1000, 1180, 3, ['poplar'], 170, 230);
      S.tone(4);
      // duvar ören öğrenciler
      S.ctx.fillRect(560, -40, 140, 40);
      for (let i = 0; i < 5; i++) S.ctx.fillRect(560 + i * 28, -46, 26, 6);
      P.person(S.ctx, 545, 0, 44, { pose: 'carry', hat: 'kasket' });
      P.person(S.ctx, 720, 0, 44, { pose: 'dig', hat: 'kasket', hold: 'shovel', dir: -1 });
      P.person(S.ctx, 760, 0, 42, { g: 'f', pose: 'carry', hat: 'scarf', skirt: 'long', dir: -1 });
      // fidan diken öğrenciler
      for (let i = 0; i < 4; i++) { P.youngTree(S.ctx, 980 + i * 50, 0, 40, rng); P.person(S.ctx, 965 + i * 50, 0, 40, { kid: true, pose: 'dig', hat: i % 2 ? 'scarf' : 'kasket', g: i % 2 ? 'f' : 'm', dir: 1 }); }
      // mandolin çalan öğrenci
      P.person(S.ctx, 120, 0, 44, { pose: 'sit', hat: 'kasket', dir: 1 });
      S.ctx.beginPath(); S.ctx.ellipse(132, -40, 7, 5, -0.4, 0, TAU); S.ctx.fill(); S.ctx.fillRect(132, -48, 16, 2);
      P.crowd(S.ctx, 160, 260, 2, rng, { year: 1940, rows: 1, h: 40, kids: 0.6, poses: { sitground: 3 }, dir: -1 });
    },
  };

  SCN.ration = {
    draw(S) {
      SC.ankaraOld(S, { cx: 0.8 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.building(S.ctx, S.em, 300, 0, 240, 150, { roof: 'hip', roofH: 40, floors: 2, cols: 6, lit: 0.3 }, rng);
      P.building(S.ctx, S.em, 900, 0, 300, 170, { roof: 'hip', roofH: 40, floors: 2, cols: 8, lit: 0.3 }, rng);
      S.tone(2); P.signboard(S.ctx, S.em, 300, -156, 110, 24, 'FIRIN', { posts: false, color: '#d6cfbb' });
      S.tone(4);
      for (let i = 0; i < 18; i++) { const g = rng() < 0.5 ? 'f' : 'm'; P.person(S.ctx, 400 + i * 24, 2, 46, { g: g, pose: rng.pick(['stand', 'stand2', 'mourn']), hat: g === 'f' ? 'scarf' : rng.pick(['fedora', 'kasket']), skirt: g === 'f' ? 'long' : null, coat: g === 'm' ? 'long' : null, dir: -1, hold: i === 0 ? 'bread' : null }); }
      P.person(S.ctx, 980, 2, 48, { pose: 'walk1', hat: 'helmet', hold: 'rifle', coat: 'long', dir: -1 });
      P.person(S.ctx, 1010, 2, 48, { pose: 'walk2', hat: 'helmet', hold: 'rifle', coat: 'long', dir: -1 });
      P.horse(S.ctx, 1120, 2, 1.1, { dir: -1 });
    },
  };

  // KKTC bayrağı (beyaz zemin, iki kırmızı şerit, kırmızı ay yıldız)
  let kktcTex = null;
  function kktcFlag() {
    if (kktcTex) return kktcTex;
    const G = 120, L = 180, c = U.canvas(L, G), x = c.getContext('2d');
    x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, L, G);
    x.fillStyle = P.FLAG_RED; x.fillRect(0, G * 0.1, L, G * 0.1); x.fillRect(0, G * 0.8, L, G * 0.1);
    x.beginPath(); x.arc(L * 0.45, G * 0.5, G * 0.2, 0, TAU); x.fill();
    x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(L * 0.45 + G * 0.05, G * 0.5, G * 0.16, 0, TAU); x.fill();
    x.fillStyle = P.FLAG_RED; x.beginPath(); P.starPath(x, L * 0.45 + G * 0.24, G * 0.5, G * 0.08, G * 0.03, 5, Math.PI); x.fill();
    kktcTex = c;
    return c;
  }
  // Kıbrıs: Beşparmak Dağları ve yamaçtaki dev bayrak
  function kibrisBack(S) {
    SC.mountainsBack(S, { n: 7, min: 160, max: 290 });
    const c = S.ctx, fx = S.W * 0.37, fy = -88, fw = 124, fh = 78;
    // yamaca boyanmış gibi: hafif eğik ve kayaya karışan
    c.save();
    c.globalAlpha = 0.72;
    c.transform(1, -0.12, 0, 1, 0, fx * 0.12);
    c.drawImage(kktcFlag(), fx - fw / 2, fy - fh / 2, fw, fh);
    c.restore();
  }

  SCN.ballot = {
    draw(S, p) {
      const rng = S.rng;
      const city = p.city || 'ankara';
      if (city === 'ankaraOld') SC.ankaraOld(S, { cx: 0.2 });
      else if (city === 'istanbul') SC.istanbul(S, { towers: S.year > 2000 ? 5 : 0, water: false });
      else if (city === 'kibris') kibrisBack(S);
      else SC.ankaraModern(S, {});
      S.layer('main'); S.ground(3);
      S.tone(3);
      // seçim okul binasında yapılır
      const modern = S.year >= 1980;
      P.building(S.ctx, S.em, 840, 0, 380, modern ? 190 : 150, { roof: modern ? 'flat' : 'hip', roofH: 50, floors: modern ? 3 : 2, cols: 12, lit: 0.45 }, rng);
      S.flag(1080, -300, 40, { base: 0 });
      if (city === 'kibris') S.flag(1160, -300, 40, { base: 0, tex: kktcFlag() });
      // afiş duvarı: taş duvar ve yapıştırılmış seçim afişleri (genel siluetler)
      S.ctx.fillRect(30, -104, 320, 104); S.ctx.fillRect(24, -112, 332, 9);
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 0.8); for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) S.ctx.fillRect(34 + c * 40 + (r % 2) * 20, -100 + r * 25, 1, 24); for (let r = 1; r < 4; r++) S.ctx.fillRect(30, -104 + r * 25, 320, 1); S.ctx.restore();
      const posters = p.posters || (p.referendum ? (p.onlyYes ? ['EVET', 'EVET', 'EVET', 'EVET'] : ['EVET', 'HAYIR', 'EVET', 'HAYIR']) : ['SEÇİM', S.year + '', 'SANDIK', 'OY']);
      posters.forEach((txt, i) => {
        const px = 72 + i * 76, py = -58;
        S.ctx.save(); S.ctx.translate(px, py); S.ctx.rotate((rng() - 0.5) * 0.1);
        S.ctx.fillStyle = '#8f8a7e'; S.ctx.fillRect(-30, -38, 60, 76);
        S.ctx.fillStyle = '#5d5952';
        if (p.referendum) { S.ctx.beginPath(); S.ctx.arc(0, -10, 18, 0, TAU); S.ctx.fill(); }
        else { S.ctx.beginPath(); S.ctx.arc(0, -18, 9, 0, TAU); S.ctx.fill(); S.ctx.beginPath(); S.ctx.ellipse(0, 4, 17, 12, 0, Math.PI, TAU); S.ctx.fill(); S.ctx.fillRect(-17, 4, 34, 4); }
        S.ctx.restore();
        P.text(S.ctx, txt, px, py + 30, 10, { color: '#2a2925', weight: '800' });
      });
      S.tone(4);
      P.table(S.ctx, 520, 0, 90, 26);
      P.ballotBox(S.ctx, S.em, 520, -26, 50, p.box || 'clear');
      P.booth(S.ctx, 640, 0, 40);
      const voter = P.person(S.ctx, 470, 0, 50, { g: rng() < 0.5 ? 'f' : 'm', pose: 'point', hat: S.year < 1960 ? 'fedora' : 'none', dir: 1 });
      S.ctx.save(); S.ctx.fillStyle = '#8f8b80'; S.ctx.fillRect(voter.hand[0] - 4, voter.hand[1] - 3, 9, 6); S.ctx.restore();
      if (p.crowd) P.crowd(S.ctx, 80, 440, 4, rng, { year: S.year, rows: 3, h: 46, flags: 0.15, poses: { cheer: 3, wave: 2, stand: 1 } });
      else for (let i = 0; i < 7; i++) P.person(S.ctx, 400 - i * 30, 0, 46, { g: i % 2 ? 'f' : 'm', pose: rng.pick(['stand', 'stand2']), hat: rng.weighted(P.eraHats(S.year, i % 2 ? 'f' : 'm')), skirt: i % 2 && S.year < 1970 ? 'knee' : null, dir: 1 });
    },
  };

  SCN.troopship = {
    w: 1300,
    draw(S) {
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -20, 130, S.rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 20; i++) P.house(S.ctx, S.em, S.rng() * 700, 6 - S.rng() * 30, U.lerp(24, 34, S.rng()), U.lerp(18, 26, S.rng()), { floors: 2, door: false }, S.rng);
      S.ctx.clearRect(600, 8, 700, S.B); P.waterLines(S.ctx, 600, 1300, 10, S.B, S.rng);
      S.layer('main');
      const rng = S.rng;
      S.tone(3);
      S.ctx.fillRect(0, 0, 560, S.B);
      S.ctx.clearRect(560, 0, 740, S.B); P.waterLines(S.ctx, 560, 1300, 4, S.B, rng);
      S.tone(3); P.ship(S.ctx, S.em, 930, 8, 520, 'steam', { flag: true }, rng);
      S.tone(2); P.crane(S.ctx, 520, 0, 200, 140, { hook: 0.7, drop: 0.4 });
      S.tone(4);
      // iskele
      S.ctx.beginPath(); S.ctx.moveTo(520, 0); S.ctx.lineTo(700, -80); S.ctx.lineTo(706, -76); S.ctx.lineTo(530, 2); S.ctx.fill();
      for (let i = 0; i < 6; i++) P.person(S.ctx, 560 + i * 26, -i * 11.5 - 12, 44, { pose: i % 2 ? 'walk1' : 'walk2', hat: 'helmet', hold: 'rifle', coat: 'short' });
      for (let i = 0; i < 9; i++) P.person(S.ctx, 300 + i * 24, 0, 44, { pose: i % 2 ? 'walk1' : 'walk2', hat: 'helmet', hold: 'rifle', coat: 'short' });
      P.crowd(S.ctx, 20, 260, 2, rng, { year: 1950, rows: 2, h: 46, poses: { wave: 4, mourn: 1, stand: 1 }, dir: 1 });
    },
  };

  SCN.tractor = {
    w: 1300,
    draw(S) {
      SC.steppe(S, { poplars: 12 });
      S.layer('back'); S.tone(1); for (let i = 0; i < 12; i++) P.house(S.ctx, S.em, 500 + S.rng() * 300, 8, 30, 22, { floors: 1, door: false }, S.rng);
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      // tarla izleri
      S.ctx.save(); S.ctx.fillStyle = '#3c3c3c';
      for (let i = 0; i < 6; i++) S.ctx.fillRect(0, 6 + i * 14, S.W, 2.2);
      S.ctx.restore();
      S.tone(4);
      P.tractor(S.ctx, 380, 2, 120, {});
      P.tractor(S.ctx, 860, 2, 110, { dir: 1 });
      for (let i = 0; i < 5; i++) { S.ctx.beginPath(); S.ctx.ellipse(1050 + i * 45, -18, 20, 18, 0, 0, TAU); S.ctx.fill(); }
      P.person(S.ctx, 200, 2, 46, { pose: 'walk1', hat: 'kasket', dir: 1 });
      P.person(S.ctx, 600, 2, 44, { g: 'f', pose: 'carry', hat: 'scarf', skirt: 'long', dir: 1 });
      S.anim(function (c, t) {
        c.fillStyle = P.TONE[3];
        for (let i = 0; i < 6; i++) { const ph = t * 1.2 + i; P.bird(c, 300 + i * 30 + Math.sin(ph * 0.6) * 20, -120 - i * 10 + Math.sin(ph) * 8, 0.8, Math.sin(ph * 6)); }
      });
    },
  };

  SCN.flags = {
    draw(S, p) {
      const rng = S.rng;
      if (p.city === 'ankara') SC.ankaraModern(S, {}); else SC.ankaraOld(S, { cx: 0.85 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      if (S.year > 2000) {
        P.modernHall(S.ctx, S.em, 600, 0, 560, 140, { roof: 'arc', lit: 0.5 }, rng);
      } else {
        P.classical(S.ctx, S.em, 600, 0, 420, 230, { cols: 10, attic: true, lit: 0.3 }, rng);
      }
      const n = 9;
      const muted = ['#6b6f78', '#7b6a5e', '#5f6f66', '#7a7466', '#6a6672', '#706a62'];
      for (let i = 0; i < n; i++) {
        const x = 140 + i * 115;
        if (i === 4) S.flag(x, -260, 50, { base: 0 });
        else if (i === 5 && p.nato) S.flag(x, -260, 50, { base: 0, tex: P.plainFlagTexture('#20406e', 'nato') });
        else if (i === 5 && p.un) S.flag(x, -260, 50, { base: 0, tex: P.plainFlagTexture('#5b8fd6', 'un') });
        else S.flag(x, -250, 46, { base: 0, tex: P.plainFlagTexture(muted[i % muted.length], i % 2 ? 'stripes' : null) });
      }
      S.tone(4);
      P.crowd(S.ctx, 200, 1000, 2, rng, { year: S.year, rows: 1, h: 47, poses: { walk1: 2, walk2: 2, stand: 2 }, female: 0.3, hats: S.year < 1960 ? { m: { fedora: 4, none: 1 }, f: { bun: 2, cloche: 1 } } : { m: { none: 1 }, f: { bob: 1, long: 1 } } });
      if (S.year > 2000) for (let i = 0; i < 3; i++) P.car(S.ctx, S.em, 160 + i * 120, 0, 90, 'modern');
    },
  };

  SCN.anitkabir = {
    w: 1400,
    draw(S) {
      SC.ankaraOld(S, { cx: 0.1, cs: 110 });
      S.layer('main');
      const rng = S.rng;
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, 0); S.ctx.quadraticCurveTo(700, -120, 1400, 0); S.ctx.lineTo(1400, S.B); S.ctx.fill();
      const a = P.anitkabir(S.ctx, S.em, 760, -96, 200);
      S.flag(a.poleX, a.poleY, 44, { base: -96 });
      S.tone(2); SC.trees(S, 60, 380, 6, ['cypress', 'pine'], 110, 170, -20);
      S.tone(4);
      // cenaze alayı
      P.gunCarriage(S.ctx, 420, 0, 1.3);
      for (let i = 0; i < 10; i++) P.person(S.ctx, 480 + i * 22, 0, 46, { pose: i % 2 ? 'walk1' : 'walk2', hat: 'helmet', hold: 'rifle', coat: 'short', dir: 1 });
      for (let i = 0; i < 8; i++) P.person(S.ctx, 300 - i * 22, 0, 46, { pose: i % 2 ? 'walk1' : 'walk2', hat: 'helmet', coat: 'long', dir: 1 });
      P.crowd(S.ctx, 760, 1380, 4, rng, { year: 1953, rows: 3, h: 46, poses: { mourn: 5, stand: 2 } });
    },
  };

  SCN.riot = {
    draw(S) {
      S.layer('back'); S.tone(1);
      for (let i = 0; i < 12; i++) P.building(S.ctx, S.em, i * 105 + 40, 6, 100, U.lerp(150, 230, S.rng()), { roof: 'mansard', floors: 5, cols: 5, lit: 0.08 }, S.rng);
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      for (let i = 0; i < 6; i++) {
        const x = 100 + i * 200;
        P.building(S.ctx, null, x, 0, 190, 230, { roof: 'mansard', floors: 5, cols: 6, lit: 0 }, rng);
        // kırık vitrin ve yangın ışığı
        S.ctx.save(); S.ctx.fillStyle = '#4a4a48';
        S.ctx.beginPath(); S.ctx.moveTo(x - 70, -10); S.ctx.lineTo(x - 70, -60); S.ctx.lineTo(x - 30, -64); S.ctx.lineTo(x - 42, -40); S.ctx.lineTo(x - 18, -52); S.ctx.lineTo(x + 10, -12); S.ctx.closePath(); S.ctx.fill(); S.ctx.restore();
        if (i % 2 === 0) P.glow(S.em, x - 40, -40, 60, '#ff8a3a', 0.55);
      }
      S.flame(240, -10, 60, 70); S.smoke(240, -80, { n: 8, size: 26, drift: 20, alpha: 0.45, color: 'rgba(30,28,26,' });
      S.flame(840, -10, 50, 60); S.smoke(840, -70, { n: 8, size: 22, drift: 16, alpha: 0.4, color: 'rgba(30,28,26,' });
      S.tone(4);
      // saçılmış kumaş topları ve eşyalar
      for (let i = 0; i < 18; i++) { S.ctx.save(); S.ctx.translate(rng() * 1200, -4); S.ctx.rotate((rng() - 0.5) * 1.5); P.fillRR(S.ctx, -12, -4, 24, 8, 3); S.ctx.restore(); }
      for (let i = 0; i < 4; i++) P.person(S.ctx, 500 + i * 40, 0, 46, { pose: 'run', hat: rng.pick(['fedora', 'none']), dir: -1, coat: 'short' });
    },
  };

  SCN.tanks = {
    draw(S, p) {
      const rng = S.rng;
      const night = p.time === 'night';
      if (p.few) { SC.steppe(S, { poplars: 6 }); }
      else SC.cityApartments(S, { n: 20, minF: 3, maxF: 7, lit: night ? 0.05 : 0.1, year: S.year });
      S.layer('main'); S.ground(3);
      S.tone(3);
      if (!p.few) {
        P.building(S.ctx, S.em, 160, 0, 260, 200, { floors: 6, cols: 8, lit: night ? 0.05 : 0.2, balcony: true }, rng);
        P.building(S.ctx, S.em, 1060, 0, 260, 220, { floors: 7, cols: 8, lit: night ? 0.05 : 0.2, balcony: true }, rng);
        // radyo/TV kulesi
        S.tone(2); P.pylon(S.ctx, 820, 0, 300); S.blink(820, -300, 12, '#ff3b30', 1.4, 0, 0.5);
      } else {
        for (let i = 0; i < 6; i++) P.house(S.ctx, S.em, 100 + i * 200, 0, 140, 100, { floors: 2, lit: 0.2 }, rng);
      }
      S.tone(3);
      for (let i = 0; i < 5; i++) P.streetLamp(S.ctx, night ? S.em : null, 120 + i * 240, 0, 110, 'modern');
      S.tone(4);
      const nt = p.few ? 3 : 2;
      for (let i = 0; i < nt; i++) P.tank(S.ctx, 360 + i * 230, 2, 170, { dir: p.few ? 1 : -1, crew: i === 0 });
      P.jeep(S.ctx, 900, 2, 80, { dir: -1 });
      for (let i = 0; i < 5; i++) P.person(S.ctx, 980 + i * 26, 2, 46, { pose: 'stand', hat: 'helmet', hold: 'rifle', coat: 'short', dir: -1 });
      if (!night) P.crowd(S.ctx, 40, 260, 2, rng, { year: S.year, rows: 1, h: 46, poses: { stand: 3, stand2: 2 } });
    },
  };

  SCN.station = {
    w: 1400,
    draw(S) {
      SC.istanbul(S, { water: false, galata: false, mosques: [[0.3, 40, 4], [0.7, 46, 6]] });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      // Sirkeci Garı cephesi
      const gx = 340;
      S.ctx.fillRect(gx - 260, -170, 520, 170);
      S.ctx.fillRect(gx - 270, -180, 540, 12);
      S.ctx.fillRect(gx - 40, -280, 80, 110);
      S.ctx.beginPath(); S.ctx.moveTo(gx - 48, -280); S.ctx.lineTo(gx, -320); S.ctx.lineTo(gx + 48, -280); S.ctx.fill();
      for (let i = -1; i <= 1; i += 2) { S.ctx.fillRect(gx + i * 200 - 30, -230, 60, 60); S.ctx.beginPath(); S.ctx.moveTo(gx + i * 200 - 34, -230); S.ctx.quadraticCurveTo(gx + i * 200, -262, gx + i * 200 + 34, -230); S.ctx.fill(); }
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.6);
      S.ctx.beginPath(); S.ctx.arc(gx, -110, 46, 0, TAU); S.ctx.fill();
      for (let i = 0; i < 6; i++) { const wx = gx - 230 + i * 92; if (Math.abs(wx - gx) < 60) continue; S.ctx.beginPath(); S.ctx.moveTo(wx - 18, -10); S.ctx.lineTo(wx - 18, -110); S.ctx.arc(wx, -110, 18, Math.PI, 0); S.ctx.lineTo(wx + 18, -10); S.ctx.fill(); P.lightRect(S.em, wx - 16, -110, 32, 98, P.LIGHT, 0.4); }
      S.ctx.restore();
      P.glow(S.em, gx, -110, 60, '#ffd890', 0.4);
      P.clockTower(S.ctx, null, gx, -280, 0.0001, {});
      // peron çatısı ve tren
      S.tone(3); S.ctx.fillRect(620, -150, 760, 8); for (let i = 0; i < 8; i++) S.ctx.fillRect(640 + i * 100, -150, 4, 150);
      S.tone(4);
      const loco = P.locomotive(S.ctx, S.em, 1250, 0, 110, 'steam');
      for (let i = 0; i < 5; i++) P.wagon(S.ctx, S.em, 1250 - 44 - (i + 1) * 104, 0, 100, 'old', rng);
      S.smoke(loco.stackX, loco.stackY, { n: 8, size: 16, drift: -18, rise: 22, alpha: 0.4 });
      for (let i = 0; i < 14; i++) {
        const x = 640 + i * 42 + rng() * 10;
        const pose = rng.pick(['suitcase', 'wave', 'hug', 'stand2', 'suitcase']);
        P.person(S.ctx, x, 0, 46, { g: rng() < 0.4 ? 'f' : 'm', pose: pose, hat: rng.pick(['kasket', 'fedora', 'none', 'scarf']), hold: pose === 'suitcase' ? 'suitcase' : null, dir: rng.sign() });
      }
      P.crowd(S.ctx, 60, 600, 2, rng, { year: 1961, rows: 2, h: 46, poses: { wave: 4, stand: 2, hug: 1 }, dir: 1 });
    },
  };

  SCN.car = {
    draw(S, p) {
      const rng = S.rng;
      const togg = p.model === 'togg';
      if (togg) {
        SC.mountainsBack(S, { n: 5, min: 120, max: 200 });
        S.layer('back'); S.tone(1); for (let i = 0; i < 6; i++) { P.windTurbineBase(S.ctx, 100 + i * 200, -20 + S.rng() * 10, 150); }
        S.anim(function (c, t) { c.fillStyle = P.TONE[1]; for (let i = 0; i < 6; i++) P.windTurbineBlades(c, 100 + i * 200, -20 - 150 - 4, 150, t * 0.8 + i); });
      } else SC.cityApartments(S, { n: 14, minF: 3, maxF: 6 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      if (togg) {
        P.modernHall(S.ctx, S.em, 600, 0, 700, 160, { roof: 'wave', lit: 0.45 }, rng);
      } else {
        P.factoryHall(S.ctx, S.em, 600, 0, 700, 150, rng);
        P.chimney(S.ctx, 1000, 0, 22, 260); S.smoke(1000, -265, { n: 8, size: 16, drift: 18 });
      }
      S.tone(4);
      // podyum
      S.ctx.fillRect(470, -14, 260, 14);
      P.car(S.ctx, S.em, 600, -14, togg ? 170 : 150, togg ? 'togg' : 'anadol');
      if (togg) {
        [[420, -330], [780, -330]].forEach((pp, k) => S.anim(function (c, t) {
          const a = Math.PI / 2 + (k ? 0.45 : -0.45) + Math.sin(t * 0.6 + k * 2) * 0.12;
          const L = 360;
          const g = c.createLinearGradient(pp[0], pp[1], pp[0] + Math.cos(a) * L, pp[1] + Math.sin(a) * L);
          g.addColorStop(0, 'rgba(225,238,255,0.5)'); g.addColorStop(1, 'rgba(225,238,255,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(pp[0], pp[1]); c.lineTo(pp[0] + Math.cos(a - 0.12) * L, pp[1] + Math.sin(a - 0.12) * L); c.lineTo(pp[0] + Math.cos(a + 0.12) * L, pp[1] + Math.sin(a + 0.12) * L); c.closePath(); c.fill();
        }, true));
        P.crowd(S.ctx, 120, 440, 4, rng, { year: 2022, rows: 2, h: 46, phones: 0.35, em: S.em, poses: { clap: 3, stand: 2 } });
        P.crowd(S.ctx, 760, 1100, 4, rng, { year: 2022, rows: 2, h: 46, phones: 0.35, em: S.em, poses: { clap: 3, stand: 2 } });
      } else {
        S.ctx.fillRect(560, -40, 2, 0);
        P.crowd(S.ctx, 120, 440, 4, rng, { year: 1966, rows: 2, h: 46, poses: { clap: 4, cheer: 1, stand: 1 }, hats: { m: { kasket: 3, none: 2 }, f: { scarf: 2, bob: 1 } } });
        P.crowd(S.ctx, 760, 1100, 4, rng, { year: 1966, rows: 2, h: 46, poses: { clap: 4, cheer: 1, stand: 1 }, hats: { m: { kasket: 3, none: 2 }, f: { scarf: 2, bob: 1 } } });
        S.flag(320, -260, 40, { base: 0 }); S.flag(880, -260, 40, { base: 0 });
      }
    },
  };

  SCN.tv = {
    draw(S) {
      SC.cityApartments(S, { n: 22, minF: 3, maxF: 6, lit: 0.4, year: 1968 });
      S.layer('back'); S.tone(1); for (let i = 0; i < 20; i++) P.antennaTV(S.ctx, S.rng() * S.W, -U.lerp(60, 110, S.rng()), 20);
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      // üç katlı apartman: üst katlar balkonlu, zemin katta geniş bir salon penceresi
      const bx = 620, bw = 620, fh = 78;
      P.building(S.ctx, S.em, bx, -fh, bw, fh * 2, { floors: 2, cols: 9, balcony: true, lit: 0.35, roof: 'flat', tank: true }, rng);
      S.ctx.fillRect(bx - bw / 2, -fh, bw, fh + 1);
      S.ctx.fillRect(bx - bw / 2 - 3, -fh - 3, bw + 6, 4);
      for (let i = 0; i < 5; i++) P.antennaTV(S.ctx, bx - bw / 2 + 50 + i * 130, -fh * 3 - 10, 36);
      // pencere boşluğu (içerisi aydınlık)
      const w0 = bx - 250, w1 = bx + 130, wt = -fh + 12, wb = -12;
      S.ctx.save(); S.ctx.fillStyle = '#4a4b4e'; S.ctx.fillRect(w0, wt, w1 - w0, wb - wt); S.ctx.restore();
      P.lightRect(S.em, w0, wt, w1 - w0, wb - wt, '#9ec0ff', 0.22);
      // içeride: koltuk, sehpa, televizyon ve komşular
      S.tone(4);
      P.tvSet(S.ctx, S.em, w0 + 70, wb, 44, {});
      S.ctx.beginPath(); P.rrect(S.ctx, w0 + 150, wb - 24, 150, 16, 5); P.rrect(S.ctx, w0 + 146, wb - 38, 12, 30, 5); P.rrect(S.ctx, w0 + 292, wb - 38, 12, 30, 5); S.ctx.fill();
      for (let i = 0; i < 3; i++) P.person(S.ctx, w0 + 175 + i * 44, wb - 10, 40, { pose: 'sit', g: i % 2 ? 'f' : 'm', hat: i % 2 ? 'scarf' : 'kasket', dir: -1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, w0 + 105 + i * 20, wb, 22, { kid: true, pose: 'sitground', g: i % 2 ? 'f' : 'm', hat: i % 2 ? 'bob' : 'none', dir: -1 });
      P.person(S.ctx, w0 + 340, wb, 42, { pose: 'stand', g: 'f', hat: 'bun', dir: -1 });
      S.anim(function (c, t) { const f = 0.5 + 0.5 * Math.sin(t * 13) * Math.sin(t * 3.1); P.glowRaw(c, w0 + 66, wb - 26, 110, 'rgba(170,200,255,', 0.16 + 0.12 * f); }, true);
      // pencere doğramaları ve perdeler
      S.tone(3);
      S.ctx.fillRect(w0 - 6, wt - 6, w1 - w0 + 12, 6); S.ctx.fillRect(w0 - 6, wb, w1 - w0 + 12, 5);
      S.ctx.fillRect(w0 - 6, wt, 6, wb - wt); S.ctx.fillRect(w1, wt, 6, wb - wt);
      for (let i = 1; i < 4; i++) S.ctx.fillRect(w0 + i * (w1 - w0) / 4 - 2, wt, 4, wb - wt);
      S.ctx.save(); S.ctx.fillStyle = '#2c2c2b';
      [[w0, 1], [w1, -1]].forEach((cp) => { const x = cp[0], d = cp[1]; S.ctx.beginPath(); S.ctx.moveTo(x, wt); S.ctx.lineTo(x + d * 38, wt); S.ctx.quadraticCurveTo(x + d * 18, (wt + wb) / 2, x + d * 26, wb); S.ctx.lineTo(x, wb); S.ctx.closePath(); S.ctx.fill(); });
      S.ctx.restore();
      // kapı, saksılar, sokak
      S.ctx.fillRect(bx + 190, -64, 44, 64);
      S.ctx.save(); S.ctx.fillStyle = '#3a3a3a'; S.ctx.fillRect(bx + 196, -58, 32, 54); S.ctx.restore();
      for (let i = 0; i < 6; i++) { S.ctx.beginPath(); S.ctx.moveTo(w0 + 10 + i * 64, wb + 5); S.ctx.lineTo(w0 + 14 + i * 64, wb + 16); S.ctx.lineTo(w0 + 26 + i * 64, wb + 16); S.ctx.lineTo(w0 + 30 + i * 64, wb + 5); S.ctx.fill(); P.bush(S.ctx, w0 + 20 + i * 64, wb + 6, 22, 14, rng); }
      S.tone(4);
      P.streetLamp(S.ctx, S.em, 190, 0, 130, 'gas');
      P.person(S.ctx, 250, 0, 50, { pose: 'stand2', hat: 'kasket', coat: 'short', dir: 1 });
      P.cat(S.ctx, 1080, 0, 1.4, { dir: -1 });
    },
  };

  SCN.radio = {
    draw(S, p) {
      if (p.y1939) { radio1939(S); return; }
      SC.cityApartments(S, { n: 18, minF: 3, maxF: 6, year: 1971 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.building(S.ctx, S.em, 520, 0, 520, 220, { floors: 3, cols: 10, lit: 0.3 }, rng);
      // kahvehane tentesi
      S.tone(2); S.ctx.beginPath(); S.ctx.moveTo(260, -110); S.ctx.lineTo(780, -110); S.ctx.lineTo(800, -80); S.ctx.lineTo(240, -80); S.ctx.fill();
      P.signboard(S.ctx, S.em, 520, -120, 180, 26, 'KIRAATHANE', { posts: false, color: '#d8d0bb' });
      S.tone(4);
      P.radio(S.ctx, S.em, 520, -80, 34);
      S.anim(function (c, t) {
        for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; c.strokeStyle = 'rgba(255,220,150,' + (0.55 * (1 - u)).toFixed(3) + ')'; c.lineWidth = 1.4; c.beginPath(); c.arc(520, -100, 20 + u * 60, -2.4, -0.7); c.stroke(); }
      }, true);
      for (let k = 0; k < 3; k++) { P.table(S.ctx, 330 + k * 160, 0, 50, 20); }
      for (let i = 0; i < 9; i++) P.person(S.ctx, 300 + i * 52, 0, 46, { pose: 'sit', hat: rng.pick(['kasket', 'none', 'kasket']), dir: i % 2 ? -1 : 1 });
      P.jeep(S.ctx, 980, 2, 90, { dir: -1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, 1070 + i * 26, 2, 47, { pose: 'stand', hat: 'helmet', hold: 'rifle', coat: 'short', dir: -1 });
      P.person(S.ctx, 140, 2, 34, { kid: true, pose: 'walk1', hat: 'kasket', hold: 'bag' });
    },
  };

  // 1939: kıraathanede radyodan savaş haberi; gazeteci çocuk ve yola çıkan askerler
  function radio1939(S) {
    const rng = S.rng;
    SC.ankaraOld(S, { cx: 0.8, cs: 120 });
    S.layer('main'); S.ground(3);
    S.tone(3);
    P.building(S.ctx, S.em, 520, 0, 480, 170, { floors: 2, cols: 9, roof: 'hip', roofH: 40, lit: 0.35 }, rng);
    S.tone(2); S.ctx.beginPath(); S.ctx.moveTo(290, -100); S.ctx.lineTo(750, -100); S.ctx.lineTo(770, -74); S.ctx.lineTo(270, -74); S.ctx.fill();
    P.signboard(S.ctx, S.em, 520, -110, 180, 24, 'KIRAATHANE', { posts: false, color: '#d8d0bb' });
    S.tone(4);
    P.radio(S.ctx, S.em, 520, -74, 34);
    S.anim(function (c, t) {
      for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; c.strokeStyle = 'rgba(255,220,150,' + (0.55 * (1 - u)).toFixed(3) + ')'; c.lineWidth = 1.4; c.beginPath(); c.arc(520, -94, 20 + u * 60, -2.4, -0.7); c.stroke(); }
    }, true);
    for (let k = 0; k < 3; k++) P.table(S.ctx, 360 + k * 150, 0, 50, 20);
    for (let i = 0; i < 8; i++) P.person(S.ctx, 330 + i * 52, 0, 46, { pose: i % 3 === 1 ? 'stand2' : 'sit', hat: rng.pick(['fedora', 'kasket', 'fedora']), dir: i % 2 ? -1 : 1 });
    // radyonun etrafında ayakta dinleyenler
    P.crowd(S.ctx, 250, 340, 2, rng, { year: 1939, rows: 2, h: 46, female: 0.2, poses: { stand: 3, stand2: 2 }, dir: 1 });
    P.crowd(S.ctx, 700, 800, 2, rng, { year: 1939, rows: 2, h: 46, female: 0.2, poses: { stand: 3, stand2: 2 }, dir: -1 });
    // gazeteci çocuk, elinde gazete
    const boy = P.person(S.ctx, 190, 2, 32, { kid: true, pose: 'wave', hat: 'kasket', hold: 'bag', dir: 1 });
    S.ctx.save(); S.ctx.fillStyle = '#9a9384'; S.ctx.fillRect(boy.hand[0] - 7, boy.hand[1] - 12, 14, 18); S.ctx.restore();
    // seferberlik: yola çıkan askerler ve top
    for (let i = 0; i < 6; i++) P.person(S.ctx, 900 + i * 30, 2, 47, { pose: i % 2 ? 'walk1' : 'walk2', hat: 'helmet', hold: 'rifle', coat: 'long', dir: 1 });
    P.horse(S.ctx, 1120, 2, 1.1, { dir: 1 });
    S.tone(4); P.cannon(S.ctx, 1050, 2, 0.8);
  }

  SCN.bridge = {
    w: 1500,
    draw(S, p) {
      const rng = S.rng;
      const k1915 = p.kind === '1915', fsm = p.kind === 'fsm';
      S.layer('back');
      S.tone(0); P.hills(S.ctx, 0, S.W, -20, k1915 ? 150 : 110, rng, { freq: 0.0018 });
      S.tone(1);
      if (!k1915) { for (let i = 0; i < 40; i++) P.house(S.ctx, S.em, rng() * S.W, 6 - rng() * 40, U.lerp(20, 32, rng()), U.lerp(16, 30, rng()), { floors: 2, door: false, lit: 0.4 }, rng); }
      else {
        // Çanakkale Şehitler Abidesi
        const ax = 380, ay = -60;
        S.ctx.fillRect(ax - 34, ay - 70, 12, 70); S.ctx.fillRect(ax + 22, ay - 70, 12, 70);
        S.ctx.fillRect(ax - 38, ay - 82, 76, 14);
        S.ctx.beginPath(); S.ctx.moveTo(ax - 80, ay); S.ctx.lineTo(ax + 80, ay); S.ctx.lineTo(ax + 100, 10); S.ctx.lineTo(ax - 100, 10); S.ctx.fill();
      }
      S.ctx.clearRect(0, 8, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 10, S.B, rng);
      S.layer('main');
      S.ctx.clearRect(0, 0, S.W, S.B);
      S.tone(3);
      // kıyılar
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -40); S.ctx.quadraticCurveTo(120, -38, 190, 6); S.ctx.lineTo(190, S.B); S.ctx.fill();
      S.ctx.beginPath(); S.ctx.moveTo(S.W, S.B); S.ctx.lineTo(S.W, -60); S.ctx.quadraticCurveTo(S.W - 150, -50, S.W - 230, 6); S.ctx.lineTo(S.W - 230, S.B); S.ctx.fill();
      P.waterLines(S.ctx, 190, S.W - 230, 4, S.B, rng);
      SC.shoreLife(S, k1915);
      S.tone(3);
      const br = P.suspensionBridge(S.ctx, S.em, 60, S.W - 60, 6, {
        deck: k1915 ? 70 : 64, tower: k1915 ? 380 : fsm ? 240 : 260, tPos: k1915 ? 0.16 : fsm ? 0.17 : 0.2, legW: k1915 ? 7 : 5, legGap: k1915 ? 10 : 14,
        beams: k1915 ? [0.3, 0.62, 0.92] : fsm ? [0.5, 0.97] : [0.4, 0.75, 0.98], towerColor: k1915 ? '#9e2c26' : null, towerCap: k1915, cableLights: k1915 ? null : '#ffe4a8',
      }, rng);
      if (fsm) {
        // Rumelihisarı: yamaca tırmanan surlar ve üç büyük kule
        S.tone(4);
        const tw = (x, y, w, h) => { S.ctx.fillRect(x - w / 2, y - h, w, h); for (let k = 0; k < 5; k++) S.ctx.fillRect(x - w / 2 + k * (w / 5), y - h - 6, w / 10, 6); };
        // kıyı yamacı (sahne kenarındaki sisin dışında kalsın diye içeride)
        S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -120); S.ctx.quadraticCurveTo(200, -130, 300, -40); S.ctx.quadraticCurveTo(330, -10, 360, 6); S.ctx.lineTo(360, S.B); S.ctx.closePath(); S.ctx.fill();
        S.ctx.beginPath(); S.ctx.moveTo(170, -60); S.ctx.lineTo(170, -150); S.ctx.lineTo(240, -170); S.ctx.lineTo(320, -40); S.ctx.lineTo(345, 0); S.ctx.lineTo(300, 0); S.ctx.closePath(); S.ctx.fill();
        tw(195, -110, 50, 130); tw(300, -30, 40, 104); tw(250, -120, 32, 80);
      } else if (!k1915) {
        // Ortaköy Camii
        S.tone(4); P.mosque(S.ctx, S.em, 140, -4, 30, { minarets: 2, minH: 100 }, rng);
      }
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        c.fillStyle = P.TONE[4];
        const x = U.lerp(1400, 260, k);
        c.save(); c.globalAlpha *= SC.edgeA(x + 60, S.W);
        P.ship(c, null, x, 8, k1915 ? 300 : 150, k1915 ? 'cargo' : 'ferry', { dir: -1 });
        c.restore();
      });
    },
  };

  SCN.cyprus = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back');
      // Beşparmak dağları
      const peaks = [[200, 150], [320, 210], [400, 260], [470, 300], [540, 270], [610, 230], [700, 200], [900, 170], [1150, 140]];
      S.tone(0); P.mountains(S.ctx, 0, S.W, 10, peaks, rng, { sag: 0.12, jag: 6 });
      S.ctx.clearRect(0, 10, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 12, S.B, rng);
      S.layer('main');
      S.ctx.clearRect(0, 0, S.W, S.B);
      P.waterLines(S.ctx, 0, S.W, 4, S.B, rng);
      S.tone(3);
      P.ship(S.ctx, S.em, 300, 8, 300, 'warship', { flag: true }, rng);
      P.ship(S.ctx, S.em, 760, 8, 220, 'landing', {}, rng);
      P.ship(S.ctx, S.em, 1150, 8, 260, 'warship', {}, rng);
      S.anim(function (c, t) {
        c.fillStyle = P.TONE[3];
        for (let i = 0; i < 7; i++) {
          const u = ((t * 0.05 + i / 7) % 1);
          P.parachute(c, 200 + i * 150 + Math.sin(t * 0.5 + i) * 20, -480 + u * 380, 22);
        }
        const hx = (t * 40) % 1500 - 50;
        c.save(); c.globalAlpha *= SC.edgeA(hx, 1400); P.helicopter(c, null, hx, -360, 70, { dir: 1 }); c.restore();
      });
    },
  };

  SCN.queue = {
    draw(S) {
      SC.cityApartments(S, { n: 22, minF: 3, maxF: 7, year: 1979 });
      S.layer('main'); S.ground(3);
      const rng = S.rng;
      S.tone(3);
      P.building(S.ctx, S.em, 200, 0, 300, 180, { floors: 4, cols: 9, balcony: true, lit: 0.2 }, rng);
      S.tone(2); P.signboard(S.ctx, S.em, 200, -60, 120, 26, 'TÜP', { posts: false, color: '#d6cebb' });
      // benzin istasyonu
      S.tone(3); S.ctx.fillRect(820, -150, 320, 10); S.ctx.fillRect(840, -150, 6, 150); S.ctx.fillRect(1110, -150, 6, 150);
      S.tone(2); P.signboard(S.ctx, S.em, 980, -160, 130, 24, 'BENZİN', { posts: false, color: '#d6cebb' });
      S.ctx.fillRect(950, -60, 20, 60);
      S.tone(4);
      for (let i = 0; i < 15; i++) { const g = rng() < 0.4 ? 'f' : 'm'; P.person(S.ctx, 300 + i * 26, 2, 46, { g: g, pose: rng.pick(['stand', 'stand2', 'mourn']), hat: g === 'f' ? rng.pick(['scarf', 'long']) : rng.pick(['kasket', 'none']), hold: rng() < 0.6 ? 'gas' : null, dir: -1 }); }
      for (let i = 0; i < 4; i++) P.car(S.ctx, S.em, 1060 - i * 110 + 40, 2, 100, 'murat', { dir: 1, lights: false });
    },
  };
  // ================================================================ Kurtuluş Savaşı ve ilk yıllar (ek sahneler)
  // Top atışı: namlu ağzında parlama ve yükselen duman (periyodik)
  function cannonFire(S, x, y, ph, period) {
    S.anim(function (c, t) {
      const u = ((t + ph) % period) / period;
      if (u < 0.06) P.glowRaw(c, x, y, 46, 'rgba(255,214,140,', (0.06 - u) * 14);
      for (let i = 0; i < 4; i++) {
        const v = (u + i * 0.22) % 1;
        c.fillStyle = 'rgba(196,190,178,' + (0.32 * (1 - v)).toFixed(3) + ')';
        c.beginPath(); c.arc(x + v * 46, y - v * 64, 9 + v * 30, 0, TAU); c.fill();
      }
    });
  }

  SCN.battle = {
    w: 1400,
    draw(S, p) {
      const rng = S.rng;
      const koca = p.v === 'kocatepe';
      // arka: bozkır tepeleri; uzakta patlama dumanları
      S.layer('back');
      S.tone(0); P.hills(S.ctx, 0, S.W, -30, koca ? 170 : 130, rng, { freq: 0.0019 });
      S.tone(1); P.hills(S.ctx, 0, S.W, 4, 70, rng, { freq: 0.0034 });
      if (!koca) { S.ctx.clearRect(0, 8, S.W, 10); P.waterLines(S.ctx, 0, S.W, 8, 18, rng, 'rgba(30,30,30,.35)'); }
      for (let i = 0; i < 4; i++) S.smoke(260 + i * 300 + rng() * 80, -40 - rng() * 40, { n: 7, size: 26, drift: 16, rise: 20, alpha: 0.32, color: 'rgba(90,86,80,' });
      S.layer('main'); S.ground(3);
      S.tone(3);
      if (koca) {
        // Kocatepe: soldaki kayalık tepe, zirvede komuta yeri ve bayrak
        S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -210);
        S.ctx.quadraticCurveTo(70, -240, 170, -232); S.ctx.lineTo(250, -220);
        S.ctx.quadraticCurveTo(360, -160, 430, -60); S.ctx.quadraticCurveTo(470, -14, 540, 0); S.ctx.lineTo(540, S.B); S.ctx.closePath(); S.ctx.fill();
        P.rocks(S.ctx, 40, 420, -200, 22, rng, 9);
        S.tone(4);
        S.flag(230, -330, 44, { base: -224 });
        // dürbünle bakan komutan ve yanındakiler (silüet)
        P.person(S.ctx, 150, -232, 48, { pose: 'glasses', hat: 'kalpak', coat: 'long', dir: 1 });
        P.person(S.ctx, 112, -236, 47, { pose: 'stand2', hat: 'kalpak', coat: 'long', dir: 1 });
        P.person(S.ctx, 188, -230, 46, { pose: 'point', hat: 'kalpak', coat: 'long', dir: 1 });
        // tepenin eteğinde toplar
        [[470, 0], [580, 0], [690, 0]].forEach((cp, i) => { P.cannon(S.ctx, cp[0], cp[1], 1.7, {}); P.person(S.ctx, cp[0] - 40, 0, 44, { pose: 'carry', hat: 'kalpak', dir: 1 }); cannonFire(S, cp[0] + 46, -38, i * 0.9, 2.7); });
        // ilerleyen birlikler
        P.crowd(S.ctx, 780, 1380, 2, rng, { year: 1922, rows: 3, h: 44, poses: { run: 3, walk1: 2, walk2: 2 }, dir: 1, female: 0, hats: { m: { kalpak: 3, kasket: 2 } }, hold: 'rifle', holdP: 0.7 });
        for (let i = 0; i < 3; i++) { P.horse(S.ctx, 860 + i * 170, 2, 1.1, {}); P.person(S.ctx, 850 + i * 170, -22, 40, { pose: 'sit', hat: 'kalpak', dir: 1 }); }
      } else {
        // Sakarya: siperler, kum torbaları, savunmadaki askerler, toplar
        S.ctx.beginPath(); S.ctx.moveTo(0, 0);
        for (let x = 0; x <= S.W; x += 40) S.ctx.lineTo(x, -16 - Math.sin(x * 0.01) * 6);
        S.ctx.lineTo(S.W, 0); S.ctx.closePath(); S.ctx.fill();
        S.tone(4);
        S.ctx.beginPath();
        for (let x = 30; x < S.W - 30; x += 24) { S.ctx.moveTo(x + 13, -22); S.ctx.ellipse(x, -22 - Math.sin(x * 0.01) * 6, 13, 8, 0, 0, TAU); }
        S.ctx.fill();
        for (let i = 0; i < 16; i++) { const x = 60 + i * 80 + rng() * 20; P.person(S.ctx, x, -16, 44, { pose: rng.pick(['stand2', 'point', 'stand']), hat: rng.pick(['kalpak', 'kasket']), hold: 'rifle', coat: 'long', dir: 1 }); }
        [[300, -18], [760, -18], [1180, -18]].forEach((cp, i) => { P.cannon(S.ctx, cp[0], cp[1], 1.6, {}); cannonFire(S, cp[0] + 44, cp[1] - 36, i * 1.1, 3.1); });
        S.flag(560, -230, 42, { base: -16 });
        // uzakta patlamalar
        S.anim(function (c, t) {
          for (let k = 0; k < 3; k++) {
            const u = ((t * 0.37 + k * 0.33) % 1);
            const x = 300 + k * 380, y = -60;
            if (u < 0.1) P.glowRaw(c, x, y, 70, 'rgba(255,190,120,', (0.1 - u) * 6);
          }
        }, true);
      }
    },
  };

  // 1922: saltanatın kaldırılması — İstanbul siluetinde ayrılan savaş gemisi
  SCN.sultanate = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      SC.istanbul(S, { towers: 0, lit: 0.15, mosques: [[0.18, 40, 6], [0.45, 46, 4], [0.78, 34, 2]], galataX: 0.6 });
      S.layer('back'); S.tone(1); P.dolmabahce(S.ctx, S.em, 1040, 6, 70, rng);
      S.layer('main');
      S.ctx.clearRect(0, 0, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 4, S.B, rng);
      S.tone(3);
      // rıhtım ve izleyenler
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -14); S.ctx.lineTo(520, -14); S.ctx.lineTo(540, 6); S.ctx.lineTo(540, S.B); S.ctx.fill();
      for (let i = 0; i < 4; i++) P.streetLamp(S.ctx, S.em, 60 + i * 140, -14, 110, 'gas');
      S.tone(4);
      P.crowd(S.ctx, 30, 500, -14, rng, { year: 1922, rows: 2, h: 46, poses: { stand: 4, stand2: 2, mourn: 1, point: 1 }, dir: 1 });
      // ayrılan gemi ve dumanı
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        const x = U.lerp(760, 1120, k);
        c.save(); c.globalAlpha *= SC.edgeA(x + 120, S.W);
        c.fillStyle = P.TONE[3];
        P.ship(c, null, x, 10, 330, 'warship', { dir: 1 });
        for (let i = 0; i < 7; i++) { const u = ((t * 0.2 + i / 7) % 1); c.fillStyle = 'rgba(80,76,70,' + (0.4 * (1 - u)).toFixed(3) + ')'; c.beginPath(); c.arc(x + 10 - u * 140, -120 - u * 80, 10 + u * 34, 0, TAU); c.fill(); }
        c.restore();
        // martılar
        c.fillStyle = P.TONE[3];
        for (let i = 0; i < 5; i++) { const ph = t * 0.9 + i * 1.3; P.bird(c, 640 + i * 60 + Math.sin(ph * 0.5) * 30, -300 - i * 16 + Math.cos(ph) * 10, 1.1, Math.sin(ph * 6)); }
      });
    },
  };

  // 1932: Halkevleri — tiyatro, kütüphane, müzik ve spor
  SCN.halkevi = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.ankaraOld(S, { cx: 0.15, cs: 120 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      // birinci ulusal mimari üslubunda bina: kemerli cephe, ortada yüksek giriş
      P.building(S.ctx, S.em, 650, 0, 560, 170, { roof: 'hip', roofH: 30, floors: 2, cols: 12, lit: 0.55, arch: true }, rng);
      S.ctx.fillRect(590, -236, 120, 70);
      S.ctx.beginPath(); S.ctx.moveTo(580, -236); S.ctx.lineTo(650, -270); S.ctx.lineTo(720, -236); S.ctx.fill();
      S.tone(2); P.signboard(S.ctx, S.em, 650, -184, 180, 26, 'HALKEVİ', { posts: false, color: '#ded6c2' });
      S.flag(650, -350, 42, { base: -270 });
      S.tone(2); SC.trees(S, 40, 300, 3, ['broad', 'poplar'], 150, 220); SC.trees(S, 1020, 1270, 3, ['broad', 'poplar'], 150, 220);
      S.tone(4);
      // açık hava sahnesi ve oyuncular
      S.ctx.fillRect(160, -40, 240, 40);
      for (let i = 0; i < 3; i++) P.person(S.ctx, 210 + i * 70, -40, 44, { pose: ['wave', 'point', 'stand2'][i], g: i === 1 ? 'f' : 'm', hat: i === 1 ? 'bun' : 'fedora', skirt: i === 1 ? 'long' : null, dir: i === 2 ? -1 : 1 });
      P.crowd(S.ctx, 120, 440, 2, rng, { year: 1932, rows: 1, h: 40, poses: { sit: 1 }, dir: 1 });
      // bağlama çalan ve kitap okuyan çocuklar
      P.person(S.ctx, 900, 0, 44, { pose: 'sit', hat: 'kasket', dir: -1 });
      S.ctx.beginPath(); S.ctx.ellipse(888, -40, 8, 6, 0.4, 0, TAU); S.ctx.fill(); S.ctx.fillRect(864, -52, 22, 2);
      for (let i = 0; i < 4; i++) { P.person(S.ctx, 960 + i * 34, 0, 30, { kid: true, pose: 'sitground', hat: i % 2 ? 'bob' : 'kasket', g: i % 2 ? 'f' : 'm', dir: 1 }); S.ctx.fillRect(966 + i * 34, -16, 9, 6); }
      // jimnastik yapan gençler
      for (let i = 0; i < 5; i++) P.person(S.ctx, 1120 + i * 34, 0, 42, { pose: i % 2 ? 'cheer' : 'wave', g: i % 2 ? 'f' : 'm', hat: 'none', dir: -1 });
    },
  };
})();
