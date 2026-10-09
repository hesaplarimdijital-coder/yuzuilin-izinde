/* =========================================================================
   Yüzyılın İzinde — oyun mantığı
   Koşucu fiziği, engel/çukur/platform üretimi, çarpışmalar, canlar,
   başlangıç eğitimi, tarih çizelgesi sürücüsü (olay zamanlaması, yıl, dönem).
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ, U = IZ.U, A = IZ.ART;
  const G = (IZ.G = {});

  // minHold: kısa bir dokunuş da en az bu kadar (oyun saniyesi) basılı sayılır; cut: erken bırakınca yükselişteki ek yerçekimi çarpanı
  const PH = { g1: 2500, g2: 3050, jumpV: 905, djumpV: 790, maxFall: 1700, coyote: 0.09, buffer: 0.18, minHold: 0.13, cut: 1.6 };
  const HIT_W = 24, HIT_H = 84;
  // engel çarpışmasında affedici kutu: biraz daha dar gövde, ayak ucunda pay
  const OBS_W = 18, OBS_FOOT = 7, OBS_TRIM = 3;
  // ayaklar zemin çizgisinin bu kadar altına inince (çukura düşerken) zıplama kapanır
  // (kenar payı süresince düşülen yoldan biraz fazla: 0,09 sn'de ~12,4 birim)
  const PIT_NOJUMP = 13;
  // engel üstüne iniş payı: ayaklar üst kenarın bu kadar altındaysa da üstüne basılır
  const LAND_TOL = OBS_FOOT + OBS_TRIM;
  // sahne panoları ekrana girmeden ~20 sn önce hazırlanmaya başlar (panolar zamana bağlı kayar)
  const tabLook = () => Math.max(20 * Math.max(200, G.speed), (0.45 * G.viewW + 900) / G.TAB_P.back) + 0.5 * G.viewW;
  G.PH = PH;

  // Tempo: bir yıl ≈ 75 saniyelik koşu; ardışık iki olay arasında en az 16 saniye
  G.SEC_PER_YEAR = 75;
  G.MIN_GAP = 16;
  G.LIGHTS_PER_LIFE = 50;
  G.MAX_LIVES = 3;

  G.mode = 'menu';
  G.viewW = 1280;
  G.t = 0;
  G.listeners = {};
  G.on = function (ev, fn) { (G.listeners[ev] = G.listeners[ev] || []).push(fn); };
  G.emit = function (ev, a, b) { (G.listeners[ev] || []).forEach((f) => f(a, b)); };

  // ------------------------------------------------------------- başlat
  G.reset = function (o) {
    o = o || {};
    G.attract = !!o.attract;
    G.god = !!o.god;
    G.mournK = 0;
    G.mode = o.attract ? 'menu' : 'play';
    G.runT = 0;
    G.speed = G.baseSpeed(0);
    G.timeScale = 1;
    G.char = G.char || new IZ.Character(o.gender || 'm');
    if (o.gender) G.char.setGender(o.gender);
    const p = (G.player = {
      x: 0, y: 0, vy: 0, ground: true, jumps: 0, coyote: 0, buffer: 0, holding: false,
      hurtT: 0, invT: 0, lives: G.MAX_LIVES, alive: true, deadT: 0, slowT: 0, support: 0, jumpT: 9,
    });
    G.camX = p.x - G.viewW * G.lead();
    G.segs = [{ x0: -4000, x1: Infinity }];
    G.obs = []; G.plats = []; G.lights = []; G.parts = [];
    G.genX = p.x + Math.max(900, G.viewW * 0.75);
    G.lastPattern = '';
    G.fx = { shake: 0, slowT: 0, flash: 0, hit: 0 };
    G.score = { dist: 0, lights: 0, events: 0, startX: p.x, toLife: 0 };
    const startIdx = U.clamp(o.startEvent || 0, 0, IZ.EVENTS.length - 1);
    const ev0 = IZ.EVENTS[startIdx];
    G.story = {
      queue: [], next: startIdx, lastF: null, cur: -1, curEv: null, startIdx: startIdx,
      year: ev0.dec - 0.2, eraIdx: IZ.eraIndex(ev0.dec), futureT: 0, finalPassed: false,
      // yıl çizgisi: [dünya x'i, ondalık yıl] noktaları; aralarında doğrusal ilerler
      points: [], hold: false,
    };
    G.char.setYear(G.story.year);
    G.char.inited = false;
    G.buildQueue = [];
    G.segStartX = p.x; G.calm0 = null;
    // eğitim
    G.tut = o.tutorial && !o.attract ? { step: 0, wait: null, shown: {}, endX: Infinity, done: false } : null;
    if (G.tut) {
      G.story.hold = true; // olaylar eğitim bitince başlar
      // eğitimde tempolu yürüyüşle başlanır; ilk engel koşuya geçince gelir
      G.runT = 16;
      G.speed = G.baseSpeed(G.runT);
      G.genX = p.x + G.distFor(7, G.runT);
    } else {
      startStory(6);
    }
    G.emit('reset');
  };

  function startStory(leadSec) {
    const S = G.story;
    S.hold = false;
    const ev0 = IZ.EVENTS[S.next];
    S.points = [{ x: G.camX, dec: ev0.dec - Math.min(0.2, 6 / G.SEC_PER_YEAR) }];
    S.year = S.points[0].dec;
    S.firstF = G.camX + G.distFor(leadSec, G.runT);
    S.firstT = G.runT + leadSec;
    G.scheduleStory();
    // koşunun başında ilk olay yazısı okunana ve karakter yürüyüşten koşuya geçene kadar engel yok
    const first = S.queue[0];
    if (first && first.calm) {
      const walkEnd = G.runT < G.RUN_FROM ? G.player.x + G.distFor(G.RUN_FROM - G.runT, G.runT) : 0;
      const end = Math.max(first.calm[1], walkEnd);
      G.calm0 = [G.player.x + 40, end]; G.segStartX = end;
    }
    resetGenAhead();
  }

  G.lead = function () { return G.viewW < 1100 ? 0.24 : 0.28; };

  // Hız: karakter yürüyerek başlar (~150), ~14 sn civarı tempolu yürür (~220–300), 32. saniyede
  // koşuya (430) varır. Koşu hızı Subway Surfers gibi ilk dakikalarda belirgin biçimde artar
  // (1 dk'da ~1,1×, 3 dk'da ~1,2×, 10 dk'da ~1,4×) ve ancak çok uzun koşuda 1,5× tavana (645) dayanır.
  G.WALK_SPEED = 150;
  G.RUN_BASE = 430;
  G.SPEED_CAP = 1.5;
  // Yas anı: depremlerde ve yas olaylarında (olayda yas: true ya da sahne 'quake' / atmosfer 'mourning')
  // karakter yazı gelirken yavaşlar, başını önüne eğerek yürür, yazı geçince yeniden koşar.
  G.MOURN_SPEED = 130;
  IZ.isMourning = function (ev) { return !!ev && (ev.yas !== undefined ? !!ev.yas : (ev.s === 'quake' || ev.m === 'mourning')); };
  G.mournK = 0;
  function mournTarget() {
    const q = G.story.queue;
    for (let i = 0; i < q.length; i++) {
      const it = q[i];
      if (!IZ.isMourning(it.ev)) continue;
      const v = it.vNom || 400;
      const pre = Math.min(2.2 * v, 900), post = Math.min(0.8 * v, 420);
      if (G.camX >= it.F - pre && G.camX <= it.F + post) return 1;
    }
    return 0;
  }
  G.RUN_FROM = 24; // bu andan önce (yürüyüş ve tempolu yürüyüş) engel çıkmaz
  G.baseSpeed = function (t) {
    const run = U.smoothstep(5, 32, t);
    const tau = Math.max(0, t - 32);
    const g = 0.6 * (1 - Math.exp(-tau / 150)) + 0.4 * (1 - Math.exp(-tau / 900));
    return G.WALK_SPEED + (G.RUN_BASE - G.WALK_SPEED) * run + G.RUN_BASE * (G.SPEED_CAP - 1) * g;
  };
  // t0 anından itibaren sec saniyede alınacak yol (hız eğrisinin integrali): olaylar ivmelenen
  // hıza göre planlanır, böylece aralarındaki süre koşunun başında da doğru kalır.
  G.distFor = function (sec, t0) {
    const n = Math.max(4, Math.ceil(sec / 0.5)), h = sec / n;
    let d = 0;
    for (let i = 0; i < n; i++) d += G.baseSpeed(t0 + (i + 0.5) * h) * h;
    return d;
  };
  // Okuma molası ve zorluk dalgası: olay yazısı okunurken (olay noktasından CALM_PRE sn önce ile
  // CALM_POST sn sonrası arası) engel çıkmaz. Moladan sonra zorluk düşük başlar ve RAMP_SEC içinde
  // o anki tepe değerine çıkar; bir sonraki olayda yine mola. Tepe değeri koşu boyunca yavaşça artar.
  G.CALM_PRE = 4.2; G.CALM_POST = 4.2; G.RAMP_SEC = 35;
  G.peakDifficulty = function () { return 0.22 + 0.63 * (1 - Math.exp(-G.runT / 1500)); };
  G.segTime = function (x) { return Math.max(0, (x - G.segStartX) / Math.max(200, G.speed)); };
  G.difficultyAt = function (x) { return G.peakDifficulty() * (0.25 + 0.75 * U.smoothstep(0, G.RAMP_SEC, G.segTime(x))); };
  G.difficulty = function () { return G.difficultyAt(G.genX); };
  function calmFor(F, T) {
    const L = G.viewW * G.lead(), v = T === undefined ? G.speed : G.baseSpeed(T);
    return [F - G.CALM_PRE * v + L, F + G.CALM_POST * v + L];
  }
  // [x0, x1] aralığıyla kesişen ilk mola bölgesi (oyuncu x'i cinsinden)
  function calmZoneAt(x0, x1) {
    let best = null;
    const test = (z) => { if (z && z[1] > x0 && z[0] < x1 && (!best || z[0] < best[0])) best = z; };
    test(G.calm0);
    const q = G.story.queue;
    for (let i = 0; i < q.length; i++) test(q[i].calm);
    return best;
  }
  G.calmZoneAt = calmZoneAt;
  // Ekranın sağ kenarının ötesinde üretilmiş (henüz görünmeyen) her şeyi kaldır; üretim oradan,
  // mola bölgeleri dikkate alınarak yeniden başlar.
  function resetGenAhead() {
    const cut = G.camX + G.viewW + 40;
    if (G.genX <= cut) return;
    let end = cut;
    G.obs = G.obs.filter((o) => { if (o.x < cut) { end = Math.max(end, o.x + o.w); return true; } return false; });
    G.plats = G.plats.filter((pl) => { if (pl.x < cut) { end = Math.max(end, pl.x + pl.w); return true; } return false; });
    G.lights = G.lights.filter((l) => l.x < cut);
    for (let i = 0; i < G.segs.length; i++) {
      const sg = G.segs[i];
      if (sg.x1 > cut) {
        if (sg.x0 > cut) end = Math.max(end, sg.x0); // kesim bir çukurun içinde: çukur kalır
        sg.x1 = Infinity; G.segs.length = i + 1;
        break;
      }
    }
    G.genX = end + 0.4 * G.speed;
  }
  // olayın tetiklenmesi (ses, atmosfer): yazı ortaya yaklaşmadan biraz önce
  G.eventLead = function () { return 2.4 * G.speed; };

  // ------------------------------------------------------------- girdi
  G.press = function () {
    if (G.mode !== 'play') return;
    G.player.buffer = PH.buffer;
    G.player.holding = true;
    if (G.tut && G.tut.wait) tutResume();
  };
  G.release = function () { G.player && (G.player.holding = false); };

  // ------------------------------------------------------------- zemin
  G.groundAt = function (x0, x1) {
    for (let i = 0; i < G.segs.length; i++) { const s = G.segs[i]; if (s.x1 > x0 && s.x0 < x1) return true; }
    return false;
  };
  G.segAfter = function (x) {
    for (let i = 0; i < G.segs.length; i++) { const s = G.segs[i]; if (s.x1 > x + 1) return s; }
    return G.segs[G.segs.length - 1];
  };
  function addPit(a, b) {
    const last = G.segs[G.segs.length - 1];
    last.x1 = a;
    G.segs.push({ x0: b, x1: Infinity });
    return { x0: a, x1: b };
  }

  // ------------------------------------------------------------- üretim
  function eraObsWeights() {
    const era = IZ.ERAS[G.story.eraIdx];
    const w = Object.assign({}, era.obs);
    delete w.crates;
    const ev = G.story.curEv;
    if (ev && ev.o) ev.o.forEach((k) => { w[k] = (w[k] || 0) + 9; });
    return w;
  }
  // Engelin üzerinden geçerken havada kalınması gereken süre (sn): uzun engeller yalnızca hız
  // yeterince yüksekken çıkar (yürürken ya da yavaşlamışken kısa bir zıplama yetmezdi).
  function obsSpan(type) { const d = A.OBS[type]; return (d.hit[1] - d.hit[0] - 2 * OBS_TRIM + OBS_W) / Math.max(120, G.speed); }
  // platformun üstüne konacak küçük, döneme uygun bir engel
  function pickSmall(r) {
    const w = eraObsWeights();
    let ok = 0;
    for (const k in w) { const d = A.OBS[k]; if (!d || d.w > 70 || d.h > 64) w[k] = 0; else ok += w[k]; }
    return ok > 0 ? r.weighted(w) : 'crate';
  }
  function pickObs(r) {
    const w = eraObsWeights();
    let ok = 0;
    for (const k in w) { if (obsSpan(k) > 0.3) w[k] = 0; else ok += w[k]; }
    if (ok <= 0) return 'rock';
    return r.weighted(w);
  }
  function addObs(type, x, y) {
    const d = A.OBS[type];
    const o = { type: type, x: x, y: y || 0, w: d.w, h: d.h, hx0: d.hit[0] + OBS_TRIM, hx1: d.hit[1] - OBS_TRIM, ht: d.hit[2] - OBS_TRIM, alive: true };
    G.obs.push(o);
    return o;
  }
  function addPlat(type, x) {
    const d = A.PLAT[type];
    const o = { type: type, x: x, w: d.w, h: d.h, alive: true };
    G.plats.push(o);
    return o;
  }
  function addLight(x, y) { G.lights.push({ x: x, y: y, got: false, t: Math.random() * 6 }); }

  // Gerçek zıplama eğrisi üzerinde ışıklar: oyuncunun gövde ortası bu yoldan geçer.
  // kind 'single': basılı tutulan tek zıplama; 'double': tepeye yakın ikinci zıplama.
  const UP1 = PH.jumpV / PH.g1, H1 = PH.jumpV * PH.jumpV / (2 * PH.g1);
  function feetHeight(t, kind) {
    if (kind === 'double') {
      const t1 = 0.3, h1 = PH.jumpV * t1 - 0.5 * PH.g1 * t1 * t1;
      if (t <= t1) return PH.jumpV * t - 0.5 * PH.g1 * t * t;
      const t2 = PH.djumpV / PH.g1, h2 = h1 + PH.djumpV * PH.djumpV / (2 * PH.g1);
      const u = t - t1;
      if (u <= t2) return h1 + PH.djumpV * u - 0.5 * PH.g1 * u * u;
      const f = u - t2;
      return Math.max(0, h2 - 0.5 * PH.g2 * f * f);
    }
    if (t <= UP1) return PH.jumpV * t - 0.5 * PH.g1 * t * t;
    const f = t - UP1;
    return Math.max(0, H1 - 0.5 * PH.g2 * f * f);
  }
  function airTime(kind) {
    if (kind === 'double') { const t1 = 0.3, h1 = PH.jumpV * t1 - 0.5 * PH.g1 * t1 * t1, h2 = h1 + PH.djumpV * PH.djumpV / (2 * PH.g1); return t1 + PH.djumpV / PH.g1 + Math.sqrt(2 * h2 / PH.g2); }
    return UP1 + Math.sqrt(2 * H1 / PH.g2);
  }
  function apexTime(kind) { return kind === 'double' ? 0.3 + PH.djumpV / PH.g1 : UP1; }
  function jumpLights(xApex, n, kind, v) {
    const T = airTime(kind), ta = apexTime(kind);
    const x0 = xApex - v * ta;
    for (let i = 0; i < n; i++) {
      const t = U.lerp(0.12, T - 0.08, n === 1 ? 0.5 : i / (n - 1));
      addLight(x0 + v * t, -(feetHeight(t, kind) + 44));
    }
  }
  G.jumpLights = jumpLights;

  // Işık dizilimleri: yalnızca zıplama yayı değil; düz sıra, dalga, zikzak, sütunlar, elmas,
  // yıldız, çift sıra, merdiven ve "taç" (yalnızca çift zıplamayla ulaşılan yüksek ışıklar).
  // Yerden koşarken -114'e kadar olan ışıklar toplanır; daha yukarıdakiler zıplama ister.
  // Dönüş: dizilimin genişliği.
  const SHAPES = ['line', 'wave', 'zigzag', 'columns', 'diamond', 'star', 'rows', 'stairs', 'arc'];
  function lightShape(x, kind, r, v) {
    const L = (dx, y) => addLight(x + dx, y);
    if (kind === 'line') { const n = 6 + r.int(0, 2); for (let i = 0; i < n; i++) L(i * 44, -50); return (n - 1) * 44; }
    if (kind === 'wave') { const n = 10; for (let i = 0; i < n; i++) L(i * 42, -78 - 34 * Math.sin((i / (n - 1)) * Math.PI * 3)); return (n - 1) * 42; }
    if (kind === 'zigzag') { const n = 8; for (let i = 0; i < n; i++) L(i * 50, i % 2 ? -132 : -46); return (n - 1) * 50; }
    if (kind === 'columns') {
      const gap = U.clamp(0.42 * v, 180, 320), n = 3;
      for (let c = 0; c < n; c++) for (let i = 0; i < 4; i++) L(c * gap, -44 - i * 40);
      return (n - 1) * gap;
    }
    if (kind === 'diamond') { [[0, -70], [40, -110], [80, -150], [120, -110], [160, -70], [80, -110], [80, -70]].forEach((q) => L(q[0], q[1])); return 160; }
    if (kind === 'star') {
      // beş köşeli yıldız: tepe yukarıda, bir zıplayışta içinden geçilir
      const cx = 72, cy = -126, R1 = 72, R2 = 30;
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R2 : R1; L(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      return 144;
    }
    if (kind === 'rows') { for (let i = 0; i < 5; i++) { L(i * 52, -46); L(26 + i * 52, -150); } return 4 * 52 + 26; }
    if (kind === 'stairs') { for (let i = 0; i < 5; i++) L(i * 40, -46 - i * 30); for (let i = 1; i < 5; i++) L(160 + i * 40, -166 + i * 30); return 320; }
    if (kind === 'crown') {
      // çift zıplama ödülü: yayın yalnızca tepesi (tek zıplamanın ulaşamadığı yükseklik)
      const T = airTime('double'), ta = apexTime('double'), x0 = -v * ta;
      for (let i = 0; i < 9; i++) { const t = U.lerp(0.1, T - 0.1, i / 8); const h = feetHeight(t, 'double'); if (h > 150) L(x0 + v * t + v * ta, -(h + 44)); }
      return 0;
    }
    for (let i = 0; i < 6; i++) L(i * 46, -40 - Math.sin((i / 5) * Math.PI) * 36);
    return 5 * 46;
  }
  G.lightShape = lightShape; G.LIGHT_SHAPES = SHAPES;
  // bir engelin önüne ve arkasına kısa ışık sütunları (yay yerine)
  function obsColumns(o, v) {
    const d = U.clamp(0.26 * v, 90, 150);
    for (let i = 0; i < 3; i++) { addLight(o.x - d, -44 - i * 40); addLight(o.x + o.w + d, -44 - i * 40); }
  }

  const rngGen = U.rng(Date.now() & 0xffff);
  G.spawnPattern = function () {
    if (G.tut && !G.tut.done) { tutSpawn(); return; }
    const x0 = G.genX;
    // okuma molası: bölgenin içindeysek bölgenin sonuna atla
    let z = calmZoneAt(x0, x0 + 1);
    if (z) { G.genX = z[1]; G.segStartX = Math.max(G.segStartX, z[1]); return; }
    if (G.noObstacles) { G.genX = x0 + 0.8 * G.speed; return; }
    const nO = G.obs.length, nP = G.plats.length, nL = G.lights.length, nS = G.segs.length, lastX1 = G.segs[nS - 1].x1;
    makePattern();
    // desen bir mola bölgesine taşıyorsa geri al, üretimi bölgenin sonundan sürdür
    z = calmZoneAt(x0, Math.max(G.genX - 0.5 * G.speed, x0 + 1));
    if (z) {
      G.obs.length = nO; G.plats.length = nP; G.lights.length = nL; G.segs.length = nS; G.segs[nS - 1].x1 = lastX1;
      // yer varsa moladan önce tek, basit bir engel kalsın (uzun boşluk olmasın)
      if (z[0] - x0 > 1.8 * G.speed) {
        const o = addObs(pickObs(rngGen), x0);
        if (o.x + o.w + 0.7 * G.speed > z[0]) G.obs.length = nO;
      }
      G.genX = z[1]; G.segStartX = Math.max(G.segStartX, z[1]);
    }
  };
  function makePattern() {
    const r = rngGen;
    const d = G.difficulty();
    const dn = d / 0.85;
    const v = G.speed;
    const J = 0.69 * v;
    let x = G.genX;
    const tau = G.segTime(x);
    const era = IZ.ERAS[G.story.eraIdx];
    // Çift zıplama gerektiren/ödüllendiren desenler seyrektir (kule, geniş çukur, taç);
    // kule ve geniş çukur yalnızca koşarken çıkar.
    const running = v > 300;
    const weights = {
      single: 4, double: 0.6 + 1.6 * d, tall: d > 0.2 ? 0.4 + 1.2 * d : 0, pit: 0.9 + 1.2 * d, pitObs: d > 0.4 ? d : 0,
      plat: 1.2, lights: tau < 6 ? 2.5 : 0.9, combo: d > 0.55 ? 1.2 * d : 0,
      triple: d > 0.3 ? 0.4 + 0.8 * d : 0, steps: d > 0.35 ? 0.3 + 0.6 * d : 0,
      tower: d > 0.3 && running ? 0.15 + 0.4 * d : 0, widePit: d > 0.4 && running ? 0.1 + 0.35 * d : 0, crown: d > 0.25 ? 0.5 : 0,
    };
    if (G.lastPattern === 'plat') weights.plat = 0.2;
    if (G.lastPattern === 'tower' || G.lastPattern === 'widePit') { weights.tower = 0; weights.widePit = 0; }
    if (G.attract) { weights.combo = 0; weights.tall = 0.4; weights.widePit = 0; }
    const kind = r.weighted(weights);
    G.lastPattern = kind;
    let len = 0;
    if (kind === 'single') {
      const o = addObs(pickObs(r), x);
      const k = r();
      if (k < 0.45) jumpLights(x + o.w / 2, 5, 'single', v);
      else if (k < 0.7) obsColumns(o, v);
      len = o.w;
    } else if (kind === 'double') {
      const a = addObs(pickObs(r), x);
      const gap = J * U.lerp(1.4, 1.05, dn) + r() * J * 0.2;
      const b = addObs(pickObs(r), x + a.w + gap);
      len = a.w + gap + b.w;
      const k = r();
      if (k < 0.35) for (let i = 0; i < 3; i++) addLight(x + a.w + gap * (0.3 + i * 0.2), -48);
      else if (k < 0.6) { jumpLights(x + a.w / 2, 4, 'single', v); jumpLights(b.x + b.w / 2, 4, 'single', v); }
    } else if (kind === 'triple') {
      // ritim: eşit aralıklı üç engel
      const gap = J * U.lerp(1.35, 1.1, dn);
      let cx = x;
      for (let i = 0; i < 3; i++) { const o = addObs(pickObs(r), cx); cx = o.x + o.w + gap; if (i < 2) addLight(o.x + o.w + gap * 0.5, -48); }
      len = cx - gap - x;
    } else if (kind === 'steps') {
      // basamak: küçük engel + hemen ardından yüksek engel; üstlerine basılarak da geçilir
      const a = addObs(pickSmall(r), x);
      const b = addObs(era.tall || 'crates', x + a.w + 6);
      addLight(a.x + a.w / 2, -a.h - 44); addLight(b.x + b.w / 2, -b.h - 44); addLight(b.x + b.w + 60, -b.h - 20);
      len = b.x + b.w - x;
    } else if (kind === 'tall') {
      // döneme özgü yüksek engel (tam zıplama ya da çift zıplama)
      const o = addObs(era.tall || 'crates', x);
      jumpLights(x + o.w / 2, 6, 'double', v);
      len = o.w;
    } else if (kind === 'tower') {
      // döneme özgü kule: tek zıplamayla aşılmaz, çift zıplama ister (eğitimdeki gibi)
      const o = addObs(era.tower || 'tower', x);
      jumpLights(x + o.w / 2, 7, 'double', v);
      len = o.w;
    } else if (kind === 'widePit') {
      // geniş çukur: dokunarak zıplamak yetmez; basılı tutarak tam zıplama tam sınırda geçer,
      // çift zıplama rahatça geçer (ışıklar çift zıplama yolunu gösterir)
      const w = Math.round(U.clamp(v * U.lerp(0.58, 0.66, r()) + 14, 200, 520));
      addPit(x, x + w);
      jumpLights(x + w / 2, 7, 'double', v);
      len = w;
    } else if (kind === 'crown') {
      lightShape(x + 0.65 * v, 'crown', r, v);
      len = 0.9 * v;
    } else if (kind === 'pit' || kind === 'pitObs') {
      const w = U.clamp(J * U.lerp(0.26, 0.44, dn) + r() * 24, 80, 240);
      addPit(x, x + w);
      jumpLights(x + w / 2, 5, 'single', v);
      len = w;
      if (kind === 'pitObs') { const gap = J * U.lerp(1.1, 0.9, dn); const o = addObs(pickObs(r), x + w + gap); len += gap + o.w; }
    } else if (kind === 'plat') {
      const types = IZ.ERAS[G.story.eraIdx].plat;
      const t = r.pick(types);
      const pl = addPlat(t, x);
      len = pl.w;
      if (r() < 0.5) for (let i = 0; i < 4; i++) addLight(x + 40 + i * (pl.w - 80) / 3, -pl.h - 44);
      else { const n = 6; for (let i = 0; i < n; i++) addLight(x + 36 + i * (pl.w - 72) / (n - 1), -pl.h - 56 - 22 * Math.sin((i / (n - 1)) * Math.PI * 2)); }
      if (d > 0.4 && r() < 0.4) { const o = addObs(pickSmall(r), x + pl.w * 0.5, -pl.h); len = Math.max(len, o.x + o.w - x); }
      // platformdan inişten sonra yeniden zıplamaya yetecek pay bırakılır
      if (d > 0.3 && r() < 0.4) { const g0 = x + pl.w + J * 0.9; const w = U.clamp(J * 0.4, 90, 210); addPit(g0, g0 + w); len = g0 + w - x; }
    } else if (kind === 'lights') {
      const shape = r.pick(SHAPES);
      len = lightShape(x, shape, r, v);
    } else if (kind === 'combo') {
      const a = addObs(pickObs(r), x);
      if (r() < 0.5) {
        const gap = J * U.lerp(0.62, 0.48, dn);
        const b = addObs(pickObs(r), x + a.w + gap);
        len = a.w + gap + b.w;
        jumpLights(x + len / 2, 6, 'double', v);
      } else {
        const g0 = x + a.w + J * 1.0;
        const w = U.clamp(J * 0.4, 90, 230);
        addPit(g0, g0 + w);
        len = g0 + w - x;
      }
    }
    const spacing = v * U.lerp(1.75, 1.1, dn) + r() * v * U.lerp(0.9, 0.5, dn);
    G.genX = x + len + spacing;
  }

  // ------------------------------------------------------------- başlangıç eğitimi
  // Sırayla: tek zıplama, çift zıplama, basılı tutarak uzun zıplama, ışık toplama.
  // Her adımda doğru anda zaman neredeyse durur ve yönerge çıkar; oyuncu dokununca devam eder.
  function tutSpawn() {
    const T = G.tut, v = G.speed, J = 0.69 * v;
    const x = G.genX;
    if (T.step === 0) {
      const o = addObs('crate', x); o.tut = 'jump';
      G.genX = x + o.w + v * 2.6;
    } else if (T.step === 1) {
      const o = addObs('tower', x); o.tut = 'double';
      jumpLights(x + o.w / 2, 6, 'double', v);
      G.genX = x + o.w + v * 2.8;
    } else if (T.step === 2) {
      const w = Math.round(J * 0.66);
      T.pit = addPit(x, x + w);
      jumpLights(x + w / 2, 5, 'single', v);
      G.genX = x + w + v * 2.6;
    } else if (T.step === 3) {
      T.lightsX = x;
      for (let i = 0; i < 7; i++) addLight(x + i * 46, -40 - Math.sin(i / 6 * Math.PI) * 36);
      const o = addObs('rock', x + 7 * 46 + v * 1.2);
      jumpLights(o.x + o.w / 2, 5, 'single', v);
      G.genX = o.x + o.w + v * 2.2;
    } else {
      T.endX = x;
      G.genX = x + v * 1.5;
      T.done = true; // bundan sonrası normal üretim
    }
    T.step++;
  }

  function tutFreeze(id) {
    const T = G.tut;
    if (T.shown[id]) return;
    T.shown[id] = true;
    T.wait = id;
    G.emit('tut', id, true);
  }
  function tutInfo(id) {
    const T = G.tut;
    if (T.shown[id]) return;
    T.shown[id] = true;
    G.emit('tut', id, false);
  }
  function tutResume() {
    const T = G.tut;
    T.wait = null;
    G.timeScale = Math.max(G.timeScale, 0.5);
    G.emit('tutGo');
  }
  function tutUpdate() {
    const T = G.tut, p = G.player, v = G.speed;
    if (T.wait) return;
    // ilk engel: tek zıplama
    G.obs.forEach((o) => {
      if (!o.alive || !o.tut) return;
      const dc = o.x + o.w / 2 - p.x;
      if (o.tut === 'jump' && p.ground && dc < (UP1 + 0.09) * v && dc > 0) tutFreeze('jump');
      if (o.tut === 'double') {
        if (!T.shown.double1 && p.ground && dc < (apexTime('double') + 0.09) * v && dc > 0) tutFreeze('double1');
        // ikinci dokunuş: ilk zıplamanın tepesine yakın (oyuncu kendisi erken zıpladıysa da gösterilir)
        else if (!T.shown.double2 && !p.ground && p.jumps === 1 && p.vy > -340 && dc > -10 && dc < v * 1.2) tutFreeze('double2');
      }
    });
    if (T.pit && !T.shown.hold && p.ground && T.pit.x0 - p.x < 30 + 0.06 * v && T.pit.x0 - p.x > -10) tutFreeze('hold');
    if (T.lightsX && !T.shown.lights && T.lightsX - p.x < G.viewW * 0.55) tutInfo('lights');
    if (p.x > T.endX && !T.finished) {
      T.finished = true;
      tutInfo('ready');
      G.emit('tutEnd');
      G.tut = null;
      startStory(6);
    }
  }
  G.skipTutorial = function () {
    const T = G.tut;
    if (!T) return;
    G.tut = null;
    // eğitim engellerini, ışıklarını ve çukurunu kaldır; normal üretime geç
    const p = G.player;
    G.obs = G.obs.filter((o) => !o.tut && o.x < p.x);
    G.lights = G.lights.filter((l) => l.x < p.x);
    if (T.pit && T.pit.x1 > p.x - 40) {
      for (let i = 0; i < G.segs.length - 1; i++) {
        if (G.segs[i].x1 === T.pit.x0 && G.segs[i + 1].x0 === T.pit.x1) { G.segs[i].x1 = G.segs[i + 1].x1; G.segs.splice(i + 1, 1); break; }
      }
      // çukura düşmekteyken geçildiyse oyuncu kapanan zeminin üstüne alınır (can kaybı olmasın)
      if (p.y > 0) { p.y = 0; p.vy = 0; p.ground = true; p.jumps = 0; p.fallen = false; }
    }
    G.genX = p.x + G.viewW * 0.8;
    G.timeScale = Math.max(G.timeScale, 0.5);
    G.emit('tutEnd', true);
    startStory(6);
  };

  // ------------------------------------------------------------- tarih çizelgesi
  G.scheduleStory = function () {
    const S = G.story;
    if (S.hold) return;
    // uzak katmanın önceden üretilen parçaları da doğru dekoru seçebilsin diye olaylar epey önceden planlanır
    const LOOK = Math.max(tabLook() + 2 * G.speed, (0.5 * G.viewW + 1.25 * A.CHUNK) / A.LAYERS.far.p + 2 * G.speed);
    let guard = 0;
    const needMore = () => S.lastF === null || S.lastF < G.camX + LOOK || S.lastF <= G.camX;
    while (needMore() && S.next < IZ.EVENTS.length && guard++ < 8) {
      const ev = IZ.EVENTS[S.next];
      const def = IZ.SCENES[ev.s] || IZ.SCENES.generic;
      const W = def.w || 1200;
      let F, T;
      if (S.lastF === null) { F = S.firstF; T = S.firstT; }
      else {
        const prev = S.queue[S.queue.length - 1] || { ev: IZ.EVENTS[S.next - 1], W: W, tm: S.lastT };
        let sec = Math.max(G.MIN_GAP, (ev.dec - prev.ev.dec) * G.SEC_PER_YEAR);
        // (it.T sahne panosudur; olayın planlanan koşu zamanı it.tm'dedir)
        const T0 = typeof prev.tm === 'number' ? prev.tm : typeof S.lastT === 'number' ? S.lastT : G.runT;
        // iki sahne panosu ekranda üst üste binmesin: panolar dünyayla birlikte (paralaksla) kaydığı için
        // aralarında en az (genişlikler/2 + pay) / paralaks kadar yol olmalı (yürürken de)
        const needD = (prev.W / 2 + W / 2 + 90) / G.TAB_P.main;
        for (let k = 0; k < 40 && G.distFor(sec, T0) < needD; k++) sec += 0.5;
        T = T0 + sec;
        F = S.lastF + G.distFor(sec, T0);
      }
      // olayın 'nominal hızı': okuma molası, yazının durgunluğu, dekor sınırları ve yas yürüyüşü bu sabit
      // değere göre hesaplanır; oyuncu yavaşlayıp hızlansa da hiçbir şey ekranda kaymaz
      const vNom = Math.max(300, G.baseSpeed(T));
      const item = { i: S.next, ev: ev, W: W, F: F, tm: T, vNom: vNom, state: 'pending', calm: calmFor(F, T) };
      S.queue.push(item);
      G.buildQueue.push(item);
      S.points.push({ x: F, dec: ev.dec });
      S.lastF = F; S.lastT = T;
      S.next++;
    }
  };

  // Sahne inşa kuyruğu: her çağrıda en fazla bir adım; yalnızca yaklaşan sahneler
  G.buildStep = function (dens, force) {
    const q = G.buildQueue;
    for (let i = q.length - 1; i >= 0; i--) if (q[i].state === 'ready' || q[i].state === 'dead') q.splice(i, 1);
    if (!q.length) return false;
    let it = q[0];
    for (let i = 1; i < q.length; i++) if (q[i].F < it.F) it = q[i];
    const LOOK = tabLook();
    if (!force && it.state === 'pending' && it.F - G.camX > LOOK) return false;
    if (it.state === 'pending') {
      IZ.deferFinish = true;
      it.T = IZ.buildTableau(it.ev, dens);
      IZ.deferFinish = false;
      it.state = 'drawn';
      if (force) { it.T.finish(); it.state = 'ready'; }
    } else if (it.state === 'drawn') {
      it.T.bloom();
      it.state = 'bloomed';
      if (force) { it.T.finish(); it.state = 'ready'; }
    } else if (it.state === 'bloomed') {
      it.T.finish();
      it.state = 'ready';
    }
    return true;
  };
  // Bir sahneyi hemen tamamla (görünür olmak üzereyse ya da koşu başında)
  G.buildNow = function (it, dens) {
    if (it.state === 'ready' || it.state === 'dead') return;
    if (it.state === 'pending' || !it.T) { IZ.deferFinish = true; it.T = IZ.buildTableau(it.ev, dens); IZ.deferFinish = false; }
    it.T.finish(); it.state = 'ready';
  };
  G.buildAll = function (dens) {
    const LOOK = tabLook();
    G.buildQueue.forEach((it) => { if (it.F - G.camX <= LOOK) G.buildNow(it, dens); });
  };

  function onNewEvent(item) {
    const ev = item.ev;
    G.story.curEv = ev;
    G.score.events++;
    const fx = ev.fx || [];
    if (fx.indexOf('shake') >= 0) { G.fx.shake = 1; }
    if (fx.indexOf('slow') >= 0) { G.fx.slowT = 4.2; }
    G.emit('event', ev, item);
  }

  // Dünya x'inden ondalık yıla (ve tersine): olay noktaları arasında doğrusal
  G.yearAtX = function (x) {
    const S = G.story, pts = S.points;
    if (!pts.length) return S.year;
    if (x <= pts[0].x) return pts[0].dec;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (x < b.x) return U.lerp(a.dec, b.dec, (x - a.x) / Math.max(1, b.x - a.x));
    }
    const last = pts[pts.length - 1];
    if (S.next >= IZ.EVENTS.length) return last.dec + (x - last.x) / (G.SEC_PER_YEAR * Math.max(200, G.speed));
    return last.dec;
  };
  G.xAtYear = function (y) {
    const S = G.story, pts = S.points;
    if (!pts.length || y < pts[0].dec) return null;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (y >= a.dec && y < b.dec) return U.lerp(a.x, b.x, (y - a.dec) / Math.max(1e-6, b.dec - a.dec));
    }
    const last = pts[pts.length - 1];
    if (S.next >= IZ.EVENTS.length && y >= last.dec) return last.x + (y - last.dec) * G.SEC_PER_YEAR * Math.max(200, G.speed);
    return null;
  };

  G.updateStory = function (dt) {
    const S = G.story;
    if (S.hold) return;
    G.scheduleStory();
    const L = G.eventLead();
    let cur = -1;
    for (let k = 0; k < S.queue.length; k++) if (G.camX >= S.queue[k].F - L) cur = k;
    if (cur !== S.cur && cur >= 0) {
      const changed = !S.queue[cur].shown;
      S.cur = cur;
      if (changed) { S.queue[cur].shown = true; onNewEvent(S.queue[cur]); }
    }
    // yıl: olaylar arasında doğrusal; son olaydan sonra gelecek yıllar akar
    const last = S.queue[S.queue.length - 1];
    if (last && last.ev.final && G.camX >= last.F) { S.finalPassed = true; S.futureT += dt; S.year = last.ev.dec + S.futureT / G.SEC_PER_YEAR; }
    else S.year = G.yearAtX(G.camX);
    const era = IZ.eraIndex(S.year);
    if (era !== S.eraIdx) { S.eraIdx = era; G.emit('era', era); }
    if (G.char.setYear(S.year) && !G.attract) G.emit('outfit');
    // geride kalan sahneleri bırak (yıl çizgisinde bir önceki nokta korunur)
    while (S.queue.length > 1) {
      const it = S.queue[0];
      const gone = G.tabLeft(it, 'back') + it.W < -80 && G.tabLeft(it, 'main') + it.W < -80 && G.camX > it.F + (0.5 * G.viewW + 800) / 0.3 + 1.9 * (it.vNom || 400);
      if (gone && S.cur > 0) { it.state = 'dead'; it.T = null; it.text = null; S.queue.shift(); S.cur--; }
      else break;
    }
    while (S.points.length > 3 && S.points[1].x < G.camX - 40000) S.points.shift();
  };

  G.displayYear = function () { return Math.floor(G.story.year); };

  // ------------------------------------------------------------- sahne panolarının kayışı
  // Olay sahneleri (panolar) dünyaya bağlıdır: orta şerit (0,22) ile yakın şerit (0,7) arasında sabit
  // bir paralaksla kayarlar. Böylece oyuncu yavaşlasa (yas yürüyüşü) ya da hızlansa da sahne zemine
  // göre hiç kaymaz; koşarken ekranda ~15–25 sn kalır, yürürken daha da uzun. Sahnenin arka ve ön
  // katmanı aynı hızla kayar: mekân tek parça durur (arka plandaki yapılar öndekilerin üstünde kaymaz).
  G.TAB_P = { back: 0.265, main: 0.265 };
  G.tabX = function (it, layer) { return G.TAB_P[layer === 'back' ? 'back' : 'main'] * (it.F - G.camX); };
  G.tabLeft = function (it, layer) { return 0.55 * G.viewW + G.tabX(it, layer) - it.W / 2; };

  // ------------------------------------------------------------- arka plan dekoru
  // Kameranın bir x konumunda hangi dekor ve hangi yıl çizilir? Olayın sahnesi ekrana girmeden
  // ~BG_PRE sn önce olayın yerine ait dekor başlar, ~BG_POST sn sürer. Olaylar arasındaki uzun
  // yollarda "yolculuk" dekorları (kırsal, kent, kıyı, sanayi) dönemine göre ağırlıklı seçilir.
  G.BG_PRE = 14; G.BG_POST = 32;
  function journeyBg(year, i, avoid) {
    if (year >= 2026.85) return 'gelecek';
    const w = year < 1950 ? { kirsal: 5, kent: 3, sahil: 1, sanayi: 1.2 } : year < 1980 ? { kirsal: 3, kent: 4, sahil: 1.5, sanayi: 1.5 } : { kirsal: 2.2, kent: 4.5, sahil: 1.6, sanayi: 1.4 };
    if (avoid && w[avoid]) w[avoid] *= 0.2;
    return U.rng(i * 7919 + 101).weighted(w);
  }
  G.bgAt = function (cx) {
    const year = G.yearAtX(cx);
    if (G.bgForce) return { s: G.bgForce, y: G.bgForceYear || year };
    if (year >= 2026.85) return { s: 'gelecek', y: year };
    if (G.tut) return { s: 'kirsal', y: year };
    const S = G.story, q = S.queue;
    let cur = null;
    for (let i = 0; i < q.length; i++) if (cx >= q[i].F - G.BG_PRE * (q[i].vNom || 400)) cur = q[i];
    if (!cur) {
      // kuyruktaki ilk olaydan önce: koşu yeni başladıysa ilk olayın dekoru, değilse yolculuk
      if (!S.curEv && q.length) return { s: IZ.bgOf(q[0].ev), y: year };
      return { s: journeyBg(year, q.length ? q[0].i - 1 : S.startIdx, S.curEv ? IZ.bgOf(S.curEv) : null), y: year };
    }
    if (cx <= cur.F + G.BG_POST * (cur.vNom || 400)) return { s: IZ.bgOf(cur.ev), y: year };
    return { s: journeyBg(year, cur.i, IZ.bgOf(cur.ev)), y: year };
  };

  // ------------------------------------------------------------- otomatik pilot
  function autopilot() {
    const p = G.player, v = G.speed;
    const front = p.x + HIT_W / 2;
    let best = null;
    G.obs.forEach((o) => { if (!o.alive) return; const L = o.x + o.hx0 - front; if (L > -10 && L < 700 && (!best || L < best.L)) best = { L: L, w: o.hx1 - o.hx0, h: o.ht + (o.y < 0 ? -o.y : 0), k: 'o' }; });
    G.plats.forEach((pl) => { const L = pl.x - front; if (L > -10 && L < 700 && (!best || L < best.L)) best = { L: L, w: pl.w, h: pl.h, k: 'p' }; });
    for (let i = 0; i < G.segs.length - 1; i++) { const s = G.segs[i]; const L = s.x1 - front; if (L > -30 && L < 700 && (!best || L < best.L)) best = { L: L, w: G.segs[i + 1].x0 - s.x1, h: 0, k: 'g' }; }
    if (!best) return;
    if (p.ground) {
      let trig;
      if (best.k === 'g') trig = 26;
      else if (best.k === 'p') trig = v * 0.22;
      else trig = Math.max(14, v * 0.34 - best.w / 2 - (best.h > 90 ? 40 : 0));
      if (best.L < trig) { p.buffer = PH.buffer; p.holding = true; }
    } else {
      p.holding = true;
      if (p.jumps === 1 && p.vy > -80 && ((best.h > 95 && best.L < 120) || (best.k === 'g' && p.y > -40 && best.L < 0))) p.buffer = PH.buffer;
    }
  }

  // ------------------------------------------------------------- güncelle
  G.update = function (dt) {
    G.t += dt;
    if (G.mode !== 'play' && G.mode !== 'menu' && G.mode !== 'dying') return;
    const p = G.player;
    if (G.tut && G.mode === 'play') tutUpdate();
    // efektler ve zaman ölçeği (eğitimde yönerge beklerken zaman neredeyse durur)
    if (G.fx.slowT > 0) G.fx.slowT -= dt;
    let targetTS = G.mode === 'dying' ? 0.3 : (G.fx.slowT > 0 ? 0.74 : 1);
    if (G.tut && G.tut.wait) targetTS = 0.035;
    G.timeScale = U.damp(G.timeScale, targetTS, G.mode === 'dying' ? 6 : (G.tut ? (G.tut.wait ? 16 : 6) : 3), dt);
    const sdt = dt * G.timeScale;
    G.fx.shake = Math.max(0, G.fx.shake - dt / 3.2);
    G.fx.flash = Math.max(0, G.fx.flash - dt * 2.5);
    G.fx.hit = Math.max(0, G.fx.hit - dt * 1.8);

    if (G.mode !== 'dying') G.runT += sdt;
    const base = G.baseSpeed(G.runT);
    const hurtSlow = p.slowT > 0 ? 0.72 : 1;
    if (p.slowT > 0) p.slowT -= sdt;
    const mt = G.attract || G.mode !== 'play' ? 0 : mournTarget();
    G.mournK = U.damp(G.mournK, mt, mt ? 2.2 : 1.5, sdt);
    if (G.mournK < 0.002 && !mt) G.mournK = 0;
    G.speed = G.mode === 'dying' ? U.damp(G.speed, 0, 3, dt) : U.lerp(base, Math.min(base, G.MOURN_SPEED), G.mournK) * hurtSlow;

    if (G.attract) autopilot();
    if (IZ.debugAuto && G.mode === 'play') {
      autopilot();
      if (G.tut && G.tut.wait) tutResume();
    }

    // sabit adımlı fizik
    let acc = sdt;
    const h = 1 / 120;
    while (acc > 1e-6) {
      const st = Math.min(h, acc);
      stepPhysics(st);
      acc -= st;
    }

    // kamera
    G.camX = p.x - G.viewW * G.lead();

    // üretim
    for (let guard = 0; G.genX < G.camX + G.viewW + 900 && guard < 60; guard++) G.spawnPattern();
    // temizlik
    const cut = G.camX - 600;
    G.obs = G.obs.filter((o) => o.x + o.w > cut && o.alive);
    G.plats = G.plats.filter((o) => o.x + o.w > cut);
    G.lights = G.lights.filter((l) => l.x > cut && !l.gone);
    while (G.segs.length > 2 && G.segs[0].x1 < cut - 2000) G.segs.shift();

    G.updateStory(sdt);

    // parçacıklar
    for (let i = G.parts.length - 1; i >= 0; i--) {
      const q = G.parts[i];
      q.life -= sdt;
      if (q.life <= 0) { G.parts.splice(i, 1); continue; }
      q.vy += (q.g || 0) * sdt;
      q.x += q.vx * sdt; q.y += q.vy * sdt;
      if (q.drag) { q.vx *= 1 - q.drag * sdt; q.vy *= 1 - q.drag * sdt; }
    }
    // ışıklar
    G.lights.forEach((l) => { l.t += dt; if (l.got) { l.gt = (l.gt || 0) + dt; if (l.gt > 0.5) l.gone = true; } });

    // karakter
    G.char.update(sdt, { speed: G.mode === 'dying' ? G.speed * 0.3 : G.speed, ground: p.ground, vy: p.vy, idle: false, hurt: p.hurtT > 0, dead: !p.alive, mourn: G.mournK });
    if (p.hurtT > 0) p.hurtT -= sdt;
    if (p.invT > 0) p.invT -= sdt;

    G.score.dist = Math.max(0, (p.x - G.score.startX) / 60);

    if (G.mode === 'dying') {
      p.deadT += dt;
      if (p.deadT > 1.9) { G.mode = 'over'; G.emit('over'); }
    }
  };

  function puff(x, y, n, o) {
    o = o || {};
    for (let i = 0; i < n; i++) {
      G.parts.push({
        x: x + (Math.random() - 0.5) * (o.spread || 20), y: y - Math.random() * 4,
        vx: (o.vx || 0) + (Math.random() - 0.5) * (o.sv || 120), vy: -(o.up || 40) - Math.random() * (o.su || 60),
        g: o.g === undefined ? 120 : o.g, drag: 2.5, life: U.lerp(0.35, 0.8, Math.random()), max: 0.8, size: U.lerp(4, 10, Math.random()) * (o.size || 1),
        kind: o.kind || 'dust',
      });
    }
  }
  G.puff = puff;

  function hurt(cause) {
    const p = G.player;
    if (!p.alive || p.invT > 0 || G.god || G.attract || G.tut) return false;
    p.lives--;
    p.invT = 2.0; p.hurtT = 0.38; p.slowT = 0.5;
    G.fx.hit = 1; G.fx.shake = Math.max(G.fx.shake, 0.35);
    G.emit('hurt', p.lives, cause);
    if (p.lives <= 0) { p.alive = false; G.mode = 'dying'; p.deadT = 0; G.emit('dying'); }
    return true;
  }

  function collectLight(l) {
    const p = G.player;
    l.got = true;
    G.score.lights++;
    G.score.toLife++;
    G.emit('light', G.score.lights);
    for (let k = 0; k < 6; k++) G.parts.push({ x: l.x, y: l.y, vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200, g: 0, drag: 4, life: 0.5, max: 0.5, size: 3, kind: 'spark' });
    if (G.score.toLife >= G.LIGHTS_PER_LIFE) {
      if (p.lives < G.MAX_LIVES && p.alive && !G.attract) { G.score.toLife = 0; p.lives++; G.emit('life', p.lives); }
      else G.score.toLife = G.LIGHTS_PER_LIFE; // canlar doluyken bir can birikmiş olarak bekler
    }
  }

  function stepPhysics(h) {
    const p = G.player;
    const v = G.speed;
    const prevY = p.y;
    p.x += v * h;

    // zıplama tamponu. Zemin çizgisinin altına düşmüş (çukura girmiş) oyuncu artık zıplayamaz:
    // ne kenar payıyla ne de havada ikinci zıplamayla çukurdan çıkılır.
    const inPit = !p.ground && p.y > PIT_NOJUMP;
    if (inPit) p.buffer = 0;
    if (p.buffer > 0) {
      p.buffer -= h;
      if (p.alive && (p.ground || p.coyote > 0)) {
        p.vy = -PH.jumpV; p.ground = false; p.coyote = 0; p.buffer = 0; p.jumps = 1; p.jumpT = 0;
        puff(p.x - 6, p.y, 5, { sv: 80, up: 20, su: 40 });
        G.emit('jump', 1);
      } else if (p.alive && p.jumps < 2 && !p.ground) {
        p.vy = -PH.djumpV; p.jumps = 2; p.buffer = 0; p.jumpT = 0;
        G.char.jumpFlip();
        G.emit('jump', 2);
      }
    }
    if (p.coyote > 0) p.coyote -= h;

    if (!p.ground) {
      p.jumpT += h;
      const held = p.holding || G.attract || p.jumpT < PH.minHold;
      const g = p.vy < 0 ? (held ? PH.g1 : PH.g1 * PH.cut) : PH.g2;
      p.vy = Math.min(p.vy + g * h, PH.maxFall);
      p.y += p.vy * h;
    }

    // destek (zemin veya platform)
    const x0 = p.x - HIT_W / 2 + 5, x1 = p.x + HIT_W / 2 - 5;
    let support = null;
    if (G.groundAt(x0, x1)) support = 0;
    for (let i = 0; i < G.plats.length; i++) {
      const pl = G.plats[i];
      if (pl.x < x1 && pl.x + pl.w > x0) {
        const top = -pl.h;
        if (prevY <= top + 1 && p.y >= top - 0.5 && p.vy >= 0) support = support === null ? top : Math.min(support, top);
        else if (p.ground && Math.abs(p.y - top) < 1) support = top;
      }
    }
    // engellerin üstü de basılabilir: yukarıdan gelip üstüne inen oyuncu can kaybetmez,
    // engelin üzerinde koşup öbür ucundan iner (yandan çarpmak yine can götürür).
    // Ayakları engelin üst kenarının biraz altında kalsa bile (köşeyi sıyırma) üstüne çıkarılır.
    const ox0p = p.x - OBS_W / 2, ox1p = p.x + OBS_W / 2;
    let obsLand = null;
    for (let i = 0; i < G.obs.length; i++) {
      const o = G.obs[i];
      if (!o.alive || o.x + o.hx1 <= ox0p || o.x + o.hx0 >= ox1p) continue;
      const top = o.y - o.ht - OBS_TRIM;
      if (p.ground && Math.abs(p.y - top) < 1) support = support === null ? top : Math.min(support, top);
      else if (!p.ground && p.vy >= 0 && prevY <= top + LAND_TOL && p.y >= top - 0.5) obsLand = obsLand === null ? top : Math.min(obsLand, top);
    }
    if (p.ground) {
      if (support === null || Math.abs(support - p.y) > 2) {
        if (support !== null && support < p.y - 2) { /* yükseltiye çarpma: yan çarpışma aşağıda */ }
        else { p.ground = false; p.coyote = PH.coyote; p.jumps = Math.max(p.jumps, 0); }
      }
    } else if (obsLand !== null || (support !== null && p.vy >= 0 && prevY <= support + 1 && p.y >= support - 0.5)) {
      const impact = p.vy;
      p.y = obsLand !== null ? obsLand : support; p.vy = 0; p.ground = true; p.jumps = 0;
      G.char.land(impact);
      if (impact > 300) { puff(p.x, p.y, Math.round(U.clamp(impact / 120, 3, 10)), { sv: 160, up: 30, su: 50 }); G.emit('land', impact); }
    }

    if (!p.alive) return;

    // engel çarpışması (affedici kutu)
    const px0 = p.x - OBS_W / 2, px1 = p.x + OBS_W / 2, py0 = p.y - HIT_H, py1 = p.y;
    for (let i = 0; i < G.obs.length; i++) {
      const o = G.obs[i];
      if (!o.alive) continue;
      const ox0 = o.x + o.hx0, ox1 = o.x + o.hx1, oy0 = o.y - o.ht, oy1 = o.y;
      if (px1 > ox0 && px0 < ox1 && py1 > oy0 + OBS_FOOT && py0 < oy1) {
        if (hurt('obs')) {
          o.alive = false;
          puff(o.x + o.w / 2, o.y - o.h / 2, 16, { sv: 320, up: 120, su: 160, g: 900, kind: 'debris', size: 0.8 });
          G.emit('break', o);
        } else if (G.attract || G.god || G.tut) {
          o.alive = false;
          puff(o.x + o.w / 2, o.y - o.h / 2, 10, { sv: 240, up: 100, su: 120, g: 900, kind: 'debris', size: 0.7 });
        }
      }
    }
    // platform yan çarpışması
    for (let i = 0; i < G.plats.length; i++) {
      const pl = G.plats[i];
      const top = -pl.h;
      if (px1 > pl.x + 2 && px0 < pl.x + pl.w && py1 > top + 12 && py0 < 0) {
        hurt('plat');
        p.y = top; p.vy = 0; p.ground = true; p.jumps = 0;
        puff(p.x, p.y, 8, { sv: 160 });
      }
    }
    // ışıklar: gövde boyunca (kapsül) toplanır
    for (let i = 0; i < G.lights.length; i++) {
      const l = G.lights[i];
      if (l.got) continue;
      const dx = l.x - p.x;
      if (dx > 40 || dx < -40) continue;
      const cy = U.clamp(l.y, p.y - 78, p.y - 12), dy = l.y - cy;
      if (dx * dx + dy * dy < 36 * 36) collectLight(l);
    }
    // çukura düşme
    if (p.y > 40 && !p.ground && !p.fallen) { p.fallen = true; G.emit('fall'); }
    if (p.y > 340) {
      p.fallen = false;
      const died = hurt('pit');
      if (G.god || G.attract || G.tut || p.alive) {
        const s = G.segAfter(p.x - 30);
        p.x = Math.max(p.x, s.x0 + 50);
        p.y = -240; p.vy = 0; p.ground = false; p.jumps = 1;
        G.obs.forEach((o) => { if (o.x > p.x - 120 && o.x < p.x + 520 && !o.tut) o.alive = false; });
        G.plats = G.plats.filter((pl) => !(pl.x + pl.w > p.x - 100 && pl.x < p.x + 520));
        G.fx.flash = 0.6;
        G.emit('respawn');
      } else if (died) {
        p.y = 340;
      }
    }
  }
})();
