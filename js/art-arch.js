/* =========================================================================
   Yüzyılın İzinde — çizim temel kitaplığı (2/3): mimari
   Evler, apartmanlar, gökdelenler, camiler, köprüler, simge yapılar.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P;
  const TAU = U.TAU;

  function lighter(ctx, k) {
    // mevcut dolgu rengine göre hafif açık ton (pencereler/çizgiler için)
    const f = ctx.fillStyle;
    if (typeof f !== 'string' || f[0] !== '#') return 'rgba(255,255,255,' + (0.08 * k) + ')';
    const c = U.hex(f);
    return U.rgb(U.mix(c, [140, 140, 140], 0.12 * k));
  }
  P.lighter = lighter;

  // ---------------------------------------------------------- Anadolu evi
  P.house = function (ctx, em, x, y, w, h, o, rng) {
    o = o || {};
    const floors = o.floors || 2;
    const fh = h / floors;
    const base = ctx.fillStyle;
    const win = lighter(ctx, 1.4);
    // gövde (üst kat çıkmalı)
    ctx.beginPath();
    ctx.rect(x - w / 2, y - fh, w, fh);
    const ow = floors > 1 ? w * 1.08 : w;
    if (floors > 1) ctx.rect(x - ow / 2, y - h, ow, fh * (floors - 1) + 1);
    ctx.fill();
    if (floors > 1) {
      // çıkma payandaları
      ctx.beginPath();
      for (let i = -1; i <= 1; i += 2) { ctx.moveTo(x + i * ow / 2, y - fh); ctx.lineTo(x + i * w / 2, y - fh + fh * 0.25); ctx.lineTo(x + i * w / 2, y - fh); ctx.closePath(); }
      ctx.fill();
    }
    // çatı (kırma)
    const eave = w * 0.12, rh = o.roofH || h * 0.42;
    const top = y - h;
    ctx.beginPath();
    ctx.moveTo(x - ow / 2 - eave, top + 2);
    for (let i = 0; i <= 14; i++) { const u = i / 14; ctx.lineTo(x - ow / 2 - eave + u * (ow + 2 * eave), top + 2 + (i % 2 ? 1.6 : 0)); }
    ctx.lineTo(x + ow * 0.18, top - rh);
    ctx.lineTo(x - ow * 0.18, top - rh);
    ctx.closePath();
    ctx.fill();
    // baca
    if (o.chimney !== false) {
      const cx = x + (rng ? (rng() - 0.5) * ow * 0.4 : ow * 0.15);
      ctx.fillRect(cx - w * 0.04, top - rh * 0.95, w * 0.08, rh * 0.55);
      ctx.fillRect(cx - w * 0.06, top - rh * 0.98, w * 0.12, w * 0.025);
    }
    // pencereler
    ctx.fillStyle = win;
    const nw = Math.max(2, Math.round(w / (fh * 0.75)));
    for (let f = 0; f < floors; f++) {
      const fy = y - fh * (f + 1), fw = f === 0 ? w : ow;
      for (let i = 0; i < nw; i++) {
        if (f === 0 && i === Math.floor(nw / 2) && o.door !== false) continue;
        const wx = x - fw / 2 + (fw / nw) * (i + 0.5) - fw * 0.06;
        const wy = fy + fh * 0.22, ww = fw * 0.12, wh = fh * 0.5;
        ctx.fillRect(wx, wy, ww, wh);
        if (em && rng && rng() < (o.lit === undefined ? 0.35 : o.lit)) P.lightRect(em, wx + 0.5, wy + 0.5, ww - 1, wh - 1, P.LIGHT, 0.5 + rng() * 0.4);
      }
    }
    ctx.fillStyle = base;
    // kapı
    if (o.door !== false) {
      ctx.fillStyle = win;
      const dw = w * 0.14, dh = fh * 0.72;
      ctx.beginPath(); ctx.moveTo(x - dw / 2, y); ctx.lineTo(x - dw / 2, y - dh + dw / 2); ctx.arc(x, y - dh + dw / 2, dw / 2, Math.PI, 0); ctx.lineTo(x + dw / 2, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = base;
    }
  };

  // Düz damlı kerpiç ev (Doğu Anadolu) — o.broken: yıkık
  P.adobe = function (ctx, em, x, y, w, h, rng, o) {
    o = o || {};
    ctx.beginPath();
    if (!o.broken) {
      ctx.rect(x - w / 2, y - h, w, h);
      ctx.rect(x - w / 2 - 2, y - h - 3, w + 4, 4);
      ctx.fill();
      // hatıl uçları
      ctx.beginPath();
      for (let i = 0; i < 7; i++) { const bx = x - w / 2 + (i + 0.5) * (w / 7); ctx.moveTo(bx + 1.6, y - h - 1); ctx.arc(bx, y - h - 1, 1.6, 0, TAU); }
      ctx.fill();
      ctx.fillStyle = lighter(ctx, 1.3);
      ctx.fillRect(x - w * 0.3, y - h * 0.65, w * 0.14, h * 0.25);
      ctx.fillRect(x + w * 0.12, y - h * 0.65, w * 0.14, h * 0.25);
      if (em && rng && rng() < 0.4) P.lightRect(em, x - w * 0.3, y - h * 0.65, w * 0.14, h * 0.25, '#ffc070', 0.6);
    } else {
      const pts = [x - w / 2, y, x - w / 2, y - h * U.lerp(0.4, 0.9, rng())];
      const n = 7;
      for (let i = 1; i < n; i++) pts.push(x - w / 2 + (i / n) * w, y - h * U.lerp(0.15, 0.85, rng()));
      pts.push(x + w / 2, y - h * U.lerp(0.2, 0.7, rng()), x + w / 2, y);
      P.poly(ctx, pts);
      ctx.fill();
      P.rubble(ctx, x - w * 0.7, x + w * 0.7, y, h * 0.35, rng);
    }
  };

  // Moloz yığını (beton parçaları + inşaat demiri)
  P.rubble = function (ctx, x0, x1, y, h, rng, o) {
    o = o || {};
    ctx.beginPath();
    const n = Math.max(4, Math.floor((x1 - x0) / (h * 0.6)));
    ctx.moveTo(x0, y + 2);
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const env = Math.sin(u * Math.PI);
      ctx.lineTo(U.lerp(x0, x1, u) + (rng() - 0.5) * h * 0.3, y - h * env * U.lerp(0.55, 1.05, rng()));
    }
    ctx.lineTo(x1, y + 2);
    ctx.closePath();
    ctx.fill();
    // bloklar
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const bx = U.lerp(x0, x1, rng()), u = (bx - x0) / (x1 - x0);
      const by = y - h * Math.sin(u * Math.PI) * U.lerp(0.6, 1.1, rng());
      const bw = h * U.lerp(0.25, 0.6, rng()), bh = bw * U.lerp(0.4, 0.8, rng()), a = (rng() - 0.5) * 1.2;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(a); ctx.rect(-bw / 2, -bh / 2, bw, bh); ctx.restore();
    }
    ctx.fill();
    // demirler
    if (o.rebar !== false) {
      ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.8, h * 0.025); ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < n * 0.8; i++) {
        const bx = U.lerp(x0, x1, U.lerp(0.15, 0.85, rng())), u = (bx - x0) / (x1 - x0);
        const by = y - h * Math.sin(u * Math.PI) * 0.8;
        const L = h * U.lerp(0.3, 0.7, rng()), a = -Math.PI / 2 + (rng() - 0.5) * 1.6;
        ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + Math.cos(a) * L * 0.5 + (rng() - 0.5) * L * 0.4, by + Math.sin(a) * L * 0.5, bx + Math.cos(a) * L, by + Math.sin(a) * L);
      }
      ctx.stroke(); ctx.restore();
    }
  };

  // --------------------------------------------------- genel bina
  P.building = function (ctx, em, x, y, w, h, o, rng) {
    o = o || {};
    const floors = o.floors || Math.max(1, Math.round(h / 34));
    const base = ctx.fillStyle;
    ctx.save();
    if (o.tilt) { ctx.translate(x + (o.tilt > 0 ? w / 2 : -w / 2), y); ctx.rotate(o.tilt); ctx.translate(-(x + (o.tilt > 0 ? w / 2 : -w / 2)), -y); }
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h);
    // kat kornişleri
    if (o.cornice !== false) {
      const fh = h / floors;
      for (let f = 1; f < floors; f++) ctx.rect(x - w / 2 - 1.5, y - f * fh - 1, w + 3, 2);
      ctx.rect(x - w / 2 - 3, y - h - 3, w + 6, 4);
    }
    ctx.fill();
    // çatı
    const roof = o.roof || 'flat';
    ctx.beginPath();
    if (roof === 'gable' || roof === 'hip') {
      const rh = o.roofH || w * 0.3;
      ctx.moveTo(x - w / 2 - 4, y - h);
      ctx.lineTo(roof === 'hip' ? x - w * 0.2 : x, y - h - rh);
      if (roof === 'hip') ctx.lineTo(x + w * 0.2, y - h - rh);
      ctx.lineTo(x + w / 2 + 4, y - h);
      ctx.closePath();
    } else if (roof === 'mansard') {
      const rh = o.roofH || h * 0.18;
      ctx.moveTo(x - w / 2 - 2, y - h); ctx.lineTo(x - w / 2 + rh * 0.35, y - h - rh); ctx.lineTo(x + w / 2 - rh * 0.35, y - h - rh); ctx.lineTo(x + w / 2 + 2, y - h); ctx.closePath();
      // çatı pencereleri
      const nd = Math.max(1, Math.round(w / 30));
      for (let i = 0; i < nd; i++) { const dx = x - w / 2 + (i + 0.5) * (w / nd); ctx.rect(dx - 3.5, y - h - rh * 0.85, 7, rh * 0.6); ctx.moveTo(dx - 5, y - h - rh * 0.85); ctx.lineTo(dx, y - h - rh * 1.15); ctx.lineTo(dx + 5, y - h - rh * 0.85); ctx.closePath(); }
    } else if (roof === 'dome') {
      ctx.ellipse(x, y - h, w * 0.32, w * 0.3, 0, Math.PI, TAU);
    } else {
      // düz çatı: korkuluk + su deposu + antenler
      if (o.tank) { ctx.rect(x - w * 0.3, y - h - 9, 12, 9); ctx.rect(x - w * 0.3 - 1, y - h - 10, 14, 2); }
      if (o.penthouse) ctx.rect(x - w * 0.25, y - h - h * 0.08, w * 0.5, h * 0.08);
    }
    ctx.fill();
    if (o.antennas) {
      const na = o.antennas;
      for (let i = 0; i < na; i++) P.antennaTV(ctx, x - w / 2 + (i + 0.5) * (w / na) + (rng ? (rng() - 0.5) * 8 : 0), y - h - (roof === 'gable' ? (o.roofH || w * 0.3) * 0.4 : 0), U.lerp(14, 24, rng ? rng() : 0.5));
    }
    if (o.dishes) {
      for (let i = 0; i < o.dishes; i++) P.dish(ctx, x - w / 2 + (i + 0.6) * (w / (o.dishes + 0.4)), y - h * U.lerp(0.3, 0.9, rng ? rng() : 0.5), 4.5, -0.4);
    }
    // pencereler
    const cols = o.cols || Math.max(2, Math.round(w / 16));
    P.windows(ctx, em, x - w / 2, y - h, w, h, cols, floors, { tone: lighter(ctx, o.winTone || 1.2), lit: o.lit, arch: o.arch, ww: o.ww, wh: o.wh, padY: h * 0.02, padX: w * 0.06 }, rng);
    ctx.fillStyle = base;
    // balkonlar
    if (o.balcony) {
      const fh = h / floors;
      ctx.beginPath();
      for (let f = 1; f < floors; f++) {
        const by = y - f * fh;
        ctx.rect(x - w / 2 - 4, by - 1.5, w + 8, 2.5);
        for (let k = 0; k <= Math.floor(w / 6); k++) ctx.rect(x - w / 2 - 3 + k * ((w + 6) / Math.floor(w / 6)), by - fh * 0.32, 0.9, fh * 0.32);
        ctx.rect(x - w / 2 - 4, by - fh * 0.34, w + 8, 1.4);
      }
      ctx.fill();
    }
    ctx.restore();
  };

  // Apartman (1960 sonrası): kat kat balkon, depo, anten/çanak
  P.apartment = function (ctx, em, x, y, w, floors, o, rng) {
    o = o || {};
    const fh = o.fh || 15;
    const h = floors * fh + 6;
    P.building(ctx, em, x, y, w, h, {
      floors: floors, cols: o.cols || Math.max(3, Math.round(w / 15)), balcony: o.balcony !== false, tank: rng && rng() < 0.6,
      antennas: o.year && o.year < 1995 ? (rng && rng() < 0.8 ? U.clamp(Math.round(w / 25), 1, 4) : 0) : 0,
      dishes: o.year && o.year >= 1990 ? (rng && rng() < 0.6 ? Math.round(rng() * 3) + 1 : 0) : 0,
      lit: o.lit, roof: o.roof || (rng && rng() < 0.3 ? 'gable' : 'flat'), roofH: w * 0.18, tilt: o.tilt, penthouse: rng && rng() < 0.3,
    }, rng);
    return h;
  };

  // Gökdelen
  P.tower = function (ctx, em, x, y, w, h, o, rng) {
    o = o || {};
    const base = ctx.fillStyle;
    ctx.beginPath();
    const kind = o.kind || 'box';
    if (kind === 'slant') {
      ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h); ctx.lineTo(x + w / 2, y - h + w * 0.6); ctx.lineTo(x + w / 2, y);
    } else if (kind === 'taper') {
      ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w * 0.36, y - h); ctx.lineTo(x + w * 0.36, y - h); ctx.lineTo(x + w / 2, y);
    } else if (kind === 'step') {
      ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * 0.7); ctx.lineTo(x - w * 0.36, y - h * 0.7); ctx.lineTo(x - w * 0.36, y - h * 0.9);
      ctx.lineTo(x - w * 0.2, y - h * 0.9); ctx.lineTo(x - w * 0.2, y - h); ctx.lineTo(x + w * 0.2, y - h); ctx.lineTo(x + w * 0.2, y - h * 0.9);
      ctx.lineTo(x + w * 0.36, y - h * 0.9); ctx.lineTo(x + w * 0.36, y - h * 0.7); ctx.lineTo(x + w / 2, y - h * 0.7); ctx.lineTo(x + w / 2, y);
    } else if (kind === 'round') {
      ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + w / 2); ctx.arc(x, y - h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, y);
    } else {
      ctx.rect(x - w / 2, y - h, w, h);
    }
    ctx.closePath();
    ctx.fill();
    if (o.spire) { ctx.beginPath(); ctx.moveTo(x - 1.2, y - h); ctx.lineTo(x, y - h - o.spire); ctx.lineTo(x + 1.2, y - h); ctx.fill(); if (em) P.glow(em, x, y - h - o.spire, 6, '#ff4a3a', 0.9); }
    // cam ızgarası
    ctx.save();
    ctx.beginPath(); ctx.rect(x - w / 2 + 2, y - h + 4, w - 4, h - 6); ctx.clip();
    ctx.fillStyle = lighter(ctx, 0.9);
    const fl = Math.floor(h / 7);
    for (let i = 0; i < fl; i++) ctx.fillRect(x - w / 2, y - h + 4 + i * 7, w, 0.8);
    const cl = Math.max(2, Math.floor(w / 9));
    for (let i = 1; i < cl; i++) ctx.fillRect(x - w / 2 + i * (w / cl), y - h, 0.7, h);
    ctx.restore();
    ctx.fillStyle = base;
    if (em && rng) {
      for (let i = 0; i < fl; i++) for (let k = 0; k < cl; k++) if (rng() < (o.lit === undefined ? 0.22 : o.lit)) P.lightRect(em, x - w / 2 + k * (w / cl) + 1, y - h + 5 + i * 7, w / cl - 2, 4.5, rng() < 0.7 ? '#fff0d0' : '#cfe6ff', 0.35 + rng() * 0.4);
      P.glow(em, x, y - h - 2, 4, '#ff3b2f', 0.9);
    }
  };

  // Modern salon/fabrika/kongre binası: dalgalı veya kemerli çatı, cam bant, dikey kanatlar
  P.modernHall = function (ctx, em, x, y, w, h, o, rng) {
    o = o || {};
    const base = ctx.fillStyle;
    const roof = o.roof || 'wave';
    ctx.beginPath(); ctx.rect(x - w / 2 - 8, y - 8, w + 16, 10); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - 6);
    ctx.lineTo(x - w / 2, y - h);
    if (roof === 'wave') {
      const ov = 22, n = 3;
      ctx.lineTo(x - w / 2 - ov, y - h - 3);
      for (let i = 0; i < n; i++) {
        const a0 = x - w / 2 - ov + i * (w + ov * 2) / n, a1 = a0 + (w + ov * 2) / n;
        ctx.quadraticCurveTo((a0 + a1) / 2, y - h - 30 - (i % 2) * 12, a1, y - h - 3);
      }
      ctx.lineTo(x + w / 2, y - h);
    } else if (roof === 'arc') {
      ctx.lineTo(x - w / 2 - 16, y - h);
      ctx.quadraticCurveTo(x, y - h - h * 0.42, x + w / 2 + 16, y - h);
      ctx.lineTo(x + w / 2, y - h);
    } else {
      ctx.lineTo(x - w / 2 - 14, y - h); ctx.lineTo(x - w / 2 - 14, y - h - 6); ctx.lineTo(x + w / 2 + 14, y - h - 6); ctx.lineTo(x + w / 2 + 14, y - h); ctx.lineTo(x + w / 2, y - h);
    }
    ctx.lineTo(x + w / 2, y - 6);
    ctx.closePath(); ctx.fill();
    // cam bant ve kanatlar
    const g0 = y - h + h * 0.16, gh = h * 0.6;
    const nf = Math.max(6, Math.floor(w / 15));
    ctx.save();
    ctx.fillStyle = P.lighter(ctx, 1.4);
    ctx.fillRect(x - w / 2 + 8, g0, w - 16, gh);
    ctx.fillStyle = base;
    for (let i = 0; i <= nf; i++) ctx.fillRect(x - w / 2 + 8 + i * (w - 16) / nf - 1.1, g0, 2.2, gh);
    ctx.fillRect(x - w / 2 + 8, g0 + gh * 0.5 - 1, w - 16, 2.2);
    ctx.restore();
    if (em) {
      P.lightRect(em, x - w / 2 + 8, g0, w - 16, gh, '#ffe4bc', 0.14);
      for (let i = 0; i < nf; i++) {
        if (rng && rng() > (o.lit === undefined ? 0.4 : o.lit)) continue;
        const top = rng && rng() < 0.5;
        P.lightRect(em, x - w / 2 + 9.5 + i * (w - 16) / nf, g0 + (top ? 1.5 : gh * 0.5 + 1.5), (w - 16) / nf - 3, gh * 0.5 - 3.5, '#fff1d8', 0.38);
      }
    }
    // giriş saçağı
    ctx.beginPath();
    ctx.rect(x - w * 0.13, y - h * 0.3, w * 0.26, 5);
    ctx.rect(x - w * 0.13 + 4, y - h * 0.3, 3, h * 0.3 - 7);
    ctx.rect(x + w * 0.13 - 7, y - h * 0.3, 3, h * 0.3 - 7);
    ctx.fill();
  };

  P.antennaTV = function (ctx, x, y, h) {
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h);
    for (let i = 0; i < 4; i++) { const yy = y - h + i * h * 0.12, L = h * (0.35 - i * 0.06); ctx.moveTo(x - L * 0.3, yy); ctx.lineTo(x + L, yy); }
    ctx.stroke(); ctx.restore();
  };
  P.dish = function (ctx, x, y, r, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a || -0.4);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.45, r, 0, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 0.7; ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 1.0, 0); ctx.stroke();
    ctx.restore();
  };

  // ---------------------------------------------------------- cami öğeleri
  P.alem = function (ctx, x, y, s) {
    ctx.beginPath();
    P.capsule(ctx, x, y, s * 0.5, x, y - s * 3, s * 0.25);
    ctx.moveTo(x + s * 0.9, y - s * 1.2); ctx.arc(x, y - s * 1.2, s * 0.9, 0, TAU);
    ctx.fill();
    // hilal
    ctx.beginPath();
    ctx.arc(x, y - s * 4.0, s * 1.3, 0.35, TAU - 0.35);
    ctx.arc(x + s * 0.55, y - s * 4.0, s * 1.0, TAU - 0.55, 0.55, true);
    ctx.closePath(); ctx.fill();
  };

  P.dome = function (ctx, x, y, r, o) {
    o = o || {};
    const drumH = o.drum === undefined ? r * 0.28 : o.drum;
    const hr = o.hr || r * 0.92;
    ctx.beginPath();
    ctx.rect(x - r * 0.98, y - drumH, r * 1.96, drumH + 1);
    ctx.moveTo(x - r, y - drumH);
    ctx.ellipse(x, y - drumH, r, hr, 0, Math.PI, TAU);
    ctx.fill();
    if (o.alem !== false) P.alem(ctx, x, y - drumH - hr + 1, Math.max(0.6, r * 0.07));
    // kasnak pencereleri
    if (o.windows !== false && drumH > 3) {
      const save = ctx.fillStyle;
      ctx.fillStyle = lighter(ctx, 1.3);
      const n = Math.max(4, Math.round(r / 4));
      for (let i = 0; i < n; i++) {
        const wx = x - r * 0.85 + (i + 0.5) * (r * 1.7 / n);
        ctx.beginPath(); ctx.moveTo(wx - 0.9, y - drumH * 0.2); ctx.lineTo(wx - 0.9, y - drumH * 0.65); ctx.arc(wx, y - drumH * 0.65, 0.9, Math.PI, 0); ctx.lineTo(wx + 0.9, y - drumH * 0.2); ctx.fill();
      }
      ctx.fillStyle = save;
    }
    return y - drumH - hr;
  };

  P.minaret = function (ctx, x, y, h, w, o) {
    o = o || {};
    const sh = o.serefe || (h > 120 ? 3 : h > 70 ? 2 : 1);
    ctx.beginPath();
    // kürsü
    ctx.rect(x - w * 0.85, y - h * 0.1, w * 1.7, h * 0.1);
    ctx.moveTo(x - w * 0.85, y - h * 0.1); ctx.lineTo(x - w * 0.6, y - h * 0.14); ctx.lineTo(x + w * 0.6, y - h * 0.14); ctx.lineTo(x + w * 0.85, y - h * 0.1); ctx.closePath();
    // gövde
    const shaftTop = y - h * 0.8;
    ctx.moveTo(x - w * 0.55, y - h * 0.14); ctx.lineTo(x - w * 0.48, shaftTop); ctx.lineTo(x + w * 0.48, shaftTop); ctx.lineTo(x + w * 0.55, y - h * 0.14); ctx.closePath();
    // şerefeler
    for (let i = 0; i < sh; i++) {
      const sy = U.lerp(y - h * 0.45, shaftTop, sh === 1 ? 1 : i / (sh - 1));
      ctx.moveTo(x - w * 0.5, sy + w * 0.5); ctx.lineTo(x - w * 0.95, sy); ctx.lineTo(x + w * 0.95, sy); ctx.lineTo(x + w * 0.5, sy + w * 0.5); ctx.closePath();
      ctx.rect(x - w * 0.95, sy - w * 0.45, w * 1.9, w * 0.45);
    }
    // petek
    ctx.rect(x - w * 0.42, shaftTop - h * 0.06, w * 0.84, h * 0.06 + 1);
    // külah
    ctx.moveTo(x - w * 0.5, shaftTop - h * 0.06); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.5, shaftTop - h * 0.06); ctx.closePath();
    ctx.fill();
    P.alem(ctx, x, y - h + 1, Math.max(0.45, w * 0.18));
    if (o.em && o.lit) { for (let i = 0; i < sh; i++) { const sy = U.lerp(y - h * 0.45, shaftTop, sh === 1 ? 1 : i / (sh - 1)); P.lightRect(o.em, x - w * 0.95, sy - w * 0.5, w * 1.9, w * 0.25, '#fff2c4', 0.8); P.glow(o.em, x, sy - w * 0.3, w * 3, '#ffe2a0', 0.35); } }
  };

  /* Osmanlı camisi. R: ana kubbe yarıçapı. o.minarets: 2/4/6 */
  P.mosque = function (ctx, em, x, y, R, o, rng) {
    o = o || {};
    const nm = o.minarets === undefined ? 4 : o.minarets;
    const baseH = R * 0.95;
    // minareler (arkadakiler)
    const mh = o.minH || R * 3.1, mw = R * 0.15;
    const mPos = nm === 2 ? [-1.75, 1.75] : nm === 6 ? [-2.6, -1.75, -1.2, 1.2, 1.75, 2.6] : nm === 1 ? [1.8] : [-2.1, -1.65, 1.65, 2.1];
    mPos.forEach((p, i) => {
      const far = nm >= 4 && (Math.abs(p) < 1.7);
      P.minaret(ctx, x + p * R, y, mh * (far ? 0.94 : 1) * (nm === 6 && Math.abs(p) < 1.5 ? 0.9 : 1), mw, { em: em, lit: o.lit });
    });
    // gövde
    ctx.beginPath();
    ctx.rect(x - R * 1.55, y - baseH, R * 3.1, baseH);
    ctx.fill();
    // köşe kubbecikleri
    [-1.25, 1.25].forEach((p) => P.dome(ctx, x + p * R, y - baseH, R * 0.28, { drum: R * 0.08, alem: true, windows: false }));
    // yarım kubbeler
    ctx.beginPath();
    ctx.moveTo(x - R * 1.45, y - baseH);
    ctx.ellipse(x - R * 0.75, y - baseH, R * 0.7, R * 0.5, 0, Math.PI, TAU);
    ctx.moveTo(x + R * 0.05, y - baseH);
    ctx.ellipse(x + R * 0.75, y - baseH, R * 0.7, R * 0.5, 0, Math.PI, TAU);
    ctx.fill();
    // ağırlık kuleleri
    [-0.9, 0.9].forEach((p) => {
      ctx.beginPath(); ctx.rect(x + p * R - R * 0.08, y - baseH - R * 0.62, R * 0.16, R * 0.62); ctx.fill();
      P.dome(ctx, x + p * R, y - baseH - R * 0.62, R * 0.1, { drum: 0, windows: false, alem: false });
    });
    // ana kubbe
    const top = P.dome(ctx, x, y - baseH - R * 0.45, R * 0.82, { drum: R * 0.22, hr: R * 0.72 });
    ctx.beginPath(); ctx.rect(x - R * 0.85, y - baseH - R * 0.46, R * 1.7, R * 0.47); ctx.fill();
    // pencereler
    const save = ctx.fillStyle;
    P.windows(ctx, em, x - R * 1.5, y - baseH, R * 3.0, baseH * 0.9, Math.round(R / 3.2), 2, { tone: lighter(ctx, 1.1), arch: true, lit: o.lit === undefined ? 0.15 : o.lit, ww: 0.45, wh: 0.6, color: '#ffe0a0' }, rng);
    ctx.fillStyle = save;
    return top;
  };

  P.ayasofya = function (ctx, em, x, y, R, rng) {
    const mh = R * 2.5;
    // minareler: farklı biçimler
    P.minaret(ctx, x - R * 2.3, y, mh * 0.95, R * 0.2);
    P.minaret(ctx, x - R * 1.7, y, mh, R * 0.15);
    P.minaret(ctx, x + R * 1.7, y, mh, R * 0.15);
    P.minaret(ctx, x + R * 2.3, y, mh * 0.92, R * 0.22);
    const baseH = R * 1.05;
    ctx.beginPath();
    ctx.rect(x - R * 1.9, y - baseH * 0.8, R * 3.8, baseH * 0.8);
    ctx.rect(x - R * 1.3, y - baseH, R * 2.6, baseH);
    // payandalar
    [-1.35, 1.35].forEach((p) => { const bx = x + p * R; ctx.moveTo(bx - R * 0.15, y - baseH * 1.45); ctx.lineTo(bx + R * 0.15 * Math.sign(p) * -1 + R * 0.15, y - baseH * 1.45); ctx.lineTo(bx + Math.sign(p) * R * 0.45 + R * 0.12, y); ctx.lineTo(bx - R * 0.2 + Math.sign(p) * R * 0.1, y); ctx.closePath(); });
    ctx.fill();
    // yarım kubbeler
    ctx.beginPath();
    ctx.moveTo(x - R * 1.6, y - baseH); ctx.ellipse(x - R * 0.95, y - baseH, R * 0.65, R * 0.42, 0, Math.PI, TAU);
    ctx.moveTo(x + R * 0.3, y - baseH); ctx.ellipse(x + R * 0.95, y - baseH, R * 0.65, R * 0.42, 0, Math.PI, TAU);
    ctx.fill();
    // basık ana kubbe, kaburgalı kasnak
    ctx.beginPath();
    ctx.rect(x - R * 0.95, y - baseH - R * 0.38, R * 1.9, R * 0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - R * 0.98, y - baseH - R * 0.36);
    ctx.ellipse(x, y - baseH - R * 0.36, R * 0.98, R * 0.5, 0, Math.PI, TAU);
    ctx.fill();
    const save = ctx.fillStyle;
    ctx.fillStyle = lighter(ctx, 1.3);
    for (let i = 0; i < 16; i++) { const wx = x - R * 0.85 + (i + 0.5) * (R * 1.7 / 16); ctx.fillRect(wx - 0.8, y - baseH - R * 0.34, 1.6, R * 0.14); }
    ctx.fillStyle = save;
    P.alem(ctx, x, y - baseH - R * 0.86, Math.max(0.6, R * 0.06));
    P.windows(ctx, em, x - R * 1.8, y - baseH * 0.8, R * 3.6, baseH * 0.7, 12, 2, { tone: lighter(ctx, 1.1), arch: true, lit: 0.15, ww: 0.4, wh: 0.55 }, rng);
    ctx.fillStyle = save;
  };

  P.galata = function (ctx, em, x, y, s, o) {
    o = o || {};
    const w = s * 0.42, h = s * 1.55;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.62, y); ctx.lineTo(x - w * 0.52, y - h); ctx.lineTo(x + w * 0.52, y - h); ctx.lineTo(x + w * 0.62, y); ctx.closePath();
    // galeri
    ctx.rect(x - w * 0.62, y - h - s * 0.05, w * 1.24, s * 0.05);
    ctx.rect(x - w * 0.56, y - h - s * 0.2, w * 1.12, s * 0.16);
    ctx.rect(x - w * 0.6, y - h - s * 0.22, w * 1.2, s * 0.03);
    // külah
    ctx.moveTo(x - w * 0.62, y - h - s * 0.21); ctx.quadraticCurveTo(x - w * 0.2, y - h - s * 0.45, x, y - h - s * 0.62); ctx.quadraticCurveTo(x + w * 0.2, y - h - s * 0.45, x + w * 0.62, y - h - s * 0.21); ctx.closePath();
    ctx.fill();
    ctx.beginPath(); P.capsule(ctx, x, y - h - s * 0.6, 0.7, x, y - h - s * 0.72, 0.4); ctx.fill();
    const save = ctx.fillStyle;
    ctx.fillStyle = lighter(ctx, 1.5);
    for (let i = 0; i < 5; i++) { const wx = x - w * 0.42 + i * w * 0.21; ctx.beginPath(); ctx.moveTo(wx - w * 0.06, y - h - s * 0.05); ctx.lineTo(wx - w * 0.06, y - h - s * 0.14); ctx.arc(wx, y - h - s * 0.14, w * 0.06, Math.PI, 0); ctx.lineTo(wx + w * 0.06, y - h - s * 0.05); ctx.fill(); }
    for (let i = 0; i < 4; i++) ctx.fillRect(x - w * 0.08, y - h * (0.25 + i * 0.18), w * 0.16, h * 0.07);
    ctx.fillStyle = save;
    if (em && o.lit !== false) { for (let i = 0; i < 5; i++) P.lightRect(em, x - w * 0.42 + i * w * 0.21 - w * 0.05, y - h - s * 0.15, w * 0.1, s * 0.09, '#ffd890', 0.7); P.glow(em, x, y - h - s * 0.12, s * 0.35, '#ffcf80', 0.25); }
  };

  P.maidenTower = function (ctx, em, x, y, s) {
    ctx.beginPath();
    // kayalık ada
    ctx.moveTo(x - s * 0.8, y + 2); ctx.quadraticCurveTo(x - s * 0.7, y - s * 0.12, x - s * 0.3, y - s * 0.14); ctx.lineTo(x + s * 0.4, y - s * 0.13); ctx.quadraticCurveTo(x + s * 0.75, y - s * 0.1, x + s * 0.85, y + 2); ctx.closePath();
    ctx.rect(x - s * 0.55, y - s * 0.42, s * 1.0, s * 0.3);
    ctx.rect(x + s * 0.05, y - s * 1.0, s * 0.3, s * 0.62);
    ctx.rect(x + s * 0.0, y - s * 1.08, s * 0.4, s * 0.08);
    ctx.fill();
    P.dome(ctx, x + s * 0.2, y - s * 1.08, s * 0.14, { drum: s * 0.12, windows: false, alem: false });
    ctx.beginPath(); ctx.rect(x + s * 0.19, y - s * 1.45, s * 0.02, s * 0.12); ctx.fill();
    if (em) { P.glow(em, x + s * 0.2, y - s * 1.2, s * 0.25, '#ffe9b0', 0.6); P.lightRect(em, x - s * 0.4, y - s * 0.32, s * 0.08, s * 0.08, P.LIGHT, 0.7); P.lightRect(em, x + s * 0.13, y - s * 0.8, s * 0.06, s * 0.1, P.LIGHT, 0.7); }
  };

  // --------------------------------------------------------- klasik cephe
  P.classical = function (ctx, em, x, y, w, h, o, rng) {
    o = o || {};
    const cols = o.cols || 6;
    const stepH = h * 0.1, entH = h * 0.12, pedH = o.pediment === false ? 0 : h * 0.22;
    ctx.beginPath();
    // basamaklar
    for (let i = 0; i < 4; i++) ctx.rect(x - w / 2 - (4 - i) * 3, y - (i + 1) * (stepH / 4), w + (4 - i) * 6, stepH / 4 + 0.5);
    // sütunlar
    const colTop = y - h + entH + pedH;
    const cw = w / (cols * 2 - 1);
    for (let i = 0; i < cols; i++) {
      const cx = x - w / 2 + cw * (i * 2) + cw / 2;
      ctx.rect(cx - cw * 0.42, colTop, cw * 0.84, y - stepH - colTop);
      ctx.rect(cx - cw * 0.6, colTop, cw * 1.2, cw * 0.35);
      ctx.rect(cx - cw * 0.58, y - stepH - cw * 0.3, cw * 1.16, cw * 0.3);
    }
    // arka duvar (hafif geride)
    // saçaklık
    ctx.rect(x - w / 2 - 4, colTop - entH, w + 8, entH);
    ctx.fill();
    if (pedH) {
      ctx.beginPath(); ctx.moveTo(x - w / 2 - 6, colTop - entH); ctx.lineTo(x, colTop - entH - pedH); ctx.lineTo(x + w / 2 + 6, colTop - entH); ctx.closePath(); ctx.fill();
    }
    if (o.attic) { ctx.beginPath(); ctx.rect(x - w * 0.35, colTop - entH - h * 0.14, w * 0.7, h * 0.14); ctx.fill(); }
    if (o.domeTop) P.dome(ctx, x, colTop - entH - (pedH || 0) + 2, w * 0.18, { drum: w * 0.06, alem: false });
    // iç boşluk (sütun arası karanlık + ışık)
    const save = ctx.fillStyle;
    ctx.fillStyle = lighter(ctx, -1.6);
    for (let i = 0; i < cols - 1; i++) {
      const cx = x - w / 2 + cw * (i * 2 + 1) + cw / 2;
      ctx.fillRect(cx - cw * 0.5, colTop + cw * 0.35, cw, y - stepH - colTop - cw * 0.65);
      if (em && rng && rng() < (o.lit || 0)) P.lightRect(em, cx - cw * 0.3, colTop + (y - stepH - colTop) * 0.35, cw * 0.6, (y - stepH - colTop) * 0.4, P.LIGHT, 0.5);
    }
    ctx.fillStyle = save;
    if (o.scales) P.scales(ctx, x, colTop - entH - pedH * 0.3, pedH * 0.4);
    return colTop - entH - pedH;
  };

  P.scales = function (ctx, x, y, s) {
    ctx.save(); ctx.fillStyle = lighter(ctx, 2.2); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.6, s * 0.06);
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.55); ctx.lineTo(x, y + s * 0.45); ctx.moveTo(x - s * 0.6, y - s * 0.4); ctx.lineTo(x + s * 0.6, y - s * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - s * 0.6, y, s * 0.22, 0, Math.PI); ctx.arc(x + s * 0.6, y, s * 0.22, 0, Math.PI); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.4); ctx.lineTo(x - s * 0.8, y); ctx.moveTo(x - s * 0.6, y - s * 0.4); ctx.lineTo(x - s * 0.4, y);
    ctx.moveTo(x + s * 0.6, y - s * 0.4); ctx.lineTo(x + s * 0.4, y); ctx.moveTo(x + s * 0.6, y - s * 0.4); ctx.lineTo(x + s * 0.8, y); ctx.stroke();
    ctx.restore();
  };

  // ------------------------------------------------------ simge yapılar
  // I. TBMM binası (Ulus, 1920)
  P.tbmm1920 = function (ctx, em, x, y, s, rng, o) {
    o = o || {};
    const w = s * 2.6, h = s * 0.62;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h);
    ctx.rect(x - w / 2 - 2, y - h - 3, w + 4, 4);
    ctx.rect(x - w / 2 - 1, y - h * 0.5, w + 2, 2.5);
    // orta çıkıntı
    ctx.rect(x - s * 0.36, y - h - s * 0.08, s * 0.72, h + s * 0.08);
    ctx.fill();
    // kırma çatı
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 6, y - h - 2); ctx.lineTo(x - w / 2 + s * 0.35, y - h - s * 0.32); ctx.lineTo(x + w / 2 - s * 0.35, y - h - s * 0.32); ctx.lineTo(x + w / 2 + 6, y - h - 2); ctx.closePath();
    // orta alınlık
    ctx.moveTo(x - s * 0.42, y - h - s * 0.08); ctx.lineTo(x, y - h - s * 0.36); ctx.lineTo(x + s * 0.42, y - h - s * 0.08); ctx.closePath();
    // bacalar
    [-0.8, 0.8].forEach((p) => ctx.rect(x + p * s - 3, y - h - s * 0.4, 6, s * 0.18));
    ctx.fill();
    // basamaklar
    ctx.beginPath(); for (let i = 0; i < 3; i++) ctx.rect(x - s * 0.3 - (3 - i) * 3, y - (i + 1) * 2.4, s * 0.6 + (3 - i) * 6, 2.6); ctx.fill();
    // pencereler: alt kat sivri kemerli, üst kat dikdörtgen
    const save = ctx.fillStyle;
    const tone = lighter(ctx, 1.5);
    const n = 13;
    for (let f = 0; f < 2; f++) {
      for (let i = 0; i < n; i++) {
        if (f === 0 && i === 6) continue;
        const wx = x - w / 2 + (i + 0.5) * (w / n), ww = w / n * 0.42;
        const wy0 = f === 0 ? y - h * 0.43 : y - h * 0.92, wh = h * 0.32;
        ctx.fillStyle = tone;
        ctx.beginPath();
        ctx.moveTo(wx - ww / 2, wy0 + wh); ctx.lineTo(wx - ww / 2, wy0 + ww * 0.5);
        if (f === 0) { ctx.quadraticCurveTo(wx - ww / 2, wy0, wx, wy0 - ww * 0.25); ctx.quadraticCurveTo(wx + ww / 2, wy0, wx + ww / 2, wy0 + ww * 0.5); }
        else { ctx.lineTo(wx - ww / 2, wy0); ctx.lineTo(wx + ww / 2, wy0); }
        ctx.lineTo(wx + ww / 2, wy0 + wh); ctx.closePath(); ctx.fill();
        if (em && rng && rng() < (o.lit === undefined ? 0.45 : o.lit)) P.lightRect(em, wx - ww / 2 + 0.6, wy0 + 1, ww - 1.2, wh - 1.5, P.LIGHT, 0.55 + rng() * 0.35);
      }
    }
    // kapı
    ctx.fillStyle = tone;
    ctx.beginPath(); ctx.moveTo(x - s * 0.09, y - 7); ctx.lineTo(x - s * 0.09, y - h * 0.38); ctx.arc(x, y - h * 0.38, s * 0.09, Math.PI, 0); ctx.lineTo(x + s * 0.09, y - 7); ctx.fill();
    if (em) P.lightRect(em, x - s * 0.08, y - h * 0.4, s * 0.16, h * 0.32, P.LIGHT, 0.6);
    ctx.fillStyle = save;
    return { poleX: x, poleY: y - h - s * 0.36 };
  };

  // Modern TBMM (Holzmeister)
  P.tbmmModern = function (ctx, em, x, y, s, rng) {
    const w = s * 3.2, h = s * 0.55;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h);
    ctx.rect(x - w / 2 - 3, y - h - 4, w + 6, 5);
    // orta blok
    ctx.rect(x - s * 0.7, y - h * 1.45, s * 1.4, h * 1.45);
    ctx.rect(x - s * 0.74, y - h * 1.45 - 4, s * 1.48, 5);
    ctx.fill();
    // basamaklı piramit çatı
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const ww = s * (1.1 - i * 0.19); ctx.rect(x - ww / 2, y - h * 1.45 - 4 - (i + 1) * s * 0.075, ww, s * 0.08); }
    ctx.fill();
    // sütunlar (orta blok önünde koyu aralıklar)
    const save = ctx.fillStyle;
    ctx.fillStyle = lighter(ctx, -1.4);
    for (let i = 0; i < 9; i++) ctx.fillRect(x - s * 0.62 + i * s * 0.15, y - h * 1.3, s * 0.07, h * 1.18);
    ctx.fillStyle = lighter(ctx, 1.2);
    for (let i = 0; i < 18; i++) {
      if (Math.abs(i - 8.5) < 5.5) continue;
      const wx = x - w / 2 + (i + 0.5) * (w / 18);
      for (let f = 0; f < 3; f++) {
        ctx.fillRect(wx - 2, y - h + 6 + f * (h / 3.2), 4, h / 5);
        if (em && rng && rng() < 0.3) P.lightRect(em, wx - 2, y - h + 6 + f * (h / 3.2), 4, h / 5, P.LIGHT, 0.6);
      }
    }
    ctx.fillStyle = save;
    if (em) for (let i = 0; i < 8; i++) P.lightRect(em, x - s * 0.55 + i * s * 0.15, y - h * 1.2, s * 0.06, h * 1.0, '#ffe0a8', 0.25);
    return { poleX: x + w / 2 + s * 0.2, poleY: y - s * 1.3 };
  };

  // II. TBMM binası (1924) — geniş saçaklı
  P.tbmm2 = function (ctx, em, x, y, s, rng) {
    const w = s * 2.4, h = s * 0.55;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h);
    ctx.rect(x - s * 0.4, y - h - s * 0.12, s * 0.8, h + s * 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - s * 0.14, y - h); ctx.lineTo(x - w / 2 + s * 0.2, y - h - s * 0.2); ctx.lineTo(x + w / 2 - s * 0.2, y - h - s * 0.2); ctx.lineTo(x + w / 2 + s * 0.14, y - h); ctx.closePath();
    ctx.moveTo(x - s * 0.52, y - h - s * 0.1); ctx.lineTo(x - s * 0.3, y - h - s * 0.32); ctx.lineTo(x + s * 0.3, y - h - s * 0.32); ctx.lineTo(x + s * 0.52, y - h - s * 0.1); ctx.closePath();
    ctx.fill();
    const save = ctx.fillStyle;
    ctx.fillStyle = lighter(ctx, 1.4);
    for (let i = 0; i < 11; i++) {
      if (i === 5) continue;
      const wx = x - w / 2 + (i + 0.5) * (w / 11);
      for (let f = 0; f < 2; f++) {
        const wy = y - h + 6 + f * h * 0.48;
        ctx.beginPath(); ctx.moveTo(wx - 3, wy + h * 0.3); ctx.lineTo(wx - 3, wy + 3); ctx.arc(wx, wy + 3, 3, Math.PI, 0); ctx.lineTo(wx + 3, wy + h * 0.3); ctx.fill();
        if (em && rng && rng() < 0.35) P.lightRect(em, wx - 2.5, wy + 2, 5, h * 0.27, P.LIGHT, 0.6);
      }
    }
    ctx.beginPath(); ctx.moveTo(x - s * 0.12, y); ctx.lineTo(x - s * 0.12, y - h * 0.55); ctx.arc(x, y - h * 0.55, s * 0.12, Math.PI, 0); ctx.lineTo(x + s * 0.12, y); ctx.fill();
    ctx.fillStyle = save;
    return { poleX: x, poleY: y - h - s * 0.32 };
  };

  P.anitkabir = function (ctx, em, x, y, s) {
    const w = s * 1.9;
    ctx.beginPath();
    // geniş kaide ve merdiven
    ctx.rect(x - s * 2.6, y - s * 0.12, s * 5.2, s * 0.12);
    ctx.rect(x - s * 1.25, y - s * 0.32, s * 2.5, s * 0.2);
    for (let i = 0; i < 8; i++) ctx.rect(x - s * 0.55 - i * 2, y - s * 0.32 + i * s * 0.025, s * 1.1 + i * 4, s * 0.026);
    // Şeref Holü
    const hy = y - s * 0.32, hh = s * 0.62;
    ctx.rect(x - w / 2, hy - hh, w, s * 0.05);
    ctx.rect(x - w / 2 - 4, hy - hh - s * 0.14, w + 8, s * 0.14);
    ctx.rect(x - w * 0.42, hy - hh - s * 0.2, w * 0.84, s * 0.07);
    const nc = 10, cw = w / (nc * 2 - 1);
    for (let i = 0; i < nc; i++) ctx.rect(x - w / 2 + i * cw * 2, hy - hh, cw * 1.05, hh);
    ctx.fill();
    // yan revaklar ve kuleler
    ctx.beginPath();
    [-1, 1].forEach((d) => {
      const rx = x + d * s * 1.15;
      ctx.rect(Math.min(rx, rx + d * s * 1.1), y - s * 0.3, s * 1.1, s * 0.03);
      for (let i = 0; i < 8; i++) ctx.rect(rx + d * i * s * 0.14 - s * 0.025, y - s * 0.28, s * 0.05, s * 0.16);
      const tx = x + d * s * 2.35;
      ctx.rect(tx - s * 0.14, y - s * 0.6, s * 0.28, s * 0.48);
      ctx.moveTo(tx - s * 0.17, y - s * 0.6); ctx.lineTo(tx, y - s * 0.78); ctx.lineTo(tx + s * 0.17, y - s * 0.6); ctx.closePath();
    });
    ctx.fill();
    if (em) { for (let i = 0; i < nc - 1; i++) P.lightRect(em, x - w / 2 + (i * 2 + 1) * cw + 1, hy - hh + 3, cw - 1, hh - 4, '#ffe2b0', 0.18); }
    return { poleX: x + s * 2.0, poleY: y - s * 1.15 };
  };

  // Ankara Kalesi tepesi
  P.castle = function (ctx, em, x, y, s, rng) {
    ctx.beginPath();
    ctx.moveTo(x - s * 1.9, y + 2);
    ctx.quadraticCurveTo(x - s * 1.2, y - s * 0.25, x - s * 0.75, y - s * 0.55);
    ctx.lineTo(x - s * 0.4, y - s * 0.7); ctx.lineTo(x + s * 0.2, y - s * 0.74); ctx.lineTo(x + s * 0.65, y - s * 0.6);
    ctx.quadraticCurveTo(x + s * 1.3, y - s * 0.3, x + s * 2.0, y + 2);
    ctx.closePath(); ctx.fill();
    // surlar
    ctx.beginPath();
    const wy = (u) => y - s * (0.55 + 0.17 * Math.sin(U.clamp(u, 0, 1) * Math.PI));
    for (let i = 0; i <= 20; i++) {
      const u = i / 20, xx = x - s * 0.8 + u * s * 1.55, yy = wy(u);
      ctx.rect(xx, yy - s * 0.1, s * 0.078, s * 0.12);
      if (i % 2) ctx.rect(xx + s * 0.01, yy - s * 0.13, s * 0.05, s * 0.04);
    }
    // burçlar
    [0.08, 0.32, 0.56, 0.84].forEach((u) => {
      const xx = x - s * 0.8 + u * s * 1.55, yy = wy(u);
      ctx.rect(xx - s * 0.06, yy - s * 0.2, s * 0.12, s * 0.22);
      for (let k = 0; k < 3; k++) ctx.rect(xx - s * 0.06 + k * s * 0.045, yy - s * 0.24, s * 0.03, s * 0.05);
    });
    // Akkale
    ctx.rect(x - s * 0.08, y - s * 0.98, s * 0.2, s * 0.3);
    for (let k = 0; k < 4; k++) ctx.rect(x - s * 0.08 + k * s * 0.055, y - s * 1.02, s * 0.035, s * 0.05);
    ctx.fill();
    // yamaçta evler
    for (let i = 0; i < 14; i++) {
      const u = rng(), side = u < 0.5 ? -1 : 1;
      const hx = x + side * s * U.lerp(0.65, 1.6, rng());
      const t = 1 - Math.abs(hx - x) / (s * 1.95);
      const hy = y - s * 0.55 * t * t * U.lerp(0.8, 1.0, rng()) + s * 0.02;
      P.house(ctx, em, hx, hy, s * U.lerp(0.13, 0.2, rng()), s * U.lerp(0.1, 0.16, rng()), { floors: rng() < 0.4 ? 2 : 1, door: false, lit: 0.3 }, rng);
    }
  };

  P.clockTower = function (ctx, em, x, y, s, o) {
    o = o || {};
    ctx.beginPath();
    ctx.rect(x - s * 0.2, y - s * 0.55, s * 0.4, s * 0.55);
    ctx.rect(x - s * 0.24, y - s * 0.6, s * 0.48, s * 0.06);
    ctx.rect(x - s * 0.16, y - s * 1.0, s * 0.32, s * 0.42);
    ctx.rect(x - s * 0.19, y - s * 1.04, s * 0.38, s * 0.05);
    ctx.rect(x - s * 0.12, y - s * 1.3, s * 0.24, s * 0.28);
    ctx.fill();
    P.dome(ctx, x, y - s * 1.3, s * 0.12, { drum: s * 0.04, windows: false, alem: false });
    ctx.beginPath(); P.capsule(ctx, x, y - s * 1.42, s * 0.012, x, y - s * 1.55, s * 0.006); ctx.fill();
    // saat kadranı
    const cy = y - s * 0.82, r = s * 0.1;
    const save = ctx.fillStyle;
    ctx.fillStyle = o.faceColor || lighter(ctx, 3.5);
    P.fillCircle(ctx, x, cy, r);
    ctx.fillStyle = save;
    if (em && o.lit) P.glow(em, x, cy, r * 2.2, '#fff0c8', 0.45);
    // akrep ve yelkovan
    const hh = o.hour === undefined ? 9 : o.hour, mm = o.minute === undefined ? 5 : o.minute;
    const ah = ((hh % 12) + mm / 60) / 12 * TAU - Math.PI / 2, am = (mm / 60) * TAU - Math.PI / 2;
    ctx.save(); ctx.strokeStyle = save; ctx.lineCap = 'round';
    ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(ah) * r * 0.55, cy + Math.sin(ah) * r * 0.55); ctx.stroke();
    ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(am) * r * 0.82, cy + Math.sin(am) * r * 0.82); ctx.stroke();
    ctx.restore();
  };

  P.dolmabahce = function (ctx, em, x, y, s, rng) {
    const w = s * 4.2, h = s * 0.5;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h);
    ctx.rect(x - w / 2 - 3, y - h - 4, w + 6, 5);
    // korkuluk
    for (let i = 0; i < 60; i++) ctx.rect(x - w / 2 + i * (w / 60), y - h - 9, 1.4, 5);
    ctx.rect(x - w / 2, y - h - 10, w, 1.5);
    // orta tören salonu
    ctx.rect(x - s * 0.55, y - h * 1.5, s * 1.1, h * 1.5);
    ctx.rect(x - s * 0.6, y - h * 1.5 - 5, s * 1.2, 6);
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s * 0.5, y - h * 1.5 - 4); ctx.ellipse(x, y - h * 1.5 - 4, s * 0.5, s * 0.28, 0, Math.PI, TAU); ctx.fill();
    // pilastr ritmi ve pencereler
    const save = ctx.fillStyle;
    ctx.fillStyle = lighter(ctx, 1.35);
    for (let i = 0; i < 30; i++) {
      const wx = x - w / 2 + (i + 0.5) * (w / 30);
      if (Math.abs(wx - x) < s * 0.55) continue;
      for (let f = 0; f < 2; f++) {
        const wy = y - h + 5 + f * h * 0.47;
        ctx.beginPath(); ctx.moveTo(wx - 2.4, wy + h * 0.32); ctx.lineTo(wx - 2.4, wy + 2.4); ctx.arc(wx, wy + 2.4, 2.4, Math.PI, 0); ctx.lineTo(wx + 2.4, wy + h * 0.32); ctx.fill();
        if (em && rng && rng() < 0.25) P.lightRect(em, wx - 2, wy + 2, 4, h * 0.28, P.LIGHT, 0.5);
      }
    }
    for (let i = 0; i < 5; i++) { const wx = x - s * 0.4 + i * s * 0.2; ctx.beginPath(); ctx.moveTo(wx - 4, y - 6); ctx.lineTo(wx - 4, y - h * 1.1); ctx.arc(wx, y - h * 1.1, 4, Math.PI, 0); ctx.lineTo(wx + 4, y - 6); ctx.fill(); }
    ctx.fillStyle = save;
    return { poleX: x, poleY: y - h * 1.5 - s * 0.55 };
  };

  P.atakule = function (ctx, em, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.1, y); ctx.lineTo(x - s * 0.07, y - s * 1.5); ctx.lineTo(x + s * 0.07, y - s * 1.5); ctx.lineTo(x + s * 0.1, y); ctx.closePath();
    ctx.moveTo(x - s * 0.08, y - s * 1.5); ctx.quadraticCurveTo(x - s * 0.36, y - s * 1.55, x - s * 0.32, y - s * 1.68);
    ctx.lineTo(x + s * 0.32, y - s * 1.68); ctx.quadraticCurveTo(x + s * 0.36, y - s * 1.55, x + s * 0.08, y - s * 1.5); ctx.closePath();
    ctx.moveTo(x - s * 0.3, y - s * 1.68); ctx.quadraticCurveTo(x, y - s * 1.9, x + s * 0.3, y - s * 1.68); ctx.closePath();
    ctx.fill();
    ctx.beginPath(); P.capsule(ctx, x, y - s * 1.8, 1, x, y - s * 2.05, 0.5); ctx.fill();
    if (em) { P.lightRect(em, x - s * 0.3, y - s * 1.66, s * 0.6, s * 0.05, '#bfe0ff', 0.7); P.glow(em, x, y - s * 2.05, 5, '#ff3b2f', 0.9); }
  };

  // ------------------------------------------------------- endüstri
  P.chimney = function (ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, y); ctx.lineTo(x - w * 0.4, y - h); ctx.lineTo(x + w * 0.4, y - h); ctx.lineTo(x + w * 0.6, y); ctx.closePath();
    ctx.rect(x - w * 0.5, y - h - w * 0.15, w, w * 0.2);
    ctx.fill();
  };

  P.factoryHall = function (ctx, em, x, y, w, h, rng, o) {
    o = o || {};
    const n = o.teeth || Math.max(3, Math.round(w / 34));
    ctx.beginPath();
    ctx.rect(x - w / 2, y - h, w, h);
    const tw = w / n;
    for (let i = 0; i < n; i++) {
      const tx = x - w / 2 + i * tw;
      ctx.moveTo(tx, y - h); ctx.lineTo(tx + tw * 0.75, y - h - tw * 0.45); ctx.lineTo(tx + tw, y - h - tw * 0.45); ctx.lineTo(tx + tw, y - h); ctx.closePath();
    }
    ctx.fill();
    if (em) for (let i = 0; i < n; i++) { const tx = x - w / 2 + i * tw; if (!rng || rng() < 0.7) P.lightRect(em, tx + tw * 0.78, y - h - tw * 0.42, tw * 0.2, tw * 0.4, '#ffe6b8', 0.45); }
    const save = ctx.fillStyle;
    P.windows(ctx, em, x - w / 2, y - h, w, h, Math.round(w / 16), 1, { tone: lighter(ctx, 1.2), lit: 0.4, ww: 0.6, wh: 0.45 }, rng);
    ctx.fillStyle = save;
  };

  P.waterTower = function (ctx, x, y, s) {
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.3, y); ctx.lineTo(x - s * 0.2, y - s * 0.8); ctx.moveTo(x + s * 0.3, y); ctx.lineTo(x + s * 0.2, y - s * 0.8);
    ctx.moveTo(x - s * 0.27, y - s * 0.25); ctx.lineTo(x + s * 0.23, y - s * 0.55); ctx.moveTo(x + s * 0.27, y - s * 0.25); ctx.lineTo(x - s * 0.23, y - s * 0.55);
    ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.rect(x - s * 0.3, y - s * 1.1, s * 0.6, s * 0.32); ctx.moveTo(x - s * 0.32, y - s * 1.1); ctx.lineTo(x, y - s * 1.28); ctx.lineTo(x + s * 0.32, y - s * 1.1); ctx.closePath(); ctx.fill();
  };

  P.tent = function (ctx, x, y, w, h, tone) {
    const save = ctx.fillStyle;
    if (tone) ctx.fillStyle = tone;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x - w * 0.3, y - h * 0.55, x - w * 0.08, y - h); ctx.lineTo(x + w * 0.08, y - h); ctx.quadraticCurveTo(x + w * 0.3, y - h * 0.55, x + w / 2, y); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = save;
    ctx.beginPath(); ctx.moveTo(x - w * 0.08, y); ctx.lineTo(x, y - h * 0.65); ctx.lineTo(x + w * 0.08, y); ctx.closePath(); ctx.fill();
  };

  P.headframe = function (ctx, x, y, h) {
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = h * 0.02; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - h * 0.18, y); ctx.lineTo(x - h * 0.06, y - h); ctx.moveTo(x + h * 0.18, y); ctx.lineTo(x + h * 0.06, y - h);
    ctx.moveTo(x + h * 0.06, y - h * 0.95); ctx.lineTo(x + h * 0.55, y);
    for (let i = 1; i < 6; i++) { const u = i / 6, yy = y - h * u, ww = U.lerp(0.18, 0.06, u) * h; ctx.moveTo(x - ww, yy); ctx.lineTo(x + ww, yy); if (i < 5) { ctx.moveTo(x - ww, yy); ctx.lineTo(x + U.lerp(0.18, 0.06, (i + 1) / 6) * h, y - h * (i + 1) / 6); } }
    ctx.stroke();
    ctx.lineWidth = h * 0.018;
    ctx.beginPath(); ctx.arc(x, y - h * 1.02, h * 0.12, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - h * 1.02); ctx.lineTo(x + h * 0.12, y - h * 1.02); ctx.moveTo(x, y - h * 1.02); ctx.lineTo(x, y - h * 0.9); ctx.stroke();
    ctx.restore();
  };

  P.pylon = function (ctx, x, y, h) {
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.7, h * 0.012);
    ctx.beginPath();
    ctx.moveTo(x - h * 0.16, y); ctx.lineTo(x - h * 0.04, y - h); ctx.moveTo(x + h * 0.16, y); ctx.lineTo(x + h * 0.04, y - h);
    for (let i = 0; i < 7; i++) { const u0 = i / 7, u1 = (i + 1) / 7; ctx.moveTo(x - U.lerp(0.16, 0.04, u0) * h, y - u0 * h); ctx.lineTo(x + U.lerp(0.16, 0.04, u1) * h, y - u1 * h); ctx.moveTo(x + U.lerp(0.16, 0.04, u0) * h, y - u0 * h); ctx.lineTo(x - U.lerp(0.16, 0.04, u1) * h, y - u1 * h); }
    [0.62, 0.8].forEach((u) => { ctx.moveTo(x - h * 0.28, y - u * h); ctx.lineTo(x + h * 0.28, y - u * h); });
    ctx.stroke(); ctx.restore();
    return [[x - h * 0.28, y - 0.62 * h], [x + h * 0.28, y - 0.62 * h], [x - h * 0.28, y - 0.8 * h], [x + h * 0.28, y - 0.8 * h]];
  };

  P.wire = function (ctx, x1, y1, x2, y2, sag, w) {
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = w || 0.7;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag, x2, y2); ctx.stroke(); ctx.restore();
  };

  P.utilityPole = function (ctx, x, y, h) {
    ctx.beginPath();
    ctx.moveTo(x - 1.6, y); ctx.lineTo(x - 1, y - h); ctx.lineTo(x + 1, y - h); ctx.lineTo(x + 1.6, y); ctx.closePath();
    ctx.rect(x - h * 0.14, y - h * 0.92, h * 0.28, 1.8);
    ctx.rect(x - h * 0.1, y - h * 0.82, h * 0.2, 1.5);
    for (let i = -1; i <= 1; i += 2) { ctx.rect(x + i * h * 0.12 - 0.8, y - h * 0.96, 1.6, 3); }
    ctx.fill();
    return [x - h * 0.12, y - h * 0.94, x + h * 0.12, y - h * 0.94];
  };

  P.streetLamp = function (ctx, em, x, y, h, type) {
    ctx.beginPath();
    if (type === 'gas') {
      ctx.rect(x - 1.1, y - h, 2.2, h);
      ctx.rect(x - 3, y - 6, 6, 6);
      ctx.moveTo(x - 4, y - h); ctx.lineTo(x - 3, y - h - 9); ctx.lineTo(x + 3, y - h - 9); ctx.lineTo(x + 4, y - h); ctx.closePath();
      ctx.moveTo(x - 4.5, y - h - 9); ctx.lineTo(x, y - h - 13); ctx.lineTo(x + 4.5, y - h - 9); ctx.closePath();
      ctx.fill();
      if (em) { P.lightRect(em, x - 2.6, y - h - 8, 5.2, 7.5, '#ffd27a', 0.9); P.glow(em, x, y - h - 4, 22, '#ffb950', 0.5); }
    } else {
      ctx.moveTo(x - 1.6, y); ctx.lineTo(x - 0.9, y - h); ctx.lineTo(x + 0.9, y - h); ctx.lineTo(x + 1.6, y); ctx.closePath();
      ctx.fill();
      ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x, y - h - 6, x + 10, y - h - 6); ctx.stroke(); ctx.restore();
      ctx.beginPath(); P.rrect(ctx, x + 8, y - h - 8, 10, 3.5, 1.5); ctx.fill();
      if (em) { P.lightRect(em, x + 9, y - h - 4.8, 8, 1.2, type === 'led' ? '#e8f2ff' : '#ffcf8a', 1); P.glow(em, x + 13, y - h - 3, 26, type === 'led' ? '#d8e8ff' : '#ffc070', 0.45); }
    }
  };

  P.crane = function (ctx, x, y, h, jib, o) {
    o = o || {};
    const mw = h * 0.045;
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.6, h * 0.008);
    ctx.beginPath();
    ctx.moveTo(x - mw, y); ctx.lineTo(x - mw, y - h); ctx.moveTo(x + mw, y); ctx.lineTo(x + mw, y - h);
    const seg = Math.floor(h / (mw * 2.2));
    for (let i = 0; i < seg; i++) { const y0 = y - i * (h / seg), y1 = y - (i + 1) * (h / seg); ctx.moveTo(x - mw, y0); ctx.lineTo(x + mw, y1); ctx.moveTo(x - mw, y1); ctx.lineTo(x + mw, y1); }
    // bom
    const by = y - h;
    ctx.moveTo(x - jib * 0.3, by); ctx.lineTo(x + jib, by); ctx.moveTo(x - jib * 0.3, by - mw * 1.2); ctx.lineTo(x + jib * 0.95, by - mw * 0.2);
    const js = Math.floor(jib / (mw * 2));
    for (let i = 0; i < js; i++) { const xx = x - jib * 0.3 + i * (jib * 1.3 / js); ctx.moveTo(xx, by); ctx.lineTo(xx + jib * 0.65 / js, by - mw * 1.1); }
    // kule tepesi ve gergiler
    ctx.moveTo(x, by - h * 0.12); ctx.lineTo(x + jib * 0.9, by); ctx.moveTo(x, by - h * 0.12); ctx.lineTo(x - jib * 0.28, by);
    ctx.moveTo(x - mw, by); ctx.lineTo(x, by - h * 0.12); ctx.lineTo(x + mw, by);
    ctx.stroke();
    // kanca halatı
    const hx = x + jib * (o.hook || 0.6), hy = by + h * (o.drop || 0.35);
    ctx.lineWidth = Math.max(0.4, h * 0.004);
    ctx.beginPath(); ctx.moveTo(hx, by); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.rect(x - jib * 0.3, by - mw * 0.5, jib * 0.12, mw * 1.6);
    ctx.rect(x + mw, by + 1, mw * 2.2, mw * 1.8);
    ctx.fill();
    if (o.load) { ctx.beginPath(); ctx.rect(hx - o.load / 2, hy, o.load, o.load * 0.35); ctx.fill(); }
    if (o.em) P.glow(o.em, x + jib, by, 5, '#ff4a3a', 0.9);
  };

  // Asma köprü
  P.suspensionBridge = function (ctx, em, x0, x1, y, o, rng) {
    o = o || {};
    const deckY = y - (o.deck || 40);
    const tH = o.tower || 180;
    const span = x1 - x0;
    const tA = x0 + span * (o.tPos || 0.22), tB = x1 - span * (o.tPos || 0.22);
    const towerColor = o.towerColor;
    const save = ctx.fillStyle;
    // kuleler
    const drawTower = (tx) => {
      if (towerColor) ctx.fillStyle = towerColor;
      const lw = o.legW || 5, gap = o.legGap || 12;
      ctx.beginPath();
      ctx.moveTo(tx - gap - lw, y); ctx.lineTo(tx - gap * 0.7 - lw * 0.8, y - tH); ctx.lineTo(tx - gap * 0.7, y - tH); ctx.lineTo(tx - gap, y); ctx.closePath();
      ctx.moveTo(tx + gap, y); ctx.lineTo(tx + gap * 0.7, y - tH); ctx.lineTo(tx + gap * 0.7 + lw * 0.8, y - tH); ctx.lineTo(tx + gap + lw, y); ctx.closePath();
      const beams = o.beams || [0.35, 0.68, 0.98];
      beams.forEach((u) => { const yy = y - tH * u, g = U.lerp(gap, gap * 0.7, u); ctx.rect(tx - g - lw * 0.5, yy, g * 2 + lw, lw * 1.1); });
      ctx.fill();
      if (o.towerCap) { ctx.beginPath(); ctx.rect(tx - gap * 0.75 - lw, y - tH - lw * 1.5, gap * 1.5 + lw * 2, lw * 1.5); ctx.fill(); }
      ctx.fillStyle = save;
      if (em) { P.glow(em, tx, y - tH - 3, 6, '#ff3b2f', 0.9); }
    };
    // ana kablo
    ctx.save(); ctx.strokeStyle = save; ctx.lineWidth = o.cable || 1.4;
    const topY = y - tH + 2;
    ctx.beginPath();
    ctx.moveTo(x0 - 10, deckY + 4); ctx.quadraticCurveTo((x0 + tA) / 2, (deckY + topY) / 2 + 10, tA, topY);
    ctx.quadraticCurveTo((tA + tB) / 2, 2 * (deckY - 6) - topY, tB, topY);
    ctx.quadraticCurveTo((tB + x1) / 2, (deckY + topY) / 2 + 10, x1 + 10, deckY + 4);
    ctx.stroke();
    // askı halatları
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    const cableY = (xx) => {
      if (xx < tA) { const u = (xx - (x0 - 10)) / (tA - x0 + 10); return U.lerp(deckY + 4, topY, u * u); }
      if (xx > tB) { const u = (x1 + 10 - xx) / (x1 + 10 - tB); return U.lerp(deckY + 4, topY, u * u); }
      const u = (xx - tA) / (tB - tA); const mid = deckY - 6; return topY + (mid - topY) * (1 - Math.pow(2 * u - 1, 2));
    };
    for (let xx = x0 + 4; xx < x1 - 4; xx += o.hangerStep || 7) { ctx.moveTo(xx, deckY); ctx.lineTo(xx, cableY(xx)); }
    ctx.stroke();
    ctx.restore();
    // tabliye
    ctx.beginPath();
    ctx.rect(x0 - 20, deckY - 2, span + 40, o.deckH || 5);
    ctx.fill();
    drawTower(tA); drawTower(tB);
    if (em) {
      for (let xx = x0; xx < x1; xx += 9) P.glow(em, xx, deckY - 3, 3.5, '#ffd28a', 0.6);
      if (o.cableLights) { for (let xx = tA; xx < tB; xx += 12) P.glow(em, xx, cableY(xx), 3, o.cableLights, 0.7); }
    }
    return { tA: tA, tB: tB, deckY: deckY, topY: topY, cableY: cableY };
  };

  // Taş viyadük (kemerli)
  P.viaduct = function (ctx, x0, x1, y, h, n, o) {
    o = o || {};
    const deckY = y - h, deckH = o.deckH || h * 0.12;
    const sw = (x1 - x0) / n;
    const pierW = sw * 0.18;
    const r = (sw - pierW) / 2;
    ctx.beginPath();
    ctx.rect(x0, deckY - deckH, x1 - x0, deckH + 1);
    for (let i = 0; i < n; i++) {
      const xl = x0 + i * sw + pierW / 2, xr = xl + sw - pierW;
      const spring = deckY + r * 1.0 + (o.springDrop || 0);
      ctx.moveTo(xl, spring); ctx.lineTo(xl, deckY); ctx.lineTo(xr, deckY); ctx.lineTo(xr, spring);
      ctx.arc((xl + xr) / 2, spring, r, 0, Math.PI, true);
      ctx.closePath();
    }
    for (let i = 0; i <= n; i++) { const px = x0 + i * sw; ctx.rect(px - pierW / 2, deckY, pierW, y - deckY + 40); }
    ctx.fill();
  };

  // Bozdoğan Su Kemeri (iki katlı kemer)
  P.aqueduct = function (ctx, x0, x1, y, h, rng) {
    const sw = h * 0.38;
    const n = Math.floor((x1 - x0) / sw);
    P.viaduct(ctx, x0, x0 + n * sw, y - h * 0.48, h * 0.52, n, { deckH: h * 0.06 });
    P.viaduct(ctx, x0, x0 + n * sw, y, h * 0.48, n, { deckH: h * 0.04 });
    // aşınmış taç
    ctx.beginPath();
    for (let i = 0; i < n * 3; i++) { const xx = x0 + i * (sw / 3); ctx.rect(xx, y - h - h * 0.02 - rng() * h * 0.03, sw / 3 - 0.5, h * 0.05); }
    ctx.fill();
  };

  P.windTurbineBase = function (ctx, x, y, h) {
    ctx.beginPath();
    ctx.moveTo(x - h * 0.025, y); ctx.lineTo(x - h * 0.012, y - h); ctx.lineTo(x + h * 0.012, y - h); ctx.lineTo(x + h * 0.025, y); ctx.closePath();
    ctx.fill();
    ctx.beginPath(); P.rrect(ctx, x - h * 0.03, y - h - h * 0.025, h * 0.08, h * 0.05, h * 0.02); ctx.fill();
  };
  P.windTurbineBlades = function (ctx, x, y, h, a) {
    ctx.beginPath();
    const L = h * 0.45;
    for (let i = 0; i < 3; i++) {
      const b = a + (i * TAU) / 3;
      const ex = x + Math.cos(b) * L, ey = y + Math.sin(b) * L;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(b + 0.12) * L * 0.4, y + Math.sin(b + 0.12) * L * 0.4, ex, ey);
      ctx.quadraticCurveTo(x + Math.cos(b - 0.05) * L * 0.5, y + Math.sin(b - 0.05) * L * 0.5, x, y);
    }
    ctx.fill();
    P.fillCircle(ctx, x, y, h * 0.02);
  };

  P.solarPanels = function (ctx, x0, x1, y, h, rng) {
    const w = h * 1.4;
    for (let x = x0; x < x1 - w; x += w * 1.25) {
      ctx.beginPath(); ctx.moveTo(x, y - h * 0.3); ctx.lineTo(x + w, y - h); ctx.lineTo(x + w + 2, y - h + 3); ctx.lineTo(x + 2, y - h * 0.3 + 3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.rect(x + w * 0.45, y - h * 0.62, 1.4, h * 0.62); ctx.fill();
    }
  };

  P.signboard = function (ctx, em, x, y, w, h, text, o) {
    o = o || {};
    ctx.beginPath();
    if (o.posts !== false) { ctx.rect(x - w * 0.4, y - (o.postH || 0), 2, o.postH || 0); ctx.rect(x + w * 0.4 - 2, y - (o.postH || 0), 2, o.postH || 0); }
    P.rrect(ctx, x - w / 2, y - (o.postH || 0) - h, w, h, 1.5);
    ctx.fill();
    const ty = y - (o.postH || 0) - h * 0.28;
    if (o.lit && em) {
      em.save(); em.fillStyle = o.lit; em.font = '700 ' + (h * 0.62) + 'px Georgia, serif'; em.textAlign = 'center';
      if ('letterSpacing' in em) em.letterSpacing = (h * 0.06) + 'px';
      em.fillText(text, x, ty); em.restore();
      P.glow(em, x, ty - h * 0.25, w * 0.6, o.lit, 0.25);
    } else {
      P.text(ctx, text, x, ty, h * 0.62, { color: o.color || lighter(ctx, 4), spacing: h * 0.06 });
    }
  };
})();
