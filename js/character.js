/* =========================================================================
   Yüzyılın İzinde — oyuncu karakteri
   Prosedürel 2B iskelet, koşu/zıplama/takla/düşme animasyonları,
   saç ve atkı için verlet fiziği, dönemlere göre kıyafet.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, P = IZ.P;
  const TAU = U.TAU;

  const R = {
    headR: 10.2, neck: 4, torso: 31, thigh: 25.5, shin: 25, foot: 9.5,
    ua: 18, fa: 16.5,
  };
  const HIP_H = R.thigh + R.shin + 2.4;
  // koşuda kalçanın zeminden yüksekliği: adım ortası RUN_H0, havada RUN_H0 + RUN_B
  const RUN_H0 = 45, RUN_B = 9;
  // yürüyüş → hızlı yürüyüş hız aralığı ve koşuya geçiş eşikleri (gecikmeli: ileri-geri titremesin)
  const WALK_V0 = 165, WALK_V1 = 245, RUN_ON = 250, RUN_OFF = 236;
  // ayak bileğinin tabandan yüksekliği ve yürürken basan bacağın en uzun hali
  const ANK = 3.2, LREACH = 50.35;

  // İki kemikli ters kinematik: kalça (hx,hy) ve bilek hedefi (ax,ay) → [uyluk açısı, diz bükümü]
  // (açılar dikeyden, öne doğru pozitif; diz hep öne bakar)
  function legIK(hx, hy, ax, ay) {
    const dx = ax - hx, dy = ay - hy;
    const d = Math.hypot(dx, dy) || 1e-6;
    const dd = U.clamp(d, 14, R.thigh + R.shin - 0.02);
    const al = Math.atan2(dx, dy);
    const cb = U.clamp((R.thigh * R.thigh + dd * dd - R.shin * R.shin) / (2 * R.thigh * dd), -1, 1);
    const ta = al + Math.acos(cb);
    const kx = hx + Math.sin(ta) * R.thigh, ky = hy + Math.cos(ta) * R.thigh;
    const ex = hx + (dx / d) * dd, ey = hy + (dy / d) * dd;
    return [ta, ta - Math.atan2(ex - kx, ey - ky)];
  }

  // Yürürken bir ayağın yolu (kalçaya göre). phi: 0 = topuk yere değer, beta: yerde kalma payı.
  // Yerde: topuk → tam taban → parmak ucunda yükselme. Taban yere tam basılıyken ayak kalçaya göre
  // zemin hızıyla geriye gider (kaymaz); topuk ve parmak ucu anlarında yavaşlar. Havada: alçak,
  // yumuşak bir yay. Dönüş: {x, y (bilek, yukarı negatif), fa (ayak açısı: + parmak aşağı), w}
  const SA = 0.2, SB = 0.62, SQ1 = 0.5 * (1 + SB - SA);
  function stanceQ(u) {
    if (u <= SA) { const s = u / SA; return SA * (s * s * s - 0.5 * s * s * s * s); }
    if (u <= SB) return SA / 2 + (u - SA);
    const c = 1 - SB, s = (u - SB) / c;
    return SA / 2 + (SB - SA) + c * (s - (s * s * s - 0.5 * s * s * s * s));
  }
  const TOE_A = 0.78;
  function walkFoot(phi, W, out) {
    const S = W.S, xc = W.xc, beta = W.beta, ball = R.foot * 0.85;
    if (phi < beta) {
      const u = phi / beta;
      const xf = xc + 0.5 * S - (S * stanceQ(u)) / SQ1;
      let fa = u < SA ? -0.24 * (1 - U.smoothstep(0, SA, u)) : 0;
      let x = xf, y = -ANK;
      const hr = U.smoothstep(SB + 0.02, 1, u);
      if (hr > 0) {
        fa = TOE_A * hr;
        x = xf + ball - Math.cos(fa) * ball;
        y = -ANK - Math.sin(fa) * ball;
      }
      out.x = x; out.y = y; out.fa = fa; out.w = 1 - U.smoothstep(0.7, 1, u);
      return out;
    }
    const u = (phi - beta) / (1 - beta);
    const x0 = xc - 0.5 * S + ball - Math.cos(TOE_A) * ball, x1 = xc + 0.5 * S;
    const e = 0.5 - 0.5 * Math.cos(Math.PI * Math.pow(u, 0.88));
    const l0 = Math.sin(TOE_A) * ball;
    const lift = l0 * (1 - u) * (1 - u) + W.lift * Math.sin(Math.PI * u) * Math.pow(1 - u, 0.6);
    out.x = x0 + (x1 - x0) * e;
    out.y = -ANK - lift;
    out.fa = TOE_A * (1 - u) * (1 - u) + 0.3 * u * (1 - u) - 0.24 * u * u;
    out.w = U.smoothstep(0.72, 1, u);
    return out;
  }
  const FN = {}, FF = {};

  // Dönemlere göre kıyafet
  function outfitFor(g, year) {
    if (g === 'm') {
      if (year < 1925.9) return { hat: 'kalpak', coat: 'long' };
      if (year < 1950) return { hat: 'fedora', coat: 'long' };
      if (year < 1975) return { hat: 'kasket', coat: 'short' };
      if (year < 2000) return { hat: 'none', coat: 'short', hair: 'seventies' };
      return { hat: 'none', hood: true, pack: true };
    }
    if (year < 1935) return { hat: 'cloche', skirt: 'long' };
    if (year < 1955) return { hat: 'bun', skirt: 'knee', coat: 'short' };
    if (year < 1975) return { hair: 'long', skirt: 'mini' };
    if (year < 2000) return { hat: 'curly', coat: 'short' };
    return { hair: 'pony', pack: true };
  }
  IZ.outfitFor = outfitFor;

  function Chain(n, len) {
    this.n = n; this.len = len;
    this.p = []; this.q = [];
    for (let i = 0; i < n; i++) { this.p.push([-i * len, 0]); this.q.push([-i * len, 0]); }
  }
  Chain.prototype.reset = function (ax, ay) {
    for (let i = 0; i < this.n; i++) { this.p[i][0] = ax - i * this.len; this.p[i][1] = ay + i * 0.5; this.q[i][0] = this.p[i][0]; this.q[i][1] = this.p[i][1]; }
  };
  Chain.prototype.step = function (ax, ay, dt, fx, fy, damp, t, flutter) {
    const p = this.p, q = this.q;
    p[0][0] = ax; p[0][1] = ay; q[0][0] = ax; q[0][1] = ay;
    const dt2 = dt * dt;
    for (let i = 1; i < this.n; i++) {
      const vx = (p[i][0] - q[i][0]) * damp, vy = (p[i][1] - q[i][1]) * damp;
      q[i][0] = p[i][0]; q[i][1] = p[i][1];
      const fl = flutter ? Math.sin(t * 17 + i * 0.9) * flutter * (i / this.n) : 0;
      p[i][0] += vx + fx * dt2;
      p[i][1] += vy + (fy + fl) * dt2;
    }
    for (let k = 0; k < 4; k++) {
      for (let i = 1; i < this.n; i++) {
        const a = p[i - 1], b = p[i];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - this.len) / d;
        if (i === 1) { b[0] -= dx * diff; b[1] -= dy * diff; }
        else { a[0] += dx * diff * 0.5; a[1] += dy * diff * 0.5; b[0] -= dx * diff * 0.5; b[1] -= dy * diff * 0.5; }
      }
      p[0][0] = ax; p[0][1] = ay;
    }
  };

  function Character(g) {
    this.g = g || 'm';
    this.phase = 0;
    this.pose = null;
    this.walk = 0;
    this.blend = { air: 0, fall: 0, hurt: 0, idle: 1 };
    this.flipT = -1;
    this.squash = 0;
    this.deadT = -1;
    this.blinkT = 2.5;
    this.blinking = 0;
    this.scarf = new Chain(10, 5.2);
    this.hair = new Chain(7, 5.2);
    this.coatTail = 0;
    this.prevVy = 0;
    this.t = 0;
    this.year = 1920;
    this.outfit = outfitFor(this.g, 1920);
    this.inited = false;
  }
  IZ.Character = Character;

  Character.prototype.setGender = function (g) { this.g = g; this.outfit = outfitFor(g, this.year); this.inited = false; };
  Character.prototype.setYear = function (y) {
    this.year = y;
    const o = outfitFor(this.g, y);
    if (JSON.stringify(o) !== JSON.stringify(this.outfit)) { this.outfit = o; return true; }
    return false;
  };

  /* s: {speed, ground, vy, idle, hurt, dead, dt} */
  Character.prototype.update = function (dt, s) {
    this.t += dt;
    const speed = s.speed || 0;
    // Üç aşama: yürüyüş → hızlı yürüyüş → koşu (sonrasında hep koşu).
    // brisk: yürüyüşün temposu; runK: koşuya geçiş (hıza göre değil, kısa ve temiz bir geçişle);
    // mourn: yas anı (baş önde, ağır adım)
    this.brisk = U.smoothstep(WALK_V0, WALK_V1, speed);
    const runTarget = speed >= RUN_ON ? 1 : speed <= RUN_OFF ? 0 : (this.runK > 0.5 ? 1 : 0);
    this.runK = this.runK === undefined ? runTarget : U.damp(this.runK, runTarget, 7, dt);
    if (Math.abs(this.runK - runTarget) < 0.004) this.runK = runTarget;
    this.walk = 1 - this.runK;
    this.mourn = U.clamp(s.mourn || 0, 0, 1);
    // Yürüyüş: ayak yere basınca zeminle birlikte geriye gider (kaymaz). Adım temposu bu koşuldan
    // çıkar: yürüyüş ≈2,0 → hızlı yürüyüş ≈2,7 adım/sn; yasta ağır (≤1,75).
    const b = this.brisk, mo = this.mourn;
    const beta = U.lerp(U.lerp(0.6, 0.56, b), 0.62, mo);
    const sMax = U.lerp(U.lerp(54, 62, b), 52, mo);
    // tempo hızla birlikte artar (kayma olmasın); yürüyüşte en çok 2,25, hızlı yürüyüşte 2,9 adım/sn
    const stMin = U.lerp(1.9, 1.5, mo), stMax = U.lerp(U.lerp(2.25, 2.9, U.smoothstep(150, 200, speed)), 1.9, mo);
    const walkSteps = U.clamp((2 * speed * beta * SQ1) / sMax, stMin, stMax);
    const wk = this.wk || (this.wk = {});
    wk.beta = beta;
    wk.S = Math.min(sMax, (2 * speed * beta * SQ1) / walkSteps);
    wk.slip = 1 - wk.S / Math.max(1e-6, (2 * speed * beta * SQ1) / walkSteps);
    wk.xc = U.lerp(U.lerp(-4, -5, b), -3, mo);
    wk.lift = U.lerp(U.lerp(6.5, 7.5, b), 4.2, mo);
    wk.hcap = U.lerp(U.lerp(52.7, 52.3, b), 52.3, mo);
    const runSteps = 2.8 + 0.9 * U.clamp((speed - 345) / 375, 0, 1);
    const steps = U.lerp(walkSteps, runSteps, this.runK);
    this.steps = steps;
    // koşuda adım boyu: yerdeki ayak zeminle aynı hızda geriye gitsin
    this.strideR = U.clamp(speed / (50.5 * Math.PI * runSteps), 0.3, 0.95);
    this.stride = U.lerp(wk.S / 100, this.strideR, this.runK);
    if (s.ground && !s.idle) this.phase += dt * Math.PI * steps;
    if (s.idle) this.phase += dt * 0.6;
    const air = s.ground ? 0 : 1;
    this.blend.air = U.damp(this.blend.air, air, air ? 18 : 22, dt);
    this.blend.fall = U.damp(this.blend.fall, s.vy > 120 ? 1 : 0, 8, dt);
    this.blend.hurt = U.damp(this.blend.hurt, s.hurt ? 1 : 0, 14, dt);
    this.blend.idle = U.damp(this.blend.idle, s.idle ? 1 : 0, 6, dt);
    if (this.flipT >= 0) { this.flipT += dt / 0.46; if (this.flipT >= 1) this.flipT = -1; }
    if (this.squash > 0) this.squash = Math.max(0, this.squash - dt * 6);
    if (s.dead) { if (this.deadT < 0) this.deadT = 0; this.deadT += dt; } else this.deadT = -1;
    // göz kırpma
    this.blinkT -= dt;
    if (this.blinkT < 0) { this.blinking = 0.13; this.blinkT = U.lerp(2.2, 5.5, Math.random()); }
    if (this.blinking > 0) this.blinking -= dt;

    this.pose = this.computePose(speed);
    // fizik: yerel uzayda rüzgâr = koşu hızı
    const accY = (s.vy - this.prevVy) / Math.max(dt, 1e-3);
    this.prevVy = s.vy;
    const gust = s.idle ? 1 + 0.45 * Math.sin(this.t * 0.9) + 0.25 * Math.sin(this.t * 2.3) : 1;
    const wind = (s.idle ? -1050 * gust : -(speed * 3.2 + 260)) * (s.dead ? 0.2 : 1);
    const fy = 900 - U.clamp(accY, -9000, 9000) * 0.55;
    const nk = this.anchors();
    if (!this.inited) { this.scarf.reset(nk.scarf[0], nk.scarf[1]); this.hair.reset(nk.hair[0], nk.hair[1]); this.inited = true; }
    const sub = dt > 1 / 50 ? 2 : 1;
    for (let i = 0; i < sub; i++) {
      this.scarf.step(nk.scarf[0], nk.scarf[1], dt / sub, wind, fy, 0.96, this.t, speed > 50 ? 5200 : 2600);
      this.hair.step(nk.hair[0], nk.hair[1], dt / sub, wind * 0.75, fy * 1.25, 0.94, this.t, speed > 50 ? 2200 : 900);
    }
    this.coatTail = U.damp(this.coatTail, U.clamp(speed / 600, 0, 1) + (s.ground ? 0 : 0.4), 5, dt);
  };

  Character.prototype.jumpFlip = function () { this.flipT = 0; };
  Character.prototype.land = function (v) { this.squash = U.clamp(v / 1400, 0.25, 1); };

  function mixPose(a, b, t) {
    const o = {};
    for (const k in a) o[k] = a[k] + ((b[k] === undefined ? a[k] : b[k]) - a[k]) * t;
    return o;
  }

  Character.prototype.computePose = function (speed) {
    const th = this.phase, PI = Math.PI;
    const A = this.strideR || this.stride || 0.5;
    const sf = U.clamp((speed - 345) / 375, 0, 1);
    // KOŞU: gövde belirgin biçimde öne eğik, öndeki diz yukarıda, arkadaki topuk kalçaya doğru,
    // kollar dirsekten bükük ve güçlü sallanır; gövde iki adım arasında havalanır (skeleton)
    const legR = (q) => 0.14 + A * Math.sin(q);
    const kneeR = (q) => 0.22 + 1.85 * Math.pow(Math.max(0, Math.cos(q)), 1.15) + 0.42 * Math.pow(Math.max(0, -Math.cos(q)), 2);
    const runP = {
      tl: 0.32 + 0.07 * sf + 0.03 * Math.sin(th * 2), hd: -0.26,
      tn: legR(th), kn: kneeR(th), tf: legR(th + PI), kf: kneeR(th + PI),
      an: 0.2 - 0.88 * Math.sin(th), en: 1.62 + 0.22 * Math.sin(th),
      af: 0.2 - 0.88 * Math.sin(th + PI), ef: 1.62 + 0.22 * Math.sin(th + PI),
      bob: 0, rot: 0, hw: 0, fw: 0,
    };
    // YÜRÜYÜŞ (ters kinematik): dik gövde, bir ayak hep yerde ve zeminle birlikte geriye gider;
    // topukla basar, parmak ucuyla ayrılır. Kalça, basan bacağın boyu kadar yükselir (yürüyüşün
    // doğal inip kalkması). Hızlı yürüyüşte tempo artar, adımlar uzar, kollar dirsekten bükülüp
    // güçlü sallanır; gövde yalnızca hafifçe öne eğilir (koşuya benzemez).
    const b = this.brisk || 0;
    const W = this.wk || { S: 0, xc: -2.5, beta: 0.6, lift: 6.5, hcap: 53.2 };
    let cyc = (th - PI / 2) / TAU;
    cyc -= Math.floor(cyc);
    const fN = walkFoot(cyc, W, FN), fF = walkFoot((cyc + 0.5) % 1, W, FF);
    let hh = W.hcap;
    for (const f of [fN, fF]) {
      if (f.w <= 0) continue;
      const lim = -f.y + Math.sqrt(Math.max(0, LREACH * LREACH - f.x * f.x));
      if (lim < W.hcap) hh = Math.min(hh, U.lerp(W.hcap, lim, f.w));
    }
    const ikN = legIK(0, -hh, fN.x, fN.y), ikF = legIK(0, -hh, fF.x, fF.y);
    const armSw = U.lerp(0.36, 0.6, b), elbow = U.lerp(0.3, 1.2, b), sw = Math.cos(cyc * TAU);
    const walkP = {
      tl: U.lerp(0.03, 0.07, b), hd: U.lerp(-0.03, -0.06, b),
      tn: ikN[0], kn: ikN[1], tf: ikF[0], kf: ikF[1],
      an: U.lerp(0.04, 0.1, b) - armSw * sw, en: elbow + 0.18 * Math.max(0, -sw),
      af: U.lerp(0.04, 0.1, b) + armSw * sw, ef: elbow + 0.18 * Math.max(0, sw),
      bob: 0, rot: 0, hw: 1, hh: hh, fw: 1, fn: fN.fa, ff: fF.fa,
    };
    const rk = this.runK === undefined ? 1 - this.walk : this.runK;
    let run = rk >= 0.999 ? runP : rk <= 0.001 ? walkP : mixPose(walkP, runP, rk);
    // YAS: baş önüne eğik, omuzlar düşük, kollar gevşek
    if (this.mourn > 0.01) {
      const mw = Object.assign({}, run, {
        tl: 0.14 + 0.01 * Math.sin(th * 2), hd: 0.66,
        an: 0.08 - 0.16 * Math.sin(th), en: 0.14, af: 0.08 - 0.16 * Math.sin(th + PI), ef: 0.14,
      });
      run = mixPose(run, mw, this.mourn);
    }
    const idle = {
      tl: 0.02 + 0.012 * Math.sin(this.t * 2.1), hd: -0.04 + 0.03 * Math.sin(this.t * 0.7),
      tn: 0.06, kn: 0.06, tf: -0.06, kf: 0.08,
      an: 0.1 + 0.03 * Math.sin(this.t * 2.1), en: 0.2, af: -0.05, ef: 0.22, bob: 0.6 * Math.sin(this.t * 2.1), rot: 0, hw: 0, fw: 0,
    };
    run = mixPose(run, idle, this.blend.idle);
    const rise = { tl: 0.12, hd: -0.2, tn: 1.3, kn: 1.9, tf: -0.38, kf: 0.95, an: -0.75, en: 1.25, af: 1.55, ef: 0.55, bob: 0, rot: 0, hw: 0, fw: 0 };
    const fall = { tl: 0.04, hd: -0.05, tn: 0.55, kn: 0.55, tf: 0.12, kf: 0.45, an: 1.3, en: 0.45, af: -0.45, ef: 0.5, bob: 0, rot: 0, hw: 0, fw: 0 };
    const airP = mixPose(rise, fall, this.blend.fall);
    let p = mixPose(run, airP, this.blend.air);
    if (this.flipT >= 0) {
      const tuck = { tl: 0.55, hd: 0.35, tn: 1.95, kn: 2.45, tf: 1.75, kf: 2.35, an: 1.05, en: 1.6, af: 0.95, ef: 1.6, bob: 0, rot: 0, hw: 0, fw: 0 };
      const k = Math.sin(Math.min(1, this.flipT) * Math.PI);
      p = mixPose(p, tuck, k);
      p.rot = U.easeInOut(Math.min(1, this.flipT)) * TAU;
    }
    if (this.blend.hurt > 0.01) {
      const hurt = { tl: -0.35, hd: 0.25, tn: 0.7, kn: 0.5, tf: -0.25, kf: 0.6, an: 2.4, en: 0.4, af: -1.1, ef: 0.3, bob: 0, rot: -0.15, hw: 0, fw: 0 };
      p = mixPose(p, hurt, this.blend.hurt * 0.85);
    }
    if (this.deadT >= 0) {
      const k = U.easeOutCubic(Math.min(1, this.deadT / 0.6));
      const lie = { tl: 0.1, hd: 0.2, tn: 0.25, kn: 0.6, tf: -0.1, kf: 0.4, an: 0.9, en: 0.3, af: 1.4, ef: 0.2, bob: 0, rot: 0, hw: 0, fw: 0 };
      p = mixPose(p, lie, k);
      p.rot = (p.rot || 0) + k * 1.45;
    }
    return p;
  };

  // İskelet noktalarını hesapla (yerel: ayak tabanı = 0, yukarı negatif)
  Character.prototype.skeleton = function () {
    const p = this.pose || this.computePose(0);
    const hip = [0, -HIP_H + (p.bob || 0)];
    const L = (a) => [Math.sin(a), Math.cos(a)];
    const legs = [];
    for (let i = 0; i < 2; i++) {
      const ta = i ? p.tn : p.tf, ka = i ? p.kn : p.kf;
      const d1 = L(ta), kx = hip[0] + d1[0] * R.thigh, ky = hip[1] + d1[1] * R.thigh;
      const d2 = L(ta - ka), ax = kx + d2[0] * R.shin, ay = ky + d2[1] * R.shin;
      legs.push({ k: [kx, ky], a: [ax, ay], sa: ta - ka, fa: i ? p.fn : p.ff, fw: p.fw || 0 });
    }
    // zemine oturtma (yalnızca yerdeyken)
    const groundW = (1 - this.blend.air) * (this.flipT >= 0 ? 0 : 1) * (this.deadT >= 0 ? 0 : 1);
    if (groundW > 0) {
      const lowest = Math.max(legs[0].a[1], legs[1].a[1]);
      let off = -ANK - lowest;
      // yürüyüşte kalça yüksekliği ters kinematikten gelir (basan ayak zaten yerde)
      if (p.hw > 0 && p.hh !== undefined) off = U.lerp(off, -p.hh - hip[1], Math.min(1, p.hw));
      // Koşu yay gibidir: adımın ortasında (diz bükükken) gövde en alçakta, iki adım arasında
      // en yüksekte ve iki ayak da yerden kesik. Yürüyüşte ise bir ayak hep yerdedir.
      const rk = (this.runK || 0) * (1 - (this.mourn || 0));
      if (rk > 0.001) {
        const hipPinned = hip[1] + off;
        const hipRun = -(RUN_H0 + RUN_B * Math.pow(Math.abs(Math.sin(this.phase)), 1.6));
        if (hipRun < hipPinned) off += (hipRun - hipPinned) * rk;
      }
      off *= groundW;
      hip[1] += off; legs.forEach((l) => { l.k[1] += off; l.a[1] += off; });
    }
    const tl = p.tl;
    const sh = [hip[0] + Math.sin(tl) * R.torso, hip[1] - Math.cos(tl) * R.torso];
    const ha = tl + p.hd;
    const head = [sh[0] + Math.sin(ha) * (R.neck + R.headR * 0.9), sh[1] - Math.cos(ha) * (R.neck + R.headR * 0.9)];
    const arms = [];
    for (let i = 0; i < 2; i++) {
      const sa = (i ? p.an : p.af) + tl, ea = i ? p.en : p.ef;
      const s0 = [sh[0] + (i ? 1 : -1) * 0.8, sh[1] + 2.2];
      const d1 = L(sa), e = [s0[0] + d1[0] * R.ua, s0[1] + d1[1] * R.ua];
      const d2 = L(sa + ea), w = [e[0] + d2[0] * R.fa, e[1] + d2[1] * R.fa];
      arms.push({ s: s0, e: e, w: w });
    }
    return { hip: hip, sh: sh, head: head, ha: ha, legs: legs, arms: arms, tl: tl, rot: p.rot || 0 };
  };

  Character.prototype.anchors = function () {
    const sk = this.skeleton();
    const nx = sk.sh[0] - Math.sin(sk.tl) * -2 - 3, ny = sk.sh[1] - 1;
    const hx = sk.head[0] - Math.cos(sk.ha) * R.headR * 0.8, hy = sk.head[1] - R.headR * (this.outfit.hair === 'pony' ? 0.75 : 0.25);
    const rot = sk.rot;
    if (rot) {
      const c = [sk.hip[0], sk.hip[1] - 12];
      const rp = (x, y) => { const dx = x - c[0], dy = y - c[1]; return [c[0] + dx * Math.cos(rot) - dy * Math.sin(rot), c[1] + dx * Math.sin(rot) + dy * Math.cos(rot)]; };
      return { scarf: rp(nx, ny), hair: rp(hx, hy) };
    }
    return { scarf: [nx, ny], hair: [hx, hy] };
  };

  // ----------------------------------------------------------- çizim
  function ribbon(ctx, pts, w0, w1) {
    const n = pts.length;
    const left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = U.lerp(w0, w1, i / (n - 1)) / 2;
      left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n; i++) { const m = [(left[i - 1][0] + left[i][0]) / 2, (left[i - 1][1] + left[i][1]) / 2]; ctx.quadraticCurveTo(left[i - 1][0], left[i - 1][1], m[0], m[1]); }
    ctx.lineTo(left[n - 1][0], left[n - 1][1]);
    ctx.lineTo(right[n - 1][0], right[n - 1][1]);
    for (let i = n - 2; i >= 0; i--) { const m = [(right[i + 1][0] + right[i][0]) / 2, (right[i + 1][1] + right[i][1]) / 2]; ctx.quadraticCurveTo(right[i + 1][0], right[i + 1][1], m[0], m[1]); }
    ctx.lineTo(right[0][0], right[0][1]);
    ctx.closePath();
    ctx.fill();
  }

  /* x,y: dünya koordinatında ayak tabanı. o: {sil, rim, rimOff, scarf, scarfDark, eye, alpha, scale, dir} */
  Character.prototype.draw = function (ctx, x, y, o) {
    o = o || {};
    const sk = this.skeleton();
    const sc = o.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    if (o.dir === -1) ctx.scale(-1, 1);
    ctx.scale(sc, sc);
    if (this.squash > 0) { const k = this.squash * 0.16; ctx.scale(1 + k * 0.5, 1 - k); }
    if (sk.rot) { const cx = sk.hip[0], cy = sk.hip[1] - 12; ctx.translate(cx, cy); ctx.rotate(sk.rot); ctx.translate(-cx, -cy); }
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;

    // atkı (gövdenin arkasında)
    const scarfPts = this.scarf.p.map((p) => [p[0], p[1]]);
    const hairPts = this.hair.p.map((p) => [p[0], p[1]]);
    if (sk.rot) {
      // fizik noktaları dönmüş uzaydadır; çizim dönmüş tuvalde olduğundan geri döndür
      const c = [sk.hip[0], sk.hip[1] - 12], r = -sk.rot;
      const inv = (p) => { const dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
      for (let i = 0; i < scarfPts.length; i++) scarfPts[i] = inv(scarfPts[i]);
      for (let i = 0; i < hairPts.length; i++) hairPts[i] = inv(hairPts[i]);
    }
    if (o.scarf !== false) {
      ctx.fillStyle = o.scarfDark || '#6e0d12';
      ribbon(ctx, scarfPts.map((p, i) => [p[0], p[1] + 1.4]), 6.2, 3.4);
      ctx.fillStyle = o.scarf || '#c8161e';
      ribbon(ctx, scarfPts, 5.8, 3.0);
    }

    const pass = (fill, off, far) => {
      ctx.save();
      ctx.translate(off[0], off[1]);
      this.drawBody(ctx, sk, fill, far, hairPts);
      ctx.restore();
    };
    if (o.rim) pass(o.rim, o.rimOff || [1.4, -0.9], o.rim);
    pass(o.sil || '#0b0a09', [0, 0], o.far || o.sil || '#0b0a09');

    // atkının boyun düğümü (önde)
    if (o.scarf !== false) {
      ctx.fillStyle = o.scarf || '#c8161e';
      ctx.beginPath();
      P.capsule(ctx, sk.sh[0] - 6, sk.sh[1] - 2.5, 3.6, sk.sh[0] + 5.5, sk.sh[1] - 3.6, 3.4);
      ctx.fill();
      ctx.fillStyle = o.scarfDark || '#6e0d12';
      ctx.beginPath(); P.capsule(ctx, sk.sh[0] - 5, sk.sh[1] - 0.6, 1.2, sk.sh[0] + 4.5, sk.sh[1] - 1.6, 1.2); ctx.fill();
    }
    // göz
    if (o.eye !== false && this.deadT < 0.4) {
      const ex = sk.head[0] + Math.cos(sk.ha) * R.headR * 0.48 + Math.sin(sk.ha) * 1.0;
      const ey = sk.head[1] + Math.sin(sk.ha) * R.headR * 0.48 - 1.2;
      const open = this.blinking > 0 ? 0.15 : 1;
      P.glowRaw(ctx, ex, ey, 7, 'rgba(255,248,230,', 0.35 * open);
      ctx.fillStyle = o.eye || '#fffaf0';
      ctx.beginPath(); ctx.ellipse(ex, ey, 1.9, 1.9 * open + 0.2, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  Character.prototype.drawBody = function (ctx, sk, fill, farFill, hairPts) {
    const of = this.outfit;
    const female = this.g === 'f';
    // arka kol + arka bacak
    ctx.fillStyle = farFill;
    const lw = female ? 5.0 : 5.6;
    let L = sk.legs[0];
    ctx.beginPath();
    P.capsule(ctx, sk.hip[0], sk.hip[1], lw * 1.12, L.k[0], L.k[1], lw * 0.86);
    P.capsule(ctx, L.k[0], L.k[1], lw * 0.86, L.a[0], L.a[1], lw * 0.6);
    this.foot(ctx, L);
    ctx.fill();
    let A = sk.arms[0];
    const aw = female ? 3.5 : 3.9;
    ctx.beginPath();
    P.capsule(ctx, A.s[0], A.s[1], aw, A.e[0], A.e[1], aw * 0.82);
    P.capsule(ctx, A.e[0], A.e[1], aw * 0.82, A.w[0], A.w[1], aw * 0.6);
    ctx.moveTo(A.w[0] + aw * 0.85, A.w[1]); ctx.arc(A.w[0], A.w[1], aw * 0.85, 0, TAU);
    ctx.fill();

    ctx.fillStyle = fill;
    // uzun saç / at kuyruğu (gövde arkasında)
    if (of.hair === 'long' || of.hair === 'pony') {
      ribbon(ctx, hairPts, of.hair === 'long' ? 11 : 7, of.hair === 'long' ? 5 : 2.4);
    }
    // sırt çantası
    if (of.pack) {
      ctx.save(); ctx.translate(sk.hip[0] + Math.sin(sk.tl) * 18, sk.hip[1] - Math.cos(sk.tl) * 18); ctx.rotate(sk.tl);
      ctx.beginPath(); P.rrect(ctx, -15, -11, 10, 22, 4); ctx.fill(); ctx.restore();
    }
    // gövde
    const tl = sk.tl, hip = sk.hip, sh = sk.sh;
    const px = Math.cos(tl), py = Math.sin(tl);
    const shW = female ? 6.8 : 8.2, waist = female ? 5.0 : 6.0, hipW = female ? 7.2 : 6.4;
    ctx.beginPath();
    ctx.moveTo(hip[0] - px * hipW, hip[1] - py * hipW);
    ctx.quadraticCurveTo((hip[0] + sh[0]) / 2 - px * waist * 1.08, (hip[1] + sh[1]) / 2 - py * waist, sh[0] - px * shW, sh[1] - py * shW + 1.8);
    ctx.quadraticCurveTo(sh[0], sh[1] - 2.8, sh[0] + px * shW, sh[1] + py * shW + 1.8);
    ctx.quadraticCurveTo((hip[0] + sh[0]) / 2 + px * waist * (female ? 1.32 : 1.15), (hip[1] + sh[1]) / 2 + py * waist, hip[0] + px * hipW, hip[1] + py * hipW);
    ctx.quadraticCurveTo(hip[0], hip[1] + 5, hip[0] - px * hipW, hip[1] - py * hipW);
    ctx.closePath();
    ctx.fill();
    // kapüşon
    if (of.hood) { ctx.beginPath(); ctx.ellipse(sh[0] - px * 6.5, sh[1] - 1, 6, 4.4, tl, 0, TAU); ctx.fill(); }
    // palto / ceket eteği
    if (of.coat) {
      const long = of.coat === 'long';
      const kneeF = sk.legs[1].k, kneeB = sk.legs[0].k;
      const len = long ? U.lerp(0.95, 0.72, this.runK || 0) : 0.35;
      const hemFx = U.lerp(hip[0] + 5, Math.max(kneeF[0], kneeB[0]) + 4, len);
      const hemY = U.lerp(hip[1] + 4, Math.max(kneeF[1], kneeB[1]) + 3, len);
      const tail = this.coatTail;
      const hemBx = hip[0] - 8 - tail * (long ? 14 : 6) + Math.sin(this.t * 14) * tail * 2;
      const hemBy = hemY - tail * (long ? 8 : 3);
      ctx.beginPath();
      ctx.moveTo(sh[0] - px * shW * 0.9, sh[1] + 4);
      ctx.lineTo(sh[0] + px * shW * 0.9, sh[1] + 4);
      ctx.quadraticCurveTo(hip[0] + 8, hip[1] - 6, hemFx, hemY);
      ctx.quadraticCurveTo((hemFx + hemBx) / 2, hemY + 2, hemBx, hemBy);
      ctx.quadraticCurveTo(hip[0] - 9, hip[1] - 4, sh[0] - px * shW * 0.9, sh[1] + 4);
      ctx.fill();
    }
    // etek
    if (of.skirt) {
      const kneeF = sk.legs[1].k, kneeB = sk.legs[0].k, ankF = sk.legs[1].a, ankB = sk.legs[0].a;
      const t = of.skirt === 'long' ? U.lerp(0.55, 0.28, this.runK || 0) : of.skirt === 'mini' ? -0.45 : U.lerp(0, -0.12, this.runK || 0);
      const pt = (k, a) => t >= 0 ? [U.lerp(k[0], a[0], t), U.lerp(k[1], a[1], t)] : [U.lerp(k[0], hip[0], -t), U.lerp(k[1], hip[1], -t)];
      const f = pt(kneeF, ankF), b = pt(kneeB, ankB);
      const fx = Math.max(f[0], b[0]) + 3.5, bx = Math.min(f[0], b[0]) - 4 - this.coatTail * 3;
      const hy = Math.max(f[1], b[1]) + 1.5;
      ctx.beginPath();
      ctx.moveTo(hip[0] - 5.5, hip[1] - 4);
      ctx.lineTo(hip[0] + 5.5, hip[1] - 4);
      ctx.quadraticCurveTo(fx - 1, (hip[1] + hy) / 2, fx, hy);
      ctx.quadraticCurveTo((fx + bx) / 2, hy + 2.2, bx, hy - 1);
      ctx.quadraticCurveTo(bx + 1, (hip[1] + hy) / 2, hip[0] - 5.5, hip[1] - 4);
      ctx.fill();
    }
    // ön bacak
    L = sk.legs[1];
    ctx.beginPath();
    P.capsule(ctx, sk.hip[0], sk.hip[1], lw * 1.15, L.k[0], L.k[1], lw * 0.88);
    P.capsule(ctx, L.k[0], L.k[1], lw * 0.88, L.a[0], L.a[1], lw * 0.62);
    this.foot(ctx, L);
    ctx.fill();
    // boyun ve baş
    const hd = sk.head, ha = sk.ha, r = R.headR;
    ctx.beginPath();
    P.capsule(ctx, sh[0], sh[1], 3.1, hd[0] - Math.sin(ha) * r * 0.55, hd[1] + Math.cos(ha) * r * 0.55, 2.8);
    ctx.moveTo(hd[0] + r, hd[1]);
    ctx.ellipse(hd[0], hd[1], r * 0.97, r, ha, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hd[0] + r * 0.82, hd[1] - r * 0.1);
    ctx.lineTo(hd[0] + r * 1.1, hd[1] + r * 0.16);
    ctx.lineTo(hd[0] + r * 0.8, hd[1] + r * 0.4);
    ctx.closePath(); ctx.fill();
    // saç / şapka
    let hat = of.hat || 'none';
    if (of.hair === 'long' || of.hair === 'pony') hat = 'bun-cap';
    if (hat === 'bun-cap') { ctx.beginPath(); ctx.ellipse(hd[0] - r * 0.1, hd[1] - r * 0.3, r * 1.04, r * 0.86, 0, Math.PI, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(hd[0] - r * 0.55, hd[1] - r * 0.05, r * 0.55, r * 0.7, 0.2, 0, TAU); ctx.fill(); }
    else if (of.hair === 'seventies') { ctx.beginPath(); ctx.ellipse(hd[0] - r * 0.15, hd[1] - r * 0.25, r * 1.12, r * 0.95, 0, Math.PI * 0.85, TAU + 0.15); ctx.fill(); ctx.beginPath(); ctx.ellipse(hd[0] - r * 0.6, hd[1] + r * 0.1, r * 0.55, r * 0.75, 0, 0, TAU); ctx.fill(); }
    else P.headwear(ctx, hd[0], hd[1], r, ha, 1, hat, 1, this.t);
    // ön kol
    A = sk.arms[1];
    ctx.beginPath();
    P.capsule(ctx, A.s[0], A.s[1], aw * 1.02, A.e[0], A.e[1], aw * 0.84);
    P.capsule(ctx, A.e[0], A.e[1], aw * 0.84, A.w[0], A.w[1], aw * 0.62);
    ctx.moveTo(A.w[0] + aw * 0.88, A.w[1]); ctx.arc(A.w[0], A.w[1], aw * 0.88, 0, TAU);
    ctx.fill();
  };

  Character.prototype.foot = function (ctx, L) {
    // ayak: incikle yaklaşık dik, yerdeyken yataya yakın
    const a = L.sa + Math.PI / 2;
    const flat = 1 - this.blend.air;
    let ang = U.lerp(a, 0.0, flat * 0.75) + (this.blend.air ? 0.25 * this.blend.air : 0);
    // yürüyüşte ayak açısı adımın evresinden gelir (topuk → taban → parmak ucu)
    if (L.fw > 0 && L.fa !== undefined) ang = U.lerp(ang, L.fa, Math.min(1, L.fw));
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const ax = L.a[0], ay = L.a[1];
    P.capsule(ctx, ax - dx * 2.2, ay - dy * 2.2 + 1.4, 3.3, ax + dx * R.foot, ay + dy * R.foot + 1.6, 2.6);
  };

  // Hitbox (yerel, ayak tabanına göre)
  Character.HIT = { w: 24, h: 84 };
})();
