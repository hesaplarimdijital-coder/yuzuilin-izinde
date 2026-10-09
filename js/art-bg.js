/* =========================================================================
   Yüzyılın İzinde — arka plan dekorları
   Uzak / orta / yakın şeritler artık tek bir "köy" görüntüsü değil: olayın
   geçtiği yere ve yıla göre değişen dekorlar çizilir.
     kirsal   Anadolu kırsalı (kerpiç köyler → traktör, elektrik → güneş paneli)
     kent     Anadolu kenti (kasaba → apartman ve gecekondu → TOKİ ve kuleler)
     ankara   Başkent (kale, Cumhuriyet yapıları, Anıtkabir, Kocatepe, Atakule…)
     istanbul Tarihî yarımada, Boğaz, köprüler, gökdelenler
     sanayi   Fabrikalar, demiryolu, liman vinçleri
     sahil    Deniz kıyısı: burunlar, tekneler, karşı kıyıda dağlar
     dogu     Doğu ve Güneydoğu'nun dağları, taş evler
     gelecek  Rüzgâr türbinleri, yeşil kuleler
   Tepe çizgisi her katmanda dekordan bağımsız ve dünya koordinatında süreklidir:
   farklı dekorlar yan yana gelince ufuk çizgisi kopmaz.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P, A = IZ.ART;
  const TAU = U.TAU;
  const inner = (r, W, m) => U.lerp(m, W - m, r());
  const SET = (A.BG = {});

  // ------------------------------------------------------------- ortak arazi
  const TER = {
    far: { y: -16, amp: 104, freq: 0.0019, seed: 101 },
    mid: { y: -6, amp: 56, freq: 0.0029, seed: 201 },
  };
  // o.flat: 0..1 arası bir fonksiyon (x → yükseklik çarpanı). Kıyı/vadi için arazi parça içinde
  // alçalır; parça kenarlarında çarpan 1'dir, böylece komşu parçayla dikiş olmaz.
  function terrain(c, layer, W, gx, r, o) {
    o = o || {};
    const T = TER[layer];
    const base = (x) => {
      const n = U.fbm1((x + gx) * T.freq, T.seed, 4);
      return T.y - T.amp * n;
    };
    const flat = o.flat || null, sea = o.sea === undefined ? 4 : o.sea;
    const surf = flat ? (x) => { const f = flat(x); return sea + (base(x) - sea) * f; } : base;
    c.beginPath();
    c.moveTo(-2, 400);
    for (let x = -2; x <= W + 10; x += 8) c.lineTo(x, surf(x));
    c.lineTo(W + 2, 400);
    c.closePath();
    c.fill();
    return surf;
  }
  // parça kenarlarında 1, ortada 0'a inen yumuşak çarpan (kıyı, vadi)
  const edgeFlat = (W, a, b) => (x) => 1 - U.smoothstep(a, b, x) * (1 - U.smoothstep(W - b, W - a, x));

  // tepe yüzeyine birkaç yapı dizer (P.onHills sarmalayıcısı)
  function row(s, x0, x1, r, n, size, draw, gapMin, gapMax, sink) {
    return P.onHills(s, x0, x1, r, n, size, draw, { gapMin: gapMin || 0, gapMax: gapMax || 8, sink: sink === undefined ? 2 : sink });
  }
  const at = (s, x, w) => (w ? Math.max(s(x - w / 2), s(x + w / 2), s(x)) : s(x)) + 3;
  // Küçük kubbeli cami: tek başına minare çizilmez (yanındaki beşik çatılı evle birlikte üçgen
  // çatılı bir yapı gibi görünüyordu). Türkiye'deki camiler gibi gövde + kubbe + minare.
  // h: minare boyu
  function camii(c, em, s, x, h, r, n) {
    const R = h / 3.7;
    P.mosque(c, em, x, at(s, x, R * 3.2), R, { minarets: n || 1, minH: h, lit: 0.2 }, r);
  }

  // yumuşak duman sütunu (açık ton, düşük opaklık)
  function smoke(c, x, y, h, r, a) {
    c.save();
    c.globalAlpha = a || 0.18;
    c.fillStyle = '#d8d2c6';
    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      c.beginPath();
      c.arc(x + u * h * 0.45 + (r() - 0.5) * 6, y - u * h, 5 + u * h * 0.12, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  // uzak dağ silsilesi (açık tonda, arazinin arkasında)
  function range(c, W, r, y, hMin, hMax, alpha, snow) {
    const peaks = [];
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) peaks.push([U.lerp(80, W - 80, (i + 0.2 + r() * 0.6) / n), U.lerp(hMin, hMax, r())]);
    c.save();
    c.globalAlpha = alpha;
    P.mountains(c, 0, W, y, peaks, r, { sag: 0.24, jag: 8 });
    c.restore();
    if (snow) {
      // kar yalnızca dağın üstüne düşsün (zirve kapakları gökyüzüne taşmasın)
      c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 0.85;
      P.snowCaps(c, peaks.map((p) => [p[0], p[1] + 6]), y, '#e9e6df', r);
      c.restore();
    }
    return peaks;
  }
  // çatıya uydu çanağı / TV anteni
  function roofGear(c, x, y, w, year, r) {
    if (year >= 1994 && r() < 0.55) P.dish(c, x + (r() - 0.5) * w * 0.6, y - 3, U.lerp(3, 4.5, r()), -0.4);
    else if (year >= 1968 && year < 2005 && r() < 0.5) P.antennaTV(c, x + (r() - 0.5) * w * 0.5, y, U.lerp(8, 13, r()));
  }
  // dönemine göre apartman
  function apt(c, em, x, y, w, floors, year, r, lit) {
    P.apartment(c, em, x, y, w, floors, { year: year, lit: lit === undefined ? 0.35 : lit, fh: 13, balcony: year >= 1965 && r() < 0.6 }, r);
    roofGear(c, x, y - floors * 13 - 4, w, year, r);
  }
  // gecekondu kümesi (yamaçta küçük, sık evler)
  function gecekondu(c, em, s, x0, x1, r, n) {
    row(s, x0, x1, r, n, (rr) => [U.lerp(16, 26, rr()), U.lerp(12, 18, rr())], (x, y, w, h) => P.house(c, em, x, y, w, h, { floors: 1, door: false, chimney: r() < 0.5, lit: 0.45 }, r), 0, 6, 3);
  }
  // sera sırası (alçak kemerler)
  function greenhouses(c, x0, x1, y) {
    c.beginPath();
    for (let x = x0; x < x1 - 30; x += 34) { c.moveTo(x, y); c.quadraticCurveTo(x + 15, y - 22, x + 30, y); }
    c.closePath(); c.fill();
  }
  // küçük köy evi (kerpiç düz dam ya da kiremit)
  function villageHouse(c, em, x, y, w, h, year, r) {
    if (year < 1955 || (year < 1975 && r() < 0.5)) P.adobe(c, em, x, y, w, h, r, { lit: 0.3 });
    else if (year < 1990 || r() < 0.4) P.house(c, em, x, y, w, h, { floors: r() < 0.3 ? 2 : 1, lit: 0.35 }, r);
    else { P.building(c, em, x, y, w, h * 1.3, { floors: 2, cols: 2, lit: 0.35, cornice: false }, r); roofGear(c, x, y - h * 1.3, w, year, r); if (year >= 2012 && r() < 0.4) { c.beginPath(); c.moveTo(x - w * 0.4, y - h * 1.3 - 1); c.lineTo(x + w * 0.3, y - h * 1.3 - 8); c.lineTo(x + w * 0.32, y - h * 1.3 - 5); c.lineTo(x - w * 0.38, y - h * 1.3 + 1); c.fill(); } }
  }
  function haystacks(c, x, y, n, r) {
    c.beginPath();
    for (let i = 0; i < n; i++) { const hx = x + i * 13 + r() * 4, hh = U.lerp(8, 13, r()); c.moveTo(hx - 7, y); c.quadraticCurveTo(hx - 6, y - hh, hx, y - hh - 2); c.quadraticCurveTo(hx + 6, y - hh, hx + 7, y); }
    c.closePath(); c.fill();
  }

  // ============================================================== KIRSAL
  SET.kirsal = {
    far(c, em, r, W, y, gx) {
      range(c, W, r, -30, 60, 150, 0.45, false);
      const s = terrain(c, 'far', W, gx, r);
      // uzak köyler: tepe sırtında küçük ev kümeleri ve minare
      for (let k = 0; k < 2; k++) {
        const cx = U.lerp(150, W - 150, (k + 0.15 + r() * 0.7) / 2);
        row(s, cx - 110, cx + 110, r, 9, (rr) => [U.lerp(9, 15, rr()), U.lerp(6, 10, rr())], (x, yy, w, h) => { c.beginPath(); c.rect(x - w / 2, yy - h, w, h); if (y >= 1960) { c.moveTo(x - w / 2 - 1, yy - h); c.lineTo(x, yy - h - 5); c.lineTo(x + w / 2 + 1, yy - h); } c.fill(); }, 1, 7);
        if (r() < 0.75) { const mx = cx + (r() - 0.5) * 80; camii(c, em, s, mx, U.lerp(40, 56, r()), r); }
      }
      if (y >= 1956) {
        // enerji nakil hattı
        const xs = []; for (let x = 60 + r() * 80; x < W - 30; x += U.lerp(170, 230, r())) xs.push(x);
        xs.forEach((x) => P.pylon(c, x, at(s, x), 46));
        for (let i = 0; i < xs.length - 1; i++) P.wire(c, xs[i], at(s, xs[i]) - 44, xs[i + 1], at(s, xs[i + 1]) - 44, 8, 0.6);
      }
      if (y >= 2008) for (let i = 0; i < 3; i++) { const x = inner(r, W, 60), b = at(s, x); P.windTurbineBase(c, x, b, 70); P.windTurbineBlades(c, x, b - 72, 70, r() * TAU); }
    },
    mid(c, em, r, W, y, gx) {
      const s = terrain(c, 'mid', W, gx, r);
      // dere boyu kavaklar
      const gx0 = inner(r, W, 120);
      for (let i = 0; i < 6; i++) { const x = gx0 + (i - 2.5) * U.lerp(14, 22, r()); P.poplar(c, x, at(s, x), U.lerp(70, 120, r()), r); }
      // köy
      const vx = inner(r, W, 230);
      row(s, vx - 220, vx + 220, r, 12, (rr) => [U.lerp(30, 46, rr()), U.lerp(20, 30, rr())], (x, yy, w, h) => villageHouse(c, em, x, yy, w, h, y, r), 4, 30);
      if (r() < 0.7) { const mx = vx + (r() - 0.5) * 160; if (r() < 0.5) P.mosque(c, em, mx, at(s, mx, 40), U.lerp(12, 16, r()), { minarets: 1 }, r); else camii(c, em, s, mx, U.lerp(70, 92, r()), r); }
      if (y < 1965 && r() < 0.6) { const hx = inner(r, W, 60); haystacks(c, hx, at(s, hx, 40), 3, r); }
      if (y >= 1951 && r() < 0.5) { const tx = inner(r, W, 60); P.tractor(c, tx, at(s, tx, 50), 46, {}); }
      else if (y < 1951 && r() < 0.5) { const ox = inner(r, W, 60); P.oxcart(c, ox, at(s, ox, 50), 54, {}); }
      if (y >= 1990 && r() < 0.5) { const gx2 = inner(r, W, 120); greenhouses(c, gx2 - 90, gx2 + 90, at(s, gx2, 180)); }
      if (y >= 1950) {
        const xs = []; for (let x = 40 + r() * 60; x < W - 20; x += U.lerp(150, 210, r())) xs.push(x);
        xs.forEach((x) => P.utilityPole(c, x, at(s, x), 62));
        for (let i = 0; i < xs.length - 1; i++) P.wire(c, xs[i], at(s, xs[i]) - 58, xs[i + 1], at(s, xs[i + 1]) - 58, 7, 0.6);
      }
      for (let i = 0; i < 3; i++) { const x = inner(r, W, 40); P.tree(c, x, at(s, x), U.lerp(50, 80, r()), r.pick(['broad', 'bare']), r); }
    },
  };

  // ============================================================== KENT (Anadolu kenti)
  SET.kent = {
    far(c, em, r, W, y, gx) {
      const s = terrain(c, 'far', W, gx, r);
      if (y < 1950) {
        for (let k = 0; k < 2; k++) {
          const cx = U.lerp(170, W - 170, (k + r()) / 2);
          row(s, cx - 150, cx + 150, r, 14, (rr) => [U.lerp(12, 20, rr()), U.lerp(8, 14, rr())], (x, yy, w, h) => P.house(c, em, x, yy, w, h, { floors: 1, door: false, chimney: false, lit: 0.35 }, r), 1, 6);
          if (r() < 0.8) { const mx = cx + (r() - 0.5) * 120; camii(c, em, s, mx, U.lerp(50, 70, r()), r); }
        }
        if (r() < 0.5) { const x = inner(r, W, 80); P.clockTower(c, em, x, at(s, x), 70, {}); }
      } else if (y < 1985) {
        row(s, 4, W - 4, r, 46, (rr) => [U.lerp(14, 26, rr()), U.lerp(14, y < 1965 ? 24 : 36, rr())], (x, yy, w, h) => P.building(c, em, x, yy, w, h, { cornice: false, cols: 3, lit: 0.35 }, r), 0, 10);
        for (let i = 0; i < 2; i++) { const x = inner(r, W, 40); camii(c, em, s, x, U.lerp(60, 86, r()), r, r() < 0.5 ? 1 : 2); }
        if (r() < 0.5) { const x = inner(r, W, 20); P.chimney(c, x, at(s, x), 8, 90); smoke(c, x, at(s, x) - 92, 60, r, 0.14); }
      } else {
        row(s, 4, W - 4, r, 56, (rr) => [U.lerp(14, 26, rr()), U.lerp(20, y < 2005 ? 50 : 64, rr())], (x, yy, w, h) => P.building(c, em, x, yy, w, h, { cornice: false, cols: 3, lit: 0.4 }, r), 0, 8);
        const n = y < 2005 ? 2 : 5, cl = inner(r, W, 160);
        for (let i = 0; i < n; i++) { const x = cl + (r() - 0.5) * 260; P.tower(c, em, x, at(s, x), U.lerp(14, 24, r()), U.lerp(80, y < 2005 ? 120 : 190, r()), { kind: r.pick(['box', 'step', 'slant', 'taper']), lit: 0.35 }, r); }
        for (let i = 0; i < 2; i++) { const x = inner(r, W, 40); camii(c, em, s, x, U.lerp(70, 90, r()), r, 2); }
        if (y >= 2003 && r() < 0.5) { const x = inner(r, W, 60); P.crane(c, x, at(s, x), 110, 70, {}); }
      }
    },
    mid(c, em, r, W, y, gx) {
      const s = terrain(c, 'mid', W, gx, r);
      if (y < 1945) {
        for (let i = 0; i < 4; i++) { const x = inner(r, W, 30); P.poplar(c, x, at(s, x), U.lerp(80, 130, r()), r); }
        if (r() < 0.6) { const x = inner(r, W, 120); P.mosque(c, em, x, at(s, x, 70), U.lerp(18, 24, r()), { minarets: r() < 0.5 ? 1 : 2 }, r); }
        if (r() < 0.45) { const x = inner(r, W, 60); P.clockTower(c, em, x, at(s, x, 30), U.lerp(110, 140, r()), {}); }
        row(s, 10, W - 10, r, 11, (rr) => [U.lerp(32, 50, rr()), U.lerp(26, 38, rr())], (x, yy, w, h) => P.house(c, em, x, yy, w, h, { floors: r() < 0.6 ? 2 : 1, lit: 0.35 }, r), 16, 70);
      } else if (y < 1965) {
        for (let i = 0; i < 3; i++) { const x = inner(r, W, 30); P.tree(c, x, at(s, x), U.lerp(70, 110, r()), r.pick(['poplar', 'broad']), r); }
        if (r() < 0.5) { const x = inner(r, W, 50); camii(c, em, s, x, U.lerp(100, 120, r()), r); }
        row(s, 10, W - 10, r, 12, (rr) => [U.lerp(36, 62, rr()), 0], (x, yy, w) => {
          if (r() < 0.55) apt(c, em, x, yy, w, r.int(3, 5), 1955, r);
          else P.house(c, em, x, yy, w * 0.75, U.lerp(28, 38, r()), { floors: 2, lit: 0.35 }, r);
        }, 14, 60);
      } else if (y < 1995) {
        // apartman blokları + yamaçta gecekondu
        gecekondu(c, em, s, 10, W * 0.42, r, 16);
        if (r() < 0.6) { const x = inner(r, W, 50); camii(c, em, s, x, U.lerp(110, 130, r()), r, r() < 0.5 ? 1 : 2); }
        row(s, W * 0.38, W - 10, r, 9, (rr) => [U.lerp(48, 76, rr()), 0], (x, yy, w) => apt(c, em, x, yy, w, r.int(5, 9), y < 1980 ? 1972 : 1985, r), 10, 50);
        for (let i = 0; i < 2; i++) { const x = inner(r, W, 40); P.tree(c, x, at(s, x), U.lerp(60, 90, r()), 'broad', r); }
      } else {
        // TOKİ blokları, kuleler, vinçler
        for (let i = 0; i < (y >= 2008 ? 3 : 1); i++) { const x = inner(r, W, 40); P.tower(c, em, x, at(s, x, 40), U.lerp(32, 46, r()), U.lerp(150, 230, r()), { kind: r.pick(['box', 'slant', 'taper', 'step']), lit: 0.4 }, r); }
        if (y >= 2004 && r() < 0.6) { const x = inner(r, W, 160); P.crane(c, x, at(s, x), 190, 120, {}); }
        row(s, 10, W - 10, r, 8, (rr) => [U.lerp(52, 78, rr()), 0], (x, yy, w) => apt(c, em, x, yy, w, r.int(y >= 2005 ? 9 : 7, y >= 2005 ? 15 : 11), 2010, r, 0.4), 24, 80);
        if (r() < 0.6) { const x = inner(r, W, 60); P.mosque(c, em, x, at(s, x, 60), 18, { minarets: 2 }, r); }
        for (let i = 0; i < 3; i++) { const x = inner(r, W, 40); P.youngTree(c, x, at(s, x), U.lerp(40, 60, r()), r); }
      }
    },
  };

  // ------------------------------------------------------------- su (orta katman)
  // Arazi ortada deniz seviyesine iner; kıyılar arasına açık tonlu su ve dalga çizgileri çizilir.
  const SEA_Y = -2;
  function water(c, s, W, r, y0) {
    // kıyı noktaları: arazinin deniz seviyesinin altına indiği aralık
    let xa = null, xb = null;
    for (let x = 0; x <= W; x += 4) { if (s(x) > SEA_Y - 0.5) { if (xa === null) xa = x; xb = x; } }
    if (xa === null) return null;
    c.save();
    // kıyıda su yumuşakça karaya karışır (dikey dikiş görünmesin)
    const g = c.createLinearGradient(xa - 50, 0, xb + 50, 0);
    const span = xb - xa + 100, e = Math.min(0.45, 100 / span);
    g.addColorStop(0, 'rgba(95,93,88,0)'); g.addColorStop(e, 'rgba(95,93,88,1)');
    g.addColorStop(1 - e, 'rgba(95,93,88,1)'); g.addColorStop(1, 'rgba(95,93,88,0)');
    c.fillStyle = g;
    c.fillRect(xa - 50, SEA_Y, xb - xa + 100, 260);
    c.fillStyle = '#77756f';
    for (let i = 0; i < 26; i++) {
      const yy = SEA_Y + 3 + Math.pow(r(), 1.6) * 60, x = U.lerp(xa + 10, xb - 40, r()), w = U.lerp(10, 46, r());
      c.fillRect(x, yy, w, 1.2);
    }
    c.restore();
    return [xa, xb];
  }
  function sailboat(c, x, y, h) {
    c.beginPath();
    c.moveTo(x - h * 0.45, y - h * 0.12); c.lineTo(x + h * 0.45, y - h * 0.12); c.lineTo(x + h * 0.32, y); c.lineTo(x - h * 0.34, y); c.closePath();
    c.moveTo(x - 1, y - h * 0.12); c.lineTo(x - 1, y - h); c.lineTo(x + h * 0.36, y - h * 0.18); c.closePath();
    c.moveTo(x - 3, y - h * 0.16); c.lineTo(x - 3, y - h * 0.8); c.lineTo(x - h * 0.3, y - h * 0.18); c.closePath();
    c.fill();
  }
  function fishingBoat(c, em, x, y, L) {
    c.beginPath();
    c.moveTo(x - L / 2, y - L * 0.14); c.lineTo(x + L / 2, y - L * 0.2); c.quadraticCurveTo(x + L * 0.44, y, x + L * 0.3, y); c.lineTo(x - L * 0.38, y); c.closePath();
    c.rect(x - L * 0.1, y - L * 0.36, L * 0.22, L * 0.2);
    c.rect(x - L * 0.32, y - L * 0.5, 1.6, L * 0.38);
    c.fill();
    if (em) P.glow(em, x, y - L * 0.3, 3, '#ffe0a0', 0.6);
  }
  function yacht(c, x, y, L) {
    c.beginPath();
    c.moveTo(x - L / 2, y - L * 0.1); c.lineTo(x + L / 2, y - L * 0.12); c.lineTo(x + L * 0.36, y); c.lineTo(x - L * 0.4, y); c.closePath();
    c.moveTo(x - L * 0.25, y - L * 0.1); c.lineTo(x + L * 0.2, y - L * 0.1); c.lineTo(x + L * 0.1, y - L * 0.2); c.lineTo(x - L * 0.2, y - L * 0.2); c.closePath();
    c.rect(x - 1, y - L * 0.95, 1.6, L * 0.85);
    c.fill();
  }
  function boats(c, em, xa, xb, y, r, n) {
    for (let i = 0; i < n; i++) {
      const x = U.lerp(xa + 60, xb - 60, (i + 0.2 + r() * 0.6) / n), yy = SEA_Y + 2 + r() * 10;
      if (y < 1950) { if (r() < 0.6) sailboat(c, x, yy, U.lerp(26, 40, r())); else P.ship(c, em, x, yy + 2, U.lerp(70, 90, r()), 'steam', { dir: r.sign() }, r); }
      else if (y < 1985) { if (r() < 0.6) fishingBoat(c, em, x, yy, U.lerp(30, 42, r())); else P.ship(c, em, x, yy + 2, U.lerp(70, 100, r()), r() < 0.5 ? 'ferry' : 'cargo', { dir: r.sign() }, r); }
      else { const k = r(); if (k < 0.4) yacht(c, x, yy, U.lerp(30, 44, r())); else if (k < 0.7) fishingBoat(c, em, x, yy, U.lerp(30, 40, r())); else P.ship(c, em, x, yy + 2, U.lerp(90, 130, r()), 'cargo', { dir: r.sign() }, r); }
    }
  }
  function lighthouse(c, em, x, y, h) {
    c.beginPath();
    c.moveTo(x - h * 0.09, y); c.lineTo(x - h * 0.06, y - h * 0.82); c.lineTo(x + h * 0.06, y - h * 0.82); c.lineTo(x + h * 0.09, y); c.closePath();
    c.rect(x - h * 0.08, y - h * 0.86, h * 0.16, h * 0.04);
    c.rect(x - h * 0.05, y - h * 0.96, h * 0.1, h * 0.1);
    c.moveTo(x - h * 0.07, y - h * 0.96); c.lineTo(x, y - h * 1.04); c.lineTo(x + h * 0.07, y - h * 0.96); c.closePath();
    c.fill();
    if (em) P.glow(em, x, y - h * 0.91, h * 0.12, '#fff2c8', 0.9);
  }

  // ============================================================== ANKARA
  SET.ankara = {
    far(c, em, r, W, y, gx) {
      const s = terrain(c, 'far', W, gx, r);
      const L = Math.abs(Math.round(gx / W)) % 4;
      const cx = inner(r, W, 260);
      // kentin dokusu
      if (y < 1945) row(s, 6, W - 6, r, 26, (rr) => [U.lerp(10, 16, rr()), U.lerp(7, 12, rr())], (x, yy, w, h) => P.house(c, em, x, yy, w, h, { floors: 1, door: false, chimney: false, lit: 0.3 }, r), 2, 22);
      else row(s, 6, W - 6, r, 50, (rr) => [U.lerp(12, 22, rr()), U.lerp(12, y < 1975 ? 28 : 46, rr())], (x, yy, w, h) => P.building(c, em, x, yy, w, h, { cornice: false, cols: 2, lit: 0.35 }, r), 0, 10);
      if (L === 0) P.castle(c, em, cx, at(s, cx, 120), 52, r);
      else if (L === 1 && y >= 1953) P.anitkabir(c, em, cx, at(s, cx, 110), 21);
      else if (L === 2 && y >= 1987) P.mosque(c, em, cx, at(s, cx, 70), 20, { minarets: 4 }, r);
      else if (L === 3 && y >= 1989) P.atakule(c, em, cx, at(s, cx, 20), 58);
      else { P.mosque(c, em, cx, at(s, cx, 50), 12, { minarets: 1 }, r); }
      if (y >= 2005) for (let i = 0; i < 4; i++) { const x = inner(r, W, 40); P.tower(c, em, x, at(s, x), U.lerp(14, 22, r()), U.lerp(90, 170, r()), { kind: r.pick(['box', 'slant', 'taper', 'round']), lit: 0.35 }, r); }
    },
    mid(c, em, r, W, y, gx) {
      const s = terrain(c, 'mid', W, gx, r);
      if (y < 1928) {
        // eski Ankara: cumbalı iki katlı evler, kavaklar, bir cami
        for (let i = 0; i < 5; i++) { const x = inner(r, W, 30); P.poplar(c, x, at(s, x), U.lerp(80, 130, r()), r); }
        if (r() < 0.7) { const x = inner(r, W, 100); P.mosque(c, em, x, at(s, x, 60), U.lerp(16, 22, r()), { minarets: 1 }, r); }
        row(s, 10, W - 10, r, 12, (rr) => [U.lerp(34, 50, rr()), U.lerp(28, 38, rr())], (x, yy, w, h) => P.house(c, em, x, yy, w, h, { floors: 2, lit: 0.35 }, r), 8, 50);
      } else if (y < 1956) {
        // Cumhuriyet Ankara'sı: kamu yapıları, bulvar ağaçları, ilk apartmanlar
        const bx = inner(r, W, 160);
        if (r() < 0.5) P.classical(c, em, bx, at(s, bx, 200), U.lerp(160, 200, r()), U.lerp(58, 70, r()), {}, r);
        else P.building(c, em, bx, at(s, bx, 190), U.lerp(170, 200, r()), U.lerp(56, 70, r()), { floors: 3, cols: 9, roof: 'hip', roofH: 12, arch: true, lit: 0.35 }, r);
        if (y >= 1937 && r() < 0.4) { const x = bx + (r() < 0.5 ? -1 : 1) * 130; P.clockTower(c, em, x, at(s, x, 30), 120, {}); }
        row(s, 10, W - 10, r, 7, (rr) => [U.lerp(44, 60, rr()), 0], (x, yy, w) => { if (Math.abs(x - bx) > 140) apt(c, em, x, yy, w, r.int(3, 4), 1936, r); }, 20, 70);
        for (let i = 0; i < 7; i++) { const x = inner(r, W, 20); P.tree(c, x, at(s, x), U.lerp(40, 70, r()), r.pick(['young', 'poplar', 'broad']), r); }
      } else if (y < 1990) {
        gecekondu(c, em, s, 10, W * 0.3, r, 12);
        const ox = inner(r, W, 120);
        P.building(c, em, ox, at(s, ox, 80), U.lerp(64, 84, r()), U.lerp(120, 170, r()), { floors: r.int(9, 13), cols: 6, cornice: false, lit: 0.4 }, r);
        row(s, W * 0.28, W - 10, r, 9, (rr) => [U.lerp(46, 70, rr()), 0], (x, yy, w) => { if (Math.abs(x - ox) > 70) apt(c, em, x, yy, w, r.int(5, 8), 1968, r); }, 12, 50);
        if (r() < 0.6) { const x = inner(r, W, 50); camii(c, em, s, x, U.lerp(100, 130, r()), r, 2); }
      } else {
        for (let i = 0; i < (y >= 2005 ? 3 : 2); i++) { const x = inner(r, W, 40); P.tower(c, em, x, at(s, x, 40), U.lerp(34, 50, r()), U.lerp(160, y >= 2005 ? 270 : 210, r()), { kind: r.pick(y >= 2005 ? ['taper', 'round', 'slant', 'step'] : ['box', 'step']), spire: y >= 2005 && r() < 0.3 ? 20 : 0, lit: 0.4 }, r); }
        if (y >= 2005 && r() < 0.5) { const x = inner(r, W, 160); P.crane(c, x, at(s, x), 200, 130, {}); }
        row(s, 10, W - 10, r, 8, (rr) => [U.lerp(50, 72, rr()), 0], (x, yy, w) => apt(c, em, x, yy, w, r.int(7, 12), 2000, r, 0.4), 20, 70);
        for (let i = 0; i < 4; i++) { const x = inner(r, W, 30); P.youngTree(c, x, at(s, x), U.lerp(40, 60, r()), r); }
      }
    },
  };

  // ============================================================== İSTANBUL
  SET.istanbul = {
    far(c, em, r, W, y, gx) {
      const L = Math.abs(Math.round(gx / W)) % 4;
      const bridge = L === 3 && y >= 1973;
      const s = terrain(c, 'far', W, gx, r, bridge ? { flat: edgeFlat(W, 200, 420), sea: 2 } : null);
      // sık kent dokusu
      row(s, 6, W - 6, r, 70, (rr) => [U.lerp(8, 16, rr()), U.lerp(8, y < 1960 ? 16 : y < 1990 ? 26 : 34, rr())], (x, yy, w, h) => { if (s(x) < -1) P.building(c, em, x, yy, w, h, { roof: y < 1960 && r() < 0.6 ? 'hip' : 'flat', roofH: 4, cornice: false, cols: 2, lit: 0.3 }, r); }, 0, 6);
      if (L === 0) { const x = inner(r, W, 260); P.ayasofya(c, em, x - 120, at(s, x - 120, 90), 16, r); P.mosque(c, em, x + 120, at(s, x + 120, 90), 18, { minarets: 6 }, r); }
      else if (L === 1) { const x = inner(r, W, 200); P.galata(c, em, x, at(s, x, 20), 58, {}); P.mosque(c, em, x + 170, at(s, x + 170, 80), 16, { minarets: 2 }, r); }
      else if (L === 2) { const x = inner(r, W, 200); P.mosque(c, em, x, at(s, x, 100), 22, { minarets: 4 }, r); P.mosque(c, em, x - 200, at(s, x - 200, 70), 14, { minarets: 2 }, r); }
      else if (bridge) { P.suspensionBridge(c, em, 150, W - 150, 3, { tower: 78, deck: 18, legW: 2.4, legGap: 6, tPos: 0.2 }, r); }
      else { const x = inner(r, W, 200); P.mosque(c, em, x, at(s, x, 90), 18, { minarets: 2 }, r); }
      if (y >= 1988 && L !== 0) { const cl = inner(r, W, 180); for (let i = 0; i < (y >= 2008 ? 6 : 3); i++) { const x = cl + (r() - 0.5) * 260; P.tower(c, em, x, at(s, x), U.lerp(12, 22, r()), U.lerp(80, y >= 2008 ? 190 : 120, r()), { kind: r.pick(['box', 'slant', 'taper', 'round']), lit: 0.35 }, r); } }
      if (y >= 2020 && L === 2) { const x = inner(r, W, 60); const b = at(s, x); c.beginPath(); c.moveTo(x - 7, b); c.lineTo(x - 3, b - 210); c.lineTo(x + 3, b - 210); c.lineTo(x + 7, b); c.fill(); c.beginPath(); c.ellipse(x, b - 170, 10, 22, 0, 0, TAU); c.fill(); c.fillRect(x - 1, b - 250, 2, 40); }
    },
    mid(c, em, r, W, y, gx) {
      const idx = Math.round(gx / W);
      const sea = Math.abs(idx) % 2 === 0;
      const s = terrain(c, 'mid', W, gx, r, sea ? { flat: edgeFlat(W, 150, 330), sea: 6 } : null);
      if (sea) {
        const wv = water(c, s, W, r);
        if (wv) {
          // vapurlar, gemiler; ara sıra Kız Kulesi
          const n = 2 + Math.floor(r() * 2);
          for (let i = 0; i < n; i++) { const x = U.lerp(wv[0] + 80, wv[1] - 80, (i + 0.2 + r() * 0.6) / n); P.ship(c, em, x, SEA_Y + 4 + r() * 8, U.lerp(70, 96, r()), y < 1950 ? (r() < 0.5 ? 'steam' : 'ferry') : (r() < 0.7 ? 'ferry' : 'cargo'), { dir: r.sign(), lights: true }, r); }
          if (r() < 0.35) { const x = U.lerp(wv[0] + 60, wv[1] - 60, r()); P.maidenTower(c, em, x, SEA_Y + 4, 48); }
        }
        // iki kıyıda mahalle
        const side = (x0, x1) => row(s, x0, x1, r, 4, (rr) => [U.lerp(30, 46, rr()), U.lerp(30, 44, rr())], (x, yy, w, h) => { if (s(x) < -4) { if (y < 1960) P.house(c, em, x, yy, w, h, { floors: 3, lit: 0.4 }, r); else apt(c, em, x, yy, w, r.int(4, y < 1985 ? 6 : 9), y, r); } }, 2, 20);
        side(8, 150); side(W - 150, W - 8);
        for (let i = 0; i < 2; i++) { const x = r() < 0.5 ? U.lerp(10, 120, r()) : U.lerp(W - 120, W - 10, r()); if (s(x) < -4) P.cypress(c, x, at(s, x), U.lerp(60, 90, r()), r); }
      } else {
        if (r() < 0.7) { const x = inner(r, W, 110); P.mosque(c, em, x, at(s, x, 70), U.lerp(20, 30, r()), { minarets: r.pick([2, 2, 4]) }, r); }
        for (let i = 0; i < 4; i++) { const x = inner(r, W, 20); P.cypress(c, x, at(s, x), U.lerp(80, 130, r()), r); }
        if (y < 1960) row(s, 10, W - 10, r, 10, (rr) => [U.lerp(38, 58, rr()), U.lerp(38, 56, rr())], (x, yy, w, h) => P.house(c, em, x, yy, w, h, { floors: r() < 0.7 ? 3 : 2, lit: 0.4 }, r), 10, 60);
        else if (y < 1990) row(s, 10, W - 10, r, 10, (rr) => [U.lerp(40, 62, rr()), 0], (x, yy, w) => { if (r() < 0.3) P.house(c, em, x, yy, w * 0.8, U.lerp(36, 48, r()), { floors: 3, lit: 0.4 }, r); else apt(c, em, x, yy, w, r.int(4, 7), 1970, r); }, 8, 40);
        else {
          if (y >= 2004) for (let i = 0; i < 2; i++) { const x = inner(r, W, 40); P.tower(c, em, x, at(s, x, 40), U.lerp(32, 46, r()), U.lerp(170, 260, r()), { kind: r.pick(['taper', 'round', 'slant']), lit: 0.4 }, r); }
          row(s, 10, W - 10, r, 9, (rr) => [U.lerp(44, 66, rr()), 0], (x, yy, w) => apt(c, em, x, yy, w, r.int(6, 10), 1995, r, 0.4), 10, 50);
        }
      }
    },
  };

  // ============================================================== SANAYİ ve DEMİRYOLU
  SET.sanayi = {
    far(c, em, r, W, y, gx) {
      const s = terrain(c, 'far', W, gx, r);
      for (let k = 0; k < 2; k++) {
        const cx = U.lerp(170, W - 170, (k + 0.2 + r() * 0.6) / 2);
        P.factoryHall(c, em, cx, at(s, cx, 90), U.lerp(70, 100, r()), U.lerp(20, 28, r()), r);
        for (let i = 0; i < 2; i++) { const x = cx + U.lerp(-50, 50, r()); const b = at(s, x); P.chimney(c, x, b, 5, U.lerp(60, 100, r())); if (y < 2000) smoke(c, x, b - 100, 70, r, 0.12); }
      }
      if (r() < 0.6) { const x = inner(r, W, 40); P.waterTower(c, x, at(s, x, 20), 0.45); }
      if (y >= 1956) { const xs = []; for (let x = 50 + r() * 60; x < W - 30; x += U.lerp(170, 220, r())) xs.push(x); xs.forEach((x) => P.pylon(c, x, at(s, x), 48)); for (let i = 0; i < xs.length - 1; i++) P.wire(c, xs[i], at(s, xs[i]) - 46, xs[i + 1], at(s, xs[i + 1]) - 46, 8, 0.6); }
      if (y >= 1975 && r() < 0.6) { const x = inner(r, W, 80); P.crane(c, x, at(s, x), 90, 60, {}); }
      if (y >= 2008) for (let i = 0; i < 2; i++) { const x = inner(r, W, 60), b = at(s, x); P.windTurbineBase(c, x, b, 64); P.windTurbineBlades(c, x, b - 66, 64, r() * TAU); }
    },
    mid(c, em, r, W, y, gx) {
      const kind = r.weighted({ viaduct: 4.5, yard: 3, works: 2.5 });
      const loco = y < 1960 ? 'steam' : y < 2009 ? 'diesel' : 'modern';
      const L = loco === 'modern' ? 92 : 74;
      // tren: lokomotif önde (sağda), arkasında vagonlar; [xa, xb] aralığına sığar
      const train = (xa, xb, deck, n) => {
        const len = L * 0.98 * (n + 1);
        let x = U.lerp(xa + 10, Math.max(xa + 10, xb - 10 - len), r());
        for (let i = 0; i < n; i++) { P.wagon(c, em, x, deck, L * 0.95, loco === 'modern' ? 'modern' : (r() < 0.55 ? 'freight' : 'passenger'), r); x += L * 0.98; }
        P.locomotive(c, em, x + (loco === 'steam' ? L * 0.38 : 0), deck, L, loco, {});
        if (loco === 'steam') smoke(c, x + L * 0.7, deck - L * 0.8, 50, r, 0.2);
      };
      let s, fx;
      if (kind === 'viaduct') {
        s = terrain(c, 'mid', W, gx, r);
        const v0 = inner(r, W, 300), vw = U.lerp(400, 540, r()), deck = -86;
        P.viaduct(c, v0 - vw / 2, v0 + vw / 2, 6, -deck, Math.round(vw / 70), {});
        train(v0 - vw / 2, v0 + vw / 2, deck, Math.min(4, Math.floor(vw / (L * 0.98)) - 1));
        fx = v0 > W / 2 ? U.lerp(140, Math.max(140, v0 - vw / 2 - 120), r()) : U.lerp(Math.min(W - 140, v0 + vw / 2 + 120), W - 140, r());
      } else if (kind === 'yard') {
        // düzlükte istasyon ve yük vagonları
        const x0 = U.lerp(120, 260, r()), x1 = x0 + U.lerp(480, 620, r());
        s = terrain(c, 'mid', W, gx, r, { flat: (x) => 1 - U.smoothstep(x0 - 70, x0, x) * (1 - U.smoothstep(x1, x1 + 70, x)), sea: -22 });
        c.fillRect(x0 - 10, -24, x1 - x0 + 20, 2);
        train(x0, x1 - 140, -24, 4);
        const st = x1 - 70;
        P.building(c, em, st, -22, U.lerp(90, 120, r()), U.lerp(34, 44, r()), { floors: 2, cols: 6, roof: 'hip', roofH: 10, lit: 0.45 }, r);
        if (y < 2000) P.waterTower(c, x0 - 30 < 40 ? x1 + 40 : x0 - 30, at(s, x0 - 30 < 40 ? x1 + 40 : x0 - 30, 20), 0.75);
        fx = x0 > 400 ? U.lerp(100, x0 - 140, r()) : U.lerp(Math.min(W - 160, x1 + 160), W - 140, r());
      } else {
        s = terrain(c, 'mid', W, gx, r);
        fx = inner(r, W, 200);
        if (y >= 1965) { const x = fx + (r() < 0.5 ? -260 : 260); P.crane(c, x, at(s, x), 160, 110, {}); }
      }
      // fabrikalar
      if (y < 2000 || r() < 0.4) {
        P.factoryHall(c, em, fx, at(s, fx, 200), U.lerp(160, 210, r()), U.lerp(48, 60, r()), r);
        for (let i = 0; i < 2; i++) { const x = fx + U.lerp(-80, 80, r()); const b = at(s, x); P.chimney(c, x, b, 9, U.lerp(120, 170, r())); if (y < 2000) smoke(c, x, b - 170, 90, r, 0.16); }
      } else {
        P.modernHall(c, em, fx, at(s, fx, 200), U.lerp(170, 210, r()), U.lerp(50, 60, r()), {}, r);
        if (y >= 2012) P.solarPanels(c, fx - 240, fx - 120, at(s, fx - 180, 120), 14, r);
      }
      if (kind !== 'yard' && r() < 0.5) { const x = inner(r, W, 40); P.waterTower(c, x, at(s, x, 30), 0.8); }
    },
  };

  // ============================================================== SAHİL
  SET.sahil = {
    far(c, em, r, W, y, gx) {
      range(c, W, r, -24, 70, 170, 0.5, false);
      const s = terrain(c, 'far', W, gx, r);
      const cx = inner(r, W, 200);
      row(s, cx - 160, cx + 160, r, 14, (rr) => [U.lerp(8, 14, rr()), U.lerp(6, y < 1975 ? 10 : 22, rr())], (x, yy, w, h) => { c.beginPath(); c.rect(x - w / 2, yy - h, w, h); c.fill(); }, 1, 10);
      if (r() < 0.6) { const x = inner(r, W, 40); camii(c, em, s, x, 44, r); }
      if (r() < 0.4) { const x = inner(r, W, 40); lighthouse(c, em, x, at(s, x), 46); }
      if (y >= 2008 && r() < 0.6) for (let i = 0; i < 3; i++) { const x = inner(r, W, 50), b = at(s, x); P.windTurbineBase(c, x, b, 60); P.windTurbineBlades(c, x, b - 62, 60, r() * TAU); }
    },
    mid(c, em, r, W, y, gx) {
      const s = terrain(c, 'mid', W, gx, r, { flat: edgeFlat(W, 120, 300), sea: 6 });
      const wv = water(c, s, W, r);
      if (wv) boats(c, em, wv[0], wv[1], y, r, 2 + Math.floor(r() * 3));
      // burunlarda kıyı evleri, çamlar, palmiyeler, deniz feneri
      const cape = (x0, x1) => {
        row(s, x0, x1, r, 4, (rr) => [U.lerp(26, 40, rr()), U.lerp(20, 30, rr())], (x, yy, w, h) => { if (s(x) < -6) { if (y >= 1975 && r() < 0.5) apt(c, em, x, yy, w * 1.2, r.int(3, 6), y, r); else P.house(c, em, x, yy, w, h, { floors: r() < 0.5 ? 2 : 1, lit: 0.4 }, r); } }, 4, 24);
        for (let i = 0; i < 3; i++) { const x = U.lerp(x0, x1, r()); if (s(x) < -6) { const k = r(); if (y >= 1960 && k < 0.4) P.palm(c, x, at(s, x), U.lerp(50, 70, r()), r); else if (k < 0.75) P.umbrellaPine(c, x, at(s, x), U.lerp(50, 70, r()), r); else P.cypress(c, x, at(s, x), U.lerp(50, 80, r()), r); } }
      };
      cape(8, 130); cape(W - 130, W - 8);
      if (r() < 0.5) { const x = r() < 0.5 ? U.lerp(40, 100, r()) : U.lerp(W - 100, W - 40, r()); if (s(x) < -8) lighthouse(c, em, x, at(s, x), 90); }
    },
  };

  // ============================================================== DOĞU (dağlar)
  SET.dogu = {
    far(c, em, r, W, y, gx) {
      range(c, W, r, -36, 130, 250, 0.62, true);
      const s = terrain(c, 'far', W, gx, r);
      if (r() < 0.7) { const cx = inner(r, W, 150); row(s, cx - 90, cx + 90, r, 7, (rr) => [U.lerp(8, 13, rr()), U.lerp(6, 9, rr())], (x, yy, w, h) => { c.beginPath(); c.rect(x - w / 2, yy - h, w, h); c.fill(); }, 1, 8); }
      if (y >= 1992 && r() < 0.3) { const x = inner(r, W, 120); const b = at(s, x, 160); c.beginPath(); c.moveTo(x - 80, b); c.lineTo(x - 70, b - 40); c.lineTo(x + 70, b - 40); c.lineTo(x + 80, b); c.closePath(); c.fill(); }
    },
    mid(c, em, r, W, y, gx) {
      const s = terrain(c, 'mid', W, gx, r);
      // kayalık yamaçlar
      for (let i = 0; i < 4; i++) { const x = inner(r, W, 80); P.rocks(c, x - 60, x + 60, at(s, x), U.lerp(10, 18, r()), r, 5); }
      // vadide kavaklar
      const vx = inner(r, W, 140);
      for (let i = 0; i < 5; i++) { const x = vx + (i - 2) * U.lerp(16, 22, r()); P.poplar(c, x, at(s, x), U.lerp(60, 100, r()), r); }
      // yamaca basamak basamak taş evler
      const hx = inner(r, W, 220);
      row(s, hx - 210, hx + 210, r, 11, (rr) => [U.lerp(30, 44, rr()), U.lerp(20, 28, rr())], (x, yy, w, h) => {
        if (y >= 1985 && r() < 0.5) { P.building(c, em, x, yy, w, h * 1.4, { floors: 2, cols: 2, cornice: false, lit: 0.35 }, r); roofGear(c, x, yy - h * 1.4, w, y, r); }
        else P.adobe(c, em, x, yy, w, h, r, { lit: 0.3 });
      }, 4, 30);
      if (r() < 0.6) { const x = hx + (r() - 0.5) * 200; camii(c, em, s, x, U.lerp(66, 86, r()), r); }
      if (r() < 0.4) for (let i = 0; i < 4; i++) { const x = inner(r, W, 30); P.fir(c, x, at(s, x), U.lerp(40, 66, r()), r, y < 0); }
      if (y >= 1960) { const xs = []; for (let x = 60 + r() * 60; x < W - 30; x += U.lerp(160, 220, r())) xs.push(x); xs.forEach((x) => P.utilityPole(c, x, at(s, x), 58)); for (let i = 0; i < xs.length - 1; i++) P.wire(c, xs[i], at(s, xs[i]) - 54, xs[i + 1], at(s, xs[i + 1]) - 54, 7, 0.6); }
    },
  };

  // ============================================================== GELECEK
  SET.gelecek = {
    far(c, em, r, W, y, gx) {
      const s = terrain(c, 'far', W, gx, r);
      for (let i = 0; i < 5; i++) { const x = inner(r, W, 30), h = U.lerp(110, 220, r()), b = at(s, x); c.beginPath(); c.moveTo(x - 11, b); c.quadraticCurveTo(x - 17, b - h * 0.6, x, b - h); c.quadraticCurveTo(x + 17, b - h * 0.6, x + 11, b); c.fill(); P.glow(em, x, b - h * 0.6, 12, '#d8f0ff', 0.6); }
      for (let i = 0; i < 4; i++) { const x = inner(r, W, 70), b = at(s, x); P.windTurbineBase(c, x, b, 100); P.windTurbineBlades(c, x, b - 104, 100, r() * TAU); }
    },
    mid(c, em, r, W, y, gx) {
      const s = terrain(c, 'mid', W, gx, r);
      for (let i = 0; i < 4; i++) {
        const x = inner(r, W, 50), h = U.lerp(120, 220, r()), b = at(s, x, 44);
        c.beginPath(); c.moveTo(x - 22, b); c.quadraticCurveTo(x - 30, b - h * 0.55, x, b - h); c.quadraticCurveTo(x + 30, b - h * 0.55, x + 22, b); c.fill();
        for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (r() - 0.5) * 34, b - h * U.lerp(0.2, 0.85, r()), U.lerp(6, 12, r()), 0, TAU); c.fill(); }
        for (let k = 0; k < 8; k++) P.glow(em, x + (r() - 0.5) * 24, b - h * U.lerp(0.2, 0.85, r()), 6, '#e2f4ff', 0.6);
      }
      const sx = inner(r, W, 160); P.solarPanels(c, sx - 140, sx + 140, at(s, sx, 280), 16, r);
      for (let i = 0; i < 6; i++) { const x = inner(r, W, 40); P.youngTree(c, x, at(s, x), U.lerp(50, 80, r()), r); }
    },
  };

  // ------------------------------------------------------------- yakın katman: kıyı
  A.NEAR.coast = function (c, em, r, W, era, year) {
    year = year || era.from + 5;
    for (let x = 100 + r() * 100; x < W - 100; x += U.lerp(300, 440, r())) {
      const k = r();
      if (k < 0.32) P.streetLamp(c, em, x, 0, year < 1960 ? 120 : 150, year < 1960 ? 'gas' : year < 2002 ? 'modern' : 'led');
      else if (k < 0.62) { if (year >= 1960 && r() < 0.7) P.palm(c, x, 0, U.lerp(170, 230, r()), r); else if (r() < 0.5) P.umbrellaPine(c, x, 0, U.lerp(130, 170, r()), r); else P.broadTree(c, x, 0, U.lerp(150, 200, r()), r); }
      else if (k < 0.8) P.cypress(c, x, 0, U.lerp(180, 240, r()), r);
      else P.person(c, x, 0, 74, { pose: r.pick(['stand', 'stand2', 'walk1']), hat: r.weighted(P.eraHats(year, 'm')), dir: r.sign() });
    }
    if (r() < 0.3) P.cat(c, r() * W, 0, 1.6, { dir: r.sign() });
  };

  // ------------------------------------------------------------- dekor ve parça üretimi
  // Bilinmeyen dekor adı → kent. Yakın katman: dönemine göre (kırsal/kasaba/kent/modern).
  A.nearStyle = function (setting, year) {
    if (setting === 'gelecek' || year >= 2026.85) return 'meadow';
    if (setting === 'kirsal' || setting === 'dogu') return 'rural';
    if (setting === 'sanayi') return year < 1960 ? 'rural' : 'city';
    if (setting === 'sahil') return 'coast';
    return year < 1960 ? 'town' : year < 2002 ? 'city' : 'modern';
  };

  A.genBgChunk = function (layerName, setting, idx, year, dens) {
    const L = A.LAYERS[layerName];
    const W = A.CHUNK;
    const r = U.rng(idx * 7919 + layerName.length * 104729 + setting.length * 31 + Math.floor(year) * 13 + 17);
    const d = dens * L.dens;
    const H = L.up + L.down;
    const c = U.canvas(W * d, H * d), ctx = c.getContext('2d');
    ctx.setTransform(d, 0, 0, d, 0, L.up * d);
    const ed = d * 0.5;
    const ec = U.canvas(W * ed, H * ed), em = ec.getContext('2d');
    em.setTransform(ed, 0, 0, ed, 0, L.up * ed);
    ctx.fillStyle = L.tone;
    ctx.strokeStyle = L.tone;
    // zemin bandı
    ctx.fillRect(-2, 0, W + 4, L.down + 2);
    ctx.save();
    if (layerName === 'near') {
      const era = IZ.ERAS[IZ.eraIndex(year)];
      const fn = A.NEAR[A.nearStyle(setting, year)] || A.NEAR.rural;
      fn(ctx, em, r, W, era, year, setting);
    } else {
      const set = SET[setting] || SET.kent;
      (set[layerName] || SET.kent[layerName])(ctx, em, r, W, year, idx * W);
    }
    ctx.restore();
    // ışık parlaması
    const sm = U.canvas(Math.max(1, ec.width / 4), Math.max(1, ec.height / 4));
    const sx = sm.getContext('2d'); sx.drawImage(ec, 0, 0, sm.width, sm.height);
    em.save(); em.setTransform(1, 0, 0, 1, 0, 0); em.globalCompositeOperation = 'lighter'; em.drawImage(sm, 0, 0, ec.width, ec.height); em.restore();
    return { c: c, ec: ec, W: W, up: L.up, down: L.down, idx: idx, setting: setting, year: year };
  };
})();
