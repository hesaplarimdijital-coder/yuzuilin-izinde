/* =========================================================================
   Yüzyılın İzinde — prosedürel ses
   Karplus–Strong ile tel çekme (ud/saz benzeri), makam dizileriyle
   üretken melodi, dem sesi, rüzgâr ambiyansı ve tüm ses efektleri.
   Hiçbir ses dosyası kullanılmaz.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U;
  const AU = (IZ.Audio = {});

  // Makamların yaklaşık perde aralıkları (sent cinsinden)
  const MAKAM = {
    hicaz: [0, 112, 386, 498, 702, 814, 996, 1200],
    nihavend: [0, 204, 294, 498, 702, 792, 996, 1200],
    rast: [0, 204, 384, 498, 702, 906, 1088, 1200],
    ussak: [0, 150, 294, 498, 702, 792, 996, 1200],
    kurdi: [0, 90, 294, 498, 702, 792, 996, 1200],
    huseyni: [0, 150, 294, 498, 702, 906, 996, 1200],
  };
  const ERA_MAKAM = ['hicaz', 'ussak', 'rast', 'kurdi', 'nihavend', 'huseyni', 'rast'];
  const ERA_TONIC = [293.66, 220.0, 196.0, 246.94, 220.0, 261.63, 293.66];
  const MOOD_MAKAM = { mourning: 'nihavend', winter: 'ussak', winternight: 'kurdi', night: 'ussak', festive: 'rast', nightfest: 'rast', fire: 'hicaz', quake: 'kurdi', storm: 'kurdi', eclipse: 'huseyni', heat: 'hicaz' };

  AU.enabled = U.store.get('sound', true);
  AU.ready = false;

  AU.init = function () {
    if (AU.ready) { AU.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { AU.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { try { AU.ctx = new AC(); } catch (e2) { return; } }
    const c = AU.ctx;
    AU.sr = c.sampleRate;
    AU.master = c.createGain(); AU.master.gain.value = AU.enabled ? 0.9 : 0;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    AU.master.connect(comp); comp.connect(c.destination);
    AU.music = c.createGain(); AU.music.gain.value = 0.55; AU.music.connect(AU.master);
    AU.sfx = c.createGain(); AU.sfx.gain.value = 0.85; AU.sfx.connect(AU.master);
    AU.amb = c.createGain(); AU.amb.gain.value = 0.6; AU.amb.connect(AU.master);
    // yankı
    AU.rev = c.createConvolver();
    AU.rev.buffer = impulse(2.8, 2.6);
    AU.revGain = c.createGain(); AU.revGain.gain.value = 0.42;
    AU.rev.connect(AU.revGain); AU.revGain.connect(AU.master);
    // gürültü tamponu
    AU.noise = c.createBuffer(1, AU.sr * 2, AU.sr);
    const nd = AU.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    AU.brown = c.createBuffer(1, AU.sr * 2, AU.sr);
    const bd = AU.brown.getChannelData(0); let last = 0;
    for (let i = 0; i < bd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = last * 3.5; }
    // rüzgâr
    const wn = c.createBufferSource(); wn.buffer = AU.noise; wn.loop = true;
    AU.windF = c.createBiquadFilter(); AU.windF.type = 'bandpass'; AU.windF.frequency.value = 500; AU.windF.Q.value = 0.7;
    AU.windG = c.createGain(); AU.windG.gain.value = 0.0;
    wn.connect(AU.windF); AU.windF.connect(AU.windG); AU.windG.connect(AU.amb);
    wn.start();
    // yağmur
    const rn = c.createBufferSource(); rn.buffer = AU.noise; rn.loop = true;
    const rf = c.createBiquadFilter(); rf.type = 'highpass'; rf.frequency.value = 1800;
    AU.rainG = c.createGain(); AU.rainG.gain.value = 0;
    rn.connect(rf); rf.connect(AU.rainG); AU.rainG.connect(AU.amb); rn.start();
    // dem (drone)
    AU.drone = [];
    for (let i = 0; i < 3; i++) {
      const o = c.createOscillator(); o.type = i === 2 ? 'sine' : 'triangle';
      const g = c.createGain(); g.gain.value = 0;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
      o.connect(f); f.connect(g); g.connect(AU.music); g.connect(AU.rev);
      o.start();
      AU.drone.push({ o: o, g: g });
    }
    AU.plucks = {};
    AU.seq = { next: 0, beat: 0, deg: 0, makam: 'hicaz', tonic: 293.66, tempo: 88, phrase: 0, intensity: 0.4, active: false, lastLight: 0, lightDeg: 0 };
    AU.ready = true;
    AU.resume();
  };

  AU.resume = function () { if (AU.ctx && AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {}); };
  AU.suspend = function () { if (AU.ctx && AU.ctx.state === 'running') AU.ctx.suspend().catch(() => {}); };
  AU.setEnabled = function (on) {
    AU.enabled = on; U.store.set('sound', on);
    if (AU.ready) AU.master.gain.setTargetAtTime(on ? 0.9 : 0, AU.ctx.currentTime, 0.05);
  };

  function impulse(sec, decay) {
    const c = AU.ctx, len = Math.floor(AU.sr * sec);
    const b = c.createBuffer(2, len, AU.sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  // Karplus–Strong tel sesi
  function pluckBuffer(freq) {
    const key = Math.round(freq * 10);
    if (AU.plucks[key]) return AU.plucks[key];
    const sr = AU.sr, len = Math.floor(sr * 2.2);
    const N = Math.max(2, Math.round(sr / freq));
    const b = AU.ctx.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    const ring = new Float32Array(N);
    let lp = 0;
    for (let i = 0; i < N; i++) { lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45; ring[i] = lp; }
    let idx = 0, prev = 0;
    const damp = freq > 400 ? 0.9955 : 0.9972;
    for (let i = 0; i < len; i++) {
      const cur = ring[idx];
      const nxt = 0.5 * (cur + prev) * damp;
      prev = cur;
      ring[idx] = nxt;
      d[i] = cur;
      idx = (idx + 1) % N;
    }
    // hafif atak yumuşatma
    for (let i = 0; i < 64; i++) d[i] *= i / 64;
    AU.plucks[key] = b;
    return b;
  }

  function pluck(freq, when, vol, pan, dest) {
    const c = AU.ctx;
    const s = c.createBufferSource(); s.buffer = pluckBuffer(freq);
    const g = c.createGain(); g.gain.value = vol;
    const body = c.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 260; body.Q.value = 1.2; body.gain.value = 5;
    const lpf = c.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 3200;
    s.connect(body); body.connect(lpf); lpf.connect(g);
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan || 0; g.connect(p); p.connect(dest || AU.music); p.connect(AU.rev); }
    else { g.connect(dest || AU.music); g.connect(AU.rev); }
    s.start(when);
    s.stop(when + 2.2);
  }

  function degFreq(deg) {
    const sc = MAKAM[AU.seq.makam];
    const oct = Math.floor(deg / 7), i = ((deg % 7) + 7) % 7;
    return AU.seq.tonic * Math.pow(2, oct + sc[i] / 1200);
  }

  // ------------------------------------------------------------- müzik
  AU.setMood = function (eraIdx, mood, intensity) {
    if (!AU.ready) return;
    const mk = MOOD_MAKAM[mood] || ERA_MAKAM[eraIdx] || 'hicaz';
    const tonic = ERA_TONIC[eraIdx] || 293.66;
    const s = AU.seq;
    s.makam = mk; s.tonic = tonic;
    s.tempo = mood === 'festive' || mood === 'nightfest' ? 104 : mood === 'mourning' || mood === 'storm' ? 66 : mood === 'eclipse' ? 72 : 86 + eraIdx * 2;
    s.mood = mood;
    s.festive = mood === 'festive' || mood === 'nightfest';
    s.somber = mood === 'mourning' || mood === 'winternight' || mood === 'storm';
    const t = AU.ctx.currentTime;
    const base = tonic / 2;
    const fifth = base * Math.pow(2, MAKAM[mk][4] / 1200);
    AU.drone[0].o.frequency.setTargetAtTime(base, t, 0.8);
    AU.drone[1].o.frequency.setTargetAtTime(fifth, t, 0.8);
    AU.drone[2].o.frequency.setTargetAtTime(base / 2, t, 0.8);
  };

  AU.start = function () {
    if (!AU.ready) return;
    const s = AU.seq;
    s.active = true;
    s.next = AU.ctx.currentTime + 0.3;
    const t = AU.ctx.currentTime;
    AU.drone.forEach((d, i) => d.g.gain.setTargetAtTime(i === 2 ? 0.05 : 0.028, t, 1.5));
  };
  AU.stop = function () {
    if (!AU.ready) return;
    AU.seq.active = false;
    const t = AU.ctx.currentTime;
    AU.drone.forEach((d) => d.g.gain.setTargetAtTime(0.0, t, 0.6));
  };

  AU.update = function (dt, st) {
    if (!AU.ready) return;
    const c = AU.ctx, t = c.currentTime;
    // rüzgâr ve yağmur
    const sp = st ? st.speed || 0 : 0;
    AU.windG.gain.setTargetAtTime(0.02 + U.clamp(sp / 900, 0, 1) * 0.05 + (st && st.wind ? st.wind : 0), t, 0.5);
    AU.windF.frequency.setTargetAtTime(380 + 260 * Math.sin(t * 0.23) + sp * 0.3, t, 0.6);
    AU.rainG.gain.setTargetAtTime(st ? (st.rain || 0) * 0.07 : 0, t, 0.8);
    // müzik zamanlayıcı
    const s = AU.seq;
    if (!s.active) return;
    const beat = 60 / s.tempo;
    while (s.next < t + 0.25) {
      const when = s.next;
      const pos = s.beat % 16;
      const phraseEnd = pos === 14 || pos === 15;
      const rest = s.somber ? 0.45 : 0.28;
      if (!phraseEnd && Math.random() > rest) {
        // melodik yürüyüş
        const r = Math.random();
        let step = r < 0.32 ? 1 : r < 0.64 ? -1 : r < 0.76 ? 2 : r < 0.88 ? -2 : 0;
        if (r > 0.95) step = (s.deg % 7 === 0) ? 4 : -((s.deg % 7));
        s.deg = U.clamp(s.deg + step, -3, 10);
        const vol = (0.13 + Math.random() * 0.07) * (0.7 + s.intensity * 0.5);
        pluck(degFreq(s.deg), when, vol, (Math.random() - 0.5) * 0.6);
        // süsleme (çarpma)
        if (Math.random() < 0.18 && !s.somber) pluck(degFreq(s.deg + 1), when + beat * 0.12, vol * 0.6, 0.2);
        // ikinci nota (yarım vuruş)
        if (Math.random() < 0.35 + s.intensity * 0.25) { s.deg = U.clamp(s.deg + (Math.random() < 0.5 ? 1 : -1), -3, 10); pluck(degFreq(s.deg), when + beat * 0.5, vol * 0.85, -0.2); }
      }
      if (pos === 15) {
        // cümle sonu: karar sesine in
        s.deg = Math.random() < 0.6 ? 0 : 4;
        pluck(degFreq(s.deg), when, 0.17, 0);
        pluck(degFreq(s.deg - 7), when + 0.01, 0.12, 0);
      }
      // bayram havasında bendir
      if (s.festive && pos % 2 === 0) drum(when, pos % 4 === 0 ? 0.22 : 0.12);
      s.beat++;
      s.next += beat;
    }
  };

  function drum(when, vol) {
    const c = AU.ctx;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, when); o.frequency.exponentialRampToValueAtTime(48, when + 0.18);
    const g = c.createGain(); g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.3);
    o.connect(g); g.connect(AU.music); o.start(when); o.stop(when + 0.32);
    noiseHit(when, 0.06, 2400, 1.2, vol * 0.25, AU.music);
  }

  // ------------------------------------------------------------- efekt yardımcıları
  function noiseHit(when, dur, freq, q, vol, dest, type, sweepTo) {
    const c = AU.ctx;
    const s = c.createBufferSource(); s.buffer = AU.noise;
    s.playbackRate.value = 1;
    const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, when); f.Q.value = q || 1;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, when + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + Math.min(0.012, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    s.connect(f); f.connect(g); g.connect(dest || AU.sfx);
    s.start(when, Math.random() * 1.5); s.stop(when + dur + 0.05);
    return g;
  }
  function tone(when, dur, f0, f1, vol, type, dest, rev) {
    const c = AU.ctx;
    const o = c.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, when); if (f1) o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(dest || AU.sfx); if (rev) g.connect(AU.rev);
    o.start(when); o.stop(when + dur + 0.05);
  }

  const now = () => AU.ctx.currentTime;
  function ok() { return AU.ready && AU.enabled; }

  AU.jump = function (n) {
    if (!ok()) return;
    const t = now();
    if (n === 2) { noiseHit(t, 0.2, 900, 1.4, 0.14, null, 'bandpass', 2800); pluck(degFreq(AU.seq.deg + 4), t, 0.1, 0.3, AU.sfx); }
    else { noiseHit(t, 0.16, 520, 1.2, 0.16, null, 'bandpass', 1700); tone(t, 0.09, 180, 260, 0.03, 'triangle'); }
  };
  AU.land = function (v) {
    if (!ok()) return;
    const t = now(), k = U.clamp(v / 1400, 0.2, 1);
    noiseHit(t, 0.12, 380, 0.8, 0.22 * k, null, 'lowpass');
    tone(t, 0.12, 95, 55, 0.18 * k, 'sine');
  };
  AU.light = function () {
    if (!ok()) return;
    const t = now(), s = AU.seq;
    if (t - s.lastLight > 1.4) s.lightDeg = 0;
    s.lastLight = t;
    const f = degFreq(7 + s.lightDeg);
    s.lightDeg = (s.lightDeg + 1) % 8;
    tone(t, 0.6, f, null, 0.07, 'sine', null, true);
    tone(t, 0.4, f * 2.01, null, 0.025, 'sine', null, true);
  };
  AU.hurt = function () {
    if (!ok()) return;
    const t = now();
    tone(t, 0.35, 110, 40, 0.5, 'sine');
    noiseHit(t, 0.22, 900, 0.8, 0.3, null, 'bandpass', 300);
    pluck(degFreq(1) / 2, t + 0.02, 0.18, 0, AU.sfx);
  };
  AU.breakObj = function () { if (!ok()) return; const t = now(); noiseHit(t, 0.18, 2200, 0.9, 0.16, null, 'bandpass', 600); };
  AU.fall = function () { if (!ok()) return; const t = now(); tone(t, 0.9, 680, 110, 0.1, 'sine', null, true); };
  AU.die = function () {
    if (!ok()) return;
    const t = now();
    tone(t, 2.4, 70, 34, 0.55, 'sine', null, true);
    noiseHit(t, 1.6, 200, 0.6, 0.3, null, 'lowpass', 60);
    pluck(degFreq(-7), t + 0.2, 0.2, 0); pluck(degFreq(-5), t + 0.5, 0.16, 0); pluck(degFreq(-8), t + 0.9, 0.18, 0);
  };
  AU.eventChime = function (cat) {
    if (!ok()) return;
    const t = now();
    const f = AU.seq.tonic * 2;
    tone(t, 2.6, f, null, 0.045, 'sine', AU.music, true);
    tone(t, 1.8, f * 2.76, null, 0.012, 'sine', AU.music, true);
    tone(t + 0.02, 2.4, f * 1.5, null, 0.02, 'sine', AU.music, true);
  };
  AU.quake = function () {
    if (!ok()) return;
    const c = AU.ctx, t = now();
    const s = c.createBufferSource(); s.buffer = AU.brown; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 140;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.4); g.gain.setValueAtTime(0.9, t + 2.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
    const lfo = c.createOscillator(); lfo.frequency.value = 7; const lg = c.createGain(); lg.gain.value = 0.35; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(AU.sfx);
    s.start(t); s.stop(t + 4.1); lfo.start(t); lfo.stop(t + 4.1);
    for (let i = 0; i < 9; i++) noiseHit(t + 0.3 + Math.random() * 3, 0.12, 1500 + Math.random() * 2000, 1, 0.05, null);
  };
  AU.siren = function () {
    if (!ok()) return;
    const c = AU.ctx, t = now() + 0.2;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(330, t); o.frequency.linearRampToValueAtTime(440, t + 1.6); o.frequency.setValueAtTime(440, t + 4.4); o.frequency.linearRampToValueAtTime(320, t + 6);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 1.2); g.gain.setValueAtTime(0.05, t + 4.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 6.2);
    o.connect(g); g.connect(AU.sfx); g.connect(AU.rev);
    o.start(t); o.stop(t + 6.3);
  };
  AU.fireworks = function (n) {
    if (!ok()) return;
    const t = now();
    for (let i = 0; i < (n || 4); i++) {
      const w = t + 0.2 + i * U.lerp(0.7, 1.4, Math.random());
      tone(w, 0.55, 700 + Math.random() * 300, 1900, 0.02, 'sine');
      const b = w + 0.6;
      noiseHit(b, 0.5, 1200, 0.6, 0.18, null, 'lowpass', 200);
      tone(b, 0.4, 90, 40, 0.15, 'sine', null, true);
      for (let k = 0; k < 10; k++) noiseHit(b + 0.15 + Math.random() * 0.8, 0.03, 3000 + Math.random() * 3000, 2, 0.04, null);
    }
  };
  AU.cheer = function () {
    if (!ok()) return;
    const c = AU.ctx, t = now();
    for (let l = 0; l < 2; l++) {
      const s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = l ? 1400 : 700; f.Q.value = 0.5;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.8); g.gain.setValueAtTime(0.09, t + 2.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      const lfo = c.createOscillator(); lfo.frequency.value = 3 + l * 2.3; const lg = c.createGain(); lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain);
      s.connect(f); f.connect(g); g.connect(AU.sfx); g.connect(AU.rev);
      s.start(t, Math.random()); s.stop(t + 4.1); lfo.start(t); lfo.stop(t + 4.1);
    }
  };
  AU.whistle = function () {
    if (!ok()) return;
    const c = AU.ctx;
    [0, 1.5].forEach((d, i) => {
      const t = now() + 0.3 + d;
      [523, 659, 784].forEach((f) => {
        const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
        const vib = c.createOscillator(); vib.frequency.value = 5.5; const vg = c.createGain(); vg.gain.value = 4; vib.connect(vg); vg.connect(o.frequency);
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2;
        const g = c.createGain(); const L = i ? 0.6 : 1.1;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.025, t + 0.08); g.gain.setValueAtTime(0.025, t + L); g.gain.exponentialRampToValueAtTime(0.0001, t + L + 0.35);
        o.connect(bp); bp.connect(g); g.connect(AU.sfx); g.connect(AU.rev);
        o.start(t); o.stop(t + L + 0.4); vib.start(t); vib.stop(t + L + 0.4);
      });
    });
  };
  AU.cannon = function () {
    if (!ok()) return;
    const t = now();
    for (let i = 0; i < 3; i++) {
      const w = t + 0.2 + i * 1.3;
      tone(w, 1.4, 60, 30, 0.55, 'sine', null, true);
      noiseHit(w, 0.9, 400, 0.6, 0.4, null, 'lowpass', 80);
    }
  };
  AU.click = function () { if (!ok()) return; const t = now(); tone(t, 0.06, 900, 700, 0.04, 'triangle'); };
  AU.unlock = function () {
    if (!ok()) return;
    const t = now();
    [0, 2, 4, 7].forEach((d, i) => pluck(degFreq(d + 7), t + i * 0.12, 0.12, (i - 1.5) * 0.3, AU.sfx));
  };
  AU.step = function (alt) { if (!ok()) return; const t = now(); noiseHit(t, 0.035, alt ? 1600 : 1300, 1.5, 0.035, null, 'bandpass'); };
})();
