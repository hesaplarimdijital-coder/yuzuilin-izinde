/* =========================================================================
   Yüzyılın İzinde — başlatıcı
   Girdi, ana döngü, olay bağlantıları, hata ayıklama kancaları.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, G = IZ.G, R = IZ.R, UI = IZ.UI, AU = IZ.Audio;
  const params = U.params;
  // Test sürümü: engelsiz, hızlandırılabilir, olaylar arası atlanabilir (js/debug.js)
  const DEBUG = (IZ.DEBUG_MODE = !!(window.IZ_DEBUG_BUILD || params.debug));

  const canvas = document.getElementById('game');
  R.q = params.q ? U.clamp(parseFloat(params.q), 0.5, 1) : U.store.get('quality', 1);
  R.init(canvas);
  IZ.debugAuto = !!params.auto;

  function startEventFor(eraIdx) { return params.ev !== undefined ? U.clamp(parseInt(params.ev, 10) || 0, 0, IZ.EVENTS.length - 1) : IZ.eraFirstEvent(eraIdx); }

  function enterMenu() {
    G.reset({ attract: true, gender: UI.state.gender, startEvent: IZ.eraFirstEvent(UI.state.era) });
    R.snapAtm();
    UI.show('menu');
    UI.resetHud();
    AU.stop();
  }

  // İlk oyunda (ya da menüden istenirse) başlangıç eğitimi
  function startRun(o) {
    o = o || {};
    const tutorial = DEBUG ? false : o.tutorial !== undefined ? o.tutorial : (!!params.tut || !U.store.get('tutorialDone', false));
    const startEvent = o.startEvent !== undefined ? o.startEvent : startEventFor(UI.state.era);
    UI.fade(o.instant ? 1 : 260, () => {
      G.reset({ gender: UI.state.gender, startEvent: startEvent, god: !!params.god || DEBUG, tutorial: tutorial });
      R.snapAtm();
      G.buildAll(R.tabDens);
      UI.resetHud();
      UI.show('play');
      if (G.tut) UI.tutorialStart();
      AU.init();
      AU.setMood(G.story.eraIdx, (IZ.EVENTS[G.story.startIdx].m) || 'day', 0.4);
      AU.start();
      lastStepPhase = null;
    });
  }

  function pause() {
    if (G.mode !== 'play') return;
    G.mode = 'pause';
    UI.showPause(G);
    UI.show('pause');
    AU.suspend();
    setTimeout(() => { const b = document.getElementById('btnResume'); b && b.focus({ preventScroll: true }); }, 30);
  }
  function resume() {
    if (G.mode !== 'pause') return;
    G.mode = 'play';
    UI.show('play');
    AU.resume();
    last = performance.now();
  }

  UI.init({
    onStart: () => startRun(),
    onTutorial: () => startRun({ tutorial: true }),
    onSkipTut: () => { G.skipTutorial(); },
    onPause: pause,
    onResume: resume,
    onMenu: () => UI.fade(220, enterMenu),
    onEra: () => { G.reset({ attract: true, gender: UI.state.gender, startEvent: IZ.eraFirstEvent(UI.state.era) }); R.snapAtm(); },
    onGender: (g) => { G.char.setGender(g); },
  });

  // ------------------------------------------------------------- oyun olayları
  G.on('event', (ev) => {
    if (G.attract) return;
    const fx = ev.fx || [];
    AU.eventChime(ev.c);
    if (fx.indexOf('shake') >= 0) AU.quake();
    if (fx.indexOf('siren') >= 0) AU.siren();
    if (fx.indexOf('fireworks') >= 0) AU.fireworks(5);
    if (fx.indexOf('cheer') >= 0) AU.cheer();
    if (fx.indexOf('whistle') >= 0) AU.whistle();
    if (fx.indexOf('cannon') >= 0) AU.cannon();
    AU.setMood(G.story.eraIdx, ev.m || 'day', 0.5);
    if (ev.final) setTimeout(() => { if (G.mode === 'play') UI.toast('<b>Bugüne ulaştın.</b> Koşmaya devam et; gelecek senin izinle yazılıyor.', 4200); }, 1800);
  });
  // dönem adı ve yılı sahnede dev rakamlarla görünür; burada yalnızca kilit açılışı bildirilir
  G.on('era', (i) => {
    if (G.attract) return;
    if (UI.unlock(i)) {
      UI.toast('<span class="t-n">' + IZ.ERAS[i].name + '</span><span class="t-u">Yeni başlangıç dönemi açıldı</span>', 3000);
      AU.unlock();
    }
  });
  G.on('life', (n) => { UI.lives(n, true); UI.toast('<b>Bir can kazandın</b>', 1800); AU.unlock(); });
  G.on('tut', (id, wait) => UI.tutorial(id, wait));
  G.on('tutGo', () => UI.tutorialGo());
  G.on('tutEnd', (skipped) => { U.store.set('tutorialDone', true); UI.tutorialEnd(skipped); });
  G.on('jump', (n) => AU.jump(n));
  G.on('land', (v) => AU.land(v));
  G.on('light', () => AU.light());
  G.on('hurt', (lives) => { UI.lives(Math.max(0, lives)); AU.hurt(); if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* yok */ } } });
  G.on('break', () => AU.breakObj());
  G.on('fall', () => AU.fall());
  G.on('dying', () => { AU.die(); AU.stop(); });
  G.on('over', () => UI.showOver(G));
  G.on('outfit', () => { const p = G.player; G.puff(p.x, p.y - 40, 14, { sv: 140, up: 60, su: 80, g: -40, size: 1.4 }); });

  // ------------------------------------------------------------- girdi
  const JUMP_KEYS = { Space: 1, ArrowUp: 1, KeyW: 1, KeyZ: 1 };
  window.addEventListener('keydown', (e) => {
    if (JUMP_KEYS[e.code]) {
      if (G.mode === 'play') { e.preventDefault(); if (!e.repeat) G.press(); }
      else if (G.mode === 'menu' && e.code === 'Space' && document.activeElement === document.body) { e.preventDefault(); AU.init(); startRun(); }
      return;
    }
    if (e.code === 'KeyP' || e.code === 'Escape') { if (G.mode === 'play') pause(); else if (G.mode === 'pause') resume(); }
    if (e.code === 'KeyM') { AU.init(); AU.setEnabled(!AU.enabled); UI.syncSound(); }
    // (preventDefault: odaktaki "Yeniden koş" düğmesi Enter ile ayrıca tıklanmasın, oyun iki kez başlamasın)
    if (e.code === 'Enter' && G.mode === 'over') { e.preventDefault(); AU.init(); startRun({ tutorial: false }); }
  });
  window.addEventListener('keyup', (e) => { if (JUMP_KEYS[e.code]) G.release(); });

  const touchLayer = document.getElementById('touch');
  let activePointers = 0;
  touchLayer.addEventListener('pointerdown', (e) => {
    if (G.mode !== 'play') return;
    e.preventDefault();
    activePointers++;
    AU.resume();
    G.press();
  });
  const up = (e) => { activePointers = Math.max(0, activePointers - 1); if (!activePointers) G.release(); };
  touchLayer.addEventListener('pointerup', up);
  touchLayer.addEventListener('pointercancel', up);
  touchLayer.addEventListener('pointerleave', up);
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (G.mode === 'play') pause(); AU.suspend(); } else if (G.mode !== 'pause') AU.resume(); });
  window.addEventListener('blur', () => { if (G.mode === 'play') pause(); });

  let rzT = null;
  window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { R.resize(); checkRotate(); }, 120); });
  function checkRotate() {
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    UI.el.rotate.hidden = !(small && window.innerHeight > window.innerWidth * 1.15);
  }
  checkRotate();

  // ------------------------------------------------------------- performans izleme
  const perf = { acc: 0, n: 0, slowFor: 0, lowered: 0 };
  function watchPerf(dtRaw) {
    if (G.mode !== 'play' || params.q) return;
    perf.acc += dtRaw; perf.n++;
    if (perf.acc > 2) {
      const avg = perf.acc / perf.n;
      perf.acc = 0; perf.n = 0;
      if (avg > 0.024) perf.slowFor++; else perf.slowFor = 0;
      if (perf.slowFor >= 2 && R.q > 0.62 && perf.lowered < 3) {
        R.q = Math.max(0.6, R.q - 0.14); perf.lowered++; perf.slowFor = 0;
        U.store.set('quality', R.q);
        R.resize();
      }
    }
  }

  // ------------------------------------------------------------- boşta iş kuyruğu
  let idlePending = false;
  function idleWork() {
    idlePending = false;
    if (!G.buildStep(R.tabDens)) R.prepare();
  }
  function requestIdle() {
    if (idlePending) return;
    idlePending = true;
    if (window.requestIdleCallback) window.requestIdleCallback(idleWork, { timeout: 150 });
    else setTimeout(idleWork, 1);
  }

  // ------------------------------------------------------------- döngü
  let last = performance.now();
  let lastStepPhase = null;
  function frame(now) {
    const dtRaw = Math.max(0, (now - last) / 1000);
    last = now;
    const dt = Math.min(dtRaw, 1 / 20);
    // test sürümünde zaman katlanabilir (her karede birden çok güncelleme)
    const mul = G.mode === 'play' && IZ.Dbg ? IZ.Dbg.mul() : 1;
    if (G.mode === 'play' || G.mode === 'menu' || G.mode === 'dying') {
      for (let i = 0; i < mul; i++) {
        G.update(dt);
        if (mul > 1 && (i & 3) === 3) { if (!G.buildStep(R.tabDens)) R.prepare(); }
      }
    }
    // arka plan işleri: kare başına tek iş, mümkünse tarayıcı boştayken
    requestIdle();
    R.frame(G.mode === 'pause' ? 0 : dt * Math.min(mul, 8));
    UI.update(G);
    UI.drawPreviews(dt);
    if (AU.ready) {
      const a = R.atm || {};
      AU.update(dt, { speed: G.mode === 'play' ? G.speed : 0, rain: a.rain || 0 });
      // ayak sesleri
      if (G.mode === 'play' && G.player.ground && G.player.alive && mul <= 2) {
        // adım sesi topuğun yere değdiği anda (iki ayak için evre π/2 + kπ)
        const ph = Math.floor((G.char.phase - Math.PI / 2) / Math.PI);
        if (lastStepPhase !== null && ph !== lastStepPhase) AU.step(ph % 2);
        lastStepPhase = ph;
      }
    }
    watchPerf(dtRaw);
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------- hata ayıklama / test
  window.IZ_DEBUG = {
    start(evIdx, opts) { opts = opts || {}; G.reset({ gender: opts.g || UI.state.gender, startEvent: evIdx, god: opts.god !== false, tutorial: !!opts.tutorial }); R.snapAtm(); G.buildAll(R.tabDens); UI.resetHud(); UI.show('play'); if (G.tut) UI.tutorialStart(); IZ.debugAuto = opts.auto !== false; },
    step(n, dt) { dt = dt || 1 / 60; for (let i = 0; i < n; i++) { G.update(dt); G.buildStep(R.tabDens) || R.prepare(); } R.frame(dt); UI.update(G); },
    frame() { R.frame(1 / 60); UI.update(G); },
    G: G, R: R,
  };

  // yazı tipleri yüklenince sahnedeki yazılar yeniden çizilir
  IZ.WT.watchFonts(() => R.clearText());

  // test sürümü ve diğer modüller için
  IZ.App = { startRun: startRun, enterMenu: enterMenu, pause: pause, resume: resume, DEBUG: DEBUG };

  enterMenu();
  if (params.start || params.ev !== undefined) { setTimeout(() => { AU.init(); startRun(); }, 60); }
  requestAnimationFrame((t) => { last = t; frame(t); });
  document.body.classList.add('ready');
})();
