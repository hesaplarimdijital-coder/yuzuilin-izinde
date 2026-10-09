/* =========================================================================
   Yüzyılın İzinde — Android uygulaması köprüsü (Capacitor)
   Tarayıcıda hiçbir şey yapmaz. Android uygulamasında:
   - Google Play Games liderlik tablosu: oyun bitince koşulan mesafe gönderilir;
     menüde ve oyun sonu ekranında "Liderlik tablosu" düğmesi görünür.
     (Yerel eklenti: android/app/src/main/java/.../PlayGamesPlugin.java)
   - Android geri tuşu: oyunda duraklatır, duraklatmada sürdürür, oyun sonunda
     menüye döner, menüde uygulamayı arka plana alır.
   - Uygulama arka plana geçince oyun duraklar, ses susar.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, G = IZ.G, UI = IZ.UI, U = IZ.U;
  const Cap = window.Capacitor;
  const native = !!(Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform());
  const PF = (IZ.Platform = { native: native, games: false, signedIn: false });
  if (!native) return;

  document.documentElement.classList.add('native-app');
  const plugins = Cap.Plugins || {};
  const PG = plugins.PlayGames || null;
  const AppP = plugins.App || null;
  const $ = (s) => document.querySelector(s);
  const App = IZ.App;
  const AU = IZ.Audio;

  // uygulama zaten tam ekran: tam ekran düğmesi gereksiz
  const fsBtn = $('#btnFull');
  if (fsBtn) fsBtn.hidden = true;
  // Bağış bağlantısı uygulamada varsayılan olarak gizli: Google Play'in ödeme politikası, uygulama
  // içinden Play dışı ödeme sayfasına yönlendirmeyi kısıtlar (bağış sayfası web sürümünde ve mağaza
  // açıklamasında kalır). Riski göze alıp göstermek isterseniz DONATE_IN_APP = true yapın.
  const DONATE_IN_APP = false;
  const don = $('#btnDonate');
  if (don && !DONATE_IN_APP) don.hidden = true;

  // ------------------------------------------------------------- liderlik tablosu
  const BOARD = 'distance';
  const boardBtns = [$('#btnBoard'), $('#btnOverBoard')].filter(Boolean);
  const showBoardBtns = (on) => boardBtns.forEach((b) => { b.hidden = !on; });
  // giriş yapılmamışken bitirilen koşuların en iyisi saklanır, girişte gönderilir
  let pending = U.store.get('pgsPending', 0) || 0;
  let submitting = false;

  function submitPending() {
    if (!PG || !PF.signedIn || submitting) return;
    const best = Math.max(pending, (UI.state.best && UI.state.best.dist) || 0);
    if (best <= 0) return;
    submitting = true;
    PG.submitScore({ leaderboard: BOARD, score: Math.floor(best) })
      .then(() => { pending = 0; U.store.set('pgsPending', 0); })
      .catch(() => { /* çevrimdışı vb.: sonra yeniden denenir */ })
      .then(() => { submitting = false; });
  }
  function setSignedIn(v) {
    PF.signedIn = !!v;
    if (PF.signedIn) submitPending();
  }

  if (PG) {
    PG.status()
      .then((s) => {
        PF.games = !!(s && s.available);
        showBoardBtns(PF.games);
        setSignedIn(s && s.authenticated);
      })
      .catch(() => showBoardBtns(false));
  } else showBoardBtns(false);

  let opening = false;
  function openBoard() {
    if (!PG || !PF.games || opening) return;
    opening = true;
    const done = () => { opening = false; };
    const fail = (msg) => { done(); UI.toast(msg, 2800); };
    const show = () => PG.showLeaderboard({ leaderboard: BOARD })
      .then(done)
      .catch(() => fail('Liderlik tablosu şu an açılamadı.'));
    if (PF.signedIn) { show(); return; }
    PG.signIn()
      .then((r) => {
        setSignedIn(r && r.authenticated);
        if (PF.signedIn) show();
        else fail('Liderlik tablosu için Google Play Games’e giriş yapmalısın.');
      })
      .catch(() => fail('Google Play Games’e bağlanılamadı.'));
  }
  boardBtns.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AU && AU.click) AU.click();
    openBoard();
  }));

  // oyun bitince koşulan mesafe (metre) liderlik tablosuna gider
  G.on('over', () => {
    if (G.attract || G.god || IZ.DEBUG_MODE || !PF.games) return;
    const d = Math.floor(G.score.dist);
    if (d <= 0) return;
    pending = Math.max(pending, d);
    U.store.set('pgsPending', pending);
    submitPending();
  });

  // ------------------------------------------------------------- geri tuşu ve yaşam döngüsü
  if (AppP && AppP.addListener) {
    AppP.addListener('backButton', () => {
      const m = G.mode;
      if (m === 'play') App.pause();
      else if (m === 'pause') App.resume();
      else if (m === 'over') UI.fade(220, App.enterMenu);
      else if (m === 'menu') {
        if (AppP.minimizeApp) AppP.minimizeApp().catch(() => AppP.exitApp && AppP.exitApp());
        else if (AppP.exitApp) AppP.exitApp();
      }
      // 'dying' (düşüş anı): yok sayılır
    });
    AppP.addListener('pause', () => {
      if (G.mode === 'play') App.pause();
      if (AU && AU.suspend) AU.suspend();
    });
    AppP.addListener('resume', () => {
      if (G.mode !== 'pause' && G.mode !== 'play' && AU && AU.resume) AU.resume();
      // arka planda giriş yapılmış olabilir (Play Games karşılama ekranı)
      if (PG && PF.games && !PF.signedIn) PG.status().then((s) => setSignedIn(s && s.authenticated)).catch(() => {});
    });
  }
})();
