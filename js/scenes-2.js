/* =========================================================================
   Yüzyılın İzinde — olay sahneleri (tablolar) 2/2
   1980–2026 sahneleri ve "Gelecek".
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P;
  const TAU = U.TAU;
  const SCN = IZ.SCENES, SC = IZ.SC;

  // Liman vinci (STS)
  function stsCrane(ctx, x, y, h) {
    ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = h * 0.02; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - h * 0.22, y); ctx.lineTo(x - h * 0.16, y - h * 0.7); ctx.moveTo(x + h * 0.12, y); ctx.lineTo(x + h * 0.06, y - h * 0.7);
    ctx.moveTo(x - h * 0.2, y - h * 0.3); ctx.lineTo(x + h * 0.1, y - h * 0.3);
    ctx.moveTo(x - h * 0.2, y - h * 0.3); ctx.lineTo(x + h * 0.07, y - h * 0.62); ctx.moveTo(x + h * 0.1, y - h * 0.3); ctx.lineTo(x - h * 0.15, y - h * 0.62);
    ctx.moveTo(x - h * 0.35, y - h * 0.7); ctx.lineTo(x + h * 0.85, y - h * 0.7);
    ctx.moveTo(x - h * 0.05, y - h); ctx.lineTo(x + h * 0.85, y - h * 0.7); ctx.moveTo(x - h * 0.05, y - h); ctx.lineTo(x - h * 0.35, y - h * 0.7);
    ctx.moveTo(x - h * 0.16, y - h * 0.7); ctx.lineTo(x - h * 0.05, y - h); ctx.lineTo(x + h * 0.06, y - h * 0.7);
    ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.rect(x + h * 0.4, y - h * 0.7, h * 0.08, h * 0.06); ctx.rect(x - h * 0.34, y - h * 0.76, h * 0.12, h * 0.07); ctx.fill();
  }

  function containers(ctx, x0, x1, y, rows, rng) {
    const cw = 34, ch = 14;
    const save = ctx.fillStyle;
    for (let r = 0; r < rows; r++) {
      for (let x = x0; x < x1 - cw; x += cw + 1.5) {
        if (rng() < 0.12 && r > 0) continue;
        ctx.fillStyle = save;
        ctx.fillRect(x, y - (r + 1) * (ch + 1), cw, ch);
        ctx.fillStyle = P.lighter(ctx, 0.8);
        for (let k = 1; k < 8; k++) ctx.fillRect(x + k * (cw / 8), y - (r + 1) * (ch + 1) + 2, 0.7, ch - 4);
      }
    }
    ctx.fillStyle = save;
  }

  SCN.port = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 110, rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 18; i++) P.apartment(S.ctx, S.em, rng() * 700, 6, 40, rng.int(3, 6), { year: 1980 }, rng);
      S.ctx.clearRect(700, 8, 700, S.B); P.waterLines(S.ctx, 700, 1400, 10, S.B, rng);
      S.layer('main');
      S.tone(3); S.ctx.fillRect(0, 0, 760, S.B);
      S.ctx.clearRect(760, 0, 640, S.B); P.waterLines(S.ctx, 760, 1400, 4, S.B, rng);
      S.tone(3); containers(S.ctx, 40, 560, 0, 4, rng);
      S.tone(2); stsCrane(S.ctx, 660, 0, 280); stsCrane(S.ctx, 520, 0, 250);
      S.tone(3); P.ship(S.ctx, S.em, 1100, 8, 560, 'cargo', {}, rng);
      S.tone(4);
      P.truck(S.ctx, S.em, 300, 2, 150, 'tir', {});
      for (let i = 0; i < 4; i++) P.person(S.ctx, 600 + i * 30, 2, 44, { pose: rng.pick(['stand', 'walk1', 'point']), hat: 'helmet', dir: 1 });
      S.blink(660, -280, 10, '#ff3b30', 1.2, 0, 0.5);
    },
  };

  SCN.city80 = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      SC.cityApartments(S, { n: 26, minF: 5, maxF: 10, lit: 0.35, year: 1983, towers: 3 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.tower(S.ctx, S.em, 250, 0, 120, 330, { kind: 'step', lit: 0.35 }, rng);
      P.tower(S.ctx, S.em, 1180, 0, 110, 280, { kind: 'box', lit: 0.35 }, rng);
      P.apartment(S.ctx, S.em, 470, 0, 160, 9, { year: 1985, lit: 0.4 }, rng);
      P.apartment(S.ctx, S.em, 950, 0, 160, 8, { year: 1985, lit: 0.4 }, rng);
      // otoyol köprüsü
      S.ctx.fillRect(0, -70, S.W, 12);
      for (let i = 0; i < 8; i++) S.ctx.fillRect(80 + i * 180, -60, 16, 60);
      // reklam panosu
      S.tone(2); S.ctx.fillRect(660, -260, 6, 190); S.ctx.fillRect(560, -300, 210, 90);
      P.lightRect(S.em, 566, -294, 198, 78, '#ffd7a8', 0.5);
      P.text(S.em, 'İHRACAT', 665, -246, 30, { color: 'rgba(255,90,70,0.95)', weight: '800', spacing: 3 });
      S.anim(function (c, t) {
        for (let i = 0; i < 12; i++) {
          const u = ((t * 0.18 + i / 12) % 1);
          const x = U.lerp(-80, 1480, u);
          P.glowRaw(c, x, -78, 10, 'rgba(255,240,200,', 0.9 * SC.edgeA(x, 1400));
          const x2 = U.lerp(1480, -80, (u + 0.37) % 1);
          P.glowRaw(c, x2, -76, 8, 'rgba(255,70,50,', 0.8 * SC.edgeA(x2, 1400));
        }
      }, true);
      S.tone(4);
      for (let i = 0; i < 5; i++) P.car(S.ctx, S.em, 140 + i * 260, 2, 90, rng.pick(['murat', 'sahin', 'taxi']), { dir: i % 2 ? -1 : 1 });
      P.crowd(S.ctx, 60, 1360, 2, rng, { year: 1984, rows: 1, h: 46, spacing: 40 });
    },
  };

  SCN.mountains = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.mountainsBack(S, { n: 6, min: 200, max: 340, snow: true, snowTone: '#5a5f68' });
      S.layer('main');
      S.tone(3);
      const peaks = [[200, 160], [520, 230], [820, 170], [1100, 210]];
      P.mountains(S.ctx, 0, S.W, 4, peaks, rng, { sag: 0.25, jag: 12 });
      // karakol
      S.tone(4);
      const kx = 520, ky = -226;
      S.ctx.fillRect(kx - 50, ky - 30, 100, 30);
      S.ctx.fillRect(kx + 30, ky - 90, 26, 60); S.ctx.fillRect(kx + 24, ky - 96, 38, 8);
      S.flag(kx - 30, ky - 100, 30, { base: ky - 30 });
      S.anim(function (c, t) {
        const a = Math.PI * 0.82 + Math.sin(t * 0.35) * 0.5;
        const sx = kx + 43, sy = ky - 92, L = 700;
        const g = c.createLinearGradient(sx, sy, sx + Math.cos(a) * L, sy + Math.sin(a) * L);
        g.addColorStop(0, 'rgba(230,238,255,0.4)'); g.addColorStop(1, 'rgba(230,238,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a - 0.06) * L, sy + Math.sin(a - 0.06) * L); c.lineTo(sx + Math.cos(a + 0.06) * L, sy + Math.sin(a + 0.06) * L); c.closePath(); c.fill();
        P.glowRaw(c, sx, sy, 20, 'rgba(240,246,255,', 0.9);
      }, true);
      // vadideki köy ışıkları
      for (let i = 0; i < 12; i++) P.glow(S.em, 820 + rng() * 380, -40 - rng() * 60, 6, P.LIGHT, 0.8);
    },
  };

  SCN.migration = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 80, rng, { freq: 0.002 });
      S.tone(1);
      P.mosque(S.ctx, S.em, 900, 6, 46, { minarets: 4, minH: 210 }, rng); // Selimiye
      for (let i = 0; i < 24; i++) P.house(S.ctx, S.em, rng() * S.W, 8, U.lerp(24, 34, rng()), U.lerp(16, 24, rng()), { floors: 2, door: false }, rng);
      S.layer('main'); S.ground(3);
      S.tone(3);
      // sınır kapısı kanopisi
      S.ctx.fillRect(820, -170, 420, 16);
      for (let i = 0; i < 5; i++) S.ctx.fillRect(840 + i * 95, -155, 10, 155);
      for (let i = 0; i < 3; i++) S.ctx.fillRect(880 + i * 120, -60, 40, 60);
      S.flag(1290, -290, 44, { base: 0 });
      for (let i = 0; i < 4; i++) P.lightRect(S.em, 860 + i * 95, -156, 60, 3, '#ffe4b0', 0.8);
      S.tone(2);
      P.locomotive(S.ctx, S.em, 40, -2, 70, 'diesel');
      S.tone(4);
      for (let i = 0; i < 4; i++) P.car(S.ctx, S.em, 300 + i * 125, 2, 110, 'lada', { lights: false });
      for (let i = 0; i < 12; i++) {
        const pose = rng.pick(['suitcase', 'walk1', 'walk2', 'carry']);
        P.person(S.ctx, 820 - i * 34 + 300, 2, i % 4 === 3 ? 30 : 46, { g: rng() < 0.5 ? 'f' : 'm', kid: i % 4 === 3, pose: pose, hat: rng.pick(['none', 'scarf', 'kasket', 'long']), hold: pose === 'suitcase' ? 'suitcase' : pose === 'carry' ? 'bundle' : null, dir: 1 });
      }
    },
  };

  SCN.dam = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      SC.mountainsBack(S, { n: 6, min: 170, max: 290 });
      S.layer('main');
      // önden görünüş: iki dağ yamacı arasında devasa baraj gövdesi
      const top = -250, L0 = 300, R0 = 1100, l1 = 520, r1 = 880;
      S.tone(2);
      S.ctx.beginPath(); S.ctx.moveTo(L0 - 6, top - 4); S.ctx.lineTo(R0 + 6, top - 4); S.ctx.lineTo(r1, 2); S.ctx.lineTo(l1, 2); S.ctx.closePath(); S.ctx.fill();
      // basamaklı dolgu yüzeyi
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.25);
      for (let i = 1; i < 9; i++) { const u = i / 9, y = U.lerp(top, 0, u), xl = U.lerp(L0, l1, u), xr = U.lerp(R0, r1, u); S.ctx.fillRect(xl + 4, y, xr - xl - 8, 2.2); }
      S.ctx.restore();
      // kret yolu ve lambalar
      S.tone(3); S.ctx.fillRect(L0 - 30, top - 12, R0 - L0 + 60, 9);
      for (let x = L0; x <= R0; x += 40) { S.ctx.fillRect(x, top - 30, 2, 18); P.glow(S.em, x + 1, top - 30, 8, '#ffe2a8', 0.8); }
      // dolusavak (sağda su akıntısı)
      S.ctx.save(); S.ctx.fillStyle = '#8b9096'; S.ctx.beginPath(); S.ctx.moveTo(R0 - 70, top + 2); S.ctx.lineTo(R0 - 40, top + 2); S.ctx.lineTo(r1 + 30, -6); S.ctx.lineTo(r1 - 4, -6); S.ctx.closePath(); S.ctx.fill(); S.ctx.restore();
      S.anim(function (c, t) {
        c.fillStyle = 'rgba(220,230,240,0.35)';
        for (let i = 0; i < 10; i++) { const u = ((t * 0.6 + i / 10) % 1); const x = U.lerp(R0 - 58, r1 + 12, u), y = U.lerp(top + 6, -8, u); c.beginPath(); c.ellipse(x, y, 6, 3, -0.9, 0, TAU); c.fill(); }
        for (let i = 0; i < 6; i++) { const u = (t * 0.8 + i / 6) % 1; c.beginPath(); c.arc(r1 + 14 + (i - 3) * 6, -6 - u * 24, 4 + u * 10, 0, TAU); c.fillStyle = 'rgba(225,232,240,' + (0.3 * (1 - u)).toFixed(3) + ')'; c.fill(); }
      });
      // dağ yamaçları
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -330); S.ctx.quadraticCurveTo(200, -320, L0 + 10, top - 10); S.ctx.lineTo(l1 + 6, 4); S.ctx.lineTo(l1 + 6, S.B); S.ctx.closePath(); S.ctx.fill();
      S.ctx.beginPath(); S.ctx.moveTo(S.W, S.B); S.ctx.lineTo(S.W, -320); S.ctx.quadraticCurveTo(1220, -300, R0 - 10, top - 10); S.ctx.lineTo(r1 - 6, 4); S.ctx.lineTo(r1 - 6, S.B); S.ctx.closePath(); S.ctx.fill();
      S.ctx.fillRect(0, 2, S.W, S.B);
      // santral binası ve iletim hatları
      S.tone(4);
      P.building(S.ctx, S.em, 700, 0, 260, 64, { roof: 'flat', floors: 2, cols: 12, lit: 0.6, cornice: true }, rng);
      S.tone(3);
      const a = P.pylon(S.ctx, 1200, -170, 150), b = P.pylon(S.ctx, 1340, -210, 140);
      P.wire(S.ctx, a[2][0], a[2][1], b[2][0], b[2][1], 10); P.wire(S.ctx, a[3][0], a[3][1], b[3][0], b[3][1], 10);
      P.wire(S.ctx, 820, -60, a[0][0], a[0][1], 20); P.wire(S.ctx, 820, -60, a[1][0], a[1][1], 20);
      S.flag(L0 - 10, top - 80, 36, { base: top - 12 });
    },
  };

  SCN.internet = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 80, rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 40; i++) P.tree(S.ctx, rng() * S.W, 8, U.lerp(50, 90, rng()), rng.pick(['pine', 'fir', 'broad']), rng);
      S.layer('main'); S.ground(3);
      S.tone(3);
      // brütalist kampüs binaları
      S.ctx.fillRect(140, -130, 520, 130); S.ctx.fillRect(100, -150, 600, 22); S.ctx.fillRect(300, -230, 140, 100);
      S.ctx.fillRect(780, -110, 380, 110); S.ctx.fillRect(760, -126, 420, 18);
      S.ctx.save(); S.ctx.fillStyle = '#2b2b2b'; for (let f = 0; f < 3; f++) S.ctx.fillRect(150, -120 + f * 38, 500, 14); for (let f = 0; f < 2; f++) S.ctx.fillRect(790, -96 + f * 44, 360, 14); S.ctx.restore();
      for (let f = 0; f < 3; f++) for (let i = 0; i < 25; i++) if (rng() < 0.55) P.lightRect(S.em, 152 + i * 20, -119 + f * 38, 16, 12, '#b9d4ff', 0.75);
      for (let f = 0; f < 2; f++) for (let i = 0; i < 18; i++) if (rng() < 0.4) P.lightRect(S.em, 792 + i * 20, -95 + f * 44, 16, 12, '#ffe0a8', 0.6);
      // anten çanağı
      S.tone(4); P.dish(S.ctx, 370, -240, 26, -0.6);
      S.ctx.fillRect(368, -240, 4, 12);
      P.crowd(S.ctx, 60, 1240, 2, rng, { year: 1993, rows: 1, h: 44, spacing: 60, hold: 'bag', holdP: 0.5 });
      // ağ düğümleri
      const nodes = [];
      for (let i = 0; i < 22; i++) nodes.push([U.lerp(80, 1220, rng()), U.lerp(-520, -300, rng())]);
      nodes.push([370, -260]);
      const links = [];
      for (let i = 0; i < nodes.length; i++) { let best = -1, bd = 1e9; for (let j = 0; j < nodes.length; j++) { if (j === i) continue; const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]); if (d < bd && !links.some((l) => l[0] === j && l[1] === i)) { bd = d; best = j; } } links.push([i, best]); if (rng() < 0.5) links.push([i, rng.int(0, nodes.length - 1)]); }
      S.anim(function (c, t) {
        c.lineWidth = 1;
        links.forEach((l, i) => {
          const a = nodes[l[0]], b = nodes[l[1]];
          c.strokeStyle = 'rgba(150,200,255,0.22)'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
          const u = (t * 0.5 + i * 0.137) % 1;
          P.glowRaw(c, U.lerp(a[0], b[0], u), U.lerp(a[1], b[1], u), 6, 'rgba(190,225,255,', 0.9);
        });
        nodes.forEach((n, i) => P.glowRaw(c, n[0], n[1], 9 + 3 * Math.sin(t * 2 + i), 'rgba(170,215,255,', 0.75));
      }, true);
    },
  };

  SCN.parliament = {
    w: 1300,
    draw(S, p) {
      const rng = S.rng;
      SC.ankaraModern(S, { towers: 2 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      const b = P.tbmmModern(S.ctx, S.em, 650, 0, 300, rng);
      S.flag(b.poleX, -380, 52, { base: 0 });
      S.tone(2); SC.trees(S, 20, 160, 3, ['broad', 'pine'], 150, 220); SC.trees(S, 1180, 1290, 2, ['broad'], 150, 210);
      S.tone(4);
      for (let i = 0; i < 6; i++) S.ctx.fillRect(560 - i * 3, -i * 4, 180 + i * 6, 4);
      const special = p.vote || p.doves || p.scales;
      const yr = p.y2007 ? 2007 : special ? S.year : 1993;
      if (p.y2007) for (let i = 0; i < 3; i++) P.car(S.ctx, S.em, 470 + i * 150, 0, 110, 'modern', { dir: 1 });
      else if (!special) P.person(S.ctx, 650, -22, 50, { g: 'f', pose: 'walk1', hat: 'bob', skirt: 'knee', hold: 'bag', dir: 1 });
      const phones = yr >= 2007 ? 0.2 : 0;
      P.crowd(S.ctx, 300, 520, 2, rng, { year: yr, rows: 2, h: 46, poses: { clap: 3, stand: 2 }, dir: 1, phones: phones, em: S.em });
      P.crowd(S.ctx, 800, 1050, 2, rng, { year: yr, rows: 2, h: 46, poses: { clap: 3, stand: 2 }, dir: -1, phones: phones, em: S.em });
      for (let i = 0; i < 4; i++) S.blink(320 + i * 230, -60, 18, '#ffffff', 2.3 + i * 0.4, i * 0.7, 0.06);
      // adalet terazisi (heykel kaidesi üzerinde)
      if (p.scales) { S.tone(4); S.ctx.fillRect(170, -70, 60, 70); S.ctx.fillRect(160, -76, 80, 8); P.scales(S.ctx, 200, -76 - 0.45 * 76, 76); }
      // oylama panosu: kabul / ret / çekimser ve sonuç
      if (p.vote) {
        const v = p.vote, bx = 1100, by = -300, bw = 200, bh = 118;
        S.tone(4);
        S.ctx.fillRect(bx - bw / 2, by, bw, bh); S.ctx.fillRect(bx - 4, by + bh, 8, -by - bh);
        S.ctx.save(); S.ctx.fillStyle = '#121110'; S.ctx.fillRect(bx - bw / 2 + 6, by + 6, bw - 12, bh - 12); S.ctx.restore();
        const rows = [['KABUL', v[0]], ['RET', v[1]], ['ÇEKİMSER', v[2]]];
        rows.forEach((r, i) => {
          const yy = by + 30 + i * 22;
          P.text(S.ctx, r[0], bx - bw / 2 + 16, yy, 14, { color: '#d9b86a', weight: '700', align: 'left' });
          P.text(S.ctx, String(r[1]), bx + bw / 2 - 16, yy, 15, { color: '#f2dda0', weight: '700', align: 'right' });
          P.text(S.em, String(r[1]), bx + bw / 2 - 16, yy, 15, { color: 'rgba(255,214,120,0.9)', weight: '700', align: 'right' });
        });
        const ok = /EDİLDİ$/.test(v[3]);
        P.text(S.ctx, v[3], bx, by + bh - 12, 12, { color: ok ? '#a8e0a0' : '#f08a7a', weight: '700', spacing: 1 });
        P.text(S.em, v[3], bx, by + bh - 12, 12, { color: ok ? 'rgba(150,240,140,0.9)' : 'rgba(255,120,100,0.9)', weight: '700', spacing: 1 });
      }
      // kubbeden havalanan beyaz güvercinler
      if (p.doves) {
        S.anim(function (c, t) {
          c.fillStyle = '#e4e0d6';
          for (let i = 0; i < 9; i++) {
            const u = (t * 0.045 + i / 9) % 1;
            const x = 650 + Math.sin(i * 2.3) * 60 + u * (i % 2 ? 420 : -380), y = -330 - u * 320 - Math.sin(u * 9 + i) * 12;
            c.globalAlpha = Math.min(1, Math.sin(u * Math.PI) * 1.4);
            P.bird(c, x, y, 1.3, Math.sin(t * 9 + i * 1.7));
          }
          c.globalAlpha = 1;
        });
      }
    },
  };

  SCN.economy = {
    w: 1300,
    draw(S, p) {
      const rng = S.rng;
      SC.cityApartments(S, { n: 22, minF: 5, maxF: 10, year: S.year, towers: S.year > 2000 ? 3 : 1 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.classical(S.ctx, S.em, 330, 0, 340, 250, { cols: 6, pediment: false, attic: true, lit: 0.2 }, rng);
      S.tone(2); P.signboard(S.ctx, S.em, 330, -262, 150, 28, 'BANKA', { posts: false, color: '#d4ccb8' });
      S.tone(3); P.building(S.ctx, S.em, 900, 0, 300, 200, { floors: 5, cols: 9, balcony: true, lit: 0.25 }, rng);
      // döviz bürosu tabelası
      S.tone(4); S.ctx.fillRect(800, -100, 200, 64);
      P.text(S.em, 'DÖVİZ', 900, -76, 18, { color: 'rgba(255,214,140,0.95)', weight: '800', spacing: 3 });
      S.anim(function (c, t) {
        const v = Math.floor(t * 3) % 7;
        let txt;
        if (p.usd) txt = '$ ' + (4.9 + v * 0.38 + Math.sin(t) * 0.02).toFixed(2).replace('.', ',') + ' ₺';
        else { const base = S.year < 2000 ? 32000 : 1200000; txt = '$ ' + U.fmtInt(Math.floor(base * (1 + v * 0.07 + Math.sin(t) * 0.01))); }
        P.text(c, txt, 900, -46, 16, { color: 'rgba(255,90,70,0.95)', weight: '700', font: 'ui-monospace, Menlo, monospace' });
      }, true);
      S.tone(4);
      for (let i = 0; i < 16; i++) { const g = rng() < 0.4 ? 'f' : 'm'; P.person(S.ctx, 500 + i * 24, 2, 46, { g: g, pose: rng.pick(['stand', 'stand2', 'mourn']), hat: rng.weighted(P.eraHats(S.year, g)), dir: -1 }); }
      const pts = p.trend === 'crash' ? [0.9, 0.86, 0.9, 0.84, 0.8, 0.82, 0.3, 0.22, 0.16, 0.12, 0.08] : [0.9, 0.88, 0.82, 0.84, 0.7, 0.6, 0.52, 0.4, 0.42, 0.3, 0.25];
      P.chart(S.em, 640, -330, 380, 160, pts, '#ff5a4a');
      S.anim(function (c, t) {
        c.fillStyle = '#9c968a';
        for (let i = 0; i < 9; i++) {
          const u = (t * 0.12 + i / 9) % 1;
          const x = 200 + i * 110 + Math.sin(t * 1.5 + i) * 30, y = -460 + u * 470;
          c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + i) * 1.2); c.fillRect(-9, -4, 18, 8); c.restore();
        }
      });
    },
  };

  SCN.customs = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 70, rng, { freq: 0.002 });
      S.tone(1); P.mosque(S.ctx, S.em, 300, 6, 40, { minarets: 4, minH: 180 }, rng);
      for (let i = 0; i < 18; i++) P.house(S.ctx, S.em, rng() * S.W, 8, 30, 20, { floors: 1, door: false }, rng);
      S.layer('main'); S.ground(3);
      S.tone(3);
      S.ctx.fillRect(560, -180, 600, 18);
      for (let i = 0; i < 6; i++) S.ctx.fillRect(580 + i * 110, -162, 10, 162);
      for (let i = 0; i < 5; i++) P.lightRect(S.em, 600 + i * 110, -162, 80, 3, '#e8f0ff', 0.8);
      for (let i = 0; i < 4; i++) S.ctx.fillRect(620 + i * 140, -56, 34, 56);
      // AB yıldız tabelası
      S.ctx.fillRect(250, -200, 6, 200); S.ctx.fillRect(170, -270, 170, 80);
      S.ctx.save(); S.ctx.fillStyle = '#1f3561'; S.ctx.fillRect(176, -264, 158, 68); S.ctx.restore();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; S.em.save(); S.em.fillStyle = 'rgba(255,214,80,0.95)'; S.em.beginPath(); P.starPath(S.em, 255 + Math.cos(a) * 24, -230 + Math.sin(a) * 24, 4.5, 1.8, 5); S.em.fill(); S.em.restore(); }
      S.flag(1220, -300, 44, { base: 0 });
      S.tone(4);
      for (let i = 0; i < 3; i++) P.truck(S.ctx, S.em, 480 + i * 210 - 80, 2, 190, 'tir', { dir: 1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, 1080 + i * 26, 2, 46, { pose: 'stand', hat: 'cap', coat: 'long', dir: -1 });
    },
  };

  SCN.blackout = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.cityApartments(S, { n: 28, minF: 5, maxF: 10, lit: 0.5, year: 1997 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      for (let i = 0; i < 6; i++) P.apartment(S.ctx, S.em, 110 + i * 215, 0, 190, rng.int(6, 10), { year: 1997, lit: 0.75, fh: 22 }, rng);
      S.tone(4);
      for (let i = 0; i < 5; i++) P.streetLamp(S.ctx, S.em, 200 + i * 230, 0, 100, 'modern');
      P.crowd(S.ctx, 100, 1200, 2, rng, { year: 1997, rows: 1, h: 46, spacing: 70 });
    },
    emAlpha(t) {
      // her 6 saniyede bir dakika karanlık: ışıklar toplu söner
      const u = (t % 6) / 6;
      if (u < 0.55) return 1;
      if (u < 0.6) return 1 - (u - 0.55) / 0.05;
      if (u < 0.92) return 0.02;
      return (u - 0.92) / 0.08;
    },
  };

  SCN.jet = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 70, rng, { freq: 0.002 });
      for (let i = 0; i < 30; i++) P.glow(S.em, rng() * S.W, -U.lerp(0, 40, rng()), 5, P.LIGHT, 0.7);
      S.layer('main'); S.ground(3);
      S.tone(3);
      // pist ışıkları
      for (let i = 0; i < 40; i++) { P.glow(S.em, i * 34, -2, 7, i % 5 ? '#fff2d0' : '#7fd38a', 0.9); }
      S.ctx.fillRect(980, -140, 240, 140); S.ctx.fillRect(1100, -260, 30, 130); S.ctx.fillRect(1080, -280, 70, 26);
      P.lightRect(S.em, 1082, -276, 66, 16, '#d8ecff', 0.7);
      S.tone(4);
      for (let i = 0; i < 2; i++) P.jeep(S.ctx, 700 + i * 110, 2, 90, { dir: -1 });
      for (let i = 0; i < 5; i++) P.person(S.ctx, 520 + i * 26, 2, 46, { pose: 'stand', hat: 'helmet', hold: 'rifle', coat: 'short', dir: -1 });
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        const x = U.lerp(-100, 700, U.clamp(k * 1.4, 0, 1)), y = U.lerp(-260, -26, U.clamp(k * 1.4, 0, 1));
        const ea = SC.edgeA(x + 40, S.W);
        if (ea < 0.01) return;
        c.save(); c.globalAlpha *= ea;
        c.fillStyle = P.TONE[3];
        P.plane(c, null, x, y, 120, 'jet', { angle: 0.12 });
        P.glowRaw(c, x + 60, y + 6, 70, 'rgba(255,248,225,', 0.35);
        c.restore();
      });
      [[200, -200], [1000, -200]].forEach((pp, k) => S.anim(function (c, t) {
        const a = Math.PI * (k ? 0.75 : 0.25) + Math.sin(t * 0.5 + k) * 0.3;
        const L = 600;
        const g = c.createLinearGradient(pp[0], pp[1], pp[0] + Math.cos(a) * L, pp[1] - Math.abs(Math.sin(a)) * L);
        g.addColorStop(0, 'rgba(230,238,255,0.35)'); g.addColorStop(1, 'rgba(230,238,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(pp[0], pp[1]); c.lineTo(pp[0] + Math.cos(a - 0.05) * L, pp[1] - Math.abs(Math.sin(a - 0.05)) * L); c.lineTo(pp[0] + Math.cos(a + 0.05) * L, pp[1] - Math.abs(Math.sin(a + 0.05)) * L); c.closePath(); c.fill();
      }, true));
    },
  };

  SCN.stadium = {
    w: 1300,
    draw(S, p) {
      const rng = S.rng;
      if (p.screen) SC.ankaraModern(S, { towers: 6 }); else SC.istanbul(S, { towers: 2, water: false, lit: 0.5 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      if (p.screen) {
        P.screen(S.ctx, S.em, 640, 0, 380, 200, 120);
      } else {
        // stadyum ışık kuleleri
        [160, 1140].forEach((x) => { S.ctx.fillRect(x - 5, -360, 10, 360); S.ctx.fillRect(x - 40, -400, 80, 44); for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) P.lightRect(S.em, x - 36 + k * 12.5, -396 + r * 13, 9, 9, '#f2f6ff', 0.95); P.glow(S.em, x, -380, 140, '#e8f0ff', 0.4); });
        // stadyum kasesi: yere oturan kavisli gövde, dikey kaburgalar ve çatı ışıkları
        S.ctx.beginPath(); S.ctx.moveTo(210, 0); S.ctx.lineTo(228, -150); S.ctx.quadraticCurveTo(650, -238, 1072, -150); S.ctx.lineTo(1090, 0); S.ctx.closePath(); S.ctx.fill();
        const rimY = (x) => { const u = (x - 228) / (1072 - 228); return -150 - 88 * 4 * u * (1 - u) * 0.5 - 0; };
        S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.2);
        for (let x = 250; x < 1060; x += 38) S.ctx.fillRect(x, rimY(x) + 6, 3, -rimY(x) - 10);
        S.ctx.fillRect(230, -96, 840, 3); S.ctx.restore();
        for (let x = 240; x < 1064; x += 26) P.glow(S.em, x, rimY(x) + 2, 7, '#eef4ff', 0.6);
        for (let i = 0; i < 3; i++) P.car(S.ctx, S.em, 300 + i * 340, 2, 100, 'sahin', {});
      }
      S.tone(4);
      const xs = P.crowd(S.ctx, 20, 1280, 4, rng, { year: S.year, rows: 4, h: 46, flags: 0.16, poses: { cheer: 5, fist: 2, wave: 2 } });
      // meşaleler
      for (let i = 0; i < 6; i++) S.flame(100 + i * 210 + rng() * 40, -66, 12, 26);
      if (p.cup) {
        // kalabalığın üstünde havaya kaldırılan kupa
        const cx = 640, cy = -150;
        S.ctx.save(); S.ctx.fillStyle = '#c9c2b0';
        S.ctx.beginPath(); S.ctx.moveTo(cx - 20, cy - 60); S.ctx.quadraticCurveTo(cx - 24, cy - 20, cx - 6, cy - 8); S.ctx.lineTo(cx - 5, cy + 14); S.ctx.lineTo(cx - 14, cy + 20); S.ctx.lineTo(cx + 14, cy + 20); S.ctx.lineTo(cx + 5, cy + 14); S.ctx.lineTo(cx + 6, cy - 8); S.ctx.quadraticCurveTo(cx + 24, cy - 20, cx + 20, cy - 60); S.ctx.closePath(); S.ctx.fill();
        S.ctx.lineWidth = 4; S.ctx.strokeStyle = '#c9c2b0';
        S.ctx.beginPath(); S.ctx.arc(cx - 22, cy - 40, 10, Math.PI * 0.5, Math.PI * 1.5); S.ctx.stroke();
        S.ctx.beginPath(); S.ctx.arc(cx + 22, cy - 40, 10, -Math.PI * 0.5, Math.PI * 0.5); S.ctx.stroke();
        S.ctx.restore();
        S.tone(4);
        P.person(S.ctx, cx - 12, -2, 50, { pose: 'cheer', hat: 'none', dir: 1 });
        P.person(S.ctx, cx + 14, -2, 50, { pose: 'cheer', hat: 'none', dir: -1 });
        P.glow(S.em, cx, cy - 30, 120, '#ffe7b0', 0.5);
      }
      SC.fireworksSky(S, [[200, -330], [520, -400], [900, -350], [1150, -410]]);
    },
  };

  SCN.stage = {
    draw(S, p) {
      const rng = S.rng;
      if (p.ist2010) {
        // Boğaz kıyısında açık hava sahnesi, ışıklı şehir ve havai fişekler
        SC.istanbul(S, { lit: 0.7, minLit: true, towers: 3, mosques: [[0.2, 40, 6], [0.5, 44, 4], [0.82, 32, 2]], galataX: 0.66 });
        SC.fireworksSky(S, [[160, -360], [430, -420], [800, -380], [1080, -430]]);
      } else {
        S.layer('back'); S.tone(1);
        S.ctx.fillRect(0, -360, S.W, 20);
        for (let i = 0; i < 14; i++) { S.ctx.fillRect(i * 90, -360, 4, 370); P.glow(S.em, i * 90 + 2, -350, 18, '#ffd6f2', 0.7); }
      }
      S.layer('main'); S.ground(3);
      S.tone(3);
      // sahne
      S.ctx.fillRect(330, -90, 540, 90); S.ctx.fillRect(330, -330, 12, 240); S.ctx.fillRect(858, -330, 12, 240); S.ctx.fillRect(320, -340, 560, 14);
      for (let i = 0; i < 9; i++) P.glow(S.em, 350 + i * 62, -330, 14, i % 2 ? '#ff7ad9' : '#7ad9ff', 0.9);
      S.tone(4);
      P.person(S.ctx, 600, -90, 62, { g: 'f', pose: 'cheer', hat: 'long', skirt: 'knee', dir: 1 });
      for (let i = 0; i < 4; i++) P.person(S.ctx, 430 + i * 105 + (i > 1 ? 80 : 0), -90, 54, { g: i % 2 ? 'f' : 'm', pose: i % 2 ? 'wave' : 'cheer', hat: i % 2 ? 'long' : 'none', dir: i < 2 ? 1 : -1 });
      [[350, -330], [600, -340], [850, -330]].forEach((pp, k) => S.anim(function (c, t) {
        const a = Math.PI / 2 + Math.sin(t * (0.9 + k * 0.3) + k * 2) * 0.55;
        const L = 520, col = ['255,120,220', '120,220,255', '255,230,160'][k];
        const g = c.createLinearGradient(pp[0], pp[1], pp[0] + Math.cos(a) * L, pp[1] + Math.sin(a) * L);
        g.addColorStop(0, 'rgba(' + col + ',0.5)'); g.addColorStop(1, 'rgba(' + col + ',0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(pp[0], pp[1]); c.lineTo(pp[0] + Math.cos(a - 0.1) * L, pp[1] + Math.sin(a - 0.1) * L); c.lineTo(pp[0] + Math.cos(a + 0.1) * L, pp[1] + Math.sin(a + 0.1) * L); c.closePath(); c.fill();
      }, true));
      P.crowd(S.ctx, 20, 1180, 4, rng, { year: S.year, rows: 3, h: 46, poses: { cheer: 5, fist: 2, wave: 2 }, phones: p.ist2010 ? 0.25 : 0.08, em: S.em, flags: 0.06 });
      S.anim(function (c, t) {
        for (let i = 0; i < 40; i++) {
          const u = (t * 0.1 + i * 0.123) % 1;
          const x = (i * 97) % 1200 + Math.sin(t + i) * 20, y = -460 + u * 460;
          c.fillStyle = ['#d9534f', '#f0e6d0', '#e6b35a'][i % 3];
          c.save(); c.translate(x, y); c.rotate(t * 3 + i); c.fillRect(-2.5, -1.2, 5, 2.4); c.restore();
        }
      });
    },
  };

  SCN.currency = {
    draw(S, p) {
      const rng = S.rng;
      if (p.y1958) {
        // 1958: döviz bürosu panosunda eski ve yeni kur
        SC.istanbul(S, { towers: 0, water: false, lit: 0.2 });
        S.layer('main'); S.ground(3);
        S.tone(3);
        P.building(S.ctx, S.em, 330, 0, 340, 190, { roof: 'flat', floors: 4, cols: 8, lit: 0.25 }, rng);
        P.building(S.ctx, S.em, 960, 0, 320, 170, { roof: 'hip', roofH: 36, floors: 4, cols: 8, lit: 0.25 }, rng);
        S.tone(4);
        S.ctx.fillRect(560, -150, 6, 150); S.ctx.fillRect(734, -150, 6, 150);
        S.ctx.fillRect(540, -300, 220, 160);
        S.ctx.save(); S.ctx.fillStyle = '#1b1915'; S.ctx.fillRect(550, -290, 200, 140); S.ctx.restore();
        P.text(S.ctx, '1 DOLAR', 650, -258, 18, { color: '#d9d0bb', weight: '700', spacing: 3 });
        P.text(S.ctx, '2,80', 610, -205, 30, { color: '#8d877a', weight: '700' });
        S.ctx.save(); S.ctx.strokeStyle = '#c23b2f'; S.ctx.lineWidth = 3; S.ctx.beginPath(); S.ctx.moveTo(582, -214); S.ctx.lineTo(640, -214); S.ctx.stroke(); S.ctx.restore();
        P.text(S.ctx, '9,00', 700, -195, 40, { color: '#f1e6cf', weight: '800' });
        P.text(S.ctx, 'TL', 650, -162, 16, { color: '#d9d0bb', weight: '700', spacing: 4 });
        P.glow(S.em, 700, -208, 90, '#ffd9a0', 0.25);
        P.crowd(S.ctx, 80, 1220, 2, rng, { year: 1958, rows: 2, h: 46, poses: { point: 2, stand: 3, stand2: 2, mourn: 1 } });
        return;
      }
      SC.istanbul(S, { towers: 4, water: false });
      S.layer('main'); S.ground(3);
      S.tone(3);
      S.ctx.fillRect(300, -170, 8, 170); S.ctx.fillRect(900, -170, 8, 170);
      P.banknote(S.ctx, 304, -270, 330, 150, '1.000.000', { paper: '#8f8778', ink: '#3b352b' });
      P.banknote(S.ctx, 904, -270, 330, 150, '1 YTL', { paper: '#a6a08f', ink: '#2e3a33' });
      P.text(S.ctx, 'TL', 420, -210, 22, { color: '#3b352b', weight: '800' });
      S.anim(function (c, t) {
        for (let i = 0; i < 6; i++) {
          const u = ((t * 0.16 + i / 6) % 1);
          const x = 330 + i * 26 + Math.sin(t + i) * 20 + u * 120, y = -290 - u * 260;
          c.strokeStyle = 'rgba(255,236,190,' + (0.9 * (1 - u)).toFixed(3) + ')'; c.lineWidth = 3;
          c.beginPath(); c.ellipse(x, y, 9, 13, 0, 0, TAU); c.stroke();
          P.glowRaw(c, x, y, 26, 'rgba(255,220,150,', 0.4 * (1 - u));
        }
      }, true);
      S.tone(4);
      P.crowd(S.ctx, 100, 1100, 2, rng, { year: 2005, rows: 2, h: 46, poses: { point: 2, stand: 3, stand2: 2 } });
    },
  };

  SCN.eu = {
    draw(S, p) {
      const rng = S.rng;
      if (p.y1963) {
        // 1963: Ankara'da imza töreni; altı kurucu ülke (sade bayraklar)
        SC.ankaraOld(S, { cx: 0.8 });
        S.layer('main'); S.ground(3);
        S.tone(3);
        P.classical(S.ctx, S.em, 650, 0, 440, 240, { cols: 8, attic: true, lit: 0.45 }, rng);
        S.flag(650, -360, 52, { base: -260 });
        const muted = ['#6b6f78', '#7b6a5e', '#5f6f66', '#7a7466', '#6a6672', '#706a62'];
        for (let i = 0; i < 6; i++) { const x = i < 3 ? 120 + i * 80 : 1020 + (i - 3) * 80; S.flag(x, -230, 40, { base: 0, tex: P.plainFlagTexture(muted[i], i % 2 ? 'stripes' : null) }); }
        S.tone(4);
        for (let i = 0; i < 3; i++) P.car(S.ctx, S.em, 470 + i * 150, 0, 100, 'old', { dir: 1 });
        P.crowd(S.ctx, 60, 420, 2, rng, { year: 1963, rows: 2, h: 46, poses: { stand: 3, clap: 2 }, dir: 1 });
        P.crowd(S.ctx, 900, 1250, 2, rng, { year: 1963, rows: 2, h: 46, poses: { stand: 3, clap: 2 }, dir: -1 });
        for (let i = 0; i < 3; i++) S.blink(560 + i * 90, -80, 16, '#ffffff', 2.1 + i * 0.5, i * 0.6, 0.06);
        return;
      }
      SC.istanbul(S, { towers: 5, water: false });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.modernHall(S.ctx, S.em, 600, 0, 500, 130, { roof: 'arc', lit: 0.4 }, rng);
      S.flag(520, -330, 52, { base: 0 });
      S.flag(680, -330, 52, { base: 0, tex: P.plainFlagTexture('#1f3a78', 'eu') });
      S.tone(4);
      P.crowd(S.ctx, 140, 1060, 2, rng, { year: S.year, rows: 2, h: 46, poses: { walk1: 2, walk2: 2, stand: 2, clap: 1 } });
      S.anim(function (c, t) {
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU + t * 0.08;
          const x = 600 + Math.cos(a) * 110, y = -440 + Math.sin(a) * 110;
          c.fillStyle = 'rgba(255,214,90,0.95)';
          c.beginPath(); P.starPath(c, x, y, 10, 4, 5); c.fill();
          P.glowRaw(c, x, y, 26, 'rgba(255,214,90,', 0.45);
        }
      }, true);
    },
  };

  SCN.books = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.istanbul(S, { lit: 0.6, minLit: true, mosques: [[0.18, 38, 4], [0.42, 44, 6], [0.85, 34, 4]], galataX: 0.6 });
      S.layer('main');
      S.ctx.clearRect(0, 0, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 4, S.B, rng);
      S.tone(3);
      // taş rıhtım: eğimli duvar, korkuluk ve bank
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -30); S.ctx.lineTo(430, -30); S.ctx.lineTo(452, 2); S.ctx.lineTo(452, S.B); S.ctx.closePath(); S.ctx.fill();
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 0.9); for (let i = 0; i < 10; i++) S.ctx.fillRect(i * 44, -22, 1.2, 26); S.ctx.fillRect(0, -10, 440, 1.2); S.ctx.restore();
      S.ctx.fillRect(0, -62, 432, 3); for (let i = 0; i < 18; i++) S.ctx.fillRect(4 + i * 24, -62, 2.4, 32);
      S.ctx.fillRect(40, -46, 70, 4); S.ctx.fillRect(46, -46, 3, 16); S.ctx.fillRect(101, -46, 3, 16); S.ctx.fillRect(40, -66, 70, 3);
      P.streetLamp(S.ctx, S.em, 400, -30, 120, 'gas');
      S.anim(function (c, t, info) { const k = info ? info.k : 0.5; c.fillStyle = P.TONE[3]; P.ship(c, null, U.lerp(1300, 520, k), 6, 190, 'ferry', { dir: -1 }); });
      // dev açık kitap (sayfaları rüzgârda çevriliyor)
      S.tone(4);
      const bx = 270, by = -30, bw = 200;
      S.ctx.beginPath(); S.ctx.moveTo(bx - bw - 6, by + 2); S.ctx.lineTo(bx + bw + 6, by + 2); S.ctx.lineTo(bx + bw + 2, by - 8); S.ctx.lineTo(bx - bw - 2, by - 8); S.ctx.closePath(); S.ctx.fill();
      S.ctx.save(); S.ctx.fillStyle = '#8c877a';
      S.ctx.beginPath(); S.ctx.moveTo(bx, by - 4); S.ctx.quadraticCurveTo(bx - bw * 0.45, by - 50, bx - bw, by - 36); S.ctx.lineTo(bx - bw, by - 10); S.ctx.quadraticCurveTo(bx - bw * 0.45, by - 22, bx, by + 2); S.ctx.closePath(); S.ctx.fill();
      S.ctx.beginPath(); S.ctx.moveTo(bx, by - 4); S.ctx.quadraticCurveTo(bx + bw * 0.45, by - 50, bx + bw, by - 36); S.ctx.lineTo(bx + bw, by - 10); S.ctx.quadraticCurveTo(bx + bw * 0.45, by - 22, bx, by + 2); S.ctx.closePath(); S.ctx.fill();
      S.ctx.fillStyle = '#6c685d';
      for (let i = 0; i < 7; i++) { const yy = by - 34 + i * 3.6; S.ctx.fillRect(bx - bw * 0.85, yy + i * 0.5, bw * 0.7, 1.2); S.ctx.fillRect(bx + bw * 0.15, yy + i * 0.5, bw * 0.7, 1.2); }
      S.ctx.restore();
      S.anim(function (c, t) {
        const u = (t * 0.22) % 1;
        const ang = Math.PI * U.easeInOut(u);
        c.fillStyle = 'rgba(180,174,158,0.92)';
        c.beginPath(); c.moveTo(bx, by - 6);
        const ex = bx + Math.cos(ang) * bw, ey = by - 34 - Math.sin(ang) * 90;
        c.quadraticCurveTo((bx + ex) / 2, ey - 26, ex, ey); c.lineTo(ex, ey + 22); c.quadraticCurveTo((bx + ex) / 2, ey - 2, bx, by); c.closePath(); c.fill();
      });
      P.glow(S.em, bx, by - 40, 210, '#ffd8a0', 0.35);
      P.person(S.ctx, 140, -30, 48, { pose: 'sit', hat: 'none', coat: 'long', dir: 1 });
    },
  };

  SCN.camp = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -20, 90, rng, { freq: 0.002 });
      S.tone(1); for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) P.tent(S.ctx, i * 52 + r * 20, -r * 14 + 6, 40, 26, '#6e6e6a');
      S.layer('main'); S.ground(3);
      S.tone(3);
      for (let i = 0; i < 11; i++) P.tent(S.ctx, 60 + i * 115, 0, 96, 64, '#5a5a56');
      // tel örgü
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[4]; S.ctx.lineWidth = 0.6;
      for (let x = 0; x < S.W; x += 8) { S.ctx.beginPath(); S.ctx.moveTo(x, -50); S.ctx.lineTo(x + 8, 0); S.ctx.moveTo(x + 8, -50); S.ctx.lineTo(x, 0); S.ctx.stroke(); }
      S.ctx.restore();
      S.tone(4); for (let x = 0; x < S.W; x += 120) S.ctx.fillRect(x, -56, 3, 56);
      P.truck(S.ctx, S.em, 1050, 2, 170, 'old', { dir: -1 });
      for (let i = 0; i < 12; i++) {
        const pose = rng.pick(['walk1', 'walk2', 'carry', 'suitcase']);
        P.person(S.ctx, 200 + i * 55, 2, i % 3 === 2 ? 30 : 46, { g: rng() < 0.5 ? 'f' : 'm', kid: i % 3 === 2, pose: pose, hat: rng.pick(['scarf', 'none', 'scarf', 'cap']), hold: pose === 'carry' ? 'bundle' : pose === 'suitcase' ? 'suitcase' : null, dir: 1 });
      }
    },
  };

  SCN.gezi = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(1);
      // AKM ve oteller
      S.ctx.fillRect(700, -150, 380, 156); S.ctx.save(); S.ctx.fillStyle = '#5a5a5a'; for (let i = 0; i < 30; i++) for (let j = 0; j < 9; j++) S.ctx.fillRect(706 + i * 12.5, -144 + j * 16, 9, 11); S.ctx.restore();
      P.tower(S.ctx, S.em, 200, 6, 90, 260, { kind: 'box', lit: 0.35 }, rng); P.tower(S.ctx, S.em, 420, 6, 80, 200, { kind: 'box', lit: 0.3 }, rng);
      SC.cityApartments;
      S.layer('main'); S.ground(3);
      S.tone(3);
      // Cumhuriyet Anıtı
      S.ctx.fillRect(80, -60, 120, 60); S.ctx.fillRect(96, -200, 22, 140); S.ctx.fillRect(162, -200, 22, 140); S.ctx.fillRect(90, -214, 100, 16);
      P.person(S.ctx, 140, -214, 40, { pose: 'stand', hat: 'none', coat: 'long' });
      S.tone(2); for (let i = 0; i < 6; i++) P.broadTree(S.ctx, 320 + i * 170 + rng() * 40, 0, U.lerp(260, 340, rng()), rng);
      S.tone(4);
      for (let i = 0; i < 5; i++) P.tent(S.ctx, 380 + i * 170, 2, 50, 30, '#2a2a28');
      P.crowd(S.ctx, 260, 1260, 4, rng, { year: 2013, rows: 3, h: 46, poses: { stand: 3, sitground: 2, clap: 1, wave: 1 } });
      // pankart
      S.ctx.fillRect(560, -110, 2, 60); S.ctx.fillRect(700, -110, 2, 60);
      S.ctx.save(); S.ctx.fillStyle = '#8a8579'; S.ctx.fillRect(560, -110, 142, 30); S.ctx.restore();
    },
  };

  SCN.marmaray = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      // Boğaz silueti su çizgisinin üstünde (arka katmanda yukarı kaydırılmış)
      S.layer('back');
      S.ctx.save(); S.ctx.translate(0, -118);
      S.tone(0); P.hills(S.ctx, 0, S.W, -10, 70, rng, { freq: 0.002, bottom: 30 });
      S.tone(1);
      for (let i = 0; i < 30; i++) P.building(S.ctx, S.em, rng() * S.W, 4, U.lerp(18, 30, rng()), U.lerp(16, 34, rng()), { roof: rng() < 0.5 ? 'hip' : 'flat', roofH: 6, cornice: false, cols: 2 }, rng);
      P.mosque(S.ctx, S.em, S.W * 0.28, 2, 40, { minarets: 4 }, rng);
      P.mosque(S.ctx, S.em, S.W * 0.55, 2, 46, { minarets: 6 }, rng);
      P.galata(S.ctx, S.em, S.W * 0.8, 4, 100, {});
      S.ctx.restore();
      S.layer('main');
      S.ctx.clearRect(0, -150, S.W, S.B + 150);
      // su kütlesi (yarı saydam)
      const g = S.ctx.createLinearGradient(0, -150, 0, 0);
      g.addColorStop(0, 'rgba(40,46,52,0.35)'); g.addColorStop(1, 'rgba(22,25,29,0.85)');
      S.ctx.fillStyle = g; S.ctx.fillRect(0, -150, S.W, 150);
      // deniz yüzeyi çizgisi
      S.ctx.save(); S.ctx.fillStyle = 'rgba(25,25,25,0.6)'; S.ctx.fillRect(0, -151, S.W, 2); S.ctx.restore();
      P.waterLines(S.ctx, 0, S.W, -147, -120, rng, 'rgba(20,20,20,.35)');
      // deniz tabanı
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -10); for (let x = 0; x <= S.W; x += 40) S.ctx.lineTo(x, -8 + Math.sin(x * 0.02) * 6); S.ctx.lineTo(S.W, S.B); S.ctx.fill();
      // tüp tünel: halkalı beton tüp
      S.ctx.save();
      S.ctx.fillStyle = '#3a3c3e'; P.fillRR(S.ctx, -30, -78, S.W + 60, 64, 30);
      S.ctx.fillStyle = '#141516'; P.fillRR(S.ctx, -30, -70, S.W + 60, 48, 22);
      S.ctx.fillStyle = '#4a4c4e';
      for (let i = 0; i < 24; i++) S.ctx.fillRect(i * 60 + 8, -78, 3, 64);
      S.ctx.restore();
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        const x = U.lerp(-500, 1700, (t * 0.12) % 1);
        const L0 = 150, L1 = S.W - 150;
        c.save();
        c.beginPath(); c.rect(L0, -70, L1 - L0, 48); c.clip();
        c.fillStyle = P.TONE[4];
        P.locomotive(c, null, x, -22, 90, 'modern');
        for (let i = 0; i < 4; i++) P.wagon(c, null, x - 36 - (i + 1) * 92, -22, 90, 'modern');
        c.fillStyle = 'rgba(225,240,255,0.85)';
        for (let wx = x + 50; wx > x - 36 - 4 * 92 - 80; wx -= 10.5) { if (((x - wx) % 92 + 92) % 92 < 6) continue; c.fillRect(wx, -52, 6.5, 9); }
        P.glowRaw(c, x - 150, -46, 260, 'rgba(200,225,255,', 0.18);
        P.glowRaw(c, x + 88, -32, 44, 'rgba(225,240,255,', 0.6);
        // tünelin iki ucunda karanlık: tren karanlığa karışarak girip çıkar
        [[L0, L0 + 170], [L1, L1 - 170]].forEach((e) => {
          const g = c.createLinearGradient(e[0], 0, e[1], 0);
          g.addColorStop(0, 'rgba(20,21,22,1)'); g.addColorStop(1, 'rgba(20,21,22,0)');
          c.fillStyle = g; c.fillRect(Math.min(e[0], e[1]), -70, 170, 48);
        });
        c.restore();
      });
      // balıklar
      S.anim(function (c, t) {
        c.fillStyle = 'rgba(20,22,24,0.7)';
        for (let i = 0; i < 9; i++) { const x = (i * 157 + t * (12 + i)) % 1400, y = -130 + (i * 37) % 50; c.globalAlpha = SC.edgeA(x, 1400); c.beginPath(); c.ellipse(x, y, 6, 2.4, 0, 0, TAU); c.moveTo(x - 6, y); c.lineTo(x - 10, y - 3); c.lineTo(x - 10, y + 3); c.closePath(); c.fill(); }
        c.globalAlpha = 1;
      });
      S.anim(function (c, t, info) { const k = info ? info.k : 0.5; const x = U.lerp(1300, 300, k); c.save(); c.globalAlpha *= SC.edgeA(x + 40, S.W); c.fillStyle = P.TONE[3]; P.ship(c, null, x, -142, 150, 'ferry', { dir: -1 }); c.restore(); });
    },
  };

  SCN.mine = {
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -30, 120, rng, { freq: 0.002 });
      S.tone(1); P.hills(S.ctx, 0, S.W, 4, 60, rng, { freq: 0.004, sharp: true });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.headframe(S.ctx, 380, 0, 260);
      S.ctx.fillRect(470, -110, 260, 110); S.ctx.fillRect(460, -118, 280, 10);
      P.chimney(S.ctx, 700, 0, 18, 200);
      S.smoke(700, -205, { n: 9, size: 22, drift: 16, alpha: 0.45, color: 'rgba(40,38,36,' });
      S.smoke(560, -120, { n: 7, size: 18, drift: 10, alpha: 0.35, color: 'rgba(50,48,46,' });
      S.tone(4);
      for (let i = 0; i < 10; i++) P.person(S.ctx, 300 + i * 28, 2, 46, { pose: rng.pick(['stand', 'mourn', 'carry']), hat: 'helmet', hold: 'helmetlamp', em: S.em, dir: rng.sign() });
      P.crowd(S.ctx, 760, 1180, 4, rng, { year: 2014, rows: 3, h: 46, poses: { mourn: 5, hug: 1, stand: 1 } });
      P.truck(S.ctx, S.em, 160, 2, 140, 'fire', { dir: 1 });
      S.blink(150, -50, 26, '#ff3b30', 0.9, 0, 0.5); S.blink(180, -50, 26, '#3b8bff', 0.9, 0.45, 0.5);
    },
  };

  SCN.dna = {
    draw(S) {
      const rng = S.rng;
      SC.cityApartments(S, { n: 16, minF: 4, maxF: 8, lit: 0.4, towers: 2 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.modernHall(S.ctx, S.em, 600, 0, 520, 150, { roof: 'wave', lit: 0.55 }, rng);
      S.tone(2); SC.trees(S, 20, 280, 4, ['broad'], 160, 230); SC.trees(S, 920, 1180, 4, ['broad'], 160, 230);
      S.tone(4);
      P.crowd(S.ctx, 300, 900, 2, rng, { year: 2015, rows: 1, h: 46, poses: { stand: 3, clap: 2 }, spacing: 30 });
      S.anim(function (c, t) {
        const cx = 600, top = -520, bot = -200, R = 46;
        for (let i = 0; i <= 26; i++) {
          const u = i / 26, y = U.lerp(top, bot, u), a = u * TAU * 1.6 + t * 0.9;
          const x1 = cx + Math.cos(a) * R, x2 = cx + Math.cos(a + Math.PI) * R;
          const z1 = Math.sin(a), z2 = Math.sin(a + Math.PI);
          c.strokeStyle = 'rgba(160,220,255,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke();
          P.glowRaw(c, x1, y, 7 + 3 * z1, 'rgba(150,215,255,', 0.6 + 0.3 * z1);
          P.glowRaw(c, x2, y, 7 + 3 * z2, 'rgba(255,190,140,', 0.6 + 0.3 * z2);
        }
      }, true);
    },
  };

  SCN.july15 = {
    w: 1500,
    draw(S) {
      const rng = S.rng;
      S.layer('back');
      S.tone(0); P.hills(S.ctx, 0, S.W, -20, 120, rng, { freq: 0.0018 });
      S.tone(1); for (let i = 0; i < 50; i++) P.house(S.ctx, S.em, rng() * S.W, 6 - rng() * 40, U.lerp(20, 30, rng()), U.lerp(16, 26, rng()), { floors: 2, door: false, lit: 0.55 }, rng);
      P.mosque(S.ctx, S.em, 300, 0, 26, { minarets: 2, lit: true }, rng); P.mosque(S.ctx, S.em, 1100, 0, 30, { minarets: 4, lit: true }, rng);
      S.ctx.clearRect(0, 8, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 10, S.B, rng);
      S.layer('main');
      S.ctx.clearRect(0, 0, S.W, S.B);
      P.waterLines(S.ctx, 0, S.W, 4, S.B, rng);
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -40); S.ctx.quadraticCurveTo(120, -38, 190, 6); S.ctx.lineTo(190, S.B); S.ctx.fill();
      S.ctx.beginPath(); S.ctx.moveTo(S.W, S.B); S.ctx.lineTo(S.W, -60); S.ctx.quadraticCurveTo(S.W - 150, -50, S.W - 230, 6); S.ctx.lineTo(S.W - 230, S.B); S.ctx.fill();
      SC.shoreLife(S, false);
      S.tone(3);
      const br = P.suspensionBridge(S.ctx, S.em, 60, S.W - 60, 6, { deck: 64, tower: 260, tPos: 0.2, beams: [0.4, 0.75, 0.98], cableLights: '#ffe4a8' }, rng);
      // köprü üstünde tanklar ve kalabalık
      S.tone(4);
      const dy = br.deckY - 2;
      for (let i = 0; i < 3; i++) P.tank(S.ctx, 560 + i * 70, dy, 50, { dir: -1 });
      P.crowd(S.ctx, 330, 540, dy, rng, { year: 2016, rows: 2, h: 16, flags: 0.25, poses: { stand: 2, walk1: 2, fist: 2 }, rowRise: 2, spacing: 5 });
      P.crowd(S.ctx, 790, 1150, dy, rng, { year: 2016, rows: 2, h: 16, flags: 0.25, poses: { stand: 2, walk1: 2, fist: 2 }, rowRise: 2, spacing: 5 });
      S.anim(function (c, t) {
        c.fillStyle = P.TONE[3];
        const x = ((t * 160) % 1700) - 150;
        c.save(); c.globalAlpha *= SC.edgeA(x, S.W);
        P.plane(c, null, x, -470, 60, 'fighter', { angle: -0.05 });
        c.restore();
      });
    },
  };

  SCN.airport = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 50, rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 10; i++) P.tower(S.ctx, S.em, 900 + rng() * 480, 6, 24, U.lerp(80, 150, rng()), { lit: 0.3 }, rng);
      S.layer('main'); S.ground(3);
      S.tone(3);
      // dalgalı çatılı terminal
      S.ctx.beginPath(); S.ctx.moveTo(120, 0); S.ctx.lineTo(120, -110);
      for (let i = 0; i <= 10; i++) { const x = 120 + i * 70; S.ctx.quadraticCurveTo(x - 35, -150, x, -118); }
      S.ctx.lineTo(820, 0); S.ctx.closePath(); S.ctx.fill();
      for (let i = 0; i < 26; i++) P.lightRect(S.em, 132 + i * 26, -100, 20, 80, '#ffe6bd', 0.45);
      // lale biçimli kule
      const tx = 1000;
      S.ctx.beginPath(); S.ctx.moveTo(tx - 16, 0); S.ctx.lineTo(tx - 8, -290); S.ctx.lineTo(tx + 8, -290); S.ctx.lineTo(tx + 16, 0); S.ctx.fill();
      S.ctx.beginPath(); S.ctx.moveTo(tx - 8, -290); S.ctx.quadraticCurveTo(tx - 46, -310, tx - 40, -360); S.ctx.quadraticCurveTo(tx - 22, -340, tx, -372); S.ctx.quadraticCurveTo(tx + 22, -340, tx + 40, -360); S.ctx.quadraticCurveTo(tx + 46, -310, tx + 8, -290); S.ctx.fill();
      P.lightRect(S.em, tx - 30, -330, 60, 10, '#d6ecff', 0.8);
      S.blink(tx, -374, 14, '#ff3b30', 1.3, 0, 0.5);
      S.tone(4);
      P.plane(S.ctx, S.em, 400, -18, 200, 'airliner', { lights: false });
      for (let i = 0; i < 40; i++) P.glow(S.em, i * 36, -2, 6, i % 4 ? '#fff2d0' : '#5aa0ff', 0.9);
      S.anim(function (c, t) {
        const u = (t * 0.07) % 1;
        const x = U.lerp(700, 1600, u), y = U.lerp(-20, -380, u * u);
        c.save(); c.globalAlpha *= SC.edgeA(x, S.W);
        c.fillStyle = P.TONE[3];
        P.plane(c, null, x, y, 150, 'airliner', { angle: -0.22 * Math.min(1, u * 3) });
        P.glowRaw(c, x - 10, y + 14, 6, 'rgba(255,60,50,', 0.9);
        c.restore();
      });
    },
  };

  SCN.covid = {
    draw(S) {
      const rng = S.rng;
      SC.cityApartments(S, { n: 24, minF: 5, maxF: 10, lit: 0.6, year: 2020 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      const xs = [160, 420, 780, 1060];
      xs.forEach((x, i) => {
        const fl = rng.int(5, 8);
        P.apartment(S.ctx, S.em, x, 0, 220, fl, { year: 2020, lit: 0.7, fh: 26, roof: 'flat' }, rng);
        S.tone(4);
        for (let f = 1; f < fl; f++) if (rng() < 0.6) P.person(S.ctx, x - 70 + rng() * 140, -f * 26 - 2, 16, { pose: 'clap', hat: 'none', g: rng() < 0.5 ? 'f' : 'm' });
        S.tone(3);
      });
      S.tone(4);
      P.streetLamp(S.ctx, S.em, 600, 0, 110, 'led');
      P.person(S.ctx, 560, 0, 46, { pose: 'walk1', hat: 'none', dir: 1 });
      P.dog(S.ctx, 600, 0, 1.2, {});
      P.cat(S.ctx, 920, 0, 1.3, { dir: -1 });
      P.truck(S.ctx, S.em, 300, 2, 130, 'old', { dir: 1 });
      S.blink(330, -46, 24, '#3b8bff', 0.7, 0, 0.5); S.blink(350, -46, 24, '#ff3b30', 0.7, 0.35, 0.5);
      S.anim(function (c, t) {
        for (let i = 0; i < 9; i++) {
          const x = (i * 141 + t * 6) % 1200, y = -380 + Math.sin(t * 0.4 + i) * 60 - (i % 3) * 40;
          c.strokeStyle = 'rgba(190,255,210,0.18)'; c.lineWidth = 1;
          c.beginPath(); c.arc(x, y, 7, 0, TAU); c.stroke();
          for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + t * 0.3; c.beginPath(); c.moveTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); c.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11); c.stroke(); }
        }
      }, true);
    },
  };

  SCN.ayasofya = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 60, rng, { freq: 0.002 });
      S.tone(1); P.mosque(S.ctx, S.em, 1050, 6, 44, { minarets: 6 }, rng);
      for (let i = 0; i < 20; i++) P.building(S.ctx, S.em, rng() * S.W, 6, 30, U.lerp(20, 40, rng()), { roof: 'hip', roofH: 8, cols: 2 }, rng);
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.ayasofya(S.ctx, S.em, 560, 0, 180, rng);
      S.tone(2); SC.trees(S, 980, 1280, 4, ['cypress', 'broad'], 140, 220);
      S.tone(4);
      // saf saf cemaat
      for (let r = 0; r < 3; r++) for (let i = 0; i < 28; i++) P.person(S.ctx, 140 + i * 30 + r * 12, -r * 5, 42 - r * 3, { pose: (i + r) % 3 ? 'pray' : 'kneel', hat: (i + r) % 4 ? 'cap' : 'none', dir: 1 });
      S.flag(1180, -300, 44, { base: 0 });
    },
  };

  SCN.kanal = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -10, 90, rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 12; i++) P.tower(S.ctx, S.em, rng() * S.W, 6, U.lerp(24, 36, rng()), U.lerp(90, 170, rng()), { lit: 0.3 }, rng);
      S.layer('main'); S.ground(3);
      S.tone(3);
      // kazılan kanal
      S.ctx.clearRect(420, -2, 520, S.B);
      S.ctx.beginPath(); S.ctx.moveTo(420, 0); S.ctx.lineTo(500, 60); S.ctx.lineTo(860, 60); S.ctx.lineTo(940, 0); S.ctx.lineTo(940, S.B); S.ctx.lineTo(420, S.B); S.ctx.fill();
      P.waterLines(S.ctx, 480, 880, 40, 60, rng, 'rgba(30,30,30,.4)');
      // köprü ayakları
      for (let i = 0; i < 4; i++) { const x = 300 + i * 260; S.ctx.fillRect(x - 16, -150, 32, 150 + (i === 1 || i === 2 ? 60 : 0)); for (let k = 0; k < 6; k++) S.ctx.fillRect(x - 12 + k * 5, -170, 1.2, 22); }
      S.ctx.fillRect(250, -158, 300, 10);
      S.tone(2);
      P.crane(S.ctx, 200, 0, 330, 260, { hook: 0.5, drop: 0.6, load: 40, em: S.em });
      P.crane(S.ctx, 1180, 0, 300, -220, { hook: 0.6, drop: 0.5, em: S.em });
      S.tone(4);
      P.excavator(S.ctx, 620, 2, 150, { arm: 0.3 });
      P.truck(S.ctx, S.em, 1100, 2, 160, 'dump', { dir: -1 });
      for (let i = 0; i < 6; i++) P.person(S.ctx, 980 + i * 26, 2, 44, { pose: rng.pick(['stand', 'point', 'dig']), hat: 'helmet', dir: -1 });
    },
  };

  SCN.fire = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); P.hills(S.ctx, 0, S.W, -20, 160, rng, { freq: 0.002 });
      S.tone(1); for (let i = 0; i < 40; i++) P.umbrellaPine(S.ctx, rng() * S.W, 6 - rng() * 60, U.lerp(50, 90, rng()), rng);
      for (let i = 0; i < 5; i++) { S.flame(600 + i * 160, -40 - rng() * 60, 90, 120); S.smoke(600 + i * 160, -140, { n: 8, size: 50, drift: 30, rise: 26, alpha: 0.5, color: 'rgba(60,40,30,' }); }
      S.layer('main'); S.ground(3);
      S.tone(3);
      for (let i = 0; i < 16; i++) P.umbrellaPine(S.ctx, 40 + i * 85 + rng() * 30, 2, U.lerp(170, 260, rng()), rng);
      for (let i = 0; i < 7; i++) S.flame(760 + i * 95 + rng() * 30, 0, 80, 140 + rng() * 60);
      S.smoke(900, -200, { n: 10, size: 60, drift: 40, rise: 30, alpha: 0.5, color: 'rgba(50,34,26,' });
      S.tone(4);
      P.truck(S.ctx, S.em, 380, 2, 170, 'fire', { dir: 1 });
      S.blink(420, -40, 24, '#ff3b30', 0.6, 0, 0.5);
      for (let i = 0; i < 4; i++) P.person(S.ctx, 500 + i * 40, 2, 46, { pose: 'point', hat: 'helmet', dir: 1 });
      S.anim(function (c, t) {
        for (let i = 0; i < 4; i++) {
          c.strokeStyle = 'rgba(200,220,240,0.35)'; c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(540 + i * 40, -36); c.quadraticCurveTo(620 + i * 40, -120 - Math.sin(t * 3 + i) * 10, 720 + i * 30, -40); c.stroke();
        }
      });
      S.anim(function (c, t) {
        const u = (t * 0.06) % 1, x = U.lerp(1400, 0, u), y = -330 + Math.sin(u * 6) * 20;
        c.save(); c.globalAlpha *= SC.edgeA(x, S.W);
        c.fillStyle = P.TONE[3];
        P.plane(c, null, x, y, 120, 'canadair', { dir: -1 });
        if (u > 0.25 && u < 0.5) { c.fillStyle = 'rgba(210,225,240,0.35)'; for (let k = 0; k < 10; k++) { c.beginPath(); c.arc(x + k * 6, y + 20 + k * 14, 8 + k * 2, 0, TAU); c.fill(); } }
        c.restore();
      });
    },
  };

  SCN.market = {
    w: 1300,
    draw(S, p) {
      const rng = S.rng;
      SC.cityApartments(S, { n: 22, minF: 5, maxF: 10, year: S.year, towers: 3 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      for (let i = 0; i < 5; i++) P.stall(S.ctx, S.em, 160 + i * 240, 0, 190, rng, { sign: p.trend === 'up' ? '₺' + (20 + i * 15) : '₺' + (90 - i * 6) });
      S.tone(4);
      P.crowd(S.ctx, 60, 1250, 4, rng, { year: S.year, rows: 2, h: 46, poses: { stand: 3, walk1: 2, walk2: 2, carry: 2 }, hold: 'bag', holdP: 0.35 });
      const up = p.trend === 'up';
      P.chart(S.em, 700, -330, 400, 170, up ? [0.12, 0.14, 0.16, 0.2, 0.26, 0.34, 0.48, 0.62, 0.8, 0.94] : [0.94, 0.88, 0.8, 0.74, 0.66, 0.6, 0.52, 0.47, 0.42, 0.38], up ? '#ff5a4a' : '#7ad48f');
      P.text(S.em, up ? '%85,5' : '%29,7', 1150, -500, 34, { color: up ? 'rgba(255,110,90,0.95)' : 'rgba(140,230,160,0.95)', weight: '800' });
    },
  };

  SCN.volley = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(1);
      // tribünler
      for (let r = 0; r < 8; r++) for (let i = 0; i < 90; i++) { const x = i * 15 + (r % 2) * 7, y = -40 - r * 26; S.ctx.beginPath(); S.ctx.arc(x, y, 5, 0, TAU); S.ctx.fill(); S.ctx.fillRect(x - 5, y + 4, 10, 10); }
      S.ctx.fillRect(0, -300, S.W, 14);
      for (let i = 0; i < 10; i++) P.glow(S.em, 60 + i * 130, -296, 30, '#f2f6ff', 0.8);
      S.layer('main'); S.ground(3);
      // salon zemini çizgisi
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.6); S.ctx.fillRect(160, -3, 980, 2.5); S.ctx.restore();
      S.tone(4);
      // file: direkler, ağ ve üst bant
      const nx = 650, top = -150, bot = -88;
      S.ctx.fillRect(nx - 210, top - 6, 7, -top + 6); S.ctx.fillRect(nx + 203, top - 6, 7, -top + 6);
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[4]; S.ctx.lineWidth = 0.9;
      for (let y = top + 6; y <= bot; y += 8) { S.ctx.beginPath(); S.ctx.moveTo(nx - 203, y); S.ctx.lineTo(nx + 203, y); S.ctx.stroke(); }
      for (let x = nx - 203; x <= nx + 203; x += 8) { S.ctx.beginPath(); S.ctx.moveTo(x, top + 6); S.ctx.lineTo(x, bot); S.ctx.stroke(); }
      S.ctx.restore();
      S.ctx.save(); S.ctx.fillStyle = '#9b968a'; S.ctx.fillRect(nx - 203, top, 406, 6); S.ctx.fillRect(nx - 203, bot, 406, 3); S.ctx.restore();
      // smaç vuran oyuncu (havada) ve blokçular
      P.person(S.ctx, nx - 70, -64, 96, { g: 'f', pose: 'spike', hat: 'pony', dir: 1 });
      P.person(S.ctx, nx + 46, -40, 92, { g: 'f', pose: 'cheer', hat: 'pony', dir: -1 });
      P.person(S.ctx, nx + 92, -32, 92, { g: 'f', pose: 'cheer', hat: 'bob', dir: -1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, 260 + i * 95, 0, 90, { g: 'f', pose: ['stand2', 'clap', 'stand2'][i], hat: rng.pick(['pony', 'bob']), dir: 1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, 900 + i * 95, 0, 90, { g: 'f', pose: 'stand2', hat: 'pony', dir: -1 });
      S.anim(function (c, t) {
        const u = (Math.sin(t * 1.4) + 1) / 2;
        const bx = U.lerp(nx - 30, nx - 12, u), by = U.lerp(-232, -214, u);
        c.fillStyle = '#ddd7c6'; c.beginPath(); c.arc(bx, by, 11, 0, TAU); c.fill();
        c.strokeStyle = '#6e6a60'; c.lineWidth = 1.2; c.beginPath(); c.arc(bx, by, 11, 0.3, 2.4); c.moveTo(bx - 10, by - 3); c.quadraticCurveTo(bx, by + 4, bx + 10, by - 5); c.stroke();
      });
      [[nx - 340, -330], [nx + 340, -330]].forEach((pp, k) => S.anim(function (c, t) {
        const a = Math.PI / 2 + (k ? 0.4 : -0.4) + Math.sin(t * 0.5 + k) * 0.08;
        const L = 360;
        const g = c.createLinearGradient(pp[0], pp[1], pp[0] + Math.cos(a) * L, pp[1] + Math.sin(a) * L);
        g.addColorStop(0, 'rgba(235,242,255,0.28)'); g.addColorStop(1, 'rgba(235,242,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(pp[0], pp[1]); c.lineTo(pp[0] + Math.cos(a - 0.13) * L, pp[1] + Math.sin(a - 0.13) * L); c.lineTo(pp[0] + Math.cos(a + 0.13) * L, pp[1] + Math.sin(a + 0.13) * L); c.closePath(); c.fill();
      }, true));
      S.flag(110, -300, 50, { base: 0 }); S.flag(1190, -300, 50, { base: 0 });
    },
  };

  SCN.centennial = {
    w: 1500,
    draw(S) {
      const rng = S.rng;
      SC.istanbul(S, { lit: 0.7, minLit: true, towers: 6, mosques: [[0.15, 36, 4], [0.38, 44, 6], [0.7, 32, 2]], galataX: 0.55 });
      S.layer('back');
      // uzaktaki aydınlatılmış köprü
      S.tone(1); P.suspensionBridge(S.ctx, S.em, 900, 1500, 0, { deck: 30, tower: 130, cableLights: '#ff6a5a', hangerStep: 12 }, rng);
      S.layer('main');
      S.ctx.clearRect(0, 0, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 4, S.B, rng);
      S.tone(3);
      for (let i = 0; i < 5; i++) P.ship(S.ctx, S.em, 150 + i * 300, 8, U.lerp(200, 260, rng()), 'warship', { lights: true, flag: true }, rng);
      // dronlarla "100"
      const pts = [];
      const digit = (ox, d) => {
        if (d === 1) { for (let i = 0; i < 9; i++) pts.push([ox, i]); pts.push([ox - 1, 1]); pts.push([ox - 2, 2]); }
        else { for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; pts.push([ox + Math.cos(a) * 2.6, 4 + Math.sin(a) * 4.4]); } }
      };
      digit(0, 1); digit(6, 0); digit(13, 0);
      S.skyAnim(function (c, t) {
        const cx = 640, cy = -400, k = 10;
        pts.forEach((pt, i) => { const tw = 0.7 + 0.3 * Math.sin(t * 4 + i); P.glowRaw(c, cx + pt[0] * k, cy + pt[1] * k, 7, 'rgba(255,255,255,', 0.9 * tw); P.glowRaw(c, cx + pt[0] * k, cy + pt[1] * k, 3, 'rgba(255,90,80,', 0.9); });
      });
      SC.fireworksSky(S, [[150, -320], [380, -280], [980, -330], [1250, -300], [1420, -360]]);
    },
  };

  SCN.rocket = {
    draw(S) {
      const rng = S.rng;
      S.layer('back'); S.tone(0); S.ctx.fillRect(0, -10, S.W, 20);
      S.tone(1); P.crane(S.ctx, 900, 6, 160, 30, {});
      S.ctx.clearRect(0, 10, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 12, S.B, rng);
      S.layer('main');
      S.tone(3);
      S.ctx.fillRect(0, 0, 700, S.B);
      S.ctx.clearRect(700, 0, 500, S.B); P.waterLines(S.ctx, 700, 1200, 4, S.B, rng);
      // fırlatma kulesi
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[3]; S.ctx.lineWidth = 2;
      S.ctx.beginPath(); S.ctx.moveTo(470, 0); S.ctx.lineTo(470, -330); S.ctx.moveTo(500, 0); S.ctx.lineTo(500, -330);
      for (let i = 0; i < 16; i++) { S.ctx.moveTo(470, -i * 20); S.ctx.lineTo(500, -(i + 1) * 20); S.ctx.moveTo(470, -i * 20); S.ctx.lineTo(500, -i * 20); }
      S.ctx.stroke(); S.ctx.restore();
      S.ctx.fillRect(380, -20, 260, 20);
      S.tone(4);
      P.crowd(S.ctx, 40, 330, 2, rng, { year: 2024, rows: 2, h: 44, phones: 0.4, em: S.em, poses: { cheer: 3, stand: 2 } });
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        const u = U.clamp((k - 0.15) / 0.75, 0, 1);
        const y = -20 - u * u * 520;
        // duman sütunu
        for (let i = 0; i < 16; i++) {
          const v = i / 16;
          const sy = U.lerp(-20, y, v);
          if (sy > -20) continue;
          c.fillStyle = 'rgba(205,200,190,' + (0.32 * (1 - v * 0.6)).toFixed(3) + ')';
          c.beginPath(); c.arc(560 + Math.sin(i * 1.7 + t) * 6 * (1 - v), sy + 40, 14 + (1 - v) * 40, 0, TAU); c.fill();
        }
        c.fillStyle = P.TONE[4];
        P.rocket(c, null, 560, y, 210);
      });
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        const u = U.clamp((k - 0.15) / 0.75, 0, 1);
        const y = -20 - u * u * 520;
        const f = 0.8 + 0.2 * Math.sin(t * 30);
        P.glowRaw(c, 560, y + 30, 70 * f, 'rgba(255,200,120,', 0.9);
        c.fillStyle = 'rgba(255,240,200,0.95)'; c.beginPath(); c.moveTo(552, y); c.quadraticCurveTo(560, y + 70 * f, 568, y); c.fill();
      }, true);
    },
  };

  SCN.protest = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      SC.istanbul(S, { water: false, lit: 0.5, minLit: true, mosques: [[0.3, 44, 4], [0.65, 36, 2]], galata: false });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.aqueduct(S.ctx, 0, 760, 0, 230, rng);
      P.building(S.ctx, S.em, 1080, 0, 420, 170, { floors: 5, cols: 16, lit: 0.6, cornice: true }, rng);
      S.tone(4);
      P.crowd(S.ctx, 0, 1400, 4, rng, { year: 2025, rows: 4, h: 44, phones: 0.32, flags: 0.1, em: S.em, poses: { stand: 3, fist: 1, wave: 1, clap: 1 } });
    },
  };

  SCN.istquake = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.istanbul(S, { water: true, lit: 0.6, towers: 5, mosques: [[0.2, 40, 4], [0.48, 46, 6], [0.8, 34, 4]], galataX: 0.65 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.apartment(S.ctx, S.em, 120, 0, 200, 8, { year: 2025, lit: 0.6 }, rng);
      P.apartment(S.ctx, S.em, 1180, 0, 220, 9, { year: 2025, lit: 0.6 }, rng);
      S.tone(2); SC.trees(S, 260, 1040, 6, ['broad'], 200, 280);
      S.tone(4);
      P.streetLamp(S.ctx, S.em, 650, 0, 110, 'led');
      P.crowd(S.ctx, 260, 1040, 2, rng, { year: 2025, rows: 3, h: 44, poses: { sitground: 5, stand: 2, hug: 1 }, phones: 0.15, em: S.em });
      for (let i = 0; i < 3; i++) P.tent(S.ctx, 420 + i * 220, 2, 46, 30, '#2a2a28');
    },
  };

  SCN.peace = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.mountainsBack(S, { n: 6, min: 180, max: 320 });
      S.layer('main');
      S.tone(3);
      S.ctx.beginPath(); S.ctx.moveTo(0, S.B); S.ctx.lineTo(0, -360); S.ctx.quadraticCurveTo(220, -380, 380, -120); S.ctx.quadraticCurveTo(420, -40, 470, 0); S.ctx.lineTo(1300, 0); S.ctx.lineTo(1300, S.B); S.ctx.fill();
      // mağara ağzı
      S.ctx.save(); S.ctx.fillStyle = '#080808'; S.ctx.beginPath(); S.ctx.moveTo(200, 0); S.ctx.quadraticCurveTo(200, -150, 300, -150); S.ctx.quadraticCurveTo(380, -150, 390, 0); S.ctx.fill(); S.ctx.restore();
      S.tone(4);
      // kazan ve ateş
      S.ctx.beginPath(); S.ctx.moveTo(600, -60); S.ctx.quadraticCurveTo(650, 0, 700, -60); S.ctx.closePath(); S.ctx.fill();
      S.ctx.fillRect(612, -14, 6, 14); S.ctx.fillRect(682, -14, 6, 14);
      S.flame(650, -58, 70, 90);
      S.smoke(650, -150, { n: 10, size: 30, drift: 18, rise: 24, alpha: 0.4, color: 'rgba(70,64,58,' });
      for (let i = 0; i < 10; i++) P.person(S.ctx, 440 + i * 18, 0, 44, { pose: 'stand', hat: rng.pick(['scarf', 'none']), g: rng() < 0.4 ? 'f' : 'm', dir: 1 });
      P.crowd(S.ctx, 820, 1250, 2, rng, { year: 2025, rows: 2, h: 46, poses: { stand: 3, point: 1 } });
      for (let i = 0; i < 3; i++) { S.ctx.save(); S.ctx.strokeStyle = P.TONE[4]; S.ctx.lineWidth = 1.2; S.ctx.beginPath(); S.ctx.moveTo(860 + i * 90, 0); S.ctx.lineTo(870 + i * 90, -52); S.ctx.moveTo(880 + i * 90, 0); S.ctx.lineTo(870 + i * 90, -52); S.ctx.stroke(); S.ctx.restore(); S.ctx.fillRect(862 + i * 90, -62, 18, 12); }
      S.anim(function (c, t) {
        c.fillStyle = '#d8d4ca';
        for (let i = 0; i < 6; i++) { const u = (t * 0.05 + i / 6) % 1; P.bird(c, U.lerp(500, 1300, u) + i * 20, -300 - i * 22 - Math.sin(u * 8) * 20, 1.5, Math.sin(t * 8 + i)); }
      });
    },
  };

  SCN.court = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.ankaraModern(S, { towers: 6 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.classical(S.ctx, S.em, 650, 0, 460, 300, { cols: 8, scales: true, attic: false, lit: 0.3 }, rng);
      S.tone(4);
      // polis bariyerleri
      for (let i = 0; i < 9; i++) { const x = 330 + i * 72; S.ctx.fillRect(x, -26, 60, 5); S.ctx.fillRect(x + 4, -26, 3, 26); S.ctx.fillRect(x + 53, -26, 3, 26); }
      P.crowd(S.ctx, 20, 310, 4, rng, { year: 2026, rows: 3, h: 46, flags: 0.25, poses: { stand: 3, fist: 1, clap: 1 } });
      P.crowd(S.ctx, 990, 1280, 4, rng, { year: 2026, rows: 3, h: 46, flags: 0.25, poses: { stand: 3, fist: 1, clap: 1 } });
      // basın kameraları
      for (let i = 0; i < 4; i++) { const x = 420 + i * 120; S.ctx.save(); S.ctx.strokeStyle = P.TONE[4]; S.ctx.lineWidth = 1.4; S.ctx.beginPath(); S.ctx.moveTo(x - 10, 0); S.ctx.lineTo(x, -56); S.ctx.lineTo(x + 10, 0); S.ctx.stroke(); S.ctx.restore(); S.ctx.fillRect(x - 12, -68, 24, 14); P.person(S.ctx, x + 22, 0, 46, { pose: 'stand2', hat: 'none', dir: 1 }); S.blink(x - 6, -62, 16, '#ffffff', 1.9 + i * 0.3, i * 0.5, 0.05); }
    },
  };

  SCN.future = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back');
      S.tone(0); P.hills(S.ctx, 0, S.W, -20, 120, rng, { freq: 0.0018 });
      S.tone(1);
      for (let i = 0; i < 9; i++) {
        const x = 500 + i * 90 + rng() * 30, h = U.lerp(160, 300, rng());
        S.ctx.beginPath(); S.ctx.moveTo(x - 18, 6); S.ctx.quadraticCurveTo(x - 26, -h * 0.6, x, -h); S.ctx.quadraticCurveTo(x + 26, -h * 0.6, x + 18, 6); S.ctx.fill();
        for (let k = 0; k < 6; k++) P.glow(S.em, x + (rng() - 0.5) * 20, -h * U.lerp(0.2, 0.8, rng()), 8, '#d8f0ff', 0.6);
        for (let k = 0; k < 4; k++) { S.ctx.beginPath(); S.ctx.arc(x + (rng() - 0.5) * 30, -h * U.lerp(0.25, 0.85, rng()), U.lerp(5, 10, rng()), 0, TAU); S.ctx.fill(); }
      }
      const tb = [];
      for (let i = 0; i < 6; i++) { const x = 40 + i * 70, y = -60 - Math.sin(i) * 20; P.windTurbineBase(S.ctx, x, y + 60, 160); tb.push([x, y + 60 - 164]); }
      S.anim(function (c, t) { c.fillStyle = P.TONE[1]; tb.forEach((p, i) => P.windTurbineBlades(c, p[0], p[1], 160, t * 0.9 + i * 0.7)); });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.solarPanels(S.ctx, 700, 1360, 0, 40, rng);
      S.tone(2); for (let i = 0; i < 6; i++) P.youngTree(S.ctx, 80 + i * 90, 0, U.lerp(70, 110, rng()), rng);
      S.tone(4);
      P.person(S.ctx, 380, 0, 32, { kid: true, pose: 'dig', hat: 'none', dir: 1 });
      P.person(S.ctx, 420, 0, 48, { g: 'f', pose: 'stand2', hat: 'pony', dir: -1 });
      P.youngTree(S.ctx, 402, 0, 26, rng);
      S.anim(function (c, t) {
        // uçurtma
        const kx = 560 + Math.sin(t * 0.7) * 30, ky = -380 + Math.cos(t * 0.9) * 20;
        c.fillStyle = 'rgba(200,60,50,0.9)';
        c.beginPath(); c.moveTo(kx, ky - 22); c.lineTo(kx + 14, ky); c.lineTo(kx, ky + 26); c.lineTo(kx - 14, ky); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(40,40,40,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(kx, ky + 26); c.quadraticCurveTo(500, -150, 395, -44); c.stroke();
        c.fillStyle = P.TONE[3];
        for (let i = 0; i < 5; i++) { const ph = t * 1.1 + i; P.bird(c, 800 + i * 40 + Math.sin(ph * 0.4) * 30, -420 - i * 14, 1, Math.sin(ph * 6)); }
      });
    },
  };
  // ================================================================ doğa olayları (ek sahneler)

  // r0 ile r1 arasında halka biçimli ışıma (içi boş kalır: Ay'ın diski karanlık görünür)
  function ringGlow(c, x, y, r0, r1, rgb, a) {
    const g = c.createRadialGradient(x, y, r0, x, y, r1);
    g.addColorStop(0, 'rgba(' + rgb + ',0)');
    g.addColorStop(0.004, 'rgba(' + rgb + ',' + a + ')');
    g.addColorStop(0.12, 'rgba(' + rgb + ',' + (a * 0.45) + ')');
    g.addColorStop(0.4, 'rgba(' + rgb + ',' + (a * 0.12) + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);
  }

  // Tam tutulmadaki Güneş: taç (korona), yumuşak akıntılar, kromosfer ve fışkırmalar
  function corona(c, x, y, R, t) {
    ringGlow(c, x, y, R, R * 11, '185,200,255', 0.14);
    const petal = (a, L, w, al) => {
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
      const bx = x + ca * R, by = y + sa * R, ex = x + ca * (R + L), ey = y + sa * (R + L);
      const mx = x + ca * (R + L * 0.38), my = y + sa * (R + L * 0.38);
      const g = c.createLinearGradient(bx, by, ex, ey);
      g.addColorStop(0, 'rgba(246,246,255,' + al + ')'); g.addColorStop(0.45, 'rgba(226,234,255,' + (al * 0.3) + ')'); g.addColorStop(1, 'rgba(220,230,255,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(bx + nx * w, by + ny * w);
      c.quadraticCurveTo(mx + nx * w * 0.9, my + ny * w * 0.9, ex, ey);
      c.quadraticCurveTo(mx - nx * w * 0.9, my - ny * w * 0.9, bx - nx * w, by - ny * w);
      c.closePath(); c.fill();
    };
    // geniş, yumuşak yapraklar (ekvator yönünde uzun) + ince kutup ışınları
    for (let i = 0; i < 7; i++) {
      const a = i * (TAU / 7) + 0.2 + Math.sin(t * 0.15 + i * 1.7) * 0.03;
      const eq = Math.abs(Math.cos(a + 0.35));
      petal(a, R * (1.6 + 2.4 * eq) * (1 + 0.05 * Math.sin(t * 0.5 + i)), R * (0.7 + 0.4 * eq), 0.26);
    }
    for (let i = 0; i < 14; i++) {
      const a = i * (TAU / 14) + 0.11;
      petal(a, R * (0.9 + 0.8 * (((i * 7) % 5) / 5)), R * 0.12, 0.22);
    }
    ringGlow(c, x, y, R, R * 3.0, '255,251,244', 0.98);
    ringGlow(c, x, y, R, R * 1.18, '255,130,150', 0.5);
    [[2.25, 1], [4.05, 0.7], [5.35, 0.85]].forEach((pp) => {
      const px = x + Math.cos(pp[0]) * R * 1.03, py = y + Math.sin(pp[0]) * R * 1.03;
      P.glowRaw(c, px, py, R * 0.2 * pp[1], 'rgba(255,80,110,', 0.9);
    });
  }

  // Side, Apollon Tapınağı: kaide, beş Korint sütunu ve üstte saçaklık parçası
  function apolloTemple(S, x, span, colH) {
    const ctx = S.ctx, rng = S.rng;
    const cols = 5, cw = 26;
    const xs = []; for (let i = 0; i < cols; i++) xs.push(x - span / 2 + (span / (cols - 1)) * i);
    // krepis: üç basamak; ön yüzde yer yer kopmuş bloklar
    ctx.beginPath();
    for (let i = 0; i < 3; i++) ctx.rect(x - span / 2 - 70 + i * 9, -(i + 1) * 8, span + 140 - i * 18, 8.6);
    ctx.fill();
    const base = -24, top = base - colH;
    ctx.beginPath();
    xs.forEach((cx, k) => {
      const h0 = k === cols - 1 ? 0 : 0;
      ctx.moveTo(cx - cw * 0.5, base - 9); ctx.lineTo(cx - cw * 0.41, top + 26 + h0); ctx.lineTo(cx + cw * 0.41, top + 26 + h0); ctx.lineTo(cx + cw * 0.5, base - 9); ctx.closePath();
      // kaide halkaları
      ctx.rect(cx - cw * 0.7, base - 6, cw * 1.4, 6);
      ctx.ellipse(cx, base - 8, cw * 0.62, 3.2, 0, 0, TAU);
      ctx.rect(cx - cw * 0.55, base - 13, cw * 1.1, 3.5);
      // Korint başlığı: yukarı açılan çan, iki sıra yaprak ve köşe sarmalları
      ctx.moveTo(cx - cw * 0.43, top + 27);
      ctx.quadraticCurveTo(cx - cw * 0.5, top + 14, cx - cw * 0.92, top + 5);
      ctx.lineTo(cx + cw * 0.92, top + 5);
      ctx.quadraticCurveTo(cx + cw * 0.5, top + 14, cx + cw * 0.43, top + 27);
      ctx.closePath();
      ctx.moveTo(cx - cw * 0.84 + 4.2, top + 7); ctx.arc(cx - cw * 0.84, top + 7, 4.2, 0, TAU);
      ctx.moveTo(cx + cw * 0.84 + 4.2, top + 7); ctx.arc(cx + cw * 0.84, top + 7, 4.2, 0, TAU);
      ctx.rect(cx - cw * 0.98, top - 1, cw * 1.96, 6); // abakus
    });
    ctx.fill();
    // yiv dokusu ve yaprak kıvrımları (açık ton)
    ctx.save(); ctx.fillStyle = P.lighter(ctx, 1.8);
    xs.forEach((cx) => {
      for (let f = -2; f <= 2; f++) ctx.fillRect(cx + f * cw * 0.16 - 0.5, top + 30, 1, colH - 44);
      for (let l = 0; l < 5; l++) { ctx.beginPath(); ctx.ellipse(cx + (l - 2) * cw * 0.2, top + 21, 2.2, 5, 0, 0, TAU); ctx.fill(); }
      for (let l = 0; l < 4; l++) { ctx.beginPath(); ctx.ellipse(cx + (l - 1.5) * cw * 0.26, top + 13, 2, 4.4, 0, 0, TAU); ctx.fill(); }
    });
    ctx.restore();
    // saçaklık: üç fasyalı arşitrav, Medusa başlı friz, dişli korniş — sağ ucu kırık
    const e0 = xs[0] - cw * 0.95, e1 = xs[cols - 1] + cw * 0.95;
    let y = top - 1;
    const yA = y;
    ctx.beginPath();
    ctx.rect(e0, y - 6, e1 - e0, 6); y -= 6;
    ctx.rect(e0 - 1, y - 6, e1 - e0 + 2, 6); y -= 6;
    ctx.rect(e0 - 2, y - 6, e1 - e0 + 4, 6); y -= 6;
    ctx.rect(e0 - 2, y - 19, e1 - e0 - 14, 19);
    ctx.moveTo(e1 - 16, y); ctx.lineTo(e1 + 2, y); ctx.lineTo(e1, y - 7); ctx.lineTo(e1 - 7, y - 11); ctx.lineTo(e1 - 10, y - 19); ctx.lineTo(e1 - 16, y - 19); ctx.closePath();
    const fy = y; y -= 19;
    ctx.moveTo(e0 - 8, y); ctx.lineTo(e1 - 26, y); ctx.lineTo(e1 - 30, y - 7); ctx.lineTo(e0 - 6, y - 7); ctx.closePath();
    ctx.fill();
    ctx.save(); ctx.fillStyle = P.lighter(ctx, 1.7);
    // fasya ayrımları ve korniş gölge çizgisi
    ctx.fillRect(e0, yA - 6, e1 - e0, 0.9); ctx.fillRect(e0 - 1, yA - 12, e1 - e0 + 2, 0.9); ctx.fillRect(e0 - 2, yA - 18, e1 - e0 - 16, 0.9);
    for (let m = 0; m < 4; m++) { const mx = U.lerp(xs[0] + 6, xs[cols - 2], m / 3); ctx.beginPath(); ctx.arc(mx, fy - 9.5, 5.4, 0, TAU); ctx.fill(); }
    for (let m = 0; m < 3; m++) { const mx = U.lerp(xs[0] + 6, xs[cols - 2], (m + 0.5) / 3); ctx.beginPath(); ctx.ellipse(mx, fy - 9.5, 9, 2.4, 0, 0, TAU); ctx.fill(); }
    for (let d = e0 - 6; d < e1 - 34; d += 6) ctx.fillRect(d, y + 0.5, 3, 3.2);
    ctx.restore();
    // yıkıntı: yerde yatan sütun tamburları ve kırık gövdeler
    const drum = (dx, dy, L, r) => { ctx.beginPath(); ctx.rect(dx - L / 2, dy - r * 2, L, r * 2); ctx.ellipse(dx + L / 2, dy - r, r * 0.35, r, 0, 0, TAU); ctx.fill(); ctx.save(); ctx.fillStyle = P.lighter(ctx, 1.4); ctx.beginPath(); ctx.ellipse(dx - L / 2, dy - r, r * 0.35, r, 0, 0, TAU); ctx.fill(); ctx.restore(); };
    drum(x - span / 2 - 120, 0, 58, 12);
    drum(x + span / 2 + 104, 0, 50, 11.5);
    drum(x - span / 2 - 52, -24, 40, 11);
    ctx.beginPath();
    [[x - span / 2 - 60, 46], [x + span / 2 + 60, 30]].forEach((st) => { ctx.rect(st[0] - cw * 0.5, base - st[1], cw, st[1]); ctx.moveTo(st[0] - cw * 0.5, base - st[1]); ctx.lineTo(st[0] - 4, base - st[1] - 7); ctx.lineTo(st[0] + 5, base - st[1] - 2); ctx.lineTo(st[0] + cw * 0.5, base - st[1] - 6); ctx.lineTo(st[0] + cw * 0.5, base - st[1]); ctx.closePath(); });
    ctx.fill();
    P.rocks(ctx, x - span / 2 - 200, x + span / 2 + 200, 0, 10, rng, 12);
    return { top: y - 7, base: base };
  }

  SCN.eclipse = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      const SUN = [1010, -440], R = 23;
      // arka: karlı Toroslar, deniz, Side antik tiyatrosu ve ışıkları yanmış otel sırası
      S.layer('back');
      const peaks = [[60, 150], [210, 200], [360, 165], [520, 230], [660, 180]];
      S.tone(0); P.mountains(S.ctx, 0, 760, -6, peaks, rng, { sag: 0.24, jag: 7 });
      P.snowCaps(S.ctx, peaks, -6, '#8c8c8a', rng);
      S.tone(1);
      for (let i = 0; i < 9; i++) P.building(S.ctx, S.em, 40 + i * 74 + rng() * 20, 6, U.lerp(50, 70, rng()), U.lerp(34, 60, rng()), { roof: 'flat', floors: rng.int(3, 5), lit: 0.75, cornice: false, balcony: true }, rng);
      // tiyatro: dış duvarında iki sıra kemer, üstte yıpranmış oturma basamakları
      const tx0 = 900, tx1 = 1250, th = 112;
      S.ctx.beginPath(); S.ctx.moveTo(tx0, 8); S.ctx.lineTo(tx0, -th + 22);
      for (let i = 0; i <= 24; i++) { const u = i / 24, xx = U.lerp(tx0, tx1, u); const env = Math.sin(u * Math.PI); S.ctx.lineTo(xx, -th + 22 - env * 22 - (rng() < 0.3 ? rng() * 7 : 0) + (i % 2 ? 2.5 : 0)); }
      S.ctx.lineTo(tx1, 8); S.ctx.closePath(); S.ctx.fill();
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.4);
      for (let k = 1; k < 5; k++) { S.ctx.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, xx = U.lerp(tx0 + 12, tx1 - 12, u); const yy = -th + 26 - Math.sin(u * Math.PI) * 22 + k * 6; if (i === 0) S.ctx.moveTo(xx, yy); else S.ctx.lineTo(xx, yy); } S.ctx.lineTo(tx1 - 12, -th + 27 + k * 6); S.ctx.lineTo(tx0 + 12, -th + 27 + k * 6); S.ctx.closePath(); S.ctx.globalAlpha = 0.5; S.ctx.fill(); }
      S.ctx.restore();
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, -1.2);
      for (let r = 0; r < 2; r++) for (let a = 0; a < 15; a++) {
        const ax = tx0 + 18 + a * 22.5, ay = r ? -30 : -76, aw = 11, ah = r ? 32 : 26;
        S.ctx.beginPath(); S.ctx.moveTo(ax, ay + ah); S.ctx.lineTo(ax, ay + aw / 2); S.ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0); S.ctx.lineTo(ax + aw, ay + ah); S.ctx.closePath(); S.ctx.fill();
        if (rng() < 0.35) P.lightRect(S.em, ax + 1, ay + aw * 0.6, aw - 2, ah - aw * 0.6, '#ffcf8a', 0.55);
      }
      S.ctx.restore();
      S.tone(1); for (let i = 0; i < 6; i++) P.palm(S.ctx, 790 + i * 22 + rng() * 10, 8, U.lerp(60, 90, rng()), rng);
      S.ctx.clearRect(0, 9, S.W, S.B); P.waterLines(S.ctx, 0, S.W, 10, S.B, rng, 'rgba(30,30,30,.35)');
      // ana katman: kıyı, tapınak, seyirciler
      S.layer('main'); S.ground(3);
      S.tone(3);
      apolloTemple(S, 640, 236, 238);
      S.tone(2); P.palm(S.ctx, 1330, 2, 180, rng); P.palm(S.ctx, 1370, 2, 140, rng); P.palm(S.ctx, 30, 2, 160, rng);
      S.tone(4);
      const look = { lookup: 3, glasses: 5, pointup: 1, phone: 1, stand2: 1 };
      P.crowd(S.ctx, 70, 452, 2, rng, { year: 2006, rows: 3, h: 45, poses: look, phones: 0.12, em: S.em, kids: 0.12 });
      P.crowd(S.ctx, 838, 960, 2, rng, { year: 2006, rows: 2, h: 45, poses: look, em: S.em });
      P.crowd(S.ctx, 1110, 1300, 2, rng, { year: 2006, rows: 3, h: 45, poses: look, phones: 0.15, em: S.em, kids: 0.1 });
      // yıkık tamburların üzerinde oturanlar
      P.person(S.ctx, 400, -22, 42, { pose: 'sit', hat: 'none', dir: 1 });
      P.person(S.ctx, 420, -22, 40, { g: 'f', pose: 'sit', hat: 'long', dir: 1 });
      P.person(S.ctx, 878, -22, 42, { pose: 'sit', hat: 'cap', dir: -1 });
      // teleskop ve gökbilimci
      const tx = 1032, ang = Math.atan2(SUN[1] - (-60), SUN[0] - tx);
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[4]; S.ctx.lineWidth = 2.2; S.ctx.lineCap = 'round';
      S.ctx.beginPath(); S.ctx.moveTo(tx, -48); S.ctx.lineTo(tx - 16, 0); S.ctx.moveTo(tx, -48); S.ctx.lineTo(tx + 14, 0); S.ctx.moveTo(tx, -48); S.ctx.lineTo(tx + 2, 0); S.ctx.stroke();
      S.ctx.lineWidth = 7.5; S.ctx.beginPath(); S.ctx.moveTo(tx - Math.cos(ang) * 16, -54 - Math.sin(ang) * 16); S.ctx.lineTo(tx + Math.cos(ang) * 40, -54 + Math.sin(ang) * 40); S.ctx.stroke();
      S.ctx.restore();
      P.person(S.ctx, tx + 22, 0, 46, { pose: 'stand2', hat: 'fedora', dir: -1 });
      P.person(S.ctx, tx - 26, 0, 30, { kid: true, pose: 'pointup', hat: 'none', dir: 1 });
      // fotoğraf makinesi flaşları
      [[150, -64], [260, -58], [340, -70], [900, -62], [1150, -66], [1240, -60]].forEach((f, i) => S.blink(f[0], f[1], 22, '#ffffff', 2.3 + i * 0.37, i * 0.61, 0.045));
      // gök: taç, Venüs ve birkaç parlak yıldız
      S.skyAnim(function (c, t) {
        corona(c, SUN[0], SUN[1], R, t);
        P.glowRaw(c, SUN[0] - 300, SUN[1] + 150, 9, 'rgba(255,250,235,', 0.95);
        [[SUN[0] + 260, SUN[1] - 70, 0.6], [SUN[0] - 520, SUN[1] - 40, 0.45], [SUN[0] + 120, SUN[1] + 190, 0.4]].forEach((st, i) => P.glowRaw(c, st[0], st[1], 5, 'rgba(235,240,255,', st[2] * (0.75 + 0.25 * Math.sin(t * 2 + i))));
      });
    },
  };

  // Yumuşak kenarlı sis/bulut bandı
  function softMist(ctx, x, y, rx, ry, a) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(216,222,222,' + a + ')'); g.addColorStop(0.55, 'rgba(216,222,222,' + (a * 0.55) + ')'); g.addColorStop(1, 'rgba(216,222,222,0)');
    ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }

  // Batı Karadeniz seli — Bozkurt (11 Ağustos 2021)
  SCN.flood = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      const R0 = 330, R1 = 1050, WY = -8; // dere yatağı ve su seviyesi
      // arka: dik yamaçlı ormanlık dağlar, sırtlara takılmış alçak bulutlar
      S.layer('back');
      const peaks = [];
      for (let i = 0; i < 8; i++) peaks.push([i * 185 + rng() * 60, U.lerp(220, 360, rng())]);
      S.tone(0); P.mountains(S.ctx, 0, S.W, 8, peaks, rng, { sag: 0.3, jag: 6 });
      S.ctx.save(); S.ctx.fillStyle = 'rgba(40,40,40,0.35)';
      peaks.forEach((pk) => { for (let k = 0; k < 26; k++) { const fx = pk[0] + (rng() - 0.5) * 300, fy = 8 - rng() * pk[1] * 0.75; P.fir(S.ctx, fx, fy, U.lerp(16, 30, rng()), rng); } });
      S.ctx.restore();
      S.tone(1); P.hills(S.ctx, 0, S.W, 2, 90, rng, { freq: 0.004 });
      for (let i = 0; i < 90; i++) P.fir(S.ctx, rng() * S.W, 8 - rng() * 60, U.lerp(26, 50, rng()), rng);
      for (let i = 0; i < 10; i++) softMist(S.ctx, rng() * S.W, -U.lerp(130, 310, rng()), U.lerp(140, 280, rng()), U.lerp(16, 30, rng()), 0.36);
      // ana katman
      S.layer('main'); S.ground(3);
      S.ctx.clearRect(R0, -2, R1 - R0, S.B + 2);
      // suya gömülen parçalar önce çizilir; su gövdesi alt kısımlarını örter
      const DY = -78;
      S.tone(3);
      S.ctx.save(); S.ctx.translate(R0 + 270, DY + 6); S.ctx.rotate(0.42); S.ctx.fillRect(0, -6, 210, 12); S.ctx.restore();
      S.ctx.save(); S.ctx.translate(575, WY + 16); S.ctx.rotate(-0.3); S.tone(4); P.car(S.ctx, null, 0, 0, 92, 'modern', { dir: 1 }); S.ctx.restore();
      // çamurlu su gövdesi
      S.ctx.save();
      const wg = S.ctx.createLinearGradient(0, WY, 0, S.B);
      wg.addColorStop(0, '#4a4136'); wg.addColorStop(0.3, '#2e2923'); wg.addColorStop(1, '#1b1815');
      S.ctx.fillStyle = wg;
      S.ctx.beginPath(); S.ctx.moveTo(R0 - 6, S.B); S.ctx.lineTo(R0 - 6, WY + 2);
      for (let x = R0; x <= R1; x += 20) S.ctx.lineTo(x, WY + Math.sin(x * 0.05) * 2.5);
      S.ctx.lineTo(R1 + 6, WY + 2); S.ctx.lineTo(R1 + 6, S.B); S.ctx.closePath(); S.ctx.fill();
      S.ctx.restore();
      S.tone(3);
      // sol kıyı: iki katlı ev ve istinat duvarı; sağ kıyı: sel yatağına yaslanan, eğilmiş apartman
      P.house(S.ctx, S.em, 150, 0, 120, 92, { floors: 2, lit: 0.2 }, rng);
      S.ctx.fillRect(R0 - 20, -14, 20, 14 + S.B);
      P.apartment(S.ctx, S.em, 1190, 0, 130, 6, { year: 2021, lit: 0.06, tilt: -0.07 }, rng);
      P.rubble(S.ctx, R1 - 30, R1 + 70, 0, 40, rng);
      P.apartment(S.ctx, S.em, 1345, 0, 100, 5, { year: 2021, lit: 0.12 }, rng);
      // köprü: sol açıklık ayakta, orta açıklık yıkılıp suya gömülmüş, sağ açıklık kopuk
      S.ctx.beginPath();
      S.ctx.rect(R0 - 30, DY, 300, 12);                 // sol tabliye
      S.ctx.rect(R0 + 112, DY + 12, 20, -DY - 12 + 4);   // sol ayak
      S.ctx.rect(R0 + 104, WY - 4, 36, 10);
      S.ctx.rect(860, DY, 230, 12);                      // sağ tabliye
      S.ctx.rect(930, DY + 12, 20, -DY - 12 + 4);       // sağ ayak
      S.ctx.rect(922, WY - 4, 36, 10);
      S.ctx.fill();
      // yıkılan orta açıklık (eğik, ucu suyun içinde)
      S.ctx.save(); S.ctx.translate(860, DY + 6); S.ctx.rotate(-0.95); S.ctx.fillRect(-60, -5, 60, 10); S.ctx.restore();
      // korkuluklar
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[3]; S.ctx.lineWidth = 1.2;
      S.ctx.beginPath(); S.ctx.moveTo(R0 - 30, DY - 14); S.ctx.lineTo(R0 + 268, DY - 14); S.ctx.moveTo(860, DY - 14); S.ctx.lineTo(1090, DY - 14);
      for (let x = R0 - 26; x < R0 + 268; x += 9) { S.ctx.moveTo(x, DY); S.ctx.lineTo(x, DY - 14); }
      for (let x = 864; x < 1090; x += 9) { S.ctx.moveTo(x, DY); S.ctx.lineTo(x, DY - 14); }
      S.ctx.stroke(); S.ctx.restore();
      // kopmuş demirler
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[3]; S.ctx.lineWidth = 1; S.ctx.beginPath();
      for (let i = 0; i < 6; i++) { S.ctx.moveTo(R0 + 266, DY + 2 + i * 2); S.ctx.quadraticCurveTo(R0 + 276 + i * 2, DY + 10 + i * 3, R0 + 272 + i * 3, DY + 22 + i * 4); }
      S.ctx.stroke(); S.ctx.restore();
      // ayaklara yığılmış tomruklar, sürüklenen araç
      S.ctx.save(); S.ctx.fillStyle = P.TONE[4];
      for (let i = 0; i < 9; i++) { S.ctx.save(); S.ctx.translate(R0 + 100 + rng() * 70, WY - 2 - rng() * 8); S.ctx.rotate((rng() - 0.5) * 0.9); S.ctx.fillRect(-26, -3, 52, 6); S.ctx.restore(); }
      for (let i = 0; i < 7; i++) { S.ctx.save(); S.ctx.translate(920 + rng() * 60, WY - 2 - rng() * 8); S.ctx.rotate((rng() - 0.5) * 0.9); S.ctx.fillRect(-22, -3, 44, 6); S.ctx.restore(); }
      S.ctx.restore();
      // elektrik direkleri (biri yatmış)
      S.tone(3);
      P.utilityPole(S.ctx, 60, 0, 120);
      S.ctx.save(); S.ctx.translate(1300 - 210, 0); S.ctx.rotate(-0.3); P.utilityPole(S.ctx, 0, 0, 110); S.ctx.restore();
      // kıyıdaki kurtarma ekibi ve halat
      S.tone(4);
      for (let i = 0; i < 5; i++) P.person(S.ctx, 220 + i * 21, 0, 45, { pose: i === 0 ? 'point' : 'carry', hat: 'helmet', dir: 1 });
      P.crowd(S.ctx, 18, 120, 2, rng, { year: 2021, rows: 2, h: 44, poses: { mourn: 3, stand: 2, hug: 1 }, hold: 'umbrella', holdP: 0.35 });
      S.ctx.save(); S.ctx.strokeStyle = 'rgba(200,190,160,0.75)'; S.ctx.lineWidth = 1.3; S.ctx.beginPath(); S.ctx.moveTo(304, -30); S.ctx.quadraticCurveTo(420, -6, 520, -60); S.ctx.stroke(); S.ctx.restore();
      P.excavator(S.ctx, 1010, -78, 120, { dir: -1, arm: 0.35 });
      // akan su: köpük çizgileri ve ayak dibindeki çalkantılar
      S.anim(function (c, t) {
        c.save();
        c.beginPath(); c.rect(R0, WY - 14, R1 - R0, 80); c.clip();
        for (let r = 0; r < 7; r++) {
          const yy = WY + 1 + r * 6.5, sp = 120 + r * 26, L = 40 + r * 9;
          c.strokeStyle = 'rgba(214,200,172,' + (0.42 - r * 0.045).toFixed(3) + ')';
          c.lineWidth = 1.6 - r * 0.12;
          c.beginPath();
          for (let k = 0; k < 9; k++) {
            const x0 = R0 - 80 + ((k * 97 + r * 41 + t * sp) % (R1 - R0 + 160));
            c.moveTo(x0, yy + Math.sin(x0 * 0.06 + t * 3) * 1.8);
            c.quadraticCurveTo(x0 + L * 0.5, yy - 2.5 + Math.sin(t * 4 + k) * 1.2, x0 + L, yy + Math.sin((x0 + L) * 0.06 + t * 3) * 1.8);
          }
          c.stroke();
        }
        c.restore();
        [[R0 + 122, WY], [940, WY], [R0 + 330, WY + 2]].forEach((pp, i) => {
          for (let k = 0; k < 5; k++) {
            const u = ((t * 1.4 + k / 5 + i * 0.3) % 1);
            c.fillStyle = 'rgba(222,212,188,' + (0.45 * (1 - u)).toFixed(3) + ')';
            c.beginPath(); c.arc(pp[0] - 14 + u * 30, pp[1] - 4 - Math.sin(u * Math.PI) * 14, 3 + u * 6, 0, TAU); c.fill();
          }
        });
      });
      // kurtarma helikopteri: halat ucunda bir kurtarıcı, projektör
      S.anim(function (c, t) {
        const hx = 700 + Math.sin(t * 0.45) * 18, hy = -310 + Math.sin(t * 1.1) * 5;
        c.fillStyle = P.TONE[3];
        P.helicopter(c, null, hx, hy, 120, { dir: -1 });
        c.save(); c.globalAlpha = 0.5; c.beginPath(); c.ellipse(hx - 6, hy - 23, 66, 2.2 + Math.abs(Math.sin(t * 40)) * 1.4, 0, 0, TAU); c.fill(); c.restore();
        c.strokeStyle = P.TONE[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 4, hy + 10); c.lineTo(hx - 4 + Math.sin(t * 0.8) * 4, hy + 120); c.stroke();
        P.person(c, hx - 4 + Math.sin(t * 0.8) * 4, hy + 150, 40, { pose: 'carry', hat: 'helmet', dir: -1 });
      });
      S.anim(function (c, t) {
        const hx = 700 + Math.sin(t * 0.45) * 18, hy = -310 + Math.sin(t * 1.1) * 5;
        const a = 1.9 + Math.sin(t * 0.5) * 0.25, L = 320;
        const g = c.createLinearGradient(hx, hy, hx + Math.cos(a) * L, hy + Math.sin(a) * L);
        g.addColorStop(0, 'rgba(235,242,255,0.3)'); g.addColorStop(1, 'rgba(235,242,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(hx, hy + 6); c.lineTo(hx + Math.cos(a - 0.14) * L, hy + Math.sin(a - 0.14) * L); c.lineTo(hx + Math.cos(a + 0.14) * L, hy + Math.sin(a + 0.14) * L); c.closePath(); c.fill();
        P.glowRaw(c, hx + 2, hy + 6, 16, 'rgba(240,246,255,', 0.9);
        P.glowRaw(c, hx + 40, hy - 14, 8, 'rgba(255,60,50,', Math.sin(t * 6) > 0 ? 0.9 : 0.15);
      }, true);
      S.blink(1023, -173, 20, '#ff8a2a', 0.9, 0, 0.5);
    },
  };

  // Rekor sıcaklık — Silopi (25 Temmuz 2025)
  function rooftopHeater(ctx, x, y, s) {
    // güneş enerjili su ısıtıcısı: eğik panel ve üstünde yatay depo
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + 28 * s, y - 15 * s); ctx.lineTo(x + 30 * s, y - 12 * s); ctx.lineTo(x + 2 * s, y + 3 * s); ctx.closePath();
    ctx.rect(x + 22 * s, y - 13 * s, 2 * s, 13 * s); ctx.rect(x + 4 * s, y - 2 * s, 2 * s, 2 * s);
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 17 * s, y - 24 * s); ctx.lineTo(x + 37 * s, y - 24 * s); ctx.arc(x + 37 * s, y - 20 * s, 4 * s, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x + 17 * s, y - 16 * s); ctx.arc(x + 17 * s, y - 20 * s, 4 * s, Math.PI / 2, Math.PI * 1.5); ctx.fill();
    ctx.fillRect(x + 25 * s, y - 16 * s, 1.6 * s, 6 * s);
  }
  function waterTank(ctx, x, y, s) {
    ctx.beginPath(); ctx.rect(x - 7 * s, y - 15 * s, 14 * s, 15 * s); ctx.ellipse(x, y - 15 * s, 7 * s, 2.4 * s, 0, 0, TAU); ctx.fill();
    ctx.fillRect(x - 1.5 * s, y - 19 * s, 3 * s, 3 * s);
  }

  SCN.heat = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      // arka: Cudi Dağı sırtı, ovada alçak düz damlı evler ve minare
      S.layer('back');
      const peaks = [[90, 150], [300, 205], [470, 240], [640, 215], [820, 250], [1010, 205], [1220, 170]];
      S.tone(0); P.mountains(S.ctx, 0, S.W, -4, peaks, rng, { sag: 0.12, jag: 5 });
      S.tone(1);
      for (let i = 0; i < 34; i++) { const x = rng() * S.W, w = U.lerp(26, 50, rng()), h = U.lerp(18, 34, rng()); S.ctx.fillRect(x - w / 2, 6 - h, w, h); if (rng() < 0.6) waterTank(S.ctx, x + (rng() - 0.5) * w * 0.5, 6 - h, 0.55); if (rng() < 0.4) rooftopHeater(S.ctx, x - w * 0.4, 6 - h, 0.45); }
      P.mosque(S.ctx, S.em, 430, 6, 28, { minarets: 1, minH: 120, lit: 0 }, rng);
      P.mosque(S.ctx, S.em, 1090, 6, 22, { minarets: 1, minH: 96, lit: 0 }, rng);
      // ana katman: güneşten kavrulan cadde
      S.layer('main'); S.ground(3);
      S.tone(3);
      const blocks = [[120, 200, 3], [360, 170, 4], [960, 200, 3], [1230, 230, 4]];
      blocks.forEach((b) => {
        const x = b[0], w = b[1], fl = b[2], h = fl * 32 + 8;
        P.building(S.ctx, S.em, x, 0, w, h, { roof: 'flat', floors: fl, cols: Math.round(w / 34), lit: 0, cornice: true, balcony: true, ww: 0.42, wh: 0.5 }, rng);
        for (let k = 0; k < Math.round(w / 70); k++) rooftopHeater(S.ctx, x - w / 2 + 14 + k * 64 + rng() * 10, -h, 1);
        waterTank(S.ctx, x + w * 0.36, -h, 1.1); if (w > 180) waterTank(S.ctx, x + w * 0.18, -h, 1);
        P.dish(S.ctx, x - w * 0.38, -h + 30, 6, -0.5);
        // klima dış üniteleri
        for (let f = 0; f < fl; f++) if (rng() < 0.7) { const ax = x + (rng() < 0.5 ? -1 : 1) * w * U.lerp(0.1, 0.4, rng()); S.ctx.fillRect(ax - 9, -16 - f * 32 - 8, 18, 12); }
      });
      // dükkân tenteleri ve gölgede oturanlar
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 2.6);
      [[120, 150], [360, 130], [960, 150]].forEach((aw) => {
        S.ctx.beginPath(); S.ctx.moveTo(aw[0] - aw[1] / 2, -58); S.ctx.lineTo(aw[0] + aw[1] / 2, -58); S.ctx.lineTo(aw[0] + aw[1] / 2 + 10, -40);
        for (let i = 10; i >= 0; i--) { const sx = aw[0] - aw[1] / 2 - 10 + (i / 10) * (aw[1] + 20); S.ctx.quadraticCurveTo(sx + (aw[1] + 20) / 20, -34, sx, -40); }
        S.ctx.closePath(); S.ctx.fill();
      });
      S.ctx.restore();
      S.tone(4);
      // sokak termometresi
      const TX = 700, TY = -250;
      S.ctx.fillRect(TX - 3, TY, 6, -TY);
      P.fillRR(S.ctx, TX - 92, TY - 68, 184, 72, 5);
      S.ctx.save(); S.ctx.fillStyle = '#0b0b0b'; P.fillRR(S.ctx, TX - 84, TY - 60, 168, 56, 3); S.ctx.restore();
      P.text(S.ctx, '50,5°C', TX, TY - 15, 40, { color: '#ff4a2e', weight: '700', font: '"Fira Sans", "Segoe UI", Roboto, sans-serif' });
      P.text(S.em, '50,5°C', TX, TY - 15, 40, { color: 'rgba(255,90,60,0.9)', weight: '700', font: '"Fira Sans", "Segoe UI", Roboto, sans-serif' });
      P.glow(S.em, TX, TY - 32, 130, '#ff4a30', 0.32);
      S.ctx.fillRect(TX - 40, TY - 94, 80, 22);
      P.text(S.ctx, 'ECZANE', TX, TY - 77, 15, { color: '#d8e9d8', weight: '700', spacing: 2 });
      // gölgede oturanlar, yelpazelenen adam, şemsiyeli kadın, su içen çocuk
      for (let i = 0; i < 3; i++) P.person(S.ctx, 70 + i * 34, -2, 44, { pose: i === 1 ? 'fan' : 'sit', hat: i === 2 ? 'cap' : 'none', dir: i ? -1 : 1 });
      S.ctx.fillRect(56, -20, 90, 4); S.ctx.fillRect(60, -20, 3, 20); S.ctx.fillRect(140, -20, 3, 20);
      P.person(S.ctx, 330, 0, 46, { g: 'f', pose: 'walk1', hat: 'scarf', skirt: 'long', dir: 1, hold: 'umbrella' });
      P.person(S.ctx, 395, 0, 45, { pose: 'fan', hat: 'none', dir: -1 });
      P.person(S.ctx, 520, 0, 44, { pose: 'stand2', hat: 'cap', dir: 1 });
      // seyyar satıcı: şemsiyeli buz/su arabası
      S.ctx.save(); S.ctx.beginPath(); S.ctx.rect(560, -44, 70, 30); S.ctx.fill(); P.wheel(S.ctx, 575, -7, 7); P.wheel(S.ctx, 615, -7, 7); S.ctx.fillRect(594, -120, 2.4, 80);
      S.ctx.beginPath(); S.ctx.moveTo(540, -112); S.ctx.quadraticCurveTo(595, -150, 650, -112); S.ctx.closePath(); S.ctx.fill(); S.ctx.restore();
      P.person(S.ctx, 652, 0, 45, { pose: 'stand2', hat: 'kasket', dir: -1 });
      // çeşmede serinleyen çocuklar
      S.ctx.fillRect(812, -26, 26, 26);
      P.person(S.ctx, 852, 0, 30, { kid: true, pose: 'cheer', hat: 'none', dir: -1 });
      P.person(S.ctx, 790, 0, 28, { kid: true, g: 'f', pose: 'clap', hat: 'pony', dir: 1 });
      P.dog(S.ctx, 1090, 0, 1.05, { dir: -1 });
      P.car(S.ctx, S.em, 1340, 0, 120, 'modern', { dir: -1 });
      P.crowd(S.ctx, 1050, 1300, 2, rng, { year: 2025, rows: 1, h: 45, poses: { fan: 2, stand2: 1, walk1: 1 }, hold: 'umbrella', holdP: 0.25 });
      // çeşme suyu ve sıcak hava dalgalanması
      S.anim(function (c, t) {
        c.strokeStyle = 'rgba(205,225,240,0.55)'; c.lineWidth = 1.6;
        for (let i = 0; i < 4; i++) { const u = (t * 2.2 + i / 4) % 1; c.beginPath(); c.moveTo(838, -20); c.quadraticCurveTo(852 + u * 6, -46 - i * 3, 866 + u * 10, -8 + Math.sin(t * 9 + i) * 2); c.stroke(); }
        for (let i = 0; i < 6; i++) { const u = (t * 1.3 + i / 6) % 1; c.fillStyle = 'rgba(210,230,245,' + (0.5 * (1 - u)).toFixed(3) + ')'; c.beginPath(); c.arc(860 + u * 18, -4 - Math.sin(u * Math.PI) * 6, 1.6, 0, TAU); c.fill(); }
      });
      S.anim(function (c, t) {
        c.lineWidth = 6;
        for (let r = 0; r < 5; r++) {
          const yy = -8 - r * 12 - ((t * 9 + r * 4) % 12);
          c.strokeStyle = 'rgba(255,246,226,' + (0.06 - r * 0.009).toFixed(3) + ')';
          c.beginPath();
          for (let x = 0; x <= S.W; x += 18) { const yv = yy + Math.sin(x * 0.045 + t * 2.4 + r) * 2.2; if (x === 0) c.moveTo(x, yv); else c.lineTo(x, yv); }
          c.stroke();
        }
        // asfaltta serap şeridi
        const g = c.createLinearGradient(0, -4, 0, 4);
        g.addColorStop(0, 'rgba(250,240,220,0)'); g.addColorStop(0.5, 'rgba(250,240,220,' + (0.16 + 0.05 * Math.sin(t * 3)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(250,240,220,0)');
        c.fillStyle = g; c.fillRect(440, -4, 520, 8);
      });
    },
  };
  // 1988: Seul — halter platformu, spot ışıkları, kalabalık
  SCN.lift = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      // arka: salonun çatı kafesi ve tribünler
      S.layer('back'); S.tone(1);
      for (let r = 0; r < 7; r++) for (let i = 0; i < 90; i++) { const x = i * 15 + (r % 2) * 7, y = -30 - r * 24; S.ctx.beginPath(); S.ctx.arc(x, y, 5, 0, TAU); S.ctx.fill(); S.ctx.fillRect(x - 5, y + 4, 10, 10); }
      S.ctx.fillRect(0, -330, S.W, 10);
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[1]; S.ctx.lineWidth = 3;
      S.ctx.beginPath(); for (let x = 0; x < S.W; x += 80) { S.ctx.moveTo(x, -330); S.ctx.lineTo(x + 40, -380); S.ctx.lineTo(x + 80, -330); } S.ctx.moveTo(0, -380); S.ctx.lineTo(S.W, -380); S.ctx.stroke(); S.ctx.restore();
      for (let i = 0; i < 9; i++) P.glow(S.em, 70 + i * 145, -326, 30, '#f2f6ff', 0.8);
      // skor tabelası
      S.ctx.fillRect(900, -300, 240, 110);
      P.lightRect(S.em, 908, -292, 224, 94, '#101418', 0.4);
      P.text(S.em, 'SİLKME', 1020, -262, 18, { color: 'rgba(255,214,140,0.95)', weight: '700', font: 'ui-monospace, Menlo, monospace', spacing: 3 });
      P.text(S.em, '190', 1020, -212, 46, { color: 'rgba(255,90,60,0.98)', weight: '800', font: 'ui-monospace, Menlo, monospace' });
      S.layer('main'); S.ground(3);
      S.tone(3);
      // platform
      S.ctx.fillRect(470, -26, 360, 26);
      S.ctx.save(); S.ctx.fillStyle = P.lighter(S.ctx, 1.5); S.ctx.fillRect(470, -26, 360, 3); S.ctx.restore();
      // hakem masası ve üç beyaz ışık (geçerli kaldırış)
      S.ctx.fillRect(900, -60, 220, 60);
      for (let i = 0; i < 3; i++) { P.person(S.ctx, 930 + i * 80, -36, 40, { pose: 'sit', hat: 'none', dir: -1 }); S.ctx.fillRect(918 + i * 80, -120, 26, 18); P.glow(S.em, 931 + i * 80, -111, 26, '#ffffff', 0.95); }
      S.tone(4);
      // kaldırıcı: halter başın üstünde
      const lx = 650;
      P.glow(S.em, lx, -120, 170, '#f4f6ff', 0.35);
      const b = P.person(S.ctx, lx, -26, 66, { pose: { tl: 0.0, hd: -0.05, tn: 0.42, kn: 0.12, tf: -0.4, kf: 0.1, an: 2.95, en: 0.04, af: 2.95, ef: 0.04 }, hat: 'none', dir: 1 });
      const by = Math.min(b.hand[1], b.hand2[1]) - 3;
      S.ctx.fillRect(lx - 120, by - 2.5, 240, 5);
      [[-100, 34], [-84, 40], [84, 40], [100, 34]].forEach((pl) => S.ctx.fillRect(lx + pl[0] - 6, by - pl[1] / 2, 12, pl[1]));
      // spot ışıkları
      [[380, -420], [920, -420]].forEach((pp, k) => S.anim(function (c, t) {
        const a = Math.atan2(-60 - pp[1], lx - pp[0]) + Math.sin(t * 0.6 + k) * 0.04, L = 520;
        const g = c.createLinearGradient(pp[0], pp[1], pp[0] + Math.cos(a) * L, pp[1] + Math.sin(a) * L);
        g.addColorStop(0, 'rgba(240,244,255,0.32)'); g.addColorStop(1, 'rgba(240,244,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(pp[0], pp[1]); c.lineTo(pp[0] + Math.cos(a - 0.12) * L, pp[1] + Math.sin(a - 0.12) * L); c.lineTo(pp[0] + Math.cos(a + 0.12) * L, pp[1] + Math.sin(a + 0.12) * L); c.closePath(); c.fill();
      }, true));
      // ön sırada coşan seyirciler ve bayraklar
      P.crowd(S.ctx, 20, 440, 4, rng, { year: 1988, rows: 2, h: 46, flags: 0.25, poses: { cheer: 4, clap: 2, fist: 1 } });
      P.crowd(S.ctx, 1140, 1290, 4, rng, { year: 1988, rows: 2, h: 46, flags: 0.25, poses: { cheer: 4, clap: 2 } });
      for (let i = 0; i < 6; i++) S.blink(80 + i * 220, -70, 18, '#ffffff', 1.7 + i * 0.3, i * 0.4, 0.05);
    },
  };
  // ------------------------------------------------------------- Cumhuriyet'in temel metinleri
  // Kürsüde açık duran anayasa kitabı. 1928'den önce sayfalar Arap harfli (soyut kıvrımlar),
  // sonra Latin harfli satırlar.
  function lawBook(S, x, y, size, latin) {
    const c = S.ctx, s = size / 100;
    S.tone(4);
    c.beginPath();
    c.moveTo(x - 16 * s, y); c.lineTo(x - 9 * s, y - 72 * s); c.lineTo(x + 9 * s, y - 72 * s); c.lineTo(x + 16 * s, y); c.closePath();
    c.rect(x - 36 * s, y - 6 * s, 72 * s, 6 * s);
    c.moveTo(x - 64 * s, y - 70 * s); c.lineTo(x + 64 * s, y - 70 * s); c.lineTo(x + 58 * s, y - 82 * s); c.lineTo(x - 58 * s, y - 82 * s); c.closePath();
    c.fill();
    const top = y - 82 * s;
    // iki sayfa: ortada sırta doğru hafifçe çöken açık renkli yüzeyler
    c.save();
    const g = c.createLinearGradient(x - 60 * s, 0, x + 60 * s, 0);
    g.addColorStop(0, '#9c9483'); g.addColorStop(0.46, '#c9c1ae'); g.addColorStop(0.5, '#8f887a'); g.addColorStop(0.54, '#c9c1ae'); g.addColorStop(1, '#9c9483');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(x, top - 2 * s);
    c.quadraticCurveTo(x - 28 * s, top - 10 * s, x - 60 * s, top - 4 * s);
    c.lineTo(x - 56 * s, top - 50 * s);
    c.quadraticCurveTo(x - 26 * s, top - 58 * s, x, top - 48 * s);
    c.quadraticCurveTo(x + 26 * s, top - 58 * s, x + 56 * s, top - 50 * s);
    c.lineTo(x + 60 * s, top - 4 * s);
    c.quadraticCurveTo(x + 28 * s, top - 10 * s, x, top - 2 * s);
    c.closePath(); c.fill();
    // satırlar
    c.fillStyle = 'rgba(40,36,30,0.75)'; c.strokeStyle = 'rgba(40,36,30,0.75)'; c.lineWidth = 1.1 * s;
    for (let side = -1; side <= 1; side += 2) {
      for (let r = 0; r < 6; r++) {
        const yy = top - 44 * s + r * 6.4 * s + Math.abs(side) * 0;
        const x0 = x + side * 8 * s, x1 = x + side * 50 * s;
        if (latin) {
          // kısa sözcük kümeleri
          let xx = Math.min(x0, x1);
          const xe = Math.max(x0, x1);
          let k = 0;
          while (xx < xe - 4 * s) { const ww = (4 + ((r * 7 + k * 3) % 9)) * s; c.fillRect(xx, yy - 1.4 * s, Math.min(ww, xe - xx), 1.8 * s); xx += ww + 2.2 * s; k++; }
        } else {
          // sağdan sola kıvrımlı yazı izlenimi ve noktalar
          c.beginPath();
          const xa = Math.max(x0, x1), xb = Math.min(x0, x1);
          c.moveTo(xa, yy);
          for (let xx = xa; xx > xb; xx -= 5 * s) c.quadraticCurveTo(xx - 1.5 * s, yy - 3 * s * ((xx / s + r) % 2 ? 1 : 0.4), xx - 5 * s, yy);
          c.stroke();
          for (let q = 0; q < 3; q++) c.fillRect(xb + (q * 13 + r * 5) % 40 * s, yy - 4.5 * s, 1.2 * s, 1.2 * s);
        }
      }
    }
    c.restore();
    // kitaba düşen sıcak ışık (gece belirginleşir)
    P.glow(S.em, x, top - 30 * s, 70 * s, '#ffe2a8', 0.35);
  }

  SCN.constitution = {
    w: 1300,
    draw(S, p) {
      const rng = S.rng, v = p.v || 1924;
      SC.ankaraOld(S, { cx: v === 1921 ? 0.86 : 0.14, cs: 130 });
      S.layer('main'); S.ground(3);
      S.tone(2); for (let i = 0; i < 6; i++) P.poplar(S.ctx, U.lerp(20, 1280, rng()), 2, U.lerp(150, 220, rng()), rng);
      S.tone(3);
      let b;
      if (v === 1921) b = P.tbmm1920(S.ctx, S.em, 760, 0, 200, rng, { lit: 0.7 });
      else b = P.tbmm2(S.ctx, S.em, 760, 0, 180, rng);
      S.flag(b.poleX, b.poleY - 70, 46, { base: b.poleY, poleTone: 3 });
      if (v === 1937) {
        // cephede altı ilkenin yazılı olduğu uzun pankart
        const bx = 760, by = -136, bw = 400, bh = 44;
        S.ctx.save();
        S.ctx.fillStyle = '#b8b0a0'; S.ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
        S.ctx.fillStyle = '#7d2622'; S.ctx.fillRect(bx - bw / 2, by - bh / 2, bw, 3); S.ctx.fillRect(bx - bw / 2, by + bh / 2 - 3, bw, 3);
        S.ctx.restore();
        P.text(S.ctx, 'CUMHURİYETÇİLİK · MİLLİYETÇİLİK · HALKÇILIK', bx, by - 3, 10.5, { color: '#2b2722', weight: '700', spacing: 0.6 });
        P.text(S.ctx, 'DEVLETÇİLİK · LAİKLİK · İNKILAPÇILIK', bx, by + 13, 10.5, { color: '#2b2722', weight: '700', spacing: 0.6 });
      }
      lawBook(S, 320, 0, 118, v >= 1928);
      S.tone(4);
      const year = v;
      // milletvekilleri ve halk
      P.crowd(S.ctx, 430, 640, 2, rng, { year: year, rows: 2, h: 46, female: v < 1935 ? 0.15 : 0.4, poses: { stand: 3, clap: 2, walk1: 1 }, dir: 1 });
      P.crowd(S.ctx, 900, 1270, 4, rng, { year: year, rows: 3, h: 46, female: v < 1935 ? 0.25 : 0.45, flags: 0.08, poses: { stand: 3, clap: 3, wave: 1 }, dir: -1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, 150 + i * 34, 0, 48, { pose: i === 1 ? 'point' : 'stand', hat: rng.weighted(P.eraHats(year, 'm')), coat: 'long', dir: 1 });
      if (v === 1921) { P.horse(S.ctx, 60, 2, 1.1, { dir: 1 }); }
      else P.car(S.ctx, S.em, 70, 2, 90, 'old', { dir: 1 });
    },
  };

  // Körfez Savaşı: kış, sınırda karlı dağlar; solda hava üssü, sağda sınıra yığılan insanlar
  SCN.gulf = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.mountainsBack(S, { n: 7, min: 150, max: 290, snow: true, snowTone: '#a4a4a2' });
      S.layer('main'); S.ground(3);
      S.tone(3);
      // hangar (yarım silindir) ve kule
      S.ctx.beginPath(); S.ctx.moveTo(30, 0); S.ctx.lineTo(30, -64); S.ctx.quadraticCurveTo(170, -160, 310, -64); S.ctx.lineTo(310, 0); S.ctx.closePath(); S.ctx.fill();
      S.ctx.fillRect(360, -150, 22, 150); S.ctx.fillRect(342, -174, 58, 26);
      P.lightRect(S.em, 346, -170, 50, 14, '#d8ecff', 0.7);
      P.lightRect(S.em, 120, -46, 100, 46, '#ffe9c0', 0.35);
      for (let i = 0; i < 16; i++) P.glow(S.em, 10 + i * 30, -2, 6, i % 4 ? '#fff2d0' : '#7fd38a', 0.85);
      // sınır teli ve çadırlar
      S.ctx.save(); S.ctx.strokeStyle = P.TONE[3]; S.ctx.lineWidth = 0.6;
      for (let x = 620; x < S.W; x += 9) { S.ctx.beginPath(); S.ctx.moveTo(x, -44); S.ctx.lineTo(x + 9, 0); S.ctx.moveTo(x + 9, -44); S.ctx.lineTo(x, 0); S.ctx.stroke(); }
      S.ctx.restore();
      for (let i = 0; i < 6; i++) P.tent(S.ctx, 820 + i * 78, 0, 66, 44, '#5a5a56');
      S.tone(4);
      for (let x = 620; x < S.W; x += 110) S.ctx.fillRect(x, -50, 3, 50);
      for (let i = 0; i < 11; i++) {
        const pose = rng.pick(['walk1', 'walk2', 'carry', 'suitcase']);
        P.person(S.ctx, 470 + i * 34, 2, i % 3 === 2 ? 30 : 46, { g: rng() < 0.5 ? 'f' : 'm', kid: i % 3 === 2, pose: pose, hat: rng.pick(['scarf', 'none', 'kasket', 'scarf']), coat: 'long', hold: pose === 'carry' ? 'bundle' : pose === 'suitcase' ? 'suitcase' : null, dir: -1 });
      }
      // gökyüzünden geçen iki savaş uçağı
      S.anim(function (c, t, info) {
        const k = info ? info.k : 0.5;
        for (let j = 0; j < 2; j++) {
          const u = U.clamp(k * 1.5 - 0.2 - j * 0.1, 0, 1);
          const x = U.lerp(1450, -150, u), y = -360 - j * 46 + Math.sin(u * 3) * 12;
          const ea = SC.edgeA(x, S.W);
          if (ea < 0.01) continue;
          c.save(); c.globalAlpha *= ea; c.fillStyle = P.TONE[3];
          P.plane(c, null, x, y, 86, 'jet', { angle: -0.04, dir: -1 });
          c.restore();
        }
      });
    },
  };

  // Devlet töreni: bayrağa sarılı tabut top arabasında, yarıya inmiş bayraklar, yaslı kalabalık
  SCN.funeral = {
    w: 1300,
    draw(S) {
      const rng = S.rng;
      SC.istanbul(S, { towers: 0, water: false, lit: 0.12 });
      S.layer('main'); S.ground(3);
      S.tone(3);
      P.mosque(S.ctx, S.em, 250, 0, 64, { minarets: 2, minH: 250, lit: 0.15 }, rng);
      S.tone(2); SC.trees(S, 420, 520, 2, ['cypress'], 160, 230); SC.trees(S, 1080, 1280, 3, ['cypress', 'broad'], 150, 230);
      S.tone(3);
      [600, 800, 1000].forEach((x) => S.flag(x, -300, 40, { base: 0, half: true, amp: 0.05, speed: 2.4 }));
      S.tone(4);
      P.gunCarriage(S.ctx, 760, 0, 2.3);
      for (let i = 0; i < 4; i++) P.person(S.ctx, 850 + i * 26, 0, 48, { pose: i % 2 ? 'walk1' : 'walk2', hat: 'helmet', coat: 'long', dir: 1 });
      for (let i = 0; i < 4; i++) P.person(S.ctx, 590 + i * 28, 0, 48, { pose: i % 2 ? 'walk2' : 'walk1', hat: 'helmet', hold: 'rifle', coat: 'short', dir: 1 });
      P.crowd(S.ctx, 20, 560, 4, rng, { year: 1993, rows: 3, h: 46, poses: { mourn: 6, stand: 2, pray: 1 }, hold: 'umbrella', holdP: 0.1 });
      P.crowd(S.ctx, 980, 1290, 4, rng, { year: 1993, rows: 3, h: 46, poses: { mourn: 6, stand: 2 }, flags: 0.05 });
    },
  };

  // Karadeniz gazı: denizde sondaj gemisi ve alevi, kıyıda boru hattının karaya çıktığı tesis
  function drillship(S, x, y, L) {
    const c = S.ctx, s = L / 100;
    c.beginPath();
    // gövde
    c.moveTo(x - 50 * s, y - 4 * s); c.lineTo(x + 44 * s, y - 4 * s); c.lineTo(x + 52 * s, y - 12 * s); c.lineTo(x - 52 * s, y - 12 * s); c.closePath();
    c.rect(x - 52 * s, y - 15 * s, 104 * s, 3 * s);
    // baş tarafta yaşam bloğu ve helikopter pisti
    c.rect(x + 26 * s, y - 30 * s, 22 * s, 16 * s);
    c.moveTo(x + 22 * s, y - 31 * s); c.lineTo(x + 52 * s, y - 34 * s); c.lineTo(x + 52 * s, y - 31 * s); c.lineTo(x + 22 * s, y - 29 * s); c.closePath();
    // vinçler
    c.rect(x - 34 * s, y - 26 * s, 3 * s, 12 * s);
    c.fill();
    // kafes kule (derrick)
    c.save(); c.strokeStyle = c.fillStyle; c.lineWidth = Math.max(0.8, 0.9 * s); c.lineJoin = 'round';
    const bx = x - 4 * s, by = y - 15 * s, h = 70 * s, w0 = 9 * s, w1 = 2.2 * s;
    c.beginPath();
    c.moveTo(bx - w0, by); c.lineTo(bx - w1, by - h); c.moveTo(bx + w0, by); c.lineTo(bx + w1, by - h);
    for (let i = 0; i < 8; i++) { const u0 = i / 8, u1 = (i + 1) / 8; const a0 = U.lerp(w0, w1, u0), a1 = U.lerp(w0, w1, u1); c.moveTo(bx - a0, by - u0 * h); c.lineTo(bx + a1, by - u1 * h); c.moveTo(bx + a0, by - u0 * h); c.lineTo(bx - a1, by - u1 * h); }
    c.moveTo(bx - 32 * s, by - 10 * s); c.lineTo(bx - 10 * s, by - 34 * s);   // vinç kolu
    c.moveTo(x - 50 * s, y - 16 * s); c.lineTo(x - 66 * s, y - 30 * s);        // yakma kolu
    c.stroke(); c.restore();
    c.fillRect(bx - 4 * s, by - h - 4 * s, 8 * s, 4 * s);
    for (let i = 0; i < 6; i++) P.glow(S.em, x - 40 * s + i * 16 * s, y - 20 * s, 6 * s, '#ffe9c0', 0.8);
    P.glow(S.em, bx, by - h - 2 * s, 8 * s, '#ff5a4a', 0.9);
    return { flareX: x - 66 * s, flareY: y - 30 * s };
  }

  SCN.gas = {
    w: 1400,
    draw(S) {
      const rng = S.rng;
      S.layer('back');
      S.tone(0); P.hills(S.ctx, 0, S.W * 0.45, -10, 90, rng, { freq: 0.003 });
      S.tone(1); P.hills(S.ctx, 0, S.W * 0.4, 4, 40, rng, { freq: 0.005 });
      S.ctx.clearRect(S.W * 0.42, 8, S.W, S.B);
      P.waterLines(S.ctx, S.W * 0.42, S.W, 10, S.B, rng, 'rgba(40,40,40,.35)');
      S.layer('main'); S.ground(3);
      // sağ yarı deniz
      S.ctx.clearRect(800, 4, S.W, S.B);
      P.waterLines(S.ctx, 800, S.W, 8, S.B, rng, 'rgba(30,30,30,.4)');
      S.tone(3);
      const f = drillship(S, 1110, 6, 300);
      S.flame(f.flareX, f.flareY, 26, 40);
      S.smoke(f.flareX - 6, f.flareY - 40, { n: 8, size: 16, drift: -10, rise: 20, alpha: 0.3, color: 'rgba(60,56,52,' });
      // kıyı tesisi: tanklar, boru hattı denize iner
      S.tone(3);
      for (let i = 0; i < 3; i++) { const tx = 420 + i * 92; S.ctx.fillRect(tx - 34, -70, 68, 70); S.ctx.beginPath(); S.ctx.ellipse(tx, -70, 34, 8, 0, 0, TAU); S.ctx.fill(); P.lightRect(S.em, tx - 2, -66, 4, 4, '#ffe9c0', 0.8); }
      S.ctx.fillRect(320, -14, 520, 6); S.ctx.fillRect(320, -22, 6, 22);
      S.ctx.fillRect(700, -120, 8, 120); S.ctx.fillRect(690, -124, 28, 6);
      S.flag(704, -230, 40, { base: -124 });
      S.tone(4);
      P.crowd(S.ctx, 40, 300, 4, rng, { year: 2020, rows: 3, h: 46, flags: 0.25, poses: { cheer: 2, clap: 2, stand: 2, phone: 1 }, dir: 1 });
      for (let i = 0; i < 3; i++) P.person(S.ctx, 560 + i * 30, 0, 46, { pose: i === 1 ? 'point' : 'stand', hat: 'helmet', coat: 'short', dir: 1 });
      S.anim(function (c, t) {
        // gece denize vuran alev yansıması
        c.fillStyle = 'rgba(255,150,70,' + (0.18 + 0.06 * Math.sin(t * 7)).toFixed(3) + ')';
        for (let i = 0; i < 6; i++) c.fillRect(f.flareX - 20 + Math.sin(t * 2 + i) * 6, 18 + i * 9, 40 - i * 4, 2);
      }, true);
    },
  };

})();
