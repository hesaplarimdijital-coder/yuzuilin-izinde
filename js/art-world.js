/* =========================================================================
   Yüzyılın İzinde — sürekli dünya çizimleri
   Uzak/orta/yakın şerit parçaları (chunk), zemin kenarı, engeller,
   platformlar, ön plan öğeleri, bulutlar ve film greni dokuları.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P;
  const TAU = U.TAU;
  const A = (IZ.ART = {});

  A.CHUNK = 1024;
  A.LAYERS = {
    far: { p: 0.1, base: -178, up: 430, down: 260, tone: '#565656', dens: 0.5 },
    mid: { p: 0.22, base: -142, up: 400, down: 220, tone: '#3a3a3a', dens: 0.6 },
    near: { p: 0.7, base: -26, up: 380, down: 60, tone: '#1b1b1b', dens: 0.9 },
  };
  // orta katmandaki tepe sırtının yaklaşık yüksekliği (katman tabanına göre): yıl rakamları buraya oturur
  A.CREST_MID = -62;

  // ------------------------------------------------------------- şerit parçaları
  // Uzak ve orta katman dekorları js/art-bg.js içinde; yakın katman çizimleri burada (dekorlar da kullanır)
  const NEAR = {};
  A.NEAR = NEAR;

  // Yakın katman: seyrek, kenarları çerçeveleyen öğeler
  function wiresAndPoles(c, r, W, h) {
    const xs = [];
    for (let x = 60 + r() * 60; x < W; x += U.lerp(320, 420, r())) xs.push(x);
    xs.forEach((x) => P.utilityPole(c, x, 0, h));
    return xs;
  }
  NEAR.rural = function (c, em, r, W, era) {
    const poles = wiresAndPoles(c, r, W, 170);
    for (let i = 0; i < poles.length - 1; i++) { P.wire(c, poles[i] - 20, -160, poles[i + 1] - 20, -160, 16, 0.8); P.wire(c, poles[i] + 20, -160, poles[i + 1] + 20, -160, 16, 0.8); }
    for (let i = 0; i < 3; i++) {
      const x = U.lerp(100, W - 100, r()), k = r();
      // yalnızca uzun öğeler: alçak çit/saman yığını gibi engele benzeyen siluetler oyuncuyu yanıltıyordu
      if (k < 0.5) P.poplar(c, x, 0, U.lerp(180, 260, r()), r);
      else if (k < 0.8) P.bareTree(c, x, 0, U.lerp(140, 200, r()), r);
      else P.broadTree(c, x, 0, U.lerp(150, 210, r()), r);
    }
    if (r() < 0.25) P.cat(c, r() * W, 0, 1.6, { dir: r.sign() });
    P.grass(c, 0, W, 0, 14, r, 0.25);
  };
  NEAR.town = function (c, em, r, W, era) {
    for (let x = 100 + r() * 100; x < W - 100; x += U.lerp(330, 460, r())) {
      const k = r();
      if (k < 0.42) P.streetLamp(c, em, x, 0, 120, 'gas');
      else if (k < 0.8) P.tree(c, x, 0, U.lerp(180, 240, r()), r.pick(['broad', 'poplar', 'cypress']), r);
      else P.person(c, x, 0, 74, { pose: r.pick(['stand', 'stand2']), hat: r.weighted(P.eraHats(era.from + 5, 'm')), coat: era.from < 1960 ? 'long' : null, dir: r.sign() });
    }
    if (r() < 0.3) P.cat(c, r() * W, 0, 1.6, { dir: r.sign() });
    P.grass(c, 0, W, 0, 10, r, 0.12);
  };
  NEAR.city = function (c, em, r, W, era) {
    for (let x = 100 + r() * 100; x < W - 100; x += U.lerp(300, 440, r())) {
      const k = r();
      if (k < 0.38) P.streetLamp(c, em, x, 0, 150, 'modern');
      else if (k < 0.6) P.tree(c, x, 0, U.lerp(170, 230, r()), 'broad', r);
      else if (k < 0.78) P.car(c, em, x, 0, 120, era.from < 1980 ? r.pick(['anadol', 'murat']) : r.pick(['murat', 'sahin', 'taxi']), { dir: r.sign(), lights: false });
      else if (k < 0.9) { c.beginPath(); c.rect(x - 2, -150, 4, 150); c.rect(x - 20, -150, 40, 30); c.fill(); }
      else P.person(c, x, 0, 74, { pose: r.pick(['stand', 'stand2', 'walk1']), hat: r.weighted(P.eraHats(era.from + 5, 'm')), dir: r.sign() });
    }
    if (r() < 0.3) P.cat(c, r() * W, 0, 1.6, { dir: r.sign() });
  };
  NEAR.modern = function (c, em, r, W, era) {
    for (let x = 100 + r() * 100; x < W - 100; x += U.lerp(300, 440, r())) {
      const k = r();
      if (k < 0.38) P.streetLamp(c, em, x, 0, 160, 'led');
      else if (k < 0.62) P.tree(c, x, 0, U.lerp(160, 220, r()), r.pick(['broad', 'young']), r);
      else if (k < 0.8) P.car(c, em, x, 0, 124, 'modern', { dir: r.sign(), lights: false });
      else if (k < 0.9) { c.beginPath(); c.rect(x - 1.5, -120, 3, 120); P.rrect(c, x - 14, -150, 28, 30, 3); c.fill(); }
      else P.person(c, x, 0, 74, { pose: r.pick(['stand', 'phone', 'walk1']), hat: r.weighted(P.eraHats(2015, 'm')), hold: r() < 0.3 ? 'phone' : null, em: em, dir: r.sign() });
    }
    if (r() < 0.3) P.cat(c, r() * W, 0, 1.6, { dir: r.sign() });
  };
  NEAR.meadow = function (c, em, r, W) {
    for (let x = 100 + r() * 100; x < W - 100; x += U.lerp(320, 480, r())) {
      if (r() < 0.6) P.youngTree(c, x, 0, U.lerp(90, 140, r()), r);
      else P.broadTree(c, x, 0, U.lerp(150, 210, r()), r);
    }
    P.grass(c, 0, W, 0, 22, r, 0.4);
    // çiçekler
    for (let i = 0; i < 26; i++) { const x = r() * W; c.beginPath(); c.arc(x, -U.lerp(8, 18, r()), 2.4, 0, TAU); c.fill(); }
  };

  // ------------------------------------------------------------- zemin kenarı
  A.groundTile = function (style, dens) {
    const W = 600, up = 30, down = 14;
    const r = U.rng(style.length * 977 + 3);
    const c = U.canvas(W * dens, (up + down) * dens), x = c.getContext('2d');
    x.setTransform(dens, 0, 0, dens, 0, up * dens);
    x.fillStyle = '#000';
    if (style === 'dirt' || style === 'meadow') {
      P.grass(x, 0, W, 1, style === 'meadow' ? 22 : 15, r, style === 'meadow' ? 0.55 : 0.4);
      x.beginPath();
      for (let i = 0; i < 14; i++) { const px = r() * W, rr = U.lerp(2, 5, r()); x.moveTo(px + rr, 1); x.ellipse(px, 1, rr * 1.4, rr, 0, Math.PI, TAU); }
      x.fill();
      if (style === 'meadow') { for (let i = 0; i < 20; i++) { const px = r() * W; x.beginPath(); x.arc(px, -U.lerp(10, 20, r()), 2.2, 0, TAU); x.fill(); } }
    } else if (style === 'cobble') {
      x.beginPath();
      for (let px = 0; px < W; px += U.lerp(10, 15, r())) { const w = U.lerp(9, 14, r()); x.moveTo(px, 1); x.quadraticCurveTo(px + w / 2, -U.lerp(4, 7, r()), px + w, 1); }
      x.fill();
      P.grass(x, 0, W, 1, 8, r, 0.08);
    } else if (style === 'curb') {
      x.fillRect(0, -7, W, 8);
      x.globalCompositeOperation = 'destination-out';
      for (let px = 0; px < W; px += 60) x.fillRect(px, -7, 1.2, 7);
      x.globalCompositeOperation = 'source-over';
      P.grass(x, 0, W, -6, 7, r, 0.05);
    } else {
      x.fillRect(0, -5, W, 6);
      x.globalCompositeOperation = 'destination-out';
      for (let px = 0; px < W; px += 40) x.fillRect(px, -5, 1, 5);
      x.globalCompositeOperation = 'source-over';
    }
    return { c: c, W: W, up: up, down: down };
  };

  // ------------------------------------------------------------- engeller
  // Engeller: belirgin bir kenar ışığı (üst ve sağ kenar parlak, sol kenar hafif) + koyu gövde.
  // Arka plandaki süslerden ayrışsınlar diye çizimde ayrıca arkalarına yumuşak bir ışıma konur.
  const RIM = 'rgba(255,238,206,0.92)', RIM2 = 'rgba(255,238,206,0.45)';
  function withRim(w, h, dens, drawShape) {
    const pad = 8;
    const c = U.canvas((w + pad * 2) * dens, (h + pad * 2) * dens), x = c.getContext('2d');
    x.setTransform(dens, 0, 0, dens, pad * dens, (h + pad) * dens);
    x.save(); x.translate(-1.6, -1.2); x.fillStyle = RIM2; x.strokeStyle = RIM2; drawShape(x, true); x.restore();
    x.save(); x.translate(2.2, -2.4); x.fillStyle = RIM; x.strokeStyle = RIM; drawShape(x, true); x.restore();
    x.fillStyle = '#0a0908'; x.strokeStyle = '#0a0908'; drawShape(x, false);
    return { c: c, w: w, h: h, pad: pad };
  }
  // engel arkası ışıma dokusu (sıcak beyaz, kenara doğru sönen)
  A.halo = function () {
    const c = U.canvas(128, 128), x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,242,220,1)'); g.addColorStop(0.45, 'rgba(255,242,220,0.45)'); g.addColorStop(1, 'rgba(255,242,220,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return c;
  };

  // w,h: görsel boyut; hit: [x0, x1, top] (sol alt köşeye göre)
  A.OBS = {
    rock: { w: 66, h: 44, hit: [8, 58, 36], draw(x, r) { x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-2, -26, 18, -34); x.quadraticCurveTo(30, -46, 46, -36); x.quadraticCurveTo(66, -30, 66, 0); x.closePath(); x.fill(); x.beginPath(); x.ellipse(52, -6, 14, 9, 0, Math.PI, TAU); x.fill(); } },
    stump: { w: 50, h: 50, hit: [8, 42, 44], draw(x) { x.beginPath(); x.moveTo(4, 0); x.quadraticCurveTo(10, -8, 12, -44); x.lineTo(38, -46); x.quadraticCurveTo(40, -8, 48, 0); x.closePath(); x.fill(); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(6, -6, 12, -10); x.lineTo(14, 0); x.fill(); x.beginPath(); x.ellipse(25, -45, 13.5, 4, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(30, -46); x.lineTo(34, -62); x.lineTo(36, -46); x.fill(); } },
    log: { w: 132, h: 36, hit: [8, 124, 30], draw(x) { x.beginPath(); P.capsule(x, 16, -16, 16, 118, -14, 14); x.fill(); x.beginPath(); x.ellipse(118, -14, 6, 13, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(60, -26); x.lineTo(70, -46); x.lineTo(74, -44); x.lineTo(68, -26); x.fill(); x.beginPath(); x.moveTo(30, -28); x.lineTo(22, -40); x.lineTo(26, -42); x.lineTo(36, -28); x.fill(); } },
    crate: { w: 56, h: 56, hit: [4, 52, 54], draw(x, rim) { x.beginPath(); P.rrect(x, 0, -56, 56, 56, 2); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.09)'; x.fillRect(4, -52, 48, 2); x.fillRect(4, -30, 48, 2); x.fillRect(4, -8, 48, 2); x.save(); x.translate(28, -28); x.rotate(-0.78); x.fillRect(-36, -1.5, 72, 3); x.restore(); x.restore(); } } },
    crates: { w: 60, h: 112, hit: [5, 55, 108], draw(x, rim) { x.beginPath(); P.rrect(x, 0, -56, 58, 56, 2); P.rrect(x, 4, -112, 54, 54, 2); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.09)'; [0, -56].forEach((o) => { x.fillRect(5, o - 50, 48, 2); x.fillRect(5, o - 28, 48, 2); x.save(); x.translate(30, o - 28); x.rotate(-0.78); x.fillRect(-34, -1.5, 68, 3); x.restore(); }); x.restore(); } } },
    // eğitim için üç kasalık kule (çift zıplama gerektirir)
    tower: { w: 62, h: 168, hit: [6, 56, 162], draw(x, rim) { x.beginPath(); P.rrect(x, 0, -56, 60, 56, 2); P.rrect(x, 3, -112, 56, 56, 2); P.rrect(x, 1, -168, 58, 56, 2); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.09)'; [0, -56, -112].forEach((o, i) => { x.fillRect(6, o - 50, 48, 2); x.fillRect(6, o - 28, 48, 2); x.save(); x.translate(31, o - 28); x.rotate(i % 2 ? 0.78 : -0.78); x.fillRect(-34, -1.5, 68, 3); x.restore(); }); x.restore(); } } },
    barrel: { w: 46, h: 62, hit: [5, 41, 58], draw(x, rim) { x.beginPath(); x.moveTo(6, 0); x.quadraticCurveTo(-4, -31, 6, -62); x.lineTo(40, -62); x.quadraticCurveTo(50, -31, 40, 0); x.closePath(); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.1)'; [-10, -50].forEach((yy) => x.fillRect(2, yy, 42, 2.5)); x.restore(); } } },
    drum: { w: 44, h: 66, hit: [4, 40, 62], draw(x, rim) { x.beginPath(); x.rect(2, -64, 40, 64); x.ellipse(22, -64, 20, 4, 0, Math.PI, TAU); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.1)'; [-20, -44].forEach((yy) => x.fillRect(2, yy, 40, 2.5)); x.restore(); } } },
    fence: { w: 100, h: 48, hit: [4, 96, 44], draw(x) { x.beginPath(); for (let i = 0; i < 7; i++) { const px = 4 + i * 15; x.moveTo(px, 0); x.lineTo(px, -40); x.lineTo(px + 4, -48); x.lineTo(px + 8, -40); x.lineTo(px + 8, 0); x.closePath(); } x.rect(0, -34, 100, 5); x.rect(0, -14, 100, 5); x.fill(); } },
    wire: { w: 112, h: 42, hit: [6, 106, 36], draw(x) { x.beginPath(); x.rect(4, -42, 4, 42); x.rect(104, -42, 4, 42); x.fill(); x.lineWidth = 1.6; x.beginPath(); for (let i = 0; i < 9; i++) x.ellipse(14 + i * 11, -18, 9, 16, 0.25, 0, TAU); x.stroke(); x.beginPath(); for (let i = 0; i < 40; i++) { const px = 6 + i * 2.6; x.moveTo(px, -36 + (i % 3) * 2); x.lineTo(px + 1.5, -39 + (i % 3) * 2); } x.stroke(); } },
    sandbags: { w: 114, h: 50, hit: [6, 108, 46], draw(x) { x.beginPath(); const rows = [[0, 5], [-17, 4], [-34, 3]]; rows.forEach((rw, ri) => { for (let i = 0; i < rw[1]; i++) { const px = 12 + ri * 12 + i * 23; x.moveTo(px + 13, rw[0] - 8); x.ellipse(px + 1, rw[0] - 8, 13, 9, 0, 0, TAU); } }); x.fill(); } },
    milk: { w: 56, h: 58, hit: [4, 52, 54], draw(x) { x.beginPath(); [4, 30].forEach((o) => { x.moveTo(o, 0); x.lineTo(o, -36); x.quadraticCurveTo(o + 2, -44, o + 6, -46); x.lineTo(o + 6, -54); x.lineTo(o + 16, -54); x.lineTo(o + 16, -46); x.quadraticCurveTo(o + 20, -44, o + 22, -36); x.lineTo(o + 22, 0); x.closePath(); }); x.fill(); } },
    hay: { w: 86, h: 58, hit: [6, 80, 54], draw(x, rim) { x.beginPath(); x.ellipse(43, -29, 43, 29, 0, 0, TAU); x.fill(); if (!rim) { x.save(); x.strokeStyle = 'rgba(255,240,210,0.08)'; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(43, -29, 40 - i * 9, 26 - i * 6, 0, 0, TAU); x.stroke(); } x.restore(); } } },
    bench: { w: 104, h: 46, hit: [4, 100, 26], draw(x) { x.beginPath(); x.rect(0, -24, 104, 5); x.rect(2, -44, 100, 4); x.rect(2, -36, 100, 4); x.rect(8, -24, 4, 24); x.rect(92, -24, 4, 24); x.rect(10, -44, 3, 20); x.rect(91, -44, 3, 20); x.fill(); } },
    bins: { w: 52, h: 64, hit: [4, 48, 60], draw(x) { x.beginPath(); x.moveTo(4, -56); x.lineTo(8, 0); x.lineTo(44, 0); x.lineTo(48, -56); x.closePath(); P.rrect(x, 0, -64, 52, 9, 3); x.fill(); } },
    tires: { w: 72, h: 54, hit: [4, 68, 50], draw(x) { x.beginPath(); [0, -18, -36].forEach((o, i) => { x.moveTo(72 - i * 2, o - 9); x.ellipse(36, o - 9, 36 - i * 2, 9, 0, 0, TAU); }); x.fill(); } },
    gas: { w: 72, h: 64, hit: [4, 68, 58], draw(x) { x.beginPath(); [2, 38].forEach((o) => { P.rrect(x, o, -56, 32, 56, 14); x.rect(o + 11, -64, 10, 9); }); x.fill(); } },
    suitcase: { w: 78, h: 60, hit: [4, 74, 56], draw(x) { x.beginPath(); P.rrect(x, 0, -28, 78, 28, 4); P.rrect(x, 8, -52, 60, 24, 4); x.rect(30, -60, 18, 3); x.rect(30, -60, 3, 9); x.rect(45, -60, 3, 9); x.fill(); } },
    cone: { w: 62, h: 50, hit: [6, 56, 44], draw(x, rim) { x.beginPath(); [0, 32].forEach((o) => { x.rect(o, -4, 30, 4); x.moveTo(o + 4, -4); x.lineTo(o + 13, -48); x.lineTo(o + 17, -48); x.lineTo(o + 26, -4); x.closePath(); }); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.16)'; [0, 32].forEach((o) => { x.fillRect(o + 9, -30, 12, 4); x.fillRect(o + 7, -18, 16, 4); }); x.restore(); } } },
    barrier: { w: 124, h: 52, hit: [6, 118, 46], draw(x) { x.beginPath(); x.moveTo(0, 0); x.lineTo(14, -14); x.lineTo(30, -50); x.lineTo(94, -50); x.lineTo(110, -14); x.lineTo(124, 0); x.closePath(); x.fill(); } },
    barrier2: { w: 112, h: 58, hit: [4, 108, 54], draw(x, rim) { x.beginPath(); x.rect(0, -58, 112, 30); x.rect(10, -28, 6, 28); x.rect(96, -28, 6, 28); x.rect(2, -4, 22, 4); x.rect(88, -4, 22, 4); x.fill(); if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.13)'; for (let i = 0; i < 6; i++) { x.save(); x.translate(10 + i * 18, -43); x.rotate(-0.7); x.fillRect(-4, -14, 8, 28); x.restore(); } x.restore(); } } },
    rubble: { w: 124, h: 58, hit: [10, 114, 46], draw(x) { const r = U.rng(77); P.rubble(x, 0, 124, 0, 52, r); } },
    scooter: { w: 80, h: 52, hit: [4, 76, 30], draw(x) { x.beginPath(); x.rect(6, -12, 58, 5); x.rect(60, -52, 4, 44); x.rect(52, -52, 18, 4); x.fill(); P.wheel(x, 12, -6, 6); P.wheel(x, 64, -6, 6); x.beginPath(); x.rect(0, -30, 30, 6); x.fill(); } },
    cart: { w: 68, h: 66, hit: [4, 64, 50], draw(x) { x.beginPath(); P.rrect(x, 6, -58, 52, 46, 6); x.rect(52, -66, 4, 20); x.rect(52, -66, 16, 4); x.fill(); P.wheel(x, 14, -6, 6); P.wheel(x, 50, -6, 6); x.beginPath(); for (let i = 0; i < 5; i++) { x.moveTo(20 + i * 8 + 5, -60); x.arc(20 + i * 8, -60, 5, 0, TAU); } x.fill(); } },
  };

  // ------------------------------------------------------------- döneme özgü engeller
  // Her dönemin kendi eşyaları: Kurtuluş yıllarında cephane sandıkları ve kağnı tekerleği,
  // savaş yıllarında kum torbası ve bidonlar, 50'lerde saman ve traktör lastiği, 60–70'lerde
  // tüp, briket ve beton boru, 80–90'larda su deposu ve çanak anten, 2000'lerde kargo kolileri…
  const TEX = 'rgba(255,240,210,0.11)', TEX2 = 'rgba(255,240,210,0.18)';
  const tex = (x, fn) => { x.save(); x.fillStyle = TEX; x.strokeStyle = TEX; fn(x); x.restore(); };
  function ammoBox(x, ox, oy, w, h, rim) {
    x.beginPath(); P.rrect(x, ox + 2, oy - h + 4, w - 4, h - 4, 2); x.rect(ox, oy - h, w, 6); x.fill();
    x.lineWidth = 2.2;
    x.beginPath(); x.arc(ox + 2, oy - h * 0.5, 5, Math.PI * 0.5, Math.PI * 1.5); x.stroke();
    x.beginPath(); x.arc(ox + w - 2, oy - h * 0.5, 5, -Math.PI * 0.5, Math.PI * 0.5); x.stroke();
    if (!rim) tex(x, (t) => { t.fillRect(ox + 6, oy - h * 0.62, w - 12, 1.6); t.fillRect(ox + 6, oy - h * 0.3, w - 12, 1.6); t.fillStyle = TEX2; t.fillRect(ox + w * 0.36, oy - h * 0.55, w * 0.28, 2.4); t.fillRect(ox + w * 0.42, oy - h * 0.45, w * 0.16, 2.4); });
  }
  function sandbagRows(x, w, rows) {
    x.beginPath();
    for (let rr = 0; rr < rows; rr++) {
      const y = -9 - rr * 19, n = rr % 2 ? 3 : 3, off = rr % 2 ? 11 : 0;
      for (let i = 0; i < n; i++) { const cx = 12 + off + i * ((w - 24 - off) / Math.max(1, n - 1)); x.moveTo(cx + 13, y); x.ellipse(cx, y, 13.5, 10, 0, 0, TAU); }
    }
    x.fill();
  }
  function tire(x, cx, cy, r, rim) {
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    // diş blokları
    x.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; x.save(); x.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.rotate(a); x.rect(-1.5, -3.5, 4, 7); x.restore(); }
    x.fill();
    if (!rim) tex(x, (t) => { t.lineWidth = 2; t.beginPath(); t.arc(cx, cy, r * 0.48, 0, TAU); t.stroke(); t.beginPath(); t.arc(cx, cy, r * 0.16, 0, TAU); t.fill(); });
  }
  function parcel(x, ox, oy, w, h, rim) {
    x.beginPath(); x.rect(ox, oy - h, w, h); x.fill();
    if (!rim) tex(x, (t) => { t.fillStyle = TEX2; t.fillRect(ox + w * 0.45, oy - h, w * 0.1, h); t.fillStyle = TEX; t.fillRect(ox + 3, oy - h * 0.3, w * 0.3, 1.4); });
  }
  Object.assign(A.OBS, {
    // --- 1920–1938
    ammo: { w: 66, h: 40, hit: [3, 63, 38], draw(x, rim) { ammoBox(x, 0, 0, 66, 40, rim); } },
    ammoStack: { w: 68, h: 112, hit: [8, 60, 108], draw(x, rim) { ammoBox(x, 0, 0, 68, 38, rim); ammoBox(x, 4, -38, 62, 36, rim); ammoBox(x, 1, -74, 64, 38, rim); } },
    kagni: { w: 60, h: 60, hit: [9, 51, 54], draw(x, rim) {
      x.beginPath(); x.arc(30, -30, 29, 0, TAU); x.fill();
      x.beginPath(); x.rect(27, -60, 6, 6); x.fill();
      if (!rim) tex(x, (t) => { t.fillRect(16, -55, 1.6, 50); t.fillRect(29, -59, 1.6, 58); t.fillRect(42, -55, 1.6, 50); t.fillStyle = TEX2; t.fillRect(24, -36, 12, 12); t.lineWidth = 2; t.beginPath(); t.arc(30, -30, 24, 0, TAU); t.stroke(); });
    } },
    sacks: { w: 84, h: 44, hit: [6, 78, 40], draw(x, rim) {
      x.beginPath();
      [[16, -12], [42, -12], [68, -12], [29, -32], [55, -32]].forEach((p) => { x.moveTo(p[0] + 15, p[1]); x.ellipse(p[0], p[1], 15.5, 11.5, 0, 0, TAU); });
      [[29, -44], [55, -44]].forEach((p) => { x.moveTo(p[0] - 4, p[1] + 4); x.lineTo(p[0] - 2, p[1] - 2); x.lineTo(p[0] + 2, p[1] - 2); x.lineTo(p[0] + 4, p[1] + 4); x.closePath(); });
      x.fill();
      if (!rim) tex(x, (t) => { t.fillRect(8, -14, 16, 1.4); t.fillRect(34, -14, 16, 1.4); t.fillRect(60, -14, 16, 1.4); t.fillRect(21, -34, 16, 1.4); t.fillRect(47, -34, 16, 1.4); });
    } },
    milestone: { w: 34, h: 56, hit: [5, 29, 52], draw(x, rim) {
      x.beginPath(); x.rect(0, -6, 34, 6); x.moveTo(4, -6); x.lineTo(4, -40); x.quadraticCurveTo(4, -56, 17, -56); x.quadraticCurveTo(30, -56, 30, -40); x.lineTo(30, -6); x.closePath(); x.fill();
      if (!rim) tex(x, (t) => { t.fillStyle = TEX2; t.fillRect(9, -40, 16, 2); t.fillRect(11, -32, 12, 2); t.fillRect(13, -24, 8, 2); });
    } },
    // --- 1938–1950
    jerrycan: { w: 58, h: 46, hit: [3, 55, 42], draw(x, rim) {
      x.beginPath();
      [2, 31].forEach((o) => { P.rrect(x, o, -40, 25, 40, 3); x.rect(o + 4, -46, 10, 6); x.rect(o + 18, -45, 5, 5); });
      x.fill();
      if (!rim) tex(x, (t) => { t.lineWidth = 1.6; [2, 31].forEach((o) => { t.beginPath(); t.moveTo(o + 4, -36); t.lineTo(o + 21, -6); t.moveTo(o + 21, -36); t.lineTo(o + 4, -6); t.stroke(); }); });
    } },
    sandbagTall: { w: 72, h: 108, hit: [5, 67, 104], draw(x) { sandbagRows(x, 72, 6); } },
    // --- 1950–1960
    tractorTire: { w: 64, h: 64, hit: [8, 56, 58], draw(x, rim) { tire(x, 32, -32, 31, rim); } },
    wheelbarrow: { w: 80, h: 48, hit: [6, 74, 40], draw(x, rim) {
      x.beginPath(); x.moveTo(6, -36); x.lineTo(60, -36); x.lineTo(52, -12); x.lineTo(16, -12); x.closePath();
      x.moveTo(8, -35); x.quadraticCurveTo(34, -58, 58, -35); x.closePath();
      x.rect(4, -38, 58, 4); x.fill();
      x.lineWidth = 4.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(52, -20); x.lineTo(77, -32); x.moveTo(20, -13); x.lineTo(16, -1); x.stroke(); x.lineCap = 'butt';
      x.beginPath(); x.arc(62, -10, 10, 0, TAU); x.fill();
      if (!rim) tex(x, (t) => { t.beginPath(); t.arc(62, -10, 3, 0, TAU); t.fill(); t.fillRect(12, -30, 42, 1.4); });
    } },
    hayStack: { w: 72, h: 108, hit: [5, 67, 104], draw(x, rim) {
      x.beginPath(); P.rrect(x, 0, -52, 72, 52, 6); P.rrect(x, 4, -108, 64, 56, 6); x.fill();
      if (!rim) tex(x, (t) => { [[0, -52, 72], [4, -108, 64]].forEach((b) => { t.fillRect(b[0] + b[2] * 0.3, b[1] + 2, 2, 48); t.fillRect(b[0] + b[2] * 0.68, b[1] + 2, 2, 48); }); for (let i = 0; i < 9; i++) t.fillRect(6 + i * 7, -54 - (i % 3) * 18, 4, 1.2); });
    } },
    // --- 1960–1980
    bricks: { w: 80, h: 44, hit: [4, 76, 40], draw(x, rim) {
      x.beginPath(); x.rect(0, -6, 80, 6);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - (r === 2 ? 1 : 0); i++) x.rect(2 + i * 19 + (r === 2 ? 9 : 0), -18 - r * 12.5, 18, 12);
      x.fill();
      if (!rim) tex(x, (t) => { for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { t.fillRect(6 + i * 19 + (r === 2 ? 9 : 0), -14 - r * 12.5, 4, 4); t.fillRect(12 + i * 19 + (r === 2 ? 9 : 0), -14 - r * 12.5, 4, 4); } });
    } },
    pipe: { w: 86, h: 50, hit: [4, 82, 46], draw(x, rim) {
      x.beginPath(); x.rect(14, -48, 60, 48); x.ellipse(74, -24, 10, 24, 0, -Math.PI / 2, Math.PI / 2); x.ellipse(14, -24, 12, 24, 0, 0, TAU); x.fill();
      if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.16)'; x.beginPath(); x.ellipse(14, -24, 8, 17, 0, 0, TAU); x.fill(); x.fillStyle = '#0a0908'; x.beginPath(); x.ellipse(15, -24, 6.5, 15, 0, 0, TAU); x.fill(); x.restore(); tex(x, (t) => { t.fillRect(30, -44, 1.4, 40); t.fillRect(54, -44, 1.4, 40); }); }
    } },
    blockStack: { w: 66, h: 108, hit: [4, 62, 104], draw(x, rim) {
      x.beginPath(); x.rect(0, -6, 66, 6);
      for (let r = 0; r < 8; r++) for (let i = 0; i < 3; i++) x.rect(2 + i * 21 + (r % 2 ? 4 : 0) - (r % 2 && i === 2 ? 8 : 0), -18 - r * 12.6, 20, 12);
      x.fill();
      if (!rim) tex(x, (t) => { for (let r = 0; r < 8; r++) for (let i = 0; i < 3; i++) t.fillRect(8 + i * 21 + (r % 2 ? 4 : 0), -14 - r * 12.6, 5, 4); });
    } },
    // --- 1980–2002
    waterTank: { w: 52, h: 62, hit: [4, 48, 58], draw(x, rim) {
      x.beginPath(); P.rrect(x, 2, -54, 48, 54, 6); x.ellipse(26, -54, 24, 5, 0, Math.PI, TAU); x.rect(20, -62, 12, 5); x.fill();
      if (!rim) tex(x, (t) => { for (let i = 0; i < 4; i++) t.fillRect(4, -46 + i * 12, 44, 1.6); });
    } },
    dish: { w: 66, h: 60, hit: [6, 60, 50], draw(x, rim) {
      x.beginPath(); x.rect(12, -12, 42, 12); x.rect(30, -34, 6, 24); x.fill();
      x.save(); x.translate(33, -38); x.rotate(-0.42);
      x.beginPath(); x.ellipse(0, 0, 30, 11, 0, 0, Math.PI); x.lineTo(-30, 0); x.closePath(); x.fill();
      x.lineWidth = 2.6; x.beginPath(); x.moveTo(-24, 2); x.lineTo(0, 26); x.lineTo(24, 2); x.stroke();
      x.beginPath(); x.rect(-4, 23, 8, 6); x.fill();
      x.restore();
      if (!rim) tex(x, (t) => { t.save(); t.translate(33, -38); t.rotate(-0.42); t.fillStyle = TEX2; t.beginPath(); t.ellipse(0, 1.5, 22, 6, 0, 0, Math.PI); t.fill(); t.restore(); t.fillRect(16, -8, 34, 1.4); });
    } },
    tireStack: { w: 64, h: 108, hit: [4, 60, 104], draw(x, rim) {
      x.beginPath();
      for (let i = 0; i < 6; i++) { const y = -9 - i * 18; x.moveTo(64 - (i % 2) * 3, y); x.ellipse(32, y, 32 - (i % 2) * 3, 9.5, 0, 0, TAU); x.rect(2 + (i % 2) * 3, y, 60 - (i % 2) * 6, 9); }
      x.fill();
      if (!rim) tex(x, (t) => { for (let i = 0; i < 6; i++) t.fillRect(8, -10 - i * 18, 48, 1.4); });
    } },
    // --- 2002–2026
    parcels: { w: 72, h: 48, hit: [4, 68, 44], draw(x, rim) { parcel(x, 0, 0, 38, 26, rim); parcel(x, 36, 0, 34, 30, rim); parcel(x, 14, -26, 36, 22, rim); } },
    parcelStack: { w: 66, h: 110, hit: [4, 62, 106], draw(x, rim) { parcel(x, 0, 0, 66, 30, rim); parcel(x, 4, -30, 58, 28, rim); parcel(x, 0, -58, 62, 26, rim); parcel(x, 8, -84, 50, 26, rim); } },
    // --- gelecek
    pod: { w: 58, h: 50, hit: [5, 53, 46], draw(x, rim) {
      x.beginPath(); P.rrect(x, 4, -40, 50, 30, 10); x.ellipse(29, -40, 18, 10, 0, Math.PI, TAU); x.fill();
      P.wheel(x, 14, -8, 7); P.wheel(x, 44, -8, 7);
      if (!rim) { x.save(); x.fillStyle = 'rgba(190,232,255,0.4)'; x.beginPath(); x.ellipse(29, -42, 11, 5, 0, Math.PI, TAU); x.fill(); x.fillRect(10, -26, 38, 2); x.restore(); }
    } },
    planter: { w: 86, h: 46, hit: [4, 82, 34], draw(x, rim) {
      x.beginPath(); x.rect(0, -26, 86, 26); x.rect(-2, -28, 90, 4);
      for (let i = 0; i < 6; i++) { const cx = 8 + i * 14; x.moveTo(cx, -28); x.quadraticCurveTo(cx - 6, -40, cx - 2, -46); x.quadraticCurveTo(cx + 2, -36, cx + 4, -28); x.moveTo(cx + 4, -28); x.quadraticCurveTo(cx + 10, -38, cx + 8, -44); x.quadraticCurveTo(cx + 4, -34, cx + 2, -28); }
      x.fill();
      if (!rim) tex(x, (t) => { t.fillRect(4, -14, 78, 1.4); });
    } },
    battery: { w: 54, h: 110, hit: [4, 50, 104], draw(x, rim) {
      x.beginPath(); P.rrect(x, 4, -96, 46, 96, 4); x.rect(0, -6, 54, 6);
      x.moveTo(-2, -100); x.lineTo(56, -110); x.lineTo(56, -104); x.lineTo(-2, -94); x.closePath(); x.rect(26, -100, 3, 6); x.fill();
      if (!rim) { x.save(); x.fillStyle = 'rgba(170,255,210,0.45)'; for (let i = 0; i < 4; i++) x.fillRect(14, -80 + i * 14, 26 * (i === 3 ? 0.5 : 1), 6); x.restore(); }
    } },
    // --- kuleler (~170 birim): tek zıplamayla aşılmaz, çift zıplama ister; seyrek çıkar
    ammoTower: { w: 68, h: 182, hit: [8, 60, 178], draw(x, rim) { for (let i = 0; i < 5; i++) ammoBox(x, i % 2 ? 3 : 0, -i * 36, i % 2 ? 62 : 68, 38, rim); } },
    sandbagTower: { w: 72, h: 190, hit: [5, 67, 184], draw(x) { sandbagRows(x, 72, 10); } },
    hayTower: { w: 72, h: 184, hit: [5, 67, 178], draw(x, rim) {
      const bales = [[0, -52, 72, 52], [4, -100, 64, 48], [1, -144, 70, 44], [5, -184, 62, 40]];
      x.beginPath(); bales.forEach((b) => P.rrect(x, b[0], b[1], b[2], b[3], 6)); x.fill();
      if (!rim) tex(x, (t) => { bales.forEach((b) => { t.fillRect(b[0] + b[2] * 0.3, b[1] + 2, 2, b[3] - 4); t.fillRect(b[0] + b[2] * 0.68, b[1] + 2, 2, b[3] - 4); }); for (let i = 0; i < 14; i++) t.fillRect(6 + (i % 9) * 7, -54 - (i % 5) * 24, 4, 1.2); });
    } },
    blockTower: { w: 66, h: 182, hit: [4, 62, 176], draw(x, rim) {
      x.beginPath(); x.rect(0, -6, 66, 6);
      for (let r = 0; r < 13; r++) for (let i = 0; i < 3; i++) x.rect(2 + i * 21 + (r % 2 ? 4 : 0) - (r % 2 && i === 2 ? 8 : 0), -18 - r * 12.6, 20, 12);
      x.fill();
      if (!rim) tex(x, (t) => { for (let r = 0; r < 13; r++) for (let i = 0; i < 3; i++) t.fillRect(8 + i * 21 + (r % 2 ? 4 : 0), -14 - r * 12.6, 5, 4); });
    } },
    tireTower: { w: 64, h: 182, hit: [4, 60, 176], draw(x, rim) {
      x.beginPath();
      for (let i = 0; i < 10; i++) { const y = -9 - i * 18; x.moveTo(64 - (i % 2) * 3, y); x.ellipse(32, y, 32 - (i % 2) * 3, 9.5, 0, 0, TAU); x.rect(2 + (i % 2) * 3, y, 60 - (i % 2) * 6, 9); }
      x.fill();
      if (!rim) tex(x, (t) => { for (let i = 0; i < 10; i++) t.fillRect(8, -10 - i * 18, 48, 1.4); });
    } },
    parcelTower: { w: 66, h: 184, hit: [4, 62, 178], draw(x, rim) { parcel(x, 0, 0, 66, 30, rim); parcel(x, 4, -30, 58, 28, rim); parcel(x, 0, -58, 62, 26, rim); parcel(x, 8, -84, 50, 26, rim); parcel(x, 2, -110, 60, 30, rim); parcel(x, 6, -140, 52, 30, rim); parcel(x, 12, -170, 42, 14, rim); } },
    batteryTower: { w: 54, h: 182, hit: [4, 50, 176], draw(x, rim) {
      x.beginPath(); P.rrect(x, 4, -168, 46, 168, 4); x.rect(0, -6, 54, 6);
      x.moveTo(-2, -172); x.lineTo(56, -182); x.lineTo(56, -176); x.lineTo(-2, -166); x.closePath(); x.rect(26, -172, 3, 6); x.fill();
      if (!rim) { x.save(); x.fillStyle = 'rgba(170,255,210,0.45)'; for (let i = 0; i < 9; i++) x.fillRect(14, -152 + i * 15, 26 * (i === 8 ? 0.5 : 1), 6); x.restore(); }
    } },
  });

  // Platformlar: üstüne çıkılabilen düz yüzeyli araçlar. h = üst yüzey yüksekliği.
  A.PLAT = {
    cart: { w: 230, h: 66, draw(x, rim) {
      x.beginPath(); x.rect(0, -66, 230, 12); for (let i = 0; i < 9; i++) x.rect(4 + i * 26, -80, 3, 14); x.rect(0, -82, 230, 3);
      x.moveTo(226, -60); x.lineTo(300, -40); x.lineTo(300, -36); x.lineTo(226, -54); x.closePath(); x.fill();
      P.wheel(x, 50, -26, 26, { spokes: 8 }); P.wheel(x, 180, -26, 26, { spokes: 8 });
    } },
    wagon: { w: 380, h: 118, draw(x, rim) {
      x.beginPath(); x.rect(8, -114, 364, 98); x.moveTo(0, -112); x.quadraticCurveTo(190, -124, 380, -112); x.lineTo(380, -108); x.lineTo(0, -108); x.closePath(); x.rect(4, -18, 372, 6); x.fill();
      [50, 90, 290, 330].forEach((w) => P.wheel(x, w, -9, 9, { spokes: 6 }));
      if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.08)'; for (let i = 0; i < 8; i++) x.fillRect(26 + i * 44, -96, 26, 30); x.restore(); }
    } },
    bus: { w: 360, h: 112, draw(x, rim) {
      x.beginPath(); x.moveTo(6, -16); x.lineTo(6, -100); x.quadraticCurveTo(8, -112, 24, -112); x.lineTo(340, -112); x.quadraticCurveTo(356, -110, 356, -90); x.lineTo(356, -16); x.closePath(); x.fill();
      P.wheel(x, 70, -14, 15); P.wheel(x, 290, -14, 15);
      if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.08)'; for (let i = 0; i < 9; i++) x.fillRect(22 + i * 36, -96, 28, 32); x.restore(); }
    } },
    truck: { w: 400, h: 120, draw(x, rim) {
      x.beginPath(); x.rect(0, -120, 400, 96); x.rect(4, -26, 392, 6); x.fill();
      [40, 76, 330, 366].forEach((w) => P.wheel(x, w, -12, 12));
      if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.06)'; for (let i = 1; i < 40; i++) x.fillRect(i * 10, -114, 1.4, 84); x.restore(); }
    } },
    container: { w: 300, h: 114, draw(x, rim) {
      x.beginPath(); x.rect(0, -114, 300, 114); x.fill();
      if (!rim) { x.save(); x.fillStyle = 'rgba(255,240,210,0.06)'; for (let i = 1; i < 30; i++) x.fillRect(i * 10, -108, 1.4, 102); x.restore(); }
    } },
  };

  const obsCache = {};
  A.obsSprite = function (type, dens) {
    const key = type + '@' + dens.toFixed(2);
    if (obsCache[key]) return obsCache[key];
    const def = A.OBS[type] || A.PLAT[type];
    const sp = withRim(def.w, def.h, dens, (x, rim) => def.draw(x, rim, U.rng(31)));
    obsCache[key] = sp;
    return sp;
  };
  A.clearCaches = function () { for (const k in obsCache) delete obsCache[k]; };

  // ------------------------------------------------------------- ön plan
  A.FG = {
    grass(x, r) { P.grass(x, -40, 260, 0, 120, r, 0.7); },
    reeds(x, r) { x.save(); x.lineWidth = 3; x.lineCap = 'round'; for (let i = 0; i < 14; i++) { const px = r() * 160, h = U.lerp(120, 260, r()); x.beginPath(); x.moveTo(px, 0); x.quadraticCurveTo(px + 10, -h * 0.5, px + U.lerp(-20, 30, r()), -h); x.stroke(); x.beginPath(); x.ellipse(px + 5, -h * 0.9, 4, 14, 0.2, 0, TAU); x.fill(); } x.restore(); },
    post(x, r) { x.beginPath(); x.rect(40, -340, 22, 360); x.fill(); P.grass(x, 0, 120, 0, 60, r, 0.5); },
    fencepost(x, r) { x.beginPath(); x.rect(20, -170, 16, 190); x.rect(120, -150, 14, 170); x.fill(); x.lineWidth = 2; x.beginPath(); x.moveTo(0, -120); x.quadraticCurveTo(80, -100, 160, -110); x.moveTo(0, -70); x.quadraticCurveTo(80, -55, 160, -60); x.stroke(); P.grass(x, -20, 180, 0, 50, r, 0.4); },
    rock(x, r) { x.beginPath(); x.moveTo(-10, 10); x.quadraticCurveTo(10, -80, 90, -90); x.quadraticCurveTo(170, -70, 200, 10); x.closePath(); x.fill(); P.grass(x, -20, 220, 0, 50, r, 0.3); },
    thistle(x, r) { x.save(); x.lineWidth = 3; for (let i = 0; i < 5; i++) { const px = 20 + i * 26, h = U.lerp(90, 170, r()); x.beginPath(); x.moveTo(px, 0); x.lineTo(px + 4, -h); x.stroke(); x.beginPath(); x.arc(px + 4, -h, 10, 0, TAU); x.fill(); for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k - 3.5) * 0.3; x.beginPath(); x.moveTo(px + 4, -h); x.lineTo(px + 4 + Math.cos(a) * 18, -h + Math.sin(a) * 18); x.stroke(); } } x.restore(); P.grass(x, 0, 160, 0, 40, r, 0.4); },
  };

  A.fgSprite = function (kind, dens, seed) {
    const W = 300, up = 380, down = 30;
    const d = dens * 0.35;
    const c = U.canvas(W * d, (up + down) * d), x = c.getContext('2d');
    x.setTransform(d, 0, 0, d, 40 * d, up * d);
    x.fillStyle = '#070606'; x.strokeStyle = '#070606';
    (A.FG[kind] || A.FG.grass)(x, U.rng(seed || 5));
    const b = U.blurCanvas(c, 3.5 * d * 2.5);
    return { c: b, W: W, up: up, down: down, ox: 40 };
  };

  // ------------------------------------------------------------- bulutlar ve gren
  A.cloud = function (seed, w, h) {
    const r = U.rng(seed);
    const c = U.canvas(w, h), x = c.getContext('2d');
    for (let i = 0; i < 26; i++) {
      const px = U.lerp(w * 0.12, w * 0.88, r()), py = U.lerp(h * 0.42, h * 0.72, r()) - Math.sin((px / w) * Math.PI) * h * 0.18;
      const rr = U.lerp(h * 0.14, h * 0.32, r());
      const g = x.createRadialGradient(px, py, 0, px, py, rr);
      g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.6, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
    }
    return c;
  };

  A.grain = function (n) {
    const out = [];
    for (let k = 0; k < (n || 3); k++) {
      const c = U.canvas(160, 160), x = c.getContext('2d');
      const img = x.createImageData(160, 160);
      for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      x.putImageData(img, 0, 0);
      out.push(c);
    }
    return out;
  };

  A.scanlines = function () {
    const c = U.canvas(4, 4), x = c.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, 0, 4, 1.2);
    return c;
  };
})();
