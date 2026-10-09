/* =========================================================================
   Yüzyılın İzinde — arayüz
   Menü, karakter ve dönem seçimi, HUD, eğitim yönergeleri,
   duraklatma ve oyun sonu ekranları. (Olay yazıları sahnenin içinde çizilir.)
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U;
  const UI = (IZ.UI = {});
  const $ = (s) => document.querySelector(s);

  const ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6s-7.6-4.6-9.6-9.3C1 7.8 3.2 4.4 6.6 4.4c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.4 0 5.6 3.4 4.2 6.9-2 4.7-9.6 9.3-9.6 9.3z"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l1.9 6.4 6.6.2-5.3 4 2 6.4L12 15.6l-5.2 3.9 2-6.4-5.3-4 6.6-.2z"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 8.8a4.6 4.6 0 0 1 0 6.4M17.9 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10v4.6a5 5 0 0 1-10 0z"/><path d="M7 5.2H4.2v1.6A3.4 3.4 0 0 0 7.6 10.2M17 5.2h2.8v1.6a3.4 3.4 0 0 1-3.4 3.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.8 12.6h2.4v3.6h-2.4z"/><rect x="7.6" y="16.4" width="8.8" height="2.6" rx=".8"/></svg>',
    // eğitim simgeleri
    tap: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="14" r="9" fill="none" stroke="#f1e6cf" stroke-opacity=".45" stroke-width="1.6"/><path d="M21 14.5a3 3 0 0 1 6 0v10.2l6.3 1.3a3.4 3.4 0 0 1 2.6 3.8l-1.4 9.2a4 4 0 0 1-4 3.4H22.2a4 4 0 0 1-3.3-1.8l-5.1-7.6a2.6 2.6 0 0 1 3.7-3.6L21 32z" fill="#f1e6cf"/></svg>',
    hold: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="14" r="9" fill="none" stroke="#e2483e" stroke-width="2.4" stroke-dasharray="44 13"/><path d="M21 14.5a3 3 0 0 1 6 0v10.2l6.3 1.3a3.4 3.4 0 0 1 2.6 3.8l-1.4 9.2a4 4 0 0 1-4 3.4H22.2a4 4 0 0 1-3.3-1.8l-5.1-7.6a2.6 2.6 0 0 1 3.7-3.6L21 32z" fill="#f1e6cf"/></svg>',
    key: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="15" width="42" height="19" rx="4" fill="none" stroke="#f1e6cf" stroke-width="2"/><rect x="12" y="27" width="24" height="2.6" rx="1.3" fill="#f1e6cf"/></svg>',
    keyHold: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="15" width="42" height="19" rx="4" fill="rgba(226,72,62,.25)" stroke="#e2483e" stroke-width="2"/><rect x="12" y="27" width="24" height="2.6" rx="1.3" fill="#f1e6cf"/></svg>',
    star: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="14" fill="rgba(255,217,138,.18)"/><path d="M24 9l3.6 12.2 12.6.4-10 7.6 3.8 12.2L24 33.8l-10 7.6 3.8-12.2-10-7.6 12.6-.4z" fill="#ffd98a"/></svg>',
    flag: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 6v36" stroke="#f1e6cf" stroke-width="2.4" stroke-linecap="round"/><path d="M13 8h22l-5 7 5 7H13z" fill="#e2483e"/></svg>',
  };
  UI.ICON = ICON;

  UI.state = {
    gender: U.store.get('gender', 'f'),
    era: 0,
    unlocked: U.store.get('unlocked', 0),
    best: U.store.get('best', { dist: 0, year: 0 }),
  };

  UI.init = function (handlers) {
    UI.h = handlers;
    UI.el = {
      hud: $('#hud'), lives: $('#hudLives'), dist: $('#hudDist'), lights: $('#hudLights'),
      menu: $('#menu'), pause: $('#pause'), over: $('#over'), toast: $('#toast'), rotate: $('#rotate'), eraList: $('#eraList'),
      best: $('#bestLine'), fade: $('#fade'),
      tut: $('#tut'), tutIcon: $('#tut .tut-icon'), tutTitle: $('#tut .tut-title'), tutText: $('#tut .tut-text'), skipTut: $('#btnSkipTut'),
      pauseYear: $('#pauseYear'), pauseInfo: $('#pauseInfo'),
    };
    // simgeler
    document.querySelectorAll('[data-icon]').forEach((b) => { b.insertAdjacentHTML('afterbegin', ICON[b.dataset.icon] || ''); });
    $('#hudLightsIcon').innerHTML = ICON.light;
    const don = $('#btnDonate .ico'); if (don) don.innerHTML = ICON.heart;
    // karakter kartları
    UI.previews = [];
    document.querySelectorAll('.char').forEach((btn) => {
      const g = btn.dataset.g;
      const cv = btn.querySelector('canvas');
      const ch = new IZ.Character(g);
      UI.previews.push({ g: g, cv: cv, ch: ch, btn: btn });
      btn.addEventListener('click', () => { UI.state.gender = g; U.store.set('gender', g); UI.syncChars(); IZ.Audio.click(); handlers.onGender && handlers.onGender(g); });
    });
    UI.syncChars();
    UI.buildEras();
    $('#btnStart').addEventListener('click', () => { IZ.Audio.init(); IZ.Audio.click(); handlers.onStart(); });
    $('#btnTutorial').addEventListener('click', () => { IZ.Audio.init(); IZ.Audio.click(); handlers.onTutorial(); });
    $('#btnPause').addEventListener('click', (e) => { e.stopPropagation(); handlers.onPause(); });
    $('#btnResume').addEventListener('click', () => handlers.onResume());
    $('#btnPauseMenu').addEventListener('click', () => handlers.onMenu());
    $('#btnRetry').addEventListener('click', () => { IZ.Audio.init(); handlers.onStart(); });
    $('#btnOverMenu').addEventListener('click', () => handlers.onMenu());
    UI.el.skipTut.addEventListener('click', (e) => { e.stopPropagation(); handlers.onSkipTut(); });
    document.querySelectorAll('.js-sound').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); IZ.Audio.init(); IZ.Audio.setEnabled(!IZ.Audio.enabled); UI.syncSound(); }));
    const fs = $('#btnFull');
    // tam ekran: destek yoksa ya da sayfa izin vermeyen bir çerçevenin içindeyse düğmeyi gizle
    const fsAllowed = document.fullscreenEnabled !== undefined ? document.fullscreenEnabled : document.webkitFullscreenEnabled !== false;
    const canFS = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) && fsAllowed;
    if (!canFS) fs.hidden = true;
    fs.addEventListener('click', () => {
      const d = document, el = d.documentElement;
      try {
        if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
        else { const r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if (r && r.catch) r.catch(() => {}); try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* yok */ } }
      } catch (e) { /* desteklenmiyor */ }
    });
    UI.syncSound();
    UI.renderBest();
    UI.lives(3);
  };

  UI.syncSound = function () {
    document.querySelectorAll('.js-sound').forEach((b) => {
      b.innerHTML = IZ.Audio.enabled ? ICON.soundOn : ICON.soundOff;
      b.setAttribute('aria-label', IZ.Audio.enabled ? 'Sesi kapat' : 'Sesi aç');
      b.classList.toggle('off', !IZ.Audio.enabled);
    });
  };

  UI.syncChars = function () {
    UI.previews.forEach((p) => { p.btn.classList.toggle('on', p.g === UI.state.gender); p.btn.setAttribute('aria-pressed', p.g === UI.state.gender ? 'true' : 'false'); });
  };

  UI.buildEras = function () {
    const list = UI.el.eraList;
    list.innerHTML = '';
    IZ.ERAS.slice(0, 6).forEach((era, i) => {
      const b = document.createElement('button');
      b.className = 'era-chip';
      b.type = 'button';
      const locked = i > UI.state.unlocked;
      b.disabled = locked;
      b.innerHTML = '<span class="y">' + era.from + '</span><span class="n">' + era.name + '</span>' + (locked ? '<span class="lk">' + ICON.lock + '</span>' : '');
      b.title = locked ? 'Bu döneme koşarak ulaştığında açılır' : era.name;
      b.addEventListener('click', () => { if (locked) return; UI.state.era = i; UI.syncEras(); IZ.Audio.click(); UI.h.onEra && UI.h.onEra(i); });
      list.appendChild(b);
    });
    UI.syncEras();
  };
  UI.syncEras = function () {
    Array.prototype.forEach.call(UI.el.eraList.children, (b, i) => { b.classList.toggle('on', i === UI.state.era); b.setAttribute('aria-pressed', i === UI.state.era ? 'true' : 'false'); });
  };

  UI.renderBest = function () {
    const b = UI.state.best;
    UI.el.best.textContent = b.dist > 0 ? 'En uzak koşun: ' + b.year + ' · ' + U.fmtInt(b.dist) + ' m' : 'Henüz bir rekorun yok. Hikâye seni bekliyor.';
  };

  // ------------------------------------------------------------- ekranlar
  UI.show = function (name) {
    const m = UI.el;
    m.menu.hidden = name !== 'menu';
    m.pause.hidden = name !== 'pause';
    m.over.hidden = name !== 'over';
    m.hud.hidden = !(name === 'play' || name === 'pause' || name === 'over');
    if (name !== 'play' && name !== 'pause') { m.tut.hidden = true; }
    document.body.dataset.screen = name;
  };

  UI.fade = function (ms, mid) {
    const f = UI.el.fade;
    f.style.transitionDuration = ms + 'ms';
    f.classList.add('on');
    setTimeout(() => { try { mid && mid(); } finally { requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on'))); } }, ms);
  };

  UI.lives = function (n, gained) {
    let h = '';
    for (let i = 0; i < 3; i++) h += '<span class="heart' + (i < n ? '' : ' lost') + (gained && i === n - 1 ? ' new' : '') + '">' + ICON.heart + '</span>';
    UI.el.lives.innerHTML = h;
    UI.el.lives.setAttribute('aria-label', n + ' can');
    if (n < 3 || gained) { UI.el.lives.classList.remove('hit'); void UI.el.lives.offsetWidth; UI.el.lives.classList.add('hit'); }
  };

  UI.update = function (G) {
    if (G.mode === 'menu') return;
    UI.el.dist.textContent = U.fmtInt(G.score.dist);
    UI.el.lights.textContent = G.score.lights;
  };
  UI.resetHud = function () { UI.lives(3); UI.tutorialHide(true); };

  UI.showPause = function (G) {
    const y = G.displayYear();
    const ev = G.story.curEv;
    UI.el.pauseYear.textContent = y;
    UI.el.pauseInfo.textContent = IZ.ERAS[G.story.eraIdx].name + (ev ? ' · Son olay: ' + ev.t : '') + '. Tarih seni bekliyor; hazır olduğunda devam et.';
  };

  let toastTimer = null;
  UI.toast = function (html, ms) {
    const t = UI.el.toast;
    t.innerHTML = html;
    t.hidden = false;
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove('in'); setTimeout(() => { t.hidden = true; }, 400); }, ms || 2600);
  };

  // ------------------------------------------------------------- eğitim
  const touchy = () => !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const TUT = {
    jump: () => ({ icon: touchy() ? 'tap' : 'key', title: 'Zıpla', text: touchy() ? 'Engelin üzerinden atlamak için ekrana dokun.' : 'Engelin üzerinden atlamak için <kbd>Boşluk</kbd> tuşuna bas.' }),
    double1: () => ({ icon: touchy() ? 'tap' : 'key', title: 'Yüksek engel', text: touchy() ? 'Önce dokun ve zıpla…' : 'Önce <kbd>Boşluk</kbd> ile zıpla…' }),
    double2: () => ({ icon: touchy() ? 'tap' : 'key', title: 'Şimdi bir kez daha!', text: touchy() ? 'Havadayken tekrar dokunursan ikinci kez zıplarsın: çift zıplama.' : 'Havadayken <kbd>Boşluk</kbd>’a tekrar basarsan ikinci kez zıplarsın: çift zıplama.' }),
    hold: () => ({ icon: touchy() ? 'hold' : 'keyHold', title: 'Basılı tut', text: touchy() ? 'Geniş bir çukur. Parmağını ekranda tutarsan daha yükseğe ve daha uzağa zıplarsın.' : 'Geniş bir çukur. <kbd>Boşluk</kbd>’u basılı tutarsan daha yükseğe ve daha uzağa zıplarsın.' }),
    lights: () => ({ icon: 'star', title: 'Işıkları topla', text: 'Her 50 ışık, kaybettiğin bir canı geri getirir.' }),
    ready: () => ({ icon: 'flag', title: 'Hazırsın', text: 'Türkiye’nin yüz yılı arkanda akıyor. Tarihler ve olaylar sahnenin içinde belirecek.' }),
  };
  let tutTimer = null;
  UI.tutorial = function (id, wait) {
    const def = TUT[id] && TUT[id]();
    if (!def) return;
    const el = UI.el;
    clearTimeout(tutTimer);
    el.tutIcon.innerHTML = ICON[def.icon] || '';
    el.tutTitle.textContent = def.title;
    el.tutText.innerHTML = def.text;
    el.tut.classList.toggle('wait', !!wait);
    el.tut.hidden = false;
    const card = el.tut.firstElementChild;
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    if (!wait) tutTimer = setTimeout(() => UI.tutorialHide(), id === 'ready' ? 4200 : 3600);
  };
  UI.tutorialGo = function () {
    // oyuncu doğru hamleyi yaptı: yönerge kısa süre sonra kaybolur
    const el = UI.el;
    el.tut.classList.remove('wait');
    clearTimeout(tutTimer);
    tutTimer = setTimeout(() => UI.tutorialHide(), 700);
  };
  UI.tutorialHide = function (all) {
    clearTimeout(tutTimer);
    UI.el.tut.hidden = true;
    if (all) UI.el.skipTut.hidden = true;
  };
  UI.tutorialStart = function () { UI.el.skipTut.hidden = false; };
  UI.tutorialEnd = function (skipped) {
    UI.el.skipTut.hidden = true;
    if (skipped) UI.tutorialHide();
  };

  UI.showOver = function (G) {
    const y = G.displayYear();
    const ev = G.story.curEv;
    $('#overYear').textContent = y;
    $('#overEvent').textContent = ev ? (ev.final ? 'Bugünü geçtin, geleceğe koşuyordun.' : 'Son tanıklığın: ' + ev.t) : 'Hikâye daha yeni başlıyordu.';
    $('#overDist').textContent = U.fmtInt(G.score.dist) + ' m';
    $('#overLights').textContent = G.score.lights;
    $('#overEvents').textContent = G.score.events;
    const best = UI.state.best;
    const dist = Math.floor(G.score.dist);
    const isBest = dist > best.dist;
    if (isBest) { UI.state.best = { dist: dist, year: y }; U.store.set('best', UI.state.best); }
    $('#overBest').textContent = isBest ? 'Yeni rekor!' : 'En uzak koşun: ' + best.year + ' · ' + U.fmtInt(best.dist) + ' m';
    $('#overBest').classList.toggle('new', isBest);
    UI.renderBest();
    UI.show('over');
    setTimeout(() => { const b = $('#btnRetry'); b && b.focus({ preventScroll: true }); }, 50);
  };

  UI.unlock = function (eraIdx) {
    if (eraIdx <= UI.state.unlocked || eraIdx > 5) return false;
    UI.state.unlocked = eraIdx;
    U.store.set('unlocked', eraIdx);
    UI.buildEras();
    return true;
  };

  // Menüdeki karakter önizlemeleri
  UI.drawPreviews = function (dt) {
    if (UI.el.menu.hidden) return;
    const year = IZ.ERAS[UI.state.era].from + 1;
    UI.previews.forEach((p) => {
      const cv = p.cv;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth || 120, h = cv.clientHeight || 150;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const x = cv.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, cv.width, cv.height);
      p.ch.setYear(year);
      const sel = p.g === UI.state.gender;
      // seçili karakter yerinde koşar, diğeri rüzgârda bekler
      p.ch.update(dt, { speed: sel ? 430 : 0, ground: true, vy: 0, idle: !sel });
      const sc = Math.min((cv.height / dpr) / 128, (cv.width / dpr) / 90);
      x.setTransform(dpr * sc, 0, 0, dpr * sc, cv.width / 2 - 6 * dpr * sc, cv.height - 9 * dpr * sc);
      const on = p.g === UI.state.gender;
      // zemin gölgesi
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(0, 0, 34, 4, 0, 0, Math.PI * 2); x.fill();
      p.ch.draw(x, 0, 0, { sil: on ? '#0b0a09' : '#1a1816', far: on ? '#1d1b18' : '#262420', rim: on ? 'rgba(255,226,180,0.85)' : 'rgba(255,226,180,0.35)', rimOff: [1.6, -1.1], scarf: on ? '#cf1d24' : '#7a2a2c', scarfDark: on ? '#741015' : '#3e1718', scale: 1.0 });
    });
  };
})();
