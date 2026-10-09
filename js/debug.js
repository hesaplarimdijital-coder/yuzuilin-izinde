/* =========================================================================
   Yüzyılın İzinde — test (debug) sürümü
   index.html?debug=1 ya da debug.html ile açılır.
   - Engel, çukur ve platform yoktur (istenirse açılabilir); karakter ölümsüzdür.
   - Zaman 1×–32× hızlandırılabilir; "Sonraki olay" bir sonraki olaya kadar hızla sarar.
   - Listeden herhangi bir olaya atlanır; bütün dönemler menüde açıktır.
   - Bilgi satırı: yıl, olay, dönem, arka plan dekorları (uzak/orta/yakın), hız, FPS.
   Klavye: 1–6 hız · N sonraki olay · B önceki olay · O engeller · H paneli gizle
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ;
  if (!IZ.DEBUG_MODE) return;
  const G = IZ.G, R = IZ.R, U = IZ.U, UI = IZ.UI, App = IZ.App;
  const MULS = [1, 2, 4, 8, 16, 32];
  const D = (IZ.Dbg = { k: 0, ff: false, hidden: false });
  D.mul = () => (D.ff ? 32 : MULS[D.k]);
  G.noObstacles = true;
  document.body.classList.add('debug');

  // menü: bütün dönemler açık, eğitim düğmesi yok
  UI.state.unlocked = 5;
  UI.buildEras();
  const tb = document.getElementById('btnTutorial');
  if (tb) tb.hidden = true;
  const logo = document.querySelector('.logo-rule');
  if (logo) logo.insertAdjacentHTML('afterend', '<div class="dbg-badge">TEST SÜRÜMÜ · engelsiz · hızlandırılabilir</div>');

  // ------------------------------------------------------------- panel
  const panel = document.createElement('div');
  panel.id = 'dbg';
  panel.innerHTML =
    '<button type="button" class="dbg-tog" title="Paneli gizle/göster (H)">TEST</button>' +
    '<div class="dbg-body">' +
    '<div class="dbg-row"><span class="dbg-speeds">' + MULS.map((m, i) => '<button type="button" data-k="' + i + '">' + m + '×</button>').join('') + '</span>' +
    '<span class="dbg-acts">' +
    '<button type="button" class="dbg-prev" title="Önceki olaydan başla (B)">◀<span class="lbl"> Önceki</span></button>' +
    '<button type="button" class="dbg-next" title="Sonraki olaya sar (N)"><span class="lbl">Sonraki </span>▶▶</button>' +
    '<button type="button" class="dbg-obs" title="Engelleri aç/kapat (O)">Engel: kapalı</button>' +
    '</span></div>' +
    '<div class="dbg-row"><select class="dbg-sel" aria-label="Olaya git"></select></div>' +
    '<div class="dbg-info"></div>' +
    '</div>';
  document.getElementById('ui').appendChild(panel);
  // panel dokunuşları oyuna (zıplamaya) geçmesin
  ['pointerdown', 'pointerup', 'touchstart', 'click'].forEach((t) => panel.addEventListener(t, (e) => e.stopPropagation()));

  const sel = panel.querySelector('.dbg-sel');
  let html = '';
  IZ.ERAS.forEach((era, k) => {
    const items = IZ.EVENTS.filter((e) => IZ.eraIndex(e.dec) === k);
    if (!items.length) return;
    html += '<optgroup label="' + era.name + '">';
    items.forEach((e) => { html += '<option value="' + e.i + '">' + (e.i + 1) + '. ' + e.year + ' · ' + e.t + ' [' + IZ.bgOf(e) + ']</option>'; });
    html += '</optgroup>';
  });
  sel.innerHTML = html;

  function syncSpeeds() {
    panel.querySelectorAll('.dbg-speeds button').forEach((b) => b.classList.toggle('on', +b.dataset.k === D.k && !D.ff));
    panel.querySelector('.dbg-next').classList.toggle('on', D.ff);
    panel.querySelector('.dbg-obs').textContent = 'Engel: ' + (G.noObstacles ? 'kapalı' : 'açık');
    panel.querySelector('.dbg-obs').classList.toggle('on', !G.noObstacles);
  }
  function setSpeed(k) { D.k = U.clamp(k, 0, MULS.length - 1); D.ff = false; syncSpeeds(); }
  function jumpTo(i) {
    i = U.clamp(i | 0, 0, IZ.EVENTS.length - 1);
    D.ff = false;
    IZ.Audio.init();
    App.startRun({ startEvent: i, instant: true });
    syncSpeeds();
  }
  function nextEvent() {
    if (G.mode !== 'play') { jumpTo(G.story.curEv ? G.story.curEv.i + 1 : 0); return; }
    D.ff = !D.ff;
    syncSpeeds();
  }
  function prevEvent() {
    const cur = G.story.curEv ? G.story.curEv.i : G.story.startIdx;
    jumpTo(cur - 1);
  }
  function toggleObs() { G.noObstacles = !G.noObstacles; syncSpeeds(); }
  function toggleHide() { D.hidden = !D.hidden; panel.classList.toggle('min', D.hidden); }

  panel.querySelectorAll('.dbg-speeds button').forEach((b) => b.addEventListener('click', () => setSpeed(+b.dataset.k)));
  panel.querySelector('.dbg-next').addEventListener('click', nextEvent);
  panel.querySelector('.dbg-prev').addEventListener('click', prevEvent);
  panel.querySelector('.dbg-obs').addEventListener('click', toggleObs);
  panel.querySelector('.dbg-tog').addEventListener('click', toggleHide);
  sel.addEventListener('change', () => { jumpTo(+sel.value); sel.blur(); });
  // olay tetiklenince hızlı sarma durur
  G.on('event', () => { if (D.ff) { D.ff = false; syncSpeeds(); } });

  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'SELECT') return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= MULS.length) { setSpeed(n - 1); return; }
    const k = e.key.toLowerCase();
    if (k === 'n') nextEvent();
    else if (k === 'b') prevEvent();
    else if (k === 'o') toggleObs();
    else if (k === 'h') toggleHide();
  });

  // ------------------------------------------------------------- bilgi satırı
  const info = panel.querySelector('.dbg-info');
  let acc = 0, frames = 0, fps = 0, last = performance.now();
  function tick(now) {
    frames++;
    acc += now - last; last = now;
    if (acc > 400) {
      fps = Math.round(frames * 1000 / acc); frames = 0; acc = 0;
      panel.hidden = G.mode === 'menu';
      if (G.mode !== 'menu') {
        const S = G.story, ev = S.curEv;
        const era = IZ.ERAS[S.eraIdx];
        const nx = S.queue.find((it) => !it.shown);
        const nextSec = nx ? Math.max(0, (nx.F - G.eventLead() - G.camX) / Math.max(1, G.speed)) : null;
        info.innerHTML =
          '<b>' + S.year.toFixed(2) + '</b> · ' + (ev ? (ev.i + 1) + '/' + IZ.EVENTS.length + ' ' + ev.t : 'olay yok') + ' · <i>' + era.name + '</i><br>' +
          'dekor ' + R.chunkInfo('far') + ' / ' + R.chunkInfo('mid') + ' / ' + R.chunkInfo('near') +
          ' · hız ' + Math.round(G.speed) + '×' + D.mul() + ' · sonraki ' + (nextSec === null ? '—' : Math.round(nextSec / D.mul()) + ' sn') + ' · ' + fps + ' FPS';
        if (ev && document.activeElement !== sel) sel.value = String(ev.i);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  syncSpeeds();
})();
