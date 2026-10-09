/* =========================================================================
   Yüzyılın İzinde — çekirdek yardımcılar
   Matematik, rastgelelik, renk, tuval (canvas) ve depolama araçları.
   ========================================================================= */
(function () {
  'use strict';
  const IZ = (window.IZ = window.IZ || {});
  const U = (IZ.U = {});

  // ---------------------------------------------------------------- matematik
  U.TAU = Math.PI * 2;
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.invLerp = (a, b, v) => (v - a) / (b - a);
  U.smooth = (t) => t * t * (3 - 2 * t);
  U.smoothstep = (a, b, v) => {
    const t = U.clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  U.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  U.easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  U.damp = (a, b, lambda, dt) => U.lerp(a, b, 1 - Math.exp(-lambda * dt));
  U.wrap = (v, m) => ((v % m) + m) % m;

  // Tohumlu rastgele sayı üreteci (mulberry32)
  U.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    const f = function () {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = (a, b) => a + (b - a) * f();
    f.int = (a, b) => Math.floor(a + (b - a + 1) * f());
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.chance = (p) => f() < p;
    f.sign = () => (f() < 0.5 ? -1 : 1);
    f.weighted = (obj) => {
      let tot = 0;
      for (const k in obj) tot += obj[k];
      let r = f() * tot;
      for (const k in obj) { r -= obj[k]; if (r <= 0) return k; }
      return Object.keys(obj)[0];
    };
    return f;
  };

  U.hash = function (n) {
    n = (n | 0) ^ 0x9e3779b9;
    n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
    n ^= n >>> 16;
    return (n >>> 0) / 4294967296;
  };
  U.noise1 = function (x, seed) {
    seed = seed || 0;
    const i = Math.floor(x), f = x - i;
    const a = U.hash(i * 374761393 + seed * 668265263);
    const b = U.hash((i + 1) * 374761393 + seed * 668265263);
    const t = f * f * (3 - 2 * f);
    return a + (b - a) * t;
  };
  U.fbm1 = function (x, seed, oct) {
    oct = oct || 3;
    let v = 0, amp = 0.5, fr = 1, norm = 0;
    for (let i = 0; i < oct; i++) {
      v += amp * U.noise1(x * fr, (seed || 0) + i * 17);
      norm += amp; amp *= 0.5; fr *= 2;
    }
    return v / norm;
  };

  // ------------------------------------------------------------------- renk
  U.hex = function (h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  U.rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')';
  U.rgb = (c) => 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
  U.lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  U.mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  U.add = (c, d) => [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
  U.clampC = (c) => [U.clamp(c[0], 0, 255), U.clamp(c[1], 0, 255), U.clamp(c[2], 0, 255)];

  // Dönem renk derecelendirmesi (sepya, gri, sıcak, vhs…)
  U.grade = function (c, g) {
    if (!g) return c;
    let out = c;
    const L = U.lum(c);
    if (g.sepia) {
      const sep = U.mix([34, 24, 14], [246, 233, 204], Math.pow(L, 0.9));
      out = U.mix(out, sep, g.sepia);
    }
    if (g.gray) {
      const gr = [L * 255, L * 252, L * 246];
      out = U.mix(out, gr, g.gray);
    }
    if (g.warm) out = [out[0] * (1 + 0.07 * g.warm), out[1] * (1 + 0.01 * g.warm), out[2] * (1 - 0.12 * g.warm)];
    if (g.cool) out = [out[0] * (1 - 0.05 * g.cool), out[1] * (1 + 0.0 * g.cool), out[2] * (1 + 0.08 * g.cool)];
    if (g.desat) {
      const L2 = U.lum(out) * 255;
      out = U.mix(out, [L2, L2, L2], g.desat);
    }
    return U.clampC(out);
  };

  // ---------------------------------------------------------------- tuval
  U.canvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  };

  /* "Sprite": dünya biriminde (WU) çizilmiş, belirli piksel yoğunluğunda bir tuval.
     ox/oy: sprite içinde dünya orijininin yeri (piksel değil WU). */
  U.sprite = function (w, h, density, ox, oy, draw) {
    const c = U.canvas(w * density, h * density);
    const ctx = c.getContext('2d');
    ctx.setTransform(density, 0, 0, density, ox * density, oy * density);
    draw(ctx);
    return { c: c, w: w, h: h, ox: ox, oy: oy, d: density };
  };

  U.supportsFilter = (function () {
    try {
      const c = U.canvas(8, 8).getContext('2d');
      if (!('filter' in c)) return false;
      c.filter = 'blur(2px)';
      return c.filter === 'blur(2px)';
    } catch (e) { return false; }
  })();

  // Bir sprite'ı (pikselde) bulanıklaştırır. Filtre desteği yoksa küçült-büyüt yöntemi.
  U.blurCanvas = function (src, px) {
    if (px <= 0.3) return src;
    const out = U.canvas(src.width, src.height);
    const o = out.getContext('2d');
    if (U.supportsFilter) {
      o.filter = 'blur(' + px.toFixed(1) + 'px)';
      o.drawImage(src, 0, 0);
      o.filter = 'none';
      return out;
    }
    const k = Math.max(1.5, px * 0.75);
    const sw = Math.max(1, Math.round(src.width / k)), sh = Math.max(1, Math.round(src.height / k));
    const small = U.canvas(sw, sh);
    const s = small.getContext('2d');
    s.imageSmoothingEnabled = true;
    s.imageSmoothingQuality = 'high';
    s.drawImage(src, 0, 0, sw, sh);
    o.imageSmoothingEnabled = true;
    o.imageSmoothingQuality = 'high';
    o.drawImage(small, 0, 0, src.width, src.height);
    return out;
  };

  // ---------------------------------------------------------------- depolama
  // localStorage kapalıysa (gizli sekme, kısıtlı çerçeve) oturum boyunca bellekte tutulur
  const memStore = {};
  U.store = {
    get(k, def) {
      try {
        const v = window.localStorage.getItem('izinde.' + k);
        if (v !== null) return JSON.parse(v);
      } catch (e) { /* bellek yedeğine düş */ }
      return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : def;
    },
    set(k, v) {
      memStore[k] = v;
      try { window.localStorage.setItem('izinde.' + k, JSON.stringify(v)); } catch (e) { /* yok say */ }
    },
  };

  // ---------------------------------------------------------------- biçim
  U.fmtInt = (n) => Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  U.qs = (s, r) => (r || document).querySelector(s);
  U.qsa = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  // URL parametreleri (hata ayıklama için)
  U.params = (function () {
    const out = {};
    try {
      const q = (location.search || '').replace(/^\?/, '');
      q.split('&').forEach((p) => {
        if (!p) return;
        const kv = p.split('=');
        out[decodeURIComponent(kv[0])] = kv.length > 1 ? decodeURIComponent(kv[1]) : true;
      });
    } catch (e) { /* yok */ }
    return out;
  })();
})();
