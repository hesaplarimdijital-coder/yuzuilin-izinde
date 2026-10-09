/* =========================================================================
   Yüzyılın İzinde — çizim temel kitaplığı (3/3): araçlar ve nesneler
   Sağa bakan araçlar; dir=-1 ile yatay çevrilir.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P;
  const TAU = U.TAU;

  function flip(ctx, x, dir) { if (dir === -1) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); } }

  P.wheel = function (ctx, x, y, r, o) {
    o = o || {};
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    const save = ctx.fillStyle;
    ctx.fillStyle = P.lighter(ctx, o.spokes ? 2.2 : 1.6);
    if (o.spokes) {
      ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.5, r * 0.08);
      ctx.beginPath(); for (let i = 0; i < o.spokes; i++) { const a = (i / o.spokes) * Math.PI; ctx.moveTo(x - Math.cos(a) * r * 0.8, y - Math.sin(a) * r * 0.8); ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); }
      ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(x, y, r * 0.86, 0, TAU); ctx.arc(x, y, r * 0.74, 0, TAU, true); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = save;
  };

  // ------------------------------------------------------------ otomobil
  P.car = function (ctx, em, x, y, L, model, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100;
    const X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    let wr = 8.5, wf = 22, wb = 78, nose = [], lightPos = [96, 14];
    ctx.beginPath();
    switch (model) {
      case 'old':
        ctx.moveTo(X(2), Y(10)); ctx.lineTo(X(2), Y(24)); ctx.lineTo(X(20), Y(26)); ctx.lineTo(X(22), Y(46)); ctx.lineTo(X(58), Y(47));
        ctx.lineTo(X(60), Y(27)); ctx.lineTo(X(86), Y(26)); ctx.quadraticCurveTo(X(96), Y(24), X(97), Y(16)); ctx.lineTo(X(97), Y(10)); ctx.closePath();
        ctx.moveTo(X(10), Y(12)); ctx.quadraticCurveTo(X(22), Y(26), X(34), Y(12)); ctx.closePath();
        ctx.moveTo(X(66), Y(12)); ctx.quadraticCurveTo(X(78), Y(26), X(90), Y(12)); ctx.closePath();
        ctx.rect(X(24), Y(11), X(64) - X(24), 2 * s);
        wr = 10; wf = 22; wb = 78; lightPos = [95, 20];
        break;
      case 'anadol':
        ctx.moveTo(X(1), Y(12)); ctx.lineTo(X(1), Y(24)); ctx.quadraticCurveTo(X(4), Y(29), X(16), Y(30)); ctx.lineTo(X(26), Y(31));
        ctx.quadraticCurveTo(X(34), Y(48), X(52), Y(48)); ctx.quadraticCurveTo(X(64), Y(48), X(70), Y(32)); ctx.lineTo(X(92), Y(30));
        ctx.quadraticCurveTo(X(99), Y(28), X(99), Y(20)); ctx.lineTo(X(99), Y(12)); ctx.closePath();
        break;
      case 'murat':
      case 'taxi':
        ctx.moveTo(X(1), Y(12)); ctx.lineTo(X(1), Y(30)); ctx.lineTo(X(24), Y(31)); ctx.lineTo(X(30), Y(47)); ctx.lineTo(X(66), Y(47)); ctx.lineTo(X(74), Y(31));
        ctx.lineTo(X(99), Y(29)); ctx.lineTo(X(99), Y(12)); ctx.closePath();
        if (model === 'taxi') ctx.rect(X(42), Y(52), 12 * s, 5 * s);
        break;
      case 'sahin':
        ctx.moveTo(X(1), Y(12)); ctx.lineTo(X(1), Y(29)); ctx.lineTo(X(22), Y(31)); ctx.lineTo(X(31), Y(46)); ctx.lineTo(X(64), Y(46)); ctx.lineTo(X(76), Y(31));
        ctx.lineTo(X(97), Y(28)); ctx.quadraticCurveTo(X(100), Y(26), X(99), Y(12)); ctx.closePath();
        break;
      case 'lada':
        ctx.moveTo(X(1), Y(12)); ctx.lineTo(X(1), Y(31)); ctx.lineTo(X(24), Y(32)); ctx.lineTo(X(30), Y(48)); ctx.lineTo(X(66), Y(48)); ctx.lineTo(X(73), Y(32));
        ctx.lineTo(X(99), Y(30)); ctx.lineTo(X(99), Y(12)); ctx.closePath();
        // portbagaj ve yük
        ctx.rect(X(28), Y(51), 42 * s, 2 * s);
        ctx.moveTo(X(30), Y(51)); ctx.quadraticCurveTo(X(34), Y(66), X(48), Y(64)); ctx.quadraticCurveTo(X(62), Y(68), X(68), Y(51)); ctx.closePath();
        break;
      case 'modern':
        ctx.moveTo(X(1), Y(12)); ctx.quadraticCurveTo(X(0), Y(34), X(10), Y(36)); ctx.lineTo(X(26), Y(38)); ctx.quadraticCurveTo(X(38), Y(52), X(56), Y(52));
        ctx.quadraticCurveTo(X(68), Y(51), X(76), Y(37)); ctx.quadraticCurveTo(X(97), Y(34), X(99), Y(22)); ctx.lineTo(X(99), Y(12)); ctx.closePath();
        break;
      case 'togg':
        ctx.moveTo(X(1), Y(14)); ctx.quadraticCurveTo(X(-1), Y(40), X(10), Y(44)); ctx.lineTo(X(22), Y(46)); ctx.quadraticCurveTo(X(36), Y(62), X(56), Y(60));
        ctx.quadraticCurveTo(X(70), Y(58), X(80), Y(44)); ctx.quadraticCurveTo(X(98), Y(40), X(100), Y(26)); ctx.lineTo(X(100), Y(14)); ctx.closePath();
        wr = 11; lightPos = [97, 34];
        break;
      default:
        ctx.rect(X(0), Y(40), L, 28 * s);
    }
    ctx.fill();
    P.wheel(ctx, X(wf), Y(wr - 0.5), wr * s, { spokes: model === 'old' ? 8 : 0 });
    P.wheel(ctx, X(wb), Y(wr - 0.5), wr * s, { spokes: model === 'old' ? 8 : 0 });
    // camlar
    const save = ctx.fillStyle;
    ctx.fillStyle = P.lighter(ctx, 1.8);
    ctx.beginPath();
    if (model === 'anadol') { ctx.moveTo(X(30), Y(32)); ctx.quadraticCurveTo(X(36), Y(45), X(50), Y(45)); ctx.lineTo(X(52), Y(32)); ctx.closePath(); ctx.moveTo(X(54), Y(32)); ctx.lineTo(X(54), Y(45)); ctx.quadraticCurveTo(X(62), Y(45), X(67), Y(32)); ctx.closePath(); }
    else if (model === 'murat' || model === 'taxi' || model === 'lada' || model === 'sahin') { ctx.moveTo(X(28), Y(32)); ctx.lineTo(X(32), Y(44)); ctx.lineTo(X(47), Y(44)); ctx.lineTo(X(47), Y(32)); ctx.closePath(); ctx.moveTo(X(50), Y(32)); ctx.lineTo(X(50), Y(44)); ctx.lineTo(X(64), Y(44)); ctx.lineTo(X(70), Y(32)); ctx.closePath(); }
    else if (model === 'modern') { ctx.moveTo(X(30), Y(39)); ctx.quadraticCurveTo(X(40), Y(49), X(55), Y(49)); ctx.quadraticCurveTo(X(65), Y(48), X(71), Y(38)); ctx.closePath(); }
    else if (model === 'togg') { ctx.moveTo(X(27), Y(47)); ctx.quadraticCurveTo(X(38), Y(58), X(56), Y(57)); ctx.quadraticCurveTo(X(68), Y(56), X(76), Y(46)); ctx.closePath(); }
    else if (model === 'old') { ctx.rect(X(26), Y(44), 14 * s, 14 * s); ctx.rect(X(43), Y(44), 13 * s, 14 * s); }
    ctx.fill();
    ctx.fillStyle = save;
    if (em) {
      P.glow(em, X(lightPos[0]), Y(lightPos[1]), 14 * s, model === 'togg' ? '#e6f2ff' : '#ffe6b0', o.lights === false ? 0 : 0.8);
      if (model === 'togg') P.lightRect(em, X(80), Y(36), 18 * s, 1.4 * s, '#e6f2ff', 0.9);
      P.glow(em, X(2), Y(lightPos[1] - 2), 6 * s, '#ff3b2f', 0.6);
    }
    ctx.restore();
  };

  P.bus = function (ctx, em, x, y, L, o, rng) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    const old = o.style === 'old';
    ctx.beginPath();
    if (old) { ctx.moveTo(X(1), Y(6)); ctx.lineTo(X(1), Y(26)); ctx.quadraticCurveTo(X(2), Y(36), X(12), Y(36)); ctx.lineTo(X(86), Y(36)); ctx.quadraticCurveTo(X(97), Y(35), X(99), Y(24)); ctx.lineTo(X(99), Y(6)); ctx.closePath(); }
    else { ctx.moveTo(X(1), Y(6)); ctx.lineTo(X(1), Y(32)); ctx.quadraticCurveTo(X(1), Y(36), X(5), Y(36)); ctx.lineTo(X(96), Y(36)); ctx.quadraticCurveTo(X(99), Y(35), X(99), Y(30)); ctx.lineTo(X(99), Y(6)); ctx.closePath(); }
    ctx.fill();
    P.wheel(ctx, X(18), Y(5), 6 * s); P.wheel(ctx, X(80), Y(5), 6 * s);
    const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 1.7);
    for (let i = 0; i < 8; i++) { const wx = X(8 + i * 10.5); ctx.fillRect(wx, Y(31), 8 * s, 10 * s); if (em && (!rng || rng() < 0.7)) P.lightRect(em, wx, Y(31), 8 * s, 10 * s, '#ffe7b8', 0.45); }
    ctx.fillStyle = save;
    if (em) P.glow(em, X(98), Y(12), 10 * s, '#ffe6b0', 0.7);
    ctx.restore();
  };

  P.truck = function (ctx, em, x, y, L, type, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    if (type === 'tir') {
      ctx.rect(X(0), Y(36), 74 * s, 30 * s);
      ctx.rect(X(4), Y(7), 70 * s, 2 * s);
      ctx.moveTo(X(77), Y(6)); ctx.lineTo(X(77), Y(34)); ctx.lineTo(X(92), Y(35)); ctx.lineTo(X(99), Y(22)); ctx.lineTo(X(99), Y(6)); ctx.closePath();
      ctx.fill();
      [10, 18, 85].forEach((w) => P.wheel(ctx, X(w), Y(4.5), 4.5 * s));
    } else if (type === 'dump') {
      ctx.moveTo(X(2), Y(30)); ctx.lineTo(X(6), Y(12)); ctx.lineTo(X(66), Y(12)); ctx.lineTo(X(70), Y(32)); ctx.closePath();
      ctx.moveTo(X(70), Y(8)); ctx.lineTo(X(70), Y(36)); ctx.lineTo(X(88), Y(36)); ctx.lineTo(X(98), Y(22)); ctx.lineTo(X(98), Y(8)); ctx.closePath();
      ctx.fill();
      [18, 34, 84].forEach((w) => P.wheel(ctx, X(w), Y(7), 7 * s));
    } else if (type === 'fire') {
      ctx.rect(X(0), Y(32), 70 * s, 24 * s);
      ctx.moveTo(X(70), Y(8)); ctx.lineTo(X(70), Y(36)); ctx.lineTo(X(90), Y(36)); ctx.lineTo(X(99), Y(22)); ctx.lineTo(X(99), Y(8)); ctx.closePath();
      ctx.rect(X(4), Y(38), 60 * s, 2 * s);
      ctx.fill();
      [16, 80].forEach((w) => P.wheel(ctx, X(w), Y(6), 6 * s));
      if (em) { P.glow(em, X(80), Y(38), 10 * s, '#ff3b30', 0.9); P.glow(em, X(88), Y(38), 10 * s, '#4aa3ff', 0.9); }
    } else {
      // eski kamyon
      ctx.rect(X(0), Y(30), 62 * s, 18 * s);
      ctx.moveTo(X(64), Y(8)); ctx.lineTo(X(64), Y(38)); ctx.lineTo(X(80), Y(38)); ctx.lineTo(X(82), Y(24)); ctx.quadraticCurveTo(X(98), Y(24), X(99), Y(14)); ctx.lineTo(X(99), Y(8)); ctx.closePath();
      ctx.fill();
      [16, 84].forEach((w) => P.wheel(ctx, X(w), Y(7), 7 * s));
    }
    if (em) P.glow(em, X(98), Y(14), 9 * s, '#ffe6b0', 0.6);
    ctx.restore();
  };

  P.tractor = function (ctx, x, y, L, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    ctx.moveTo(X(30), Y(26)); ctx.lineTo(X(30), Y(46)); ctx.lineTo(X(86), Y(44)); ctx.quadraticCurveTo(X(97), Y(42), X(97), Y(30)); ctx.lineTo(X(97), Y(22)); ctx.closePath();
    // koltuk ve direksiyon
    ctx.rect(X(18), Y(50), 16 * s, 4 * s);
    ctx.rect(X(36), Y(66), 3 * s, 20 * s);
    // egzoz
    ctx.rect(X(74), Y(66), 3 * s, 22 * s);
    ctx.fill();
    P.wheel(ctx, X(26), Y(26), 26 * s, { spokes: 0 });
    P.wheel(ctx, X(86), Y(13), 13 * s);
    // lastik dişleri
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; ctx.moveTo(X(26) + Math.cos(a) * 26 * s, Y(26) + Math.sin(a) * 26 * s); ctx.arc(X(26) + Math.cos(a) * 26 * s, Y(26) + Math.sin(a) * 26 * s, 2.2 * s, 0, TAU); } ctx.fill();
    if (o.driver !== false) P.person(ctx, X(26), Y(26), 42 * s, { pose: 'sit', hat: o.hat || 'kasket', dir: 1 });
    ctx.restore();
  };

  P.tank = function (ctx, x, y, L, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    // palet
    ctx.moveTo(X(6), Y(2)); ctx.lineTo(X(94), Y(2)); ctx.quadraticCurveTo(X(102), Y(10), X(96), Y(18)); ctx.lineTo(X(4), Y(18)); ctx.quadraticCurveTo(X(-2), Y(10), X(6), Y(2)); ctx.closePath();
    // gövde
    ctx.moveTo(X(2), Y(17)); ctx.lineTo(X(8), Y(28)); ctx.lineTo(X(84), Y(28)); ctx.lineTo(X(98), Y(20)); ctx.lineTo(X(98), Y(17)); ctx.closePath();
    // kule
    ctx.moveTo(X(26), Y(28)); ctx.lineTo(X(30), Y(41)); ctx.lineTo(X(62), Y(42)); ctx.quadraticCurveTo(X(70), Y(40), X(70), Y(28)); ctx.closePath();
    ctx.rect(X(66), Y(37), 52 * s, 3.4 * s);
    ctx.rect(X(40), Y(46), 8 * s, 4 * s);
    ctx.fill();
    const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 1.5);
    for (let i = 0; i < 7; i++) P.fillCircle(ctx, X(12 + i * 12.6), Y(9), 4.4 * s);
    ctx.fillStyle = save;
    if (o.crew) P.person(ctx, X(44), Y(36), 30 * s, { pose: 'stand', hat: 'helmet' });
    ctx.restore();
  };

  P.jeep = function (ctx, x, y, L, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    ctx.moveTo(X(2), Y(10)); ctx.lineTo(X(2), Y(38)); ctx.lineTo(X(62), Y(38)); ctx.lineTo(X(66), Y(58)); ctx.lineTo(X(69), Y(58)); ctx.lineTo(X(70), Y(38)); ctx.lineTo(X(98), Y(34)); ctx.lineTo(X(98), Y(10)); ctx.closePath();
    ctx.fill();
    P.wheel(ctx, X(20), Y(12), 12 * s); P.wheel(ctx, X(80), Y(12), 12 * s);
    ctx.restore();
  };

  // ------------------------------------------------------------- trenler
  P.locomotive = function (ctx, em, x, y, L, type, o) {
    o = o || {};
    const s = L / 100, X = (v) => x + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    if (type === 'steam') {
      // tender
      ctx.rect(X(-38), Y(44), 34 * s, 34 * s);
      // kabin
      ctx.rect(X(0), Y(60), 24 * s, 50 * s);
      ctx.rect(X(-3), Y(63), 30 * s, 4 * s);
      // kazan
      ctx.moveTo(X(22), Y(22)); ctx.lineTo(X(22), Y(46)); ctx.lineTo(X(88), Y(46)); ctx.quadraticCurveTo(X(94), Y(34), X(88), Y(22)); ctx.closePath();
      // baca
      ctx.moveTo(X(76), Y(46)); ctx.lineTo(X(74), Y(66)); ctx.lineTo(X(84), Y(66)); ctx.lineTo(X(81), Y(46)); ctx.closePath();
      // kubbe
      ctx.moveTo(X(48), Y(46)); ctx.ellipse(X(54), Y(46), 6 * s, 6 * s, 0, Math.PI, TAU);
      // mahmuz
      ctx.moveTo(X(88), Y(8)); ctx.lineTo(X(100), Y(2)); ctx.lineTo(X(90), Y(2)); ctx.closePath();
      ctx.rect(X(-40), Y(12), 132 * s, 6 * s);
      ctx.fill();
      [30, 50, 70].forEach((w) => P.wheel(ctx, X(w), Y(10), 10 * s, { spokes: 6 }));
      [-30, -14, 86].forEach((w) => P.wheel(ctx, X(w), Y(6), 6 * s));
      ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.6 * s;
      ctx.beginPath(); ctx.moveTo(X(30), Y(7)); ctx.lineTo(X(70), Y(7)); ctx.stroke(); ctx.restore();
      if (em) { P.glow(em, X(92), Y(36), 14 * s, '#ffe2a0', 0.8); P.lightRect(em, X(4), Y(54), 14 * s, 12 * s, '#ffb24a', 0.5); }
      if (o.flags) { P.flag(ctx, X(92), Y(56), 10 * s, 0.3, { dir: -1, amp: 0.15, red: o.red }); }
      return { stackX: X(79), stackY: Y(66), front: X(100), back: X(-40) };
    } else if (type === 'diesel') {
      ctx.moveTo(X(-40), Y(10)); ctx.lineTo(X(-40), Y(50)); ctx.lineTo(X(80), Y(50)); ctx.quadraticCurveTo(X(98), Y(48), X(100), Y(30)); ctx.lineTo(X(100), Y(10)); ctx.closePath();
      ctx.fill();
      [-30, -15, 70, 85].forEach((w) => P.wheel(ctx, X(w), Y(5), 5 * s));
      if (em) { P.glow(em, X(98), Y(22), 12 * s, '#ffe6b0', 0.7); }
      return { front: X(100), back: X(-40) };
    }
    // modern (Marmaray/YHT)
    ctx.moveTo(X(-40), Y(8)); ctx.lineTo(X(-40), Y(44)); ctx.lineTo(X(60), Y(44)); ctx.quadraticCurveTo(X(92), Y(42), X(100), Y(16)); ctx.lineTo(X(100), Y(8)); ctx.closePath();
    ctx.fill();
    if (em) {
      for (let i = 0; i < 9; i++) P.lightRect(em, X(-36 + i * 10.5), Y(36), 8 * s, 12 * s, '#e9f3ff', 0.75);
      P.glow(em, X(98), Y(14), 16 * s, '#e6f2ff', 0.8);
    }
    return { front: X(100), back: X(-40) };
  };

  P.wagon = function (ctx, em, x, y, L, type, rng) {
    const s = L / 100, X = (v) => x + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    if (type === 'freight') ctx.rect(X(2), Y(50), 96 * s, 40 * s);
    else if (type === 'modern') { ctx.rect(X(1), Y(44), 98 * s, 36 * s); }
    else { ctx.rect(X(2), Y(46), 96 * s, 36 * s); ctx.moveTo(X(0), Y(46)); ctx.quadraticCurveTo(X(50), Y(56), X(100), Y(46)); ctx.closePath(); }
    ctx.rect(X(1), Y(11), 98 * s, 3 * s);
    ctx.fill();
    [14, 26, 74, 86].forEach((w) => P.wheel(ctx, X(w), Y(5), 5 * s));
    const save = ctx.fillStyle;
    if (type !== 'freight') {
      ctx.fillStyle = P.lighter(ctx, 1.7);
      const n = type === 'modern' ? 9 : 7;
      for (let i = 0; i < n; i++) {
        const wx = X(6 + i * (88 / n)), ww = (88 / n) * 0.7 * s;
        ctx.fillRect(wx, Y(38), ww, 13 * s);
        if (em && (!rng || rng() < 0.75)) P.lightRect(em, wx, Y(38), ww, 13 * s, type === 'modern' ? '#e9f3ff' : '#ffdca0', 0.55);
      }
    } else {
      ctx.fillStyle = P.lighter(ctx, 1.3);
      ctx.fillRect(X(40), Y(46), 20 * s, 32 * s);
    }
    ctx.fillStyle = save;
  };

  // ------------------------------------------------------------- gemiler
  P.ship = function (ctx, em, x, y, L, type, o, rng) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    let windowsRow = null;
    switch (type) {
      case 'ferry': // İstanbul vapuru
        ctx.moveTo(X(2), Y(10)); ctx.quadraticCurveTo(X(0), Y(18), X(4), Y(20)); ctx.lineTo(X(96), Y(20)); ctx.quadraticCurveTo(X(100), Y(18), X(98), Y(10));
        ctx.quadraticCurveTo(X(50), Y(-2), X(2), Y(10)); ctx.closePath();
        ctx.rect(X(10), Y(32), 80 * s, 12 * s);
        ctx.rect(X(16), Y(42), 68 * s, 10 * s);
        ctx.rect(X(8), Y(44), 84 * s, 2 * s);
        // baca
        ctx.moveTo(X(46), Y(42)); ctx.lineTo(X(47), Y(64)); ctx.lineTo(X(55), Y(64)); ctx.lineTo(X(56), Y(42)); ctx.closePath();
        ctx.rect(X(30), Y(66), 1.2 * s, 24 * s);
        windowsRow = [[12, 28, 76, 7], [18, 38, 64, 5]];
        break;
      case 'steam':
        ctx.moveTo(X(0), Y(22)); ctx.lineTo(X(8), Y(2)); ctx.lineTo(X(94), Y(2)); ctx.lineTo(X(100), Y(24)); ctx.closePath();
        ctx.rect(X(28), Y(34), 44 * s, 12 * s);
        ctx.rect(X(36), Y(64), 7 * s, 30 * s); ctx.rect(X(54), Y(64), 7 * s, 30 * s);
        ctx.rect(X(18), Y(80), 1.2 * s, 58 * s); ctx.rect(X(80), Y(80), 1.2 * s, 58 * s);
        windowsRow = [[30, 30, 40, 6]];
        break;
      case 'warship':
        ctx.moveTo(X(0), Y(18)); ctx.lineTo(X(6), Y(2)); ctx.lineTo(X(92), Y(2)); ctx.lineTo(X(100), Y(20)); ctx.lineTo(X(82), Y(18)); ctx.lineTo(X(60), Y(18)); ctx.closePath();
        ctx.moveTo(X(30), Y(17)); ctx.lineTo(X(32), Y(30)); ctx.lineTo(X(44), Y(30)); ctx.lineTo(X(46), Y(40)); ctx.lineTo(X(56), Y(40)); ctx.lineTo(X(60), Y(17)); ctx.closePath();
        ctx.rect(X(49), Y(62), 1.4 * s, 22 * s);
        ctx.rect(X(45), Y(54), 9 * s, 1.2 * s);
        ctx.moveTo(X(68), Y(17)); ctx.lineTo(X(70), Y(23)); ctx.lineTo(X(76), Y(23)); ctx.lineTo(X(77), Y(17)); ctx.closePath();
        ctx.rect(X(75), Y(22), 12 * s, 1.2 * s);
        windowsRow = [[34, 26, 20, 4]];
        break;
      case 'cargo':
        ctx.moveTo(X(0), Y(20)); ctx.lineTo(X(6), Y(2)); ctx.lineTo(X(94), Y(2)); ctx.lineTo(X(100), Y(22)); ctx.closePath();
        ctx.rect(X(6), Y(40), 14 * s, 20 * s);
        ctx.rect(X(10), Y(48), 6 * s, 8 * s);
        for (let i = 0; i < 9; i++) { const hh = 8 + ((i * 7) % 4) * 3; ctx.rect(X(24 + i * 8), Y(20 + hh), 7.4 * s, hh * s); }
        windowsRow = [[7, 37, 12, 3]];
        break;
      case 'landing':
        ctx.moveTo(X(0), Y(16)); ctx.lineTo(X(4), Y(2)); ctx.lineTo(X(90), Y(2)); ctx.lineTo(X(100), Y(14)); ctx.lineTo(X(100), Y(18)); ctx.closePath();
        ctx.rect(X(8), Y(30), 18 * s, 14 * s);
        ctx.rect(X(14), Y(44), 1 * s, 14 * s);
        break;
      default: // kayık
        ctx.moveTo(X(0), Y(16)); ctx.quadraticCurveTo(X(10), Y(2), X(50), Y(2)); ctx.quadraticCurveTo(X(90), Y(2), X(100), Y(18)); ctx.lineTo(X(88), Y(14)); ctx.lineTo(X(10), Y(14)); ctx.closePath();
    }
    ctx.fill();
    if (windowsRow) {
      const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 1.6);
      windowsRow.forEach((r) => { for (let i = 0; i < r[3] * 3; i++) { const wx = X(r[0] + i * (r[2] / (r[3] * 3))); ctx.fillRect(wx, Y(r[1]), 1.6 * s, 2.4 * s); if (em && (!rng || rng() < 0.6)) P.lightRect(em, wx, Y(r[1]), 1.6 * s, 2.4 * s, P.LIGHT, 0.8); } });
      ctx.fillStyle = save;
    }
    if (em && o.lights) { P.glow(em, X(50), Y(30), L * 0.12, '#ffe0a0', 0.3); for (let i = 0; i < 12; i++) P.glow(em, X(4 + i * 8), Y(22 + Math.sin(i / 11 * Math.PI) * 40 * (type === 'warship' ? 1 : 0.4)), 2.5 * s + 1, '#fff0c0', 0.8); }
    if (o.flag) P.flag(ctx, X(type === 'warship' ? 49.5 : 30.5), Y(type === 'warship' ? 62 : 90), 9 * s, o.t || 0, { dir: -1, amp: 0.14, red: o.red });
    ctx.restore();
  };

  // ------------------------------------------------------------- uçaklar
  P.plane = function (ctx, em, x, y, L, type, o) {
    o = o || {};
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.angle || 0); if (o.dir === -1) ctx.scale(-1, 1);
    const s = L / 100;
    ctx.beginPath();
    if (type === 'airliner' || type === 'jet') {
      const bj = type === 'jet';
      ctx.moveTo(-50 * s, -2 * s); ctx.quadraticCurveTo(-48 * s, -7 * s, -40 * s, -7 * s); ctx.lineTo(36 * s, -7 * s);
      ctx.quadraticCurveTo(48 * s, -6 * s, 50 * s, -1 * s); ctx.quadraticCurveTo(46 * s, 3 * s, 36 * s, 3 * s); ctx.lineTo(-40 * s, 3 * s); ctx.closePath();
      // kuyruk
      ctx.moveTo(-36 * s, -6 * s); ctx.lineTo(-48 * s, -24 * s); ctx.lineTo(-42 * s, -24 * s); ctx.lineTo(-24 * s, -6 * s); ctx.closePath();
      ctx.moveTo(-40 * s, -2 * s); ctx.lineTo(-52 * s, 2 * s); ctx.lineTo(-30 * s, 0); ctx.closePath();
      // kanat
      ctx.moveTo(4 * s, 0); ctx.lineTo(-18 * s, 14 * s); ctx.lineTo(-12 * s, 14 * s); ctx.lineTo(16 * s, 0); ctx.closePath();
      if (!bj) { ctx.moveTo(-6 * s, 5 * s); ctx.ellipse(-4 * s, 7 * s, 7 * s, 2.6 * s, 0, 0, TAU); }
      else { ctx.moveTo(-26 * s, -8 * s); ctx.ellipse(-24 * s, -8 * s, 7 * s, 2.4 * s, 0, 0, TAU); }
    } else if (type === 'fighter') {
      ctx.moveTo(-50 * s, -2 * s); ctx.lineTo(30 * s, -5 * s); ctx.quadraticCurveTo(50 * s, -3 * s, 52 * s, 0); ctx.lineTo(30 * s, 3 * s); ctx.lineTo(-50 * s, 3 * s); ctx.closePath();
      ctx.moveTo(-30 * s, -3 * s); ctx.lineTo(-48 * s, -22 * s); ctx.lineTo(-40 * s, -22 * s); ctx.lineTo(-18 * s, -3 * s); ctx.closePath();
      ctx.moveTo(10 * s, 0); ctx.lineTo(-24 * s, 16 * s); ctx.lineTo(-14 * s, 16 * s); ctx.lineTo(18 * s, 0); ctx.closePath();
      ctx.moveTo(20 * s, -5 * s); ctx.quadraticCurveTo(28 * s, -10 * s, 36 * s, -4 * s); ctx.closePath();
      if (em) P.glow(em, -52 * s, 0, 10 * s, '#ffb060', 0.8);
    } else if (type === 'canadair') {
      ctx.moveTo(-48 * s, -2 * s); ctx.quadraticCurveTo(-30 * s, 6 * s, 30 * s, 6 * s); ctx.quadraticCurveTo(48 * s, 4 * s, 50 * s, -4 * s); ctx.lineTo(40 * s, -10 * s); ctx.lineTo(-30 * s, -8 * s); ctx.closePath();
      ctx.moveTo(-34 * s, -6 * s); ctx.lineTo(-44 * s, -26 * s); ctx.lineTo(-36 * s, -26 * s); ctx.lineTo(-24 * s, -7 * s); ctx.closePath();
      ctx.rect(-20 * s, -14 * s, 50 * s, 4 * s);
      ctx.moveTo(6 * s, -12 * s); ctx.ellipse(6 * s, -11 * s, 8 * s, 3 * s, 0, 0, TAU);
    } else { // pervaneli eski uçak
      ctx.moveTo(-46 * s, -3 * s); ctx.lineTo(30 * s, -6 * s); ctx.quadraticCurveTo(42 * s, -6 * s, 44 * s, 0); ctx.lineTo(30 * s, 4 * s); ctx.lineTo(-46 * s, 2 * s); ctx.closePath();
      ctx.moveTo(-36 * s, -3 * s); ctx.lineTo(-46 * s, -18 * s); ctx.lineTo(-40 * s, -18 * s); ctx.lineTo(-26 * s, -3 * s); ctx.closePath();
      ctx.rect(-10 * s, -8 * s, 26 * s, 3 * s);
      ctx.rect(44 * s, -12 * s, 1.5 * s, 24 * s);
    }
    ctx.fill();
    if (em && o.lights !== false) { P.glow(em, 10 * s, 14 * s, 4 * s + 2, '#ff3b30', 0.9); P.glow(em, -48 * s, -24 * s, 3 * s + 2, '#ffffff', 0.9); if (o.landing) P.glow(em, 48 * s, 2 * s, 30 * s, '#fff6dc', 0.7); }
    ctx.restore();
  };

  P.helicopter = function (ctx, em, x, y, L, o) {
    o = o || {};
    ctx.save(); ctx.translate(x, y); if (o.dir === -1) ctx.scale(-1, 1);
    const s = L / 100;
    ctx.beginPath();
    ctx.moveTo(-10 * s, -6 * s); ctx.quadraticCurveTo(10 * s, -16 * s, 30 * s, -8 * s); ctx.quadraticCurveTo(38 * s, 0, 28 * s, 8 * s); ctx.lineTo(-10 * s, 8 * s); ctx.closePath();
    ctx.moveTo(-10 * s, -4 * s); ctx.lineTo(-50 * s, -2 * s); ctx.lineTo(-50 * s, 1 * s); ctx.lineTo(-10 * s, 4 * s); ctx.closePath();
    ctx.rect(-52 * s, -10 * s, 3 * s, 12 * s);
    ctx.rect(4 * s, -18 * s, 3 * s, 6 * s);
    ctx.rect(-6 * s, 12 * s, 36 * s, 1.6 * s);
    ctx.fill();
    ctx.globalAlpha *= 0.6;
    ctx.beginPath(); ctx.ellipse(5 * s, -19 * s, 52 * s, 2 * s, 0, 0, TAU); ctx.fill();
    ctx.restore();
    if (em) P.glow(em, x + (o.dir === -1 ? -30 : 30) * s, y + 6 * s, 40 * s, '#f2f6ff', 0.25);
  };

  P.rocket = function (ctx, em, x, y, h) {
    const w = h * 0.075;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h * 0.86, w, h * 0.86);
    ctx.moveTo(x - w / 2, y - h * 0.86); ctx.quadraticCurveTo(x - w / 2, y - h * 0.97, x, y - h); ctx.quadraticCurveTo(x + w / 2, y - h * 0.97, x + w / 2, y - h * 0.86); ctx.closePath();
    // bacaklar
    ctx.moveTo(x - w / 2, y - h * 0.08); ctx.lineTo(x - w * 1.3, y); ctx.lineTo(x - w * 0.9, y); ctx.lineTo(x - w / 2, y - h * 0.03); ctx.closePath();
    ctx.moveTo(x + w / 2, y - h * 0.08); ctx.lineTo(x + w * 1.3, y); ctx.lineTo(x + w * 0.9, y); ctx.lineTo(x + w / 2, y - h * 0.03); ctx.closePath();
    ctx.fill();
    const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 1.6);
    ctx.fillRect(x - w / 2, y - h * 0.6, w, h * 0.012); ctx.fillRect(x - w / 2, y - h * 0.8, w, h * 0.01);
    ctx.fillStyle = save;
  };

  P.excavator = function (ctx, x, y, L, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    ctx.moveTo(X(4), Y(2)); ctx.lineTo(X(60), Y(2)); ctx.quadraticCurveTo(X(68), Y(9), X(60), Y(16)); ctx.lineTo(X(4), Y(16)); ctx.quadraticCurveTo(X(-4), Y(9), X(4), Y(2)); ctx.closePath();
    ctx.rect(X(4), Y(36), 44 * s, 20 * s);
    ctx.rect(X(30), Y(56), 18 * s, 20 * s);
    ctx.fill();
    const a1 = o.arm || 0.5;
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineCap = 'round';
    ctx.lineWidth = 7 * s;
    const bx = X(46), by = Y(40), ex = bx + Math.cos(-a1) * 50 * s, ey = by + Math.sin(-a1) * 50 * s;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = 5 * s;
    const fx = ex + 8 * s, fy = ey + 40 * s;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(fx - 6 * s, fy - 4 * s); ctx.lineTo(fx + 12 * s, fy + 2 * s); ctx.lineTo(fx + 4 * s, fy + 14 * s); ctx.lineTo(fx - 8 * s, fy + 8 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  // Kağnı (öküz arabası)
  P.oxcart = function (ctx, x, y, L, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    const s = L / 100, X = (v) => x - L / 2 + v * s, Y = (v) => y - v * s;
    ctx.beginPath();
    ctx.moveTo(X(2), Y(30)); ctx.lineTo(X(40), Y(30)); ctx.lineTo(X(40), Y(24)); ctx.lineTo(X(2), Y(24)); ctx.closePath();
    for (let i = 0; i < 6; i++) ctx.rect(X(3 + i * 7), Y(44), 1.4 * s, 14 * s);
    ctx.rect(X(36), Y(26), 30 * s, 2 * s);
    if (o.load) { ctx.moveTo(X(4), Y(30)); ctx.quadraticCurveTo(X(20), Y(52), X(38), Y(30)); ctx.closePath(); }
    ctx.fill();
    P.wheel(ctx, X(20), Y(14), 14 * s);
    // öküzler
    for (let k = 0; k < 2; k++) {
      const ox = X(70 + k * 6), oy = y;
      ctx.beginPath();
      ctx.ellipse(ox, oy - 22 * s, 15 * s, 9 * s, 0, 0, TAU);
      ctx.moveTo(ox + 14 * s, oy - 26 * s); ctx.ellipse(ox + 18 * s, oy - 22 * s, 5.5 * s, 4.5 * s, 0.5, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      P.capsule(ctx, ox - 10 * s, oy - 18 * s, 2.2 * s, ox - 11 * s, oy, 1.6 * s);
      P.capsule(ctx, ox + 8 * s, oy - 18 * s, 2.2 * s, ox + 9 * s, oy, 1.6 * s);
      ctx.fill();
      ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.2 * s;
      ctx.beginPath(); ctx.moveTo(ox + 16 * s, oy - 26 * s); ctx.quadraticCurveTo(ox + 14 * s, oy - 33 * s, ox + 19 * s, oy - 34 * s); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  };

  P.horse = function (ctx, x, y, s, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    ctx.beginPath();
    ctx.ellipse(x, y - 30 * s, 16 * s, 8 * s, 0, 0, TAU);
    ctx.moveTo(x + 12 * s, y - 34 * s); ctx.lineTo(x + 20 * s, y - 50 * s); ctx.lineTo(x + 27 * s, y - 46 * s); ctx.lineTo(x + 19 * s, y - 30 * s); ctx.closePath();
    ctx.moveTo(x + 20 * s, y - 50 * s); ctx.ellipse(x + 25 * s, y - 47 * s, 6 * s, 3.2 * s, 0.6, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    [[-12, 0.1], [-8, -0.15], [10, 0.12], [13, -0.1]].forEach((l) => P.capsule(ctx, x + l[0] * s, y - 26 * s, 2 * s, x + l[0] * s + l[1] * 20 * s, y, 1.3 * s));
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 15 * s, y - 32 * s); ctx.quadraticCurveTo(x - 24 * s, y - 26 * s, x - 21 * s, y - 14 * s); ctx.lineTo(x - 19 * s, y - 15 * s); ctx.quadraticCurveTo(x - 20 * s, y - 26 * s, x - 14 * s, y - 29 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  P.cannon = function (ctx, x, y, s, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    ctx.beginPath();
    ctx.save(); ctx.translate(x, y - 12 * s); ctx.rotate(-0.35);
    ctx.moveTo(-10 * s, -3.5 * s); ctx.lineTo(30 * s, -2.4 * s); ctx.lineTo(30 * s, 2.4 * s); ctx.lineTo(-10 * s, 3.5 * s); ctx.closePath();
    ctx.restore();
    ctx.moveTo(x - 4 * s, y - 12 * s); ctx.lineTo(x - 24 * s, y); ctx.lineTo(x - 20 * s, y); ctx.lineTo(x, y - 10 * s); ctx.closePath();
    ctx.fill();
    P.wheel(ctx, x, y - 9 * s, 9 * s, { spokes: 6 });
    ctx.restore();
  };

  // Top arabası üzerinde bayrağa sarılı tabut
  P.gunCarriage = function (ctx, x, y, s) {
    ctx.beginPath();
    ctx.rect(x - 30 * s, y - 18 * s, 60 * s, 4 * s);
    ctx.fill();
    P.wheel(ctx, x - 18 * s, y - 9 * s, 9 * s, { spokes: 8 });
    P.wheel(ctx, x + 18 * s, y - 9 * s, 9 * s, { spokes: 8 });
    const tex = P.flagTexture();
    ctx.drawImage(tex, x - 26 * s, y - 28 * s, 52 * s, 11 * s);
  };

  // ------------------------------------------------------------- nesneler
  P.ballotBox = function (ctx, em, x, y, s, style) {
    const w = s, h = s * 0.85;
    if (style === 'clear') {
      ctx.save();
      const save = ctx.fillStyle;
      ctx.fillStyle = P.lighter(ctx, 2.5);
      ctx.globalAlpha *= 0.45; ctx.fillRect(x - w / 2, y - h, w, h); ctx.globalAlpha /= 0.45;
      ctx.fillStyle = save;
      ctx.lineWidth = Math.max(1, s * 0.03); ctx.strokeStyle = save;
      ctx.strokeRect(x - w / 2, y - h, w, h);
      ctx.fillRect(x - w / 2 - s * 0.02, y - h - s * 0.06, w + s * 0.04, s * 0.07);
      ctx.fillRect(x - w * 0.18, y - h - s * 0.075, w * 0.36, s * 0.02);
      // zarflar
      ctx.fillStyle = P.lighter(ctx, 1.4);
      for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(x - w * 0.35 + (i % 5) * w * 0.17, y - s * 0.08 - Math.floor(i / 5) * s * 0.09); ctx.rotate((i * 0.7) % 1 - 0.5); ctx.fillRect(-s * 0.08, -s * 0.05, s * 0.16, s * 0.1); ctx.restore(); }
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.rect(x - w / 2, y - h, w, h);
      ctx.rect(x - w / 2 - s * 0.03, y - h - s * 0.08, w + s * 0.06, s * 0.09);
      ctx.fill();
      const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 2.2);
      ctx.fillRect(x - w * 0.2, y - h - s * 0.05, w * 0.4, s * 0.025);
      ctx.fillRect(x - s * 0.04, y - h * 0.65, s * 0.08, s * 0.1);
      ctx.fillStyle = save;
    }
    if (em) P.glow(em, x, y - h * 0.5, s * 0.9, '#fff0cc', 0.12);
  };

  P.booth = function (ctx, x, y, s) {
    ctx.beginPath();
    ctx.rect(x - s * 0.4, y - s * 1.6, s * 0.8, s * 0.06);
    ctx.rect(x - s * 0.4, y - s * 1.6, s * 0.03, s * 1.6);
    ctx.rect(x + s * 0.37, y - s * 1.6, s * 0.03, s * 1.6);
    ctx.fill();
    const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 0.9);
    ctx.beginPath(); ctx.moveTo(x - s * 0.37, y - s * 1.55);
    for (let i = 0; i <= 8; i++) ctx.lineTo(x - s * 0.37 + i * s * 0.0925, y - s * 1.55 + (i % 2 ? 2 : 0));
    ctx.lineTo(x + s * 0.37, y - s * 0.25);
    for (let i = 8; i >= 0; i--) ctx.lineTo(x - s * 0.37 + i * s * 0.0925, y - s * 0.25 + (i % 2 ? 3 : 0));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = save;
  };

  P.blackboard = function (ctx, x, y, w, h, lines, o) {
    o = o || {};
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(1, w * 0.02); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - w * 0.4, y); ctx.lineTo(x - w * 0.3, y - h * 1.5); ctx.moveTo(x + w * 0.4, y); ctx.lineTo(x + w * 0.3, y - h * 1.5); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.1, y - h * 1.3); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.rect(x - w / 2 - 2, y - h * 1.55 - 2, w + 4, h + 4); ctx.fill();
    ctx.save(); ctx.fillStyle = o.board || '#1d2620'; ctx.fillRect(x - w / 2, y - h * 1.55, w, h); ctx.restore();
    const chalk = o.chalk || '#d8d3c3';
    lines.forEach((ln, i) => P.text(ctx, ln, x, y - h * 1.55 + h * (0.38 + i * 0.36), h * 0.27, { color: chalk, weight: '600', spacing: h * 0.04 }));
  };

  P.radio = function (ctx, em, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s / 2, y); ctx.lineTo(x - s / 2, y - s * 0.55); ctx.quadraticCurveTo(x - s / 2, y - s * 0.95, x, y - s * 0.95); ctx.quadraticCurveTo(x + s / 2, y - s * 0.95, x + s / 2, y - s * 0.55); ctx.lineTo(x + s / 2, y); ctx.closePath();
    ctx.fill();
    const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 1.8);
    ctx.beginPath(); ctx.arc(x, y - s * 0.55, s * 0.28, Math.PI, TAU); ctx.fill();
    ctx.fillRect(x - s * 0.35, y - s * 0.22, s * 0.7, s * 0.08);
    ctx.fillStyle = save;
    if (em) { P.lightRect(em, x - s * 0.35, y - s * 0.22, s * 0.7, s * 0.08, '#ffcf70', 0.9); P.glow(em, x, y - s * 0.2, s * 0.7, '#ffbf60', 0.35); }
  };

  P.tvSet = function (ctx, em, x, y, s, o) {
    o = o || {};
    ctx.beginPath();
    ctx.rect(x - s * 0.5, y - s * 0.95, s, s * 0.72);
    ctx.rect(x - s * 0.36, y - s * 0.23, s * 0.05, s * 0.23); ctx.rect(x + s * 0.31, y - s * 0.23, s * 0.05, s * 0.23);
    ctx.fill();
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = s * 0.025;
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.95); ctx.lineTo(x - s * 0.3, y - s * 1.35); ctx.moveTo(x, y - s * 0.95); ctx.lineTo(x + s * 0.28, y - s * 1.38); ctx.stroke(); ctx.restore();
    const save = ctx.fillStyle; ctx.fillStyle = P.lighter(ctx, 2.4);
    P.fillRR(ctx, x - s * 0.42, y - s * 0.88, s * 0.62, s * 0.56, s * 0.08);
    ctx.fillStyle = save;
    if (em) { em.save(); em.fillStyle = 'rgba(190,215,255,0.85)'; em.beginPath(); P.rrect(em, x - s * 0.42, y - s * 0.88, s * 0.62, s * 0.56, s * 0.08); em.fill(); em.restore(); P.glow(em, x - s * 0.1, y - s * 0.6, s * 1.6, '#a8c8ff', 0.35); }
  };

  P.table = function (ctx, x, y, w, h) {
    ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h * 0.1); ctx.rect(x - w * 0.42, y - h, w * 0.05, h); ctx.rect(x + w * 0.37, y - h, w * 0.05, h); ctx.fill();
  };

  P.stall = function (ctx, em, x, y, w, rng, o) {
    o = o || {};
    const h = w * 0.42;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h * 0.12);
    ctx.rect(x - w * 0.46, y - h, w * 0.04, h); ctx.rect(x + w * 0.42, y - h, w * 0.04, h);
    ctx.rect(x - w / 2, y - w * 0.9, w * 0.03, w * 0.9 - h); ctx.rect(x + w / 2 - w * 0.03, y - w * 0.9, w * 0.03, w * 0.9 - h);
    ctx.fill();
    // ürünler
    ctx.beginPath();
    for (let i = 0; i < 26; i++) { const px = x - w * 0.45 + rng() * w * 0.9, py = y - h - rng() * w * 0.09; ctx.moveTo(px + w * 0.035, py); ctx.arc(px, py, w * U.lerp(0.022, 0.04, rng()), 0, TAU); }
    ctx.fill();
    // tente
    const save = ctx.fillStyle; ctx.fillStyle = o.awning || P.lighter(ctx, 2.2);
    ctx.beginPath(); ctx.moveTo(x - w * 0.56, y - w * 0.72); ctx.lineTo(x - w * 0.5, y - w * 0.92); ctx.lineTo(x + w * 0.5, y - w * 0.92); ctx.lineTo(x + w * 0.56, y - w * 0.72);
    for (let i = 8; i >= 0; i--) { const sx = x - w * 0.56 + (i / 8) * w * 1.12; ctx.quadraticCurveTo(sx + w * 0.07, y - w * 0.66, sx, y - w * 0.72); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = save;
    if (o.sign) { P.signboard(ctx, em, x + w * 0.25, y - h - w * 0.02, w * 0.3, w * 0.12, o.sign, { posts: false, color: '#e9e2cf' }); }
    if (em) P.glow(em, x, y - w * 0.68, w * 0.5, '#ffd690', 0.25);
  };

  P.screen = function (ctx, em, x, y, w, h, postH) {
    ctx.beginPath(); ctx.rect(x - w * 0.3, y - postH, w * 0.03, postH); ctx.rect(x + w * 0.27, y - postH, w * 0.03, postH);
    ctx.rect(x - w / 2 - 3, y - postH - h - 3, w + 6, h + 6); ctx.fill();
    ctx.save(); ctx.fillStyle = '#16301f'; ctx.fillRect(x - w / 2, y - postH - h, w, h); ctx.restore();
    if (em) {
      em.save(); em.fillStyle = 'rgba(80,190,110,.85)'; em.fillRect(x - w / 2, y - postH - h, w, h);
      em.strokeStyle = 'rgba(235,255,240,.8)'; em.lineWidth = Math.max(0.6, w * 0.008);
      em.strokeRect(x - w * 0.44, y - postH - h * 0.9, w * 0.88, h * 0.8);
      em.beginPath(); em.moveTo(x, y - postH - h * 0.9); em.lineTo(x, y - postH - h * 0.1); em.stroke();
      em.beginPath(); em.arc(x, y - postH - h * 0.5, h * 0.14, 0, TAU); em.stroke();
      em.restore();
      P.glow(em, x, y - postH - h / 2, w * 0.9, '#9df0b8', 0.3);
    }
  };

  P.banknote = function (ctx, x, y, w, h, text, o) {
    o = o || {};
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
    ctx.fillStyle = o.paper || '#bdb39a';
    P.fillRR(ctx, -w / 2, -h / 2, w, h, h * 0.08);
    ctx.strokeStyle = o.ink || '#4f4636'; ctx.lineWidth = Math.max(0.6, h * 0.03);
    ctx.strokeRect(-w / 2 + h * 0.08, -h / 2 + h * 0.08, w - h * 0.16, h - h * 0.16);
    ctx.beginPath(); ctx.arc(-w * 0.28, 0, h * 0.28, 0, TAU); ctx.stroke();
    P.text(ctx, text, w * 0.12, h * 0.16, h * 0.4, { color: o.ink || '#4f4636', weight: '700' });
    ctx.restore();
  };

  P.parachute = function (ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x - s, y - s * 1.6); ctx.quadraticCurveTo(x, y - s * 2.5, x + s, y - s * 1.6);
    for (let i = 4; i >= 0; i--) { const px = x - s + (i / 4) * 2 * s; ctx.quadraticCurveTo(px + s * 0.25, y - s * 1.45, px, y - s * 1.6); }
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = s * 0.03;
    ctx.beginPath(); for (let i = 0; i <= 4; i++) { ctx.moveTo(x - s + (i / 4) * 2 * s, y - s * 1.6); ctx.lineTo(x, y - s * 0.75); } ctx.stroke(); ctx.restore();
    P.person(ctx, x, y, s * 0.9, { pose: 'stand', hat: 'helmet' });
  };

  P.cat = function (ctx, x, y, s, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    ctx.beginPath();
    ctx.ellipse(x, y - 6 * s, 6 * s, 6.5 * s, 0, 0, TAU);
    ctx.moveTo(x + 4 * s + 4 * s, y - 14 * s); ctx.arc(x + 4 * s, y - 14 * s, 4 * s, 0, TAU);
    ctx.moveTo(x + 1.5 * s, y - 16.5 * s); ctx.lineTo(x + 1.8 * s, y - 21 * s); ctx.lineTo(x + 4 * s, y - 17.5 * s); ctx.closePath();
    ctx.moveTo(x + 5 * s, y - 17.5 * s); ctx.lineTo(x + 7 * s, y - 21 * s); ctx.lineTo(x + 7.6 * s, y - 16 * s); ctx.closePath();
    ctx.fill();
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 2 * s); ctx.quadraticCurveTo(x - 14 * s, y - 2 * s, x - 11 * s, y - 12 * s + (o.tail || 0) * s); ctx.stroke(); ctx.restore();
    ctx.restore();
  };

  P.dog = function (ctx, x, y, s, o) {
    o = o || {};
    ctx.save(); flip(ctx, x, o.dir);
    ctx.beginPath();
    ctx.ellipse(x, y - 12 * s, 11 * s, 5 * s, 0, 0, TAU);
    ctx.moveTo(x + 12 * s, y - 18 * s); ctx.ellipse(x + 12 * s, y - 18 * s, 4.5 * s, 4 * s, 0, 0, TAU);
    ctx.moveTo(x + 15 * s, y - 18 * s); ctx.ellipse(x + 17 * s, y - 17 * s, 3.5 * s, 2 * s, 0.2, 0, TAU);
    ctx.moveTo(x + 9 * s, y - 21 * s); ctx.lineTo(x + 10 * s, y - 26 * s); ctx.lineTo(x + 13 * s, y - 21 * s); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    [-8, -5, 6, 9].forEach((lx) => P.capsule(ctx, x + lx * s, y - 10 * s, 1.6 * s, x + lx * s, y, 1.2 * s));
    ctx.fill();
    ctx.restore();
  };

  // Uçan kuş silüeti (kanat çırpma fazı f: -1..1)
  P.bird = function (ctx, x, y, s, f) {
    const up = f === undefined ? 0.5 : f;
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y - 6 * s * up);
    ctx.quadraticCurveTo(x - 5 * s, y - 7 * s * up - 1 * s, x - 0.5 * s, y);
    ctx.quadraticCurveTo(x + 5 * s, y - 7 * s * up - 1 * s, x + 10 * s, y - 6 * s * up);
    ctx.quadraticCurveTo(x + 5 * s, y - 4 * s * up + 1.6 * s, x + 0.5 * s, y + 1.5 * s);
    ctx.quadraticCurveTo(x - 5 * s, y - 4 * s * up + 1.6 * s, x - 10 * s, y - 6 * s * up);
    ctx.fill();
  };

  P.sacks = function (ctx, x, y, w, rng) {
    ctx.beginPath();
    const n = Math.max(2, Math.round(w / 14));
    for (let row = 0; row < 3; row++) for (let i = 0; i < n - row; i++) {
      const sx = x - w / 2 + (i + row * 0.5 + 0.5) * (w / n), sy = y - row * 9 - 5;
      ctx.moveTo(sx + 7, sy); ctx.ellipse(sx, sy, 7.2, 5.2, (rng() - 0.5) * 0.3, 0, TAU);
    }
    ctx.fill();
  };

  P.chart = function (em, x, y, w, h, pts, color, o) {
    if (!em) return;
    o = o || {};
    const c = U.hex(color || '#ff5a4a');
    em.save();
    // ızgara
    em.strokeStyle = U.rgba(c, 0.18); em.lineWidth = 0.8;
    em.beginPath();
    for (let i = 0; i <= 4; i++) { em.moveTo(x, y - (h * i) / 4); em.lineTo(x + w, y - (h * i) / 4); }
    em.stroke();
    // alan
    const g = em.createLinearGradient(0, y - h, 0, y);
    g.addColorStop(0, U.rgba(c, 0.32)); g.addColorStop(1, U.rgba(c, 0));
    em.fillStyle = g;
    em.beginPath(); em.moveTo(x, y);
    pts.forEach((p, i) => em.lineTo(x + (i / (pts.length - 1)) * w, y - p * h));
    em.lineTo(x + w, y); em.closePath(); em.fill();
    em.strokeStyle = U.rgba(c, 0.95); em.lineWidth = o.lw || 2.4; em.lineJoin = 'round';
    em.beginPath();
    pts.forEach((p, i) => { const px = x + (i / (pts.length - 1)) * w, py = y - p * h; if (i) em.lineTo(px, py); else em.moveTo(px, py); });
    em.stroke();
    const lp = pts[pts.length - 1];
    em.fillStyle = U.rgba(c, 1); em.beginPath(); em.arc(x + w, y - lp * h, 3.2, 0, TAU); em.fill();
    em.restore();
    P.glow(em, x + w, y - lp * h, 16, color || '#ff5a4a', 0.6);
  };
})();
