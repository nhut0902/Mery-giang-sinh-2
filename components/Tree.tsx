import React, { useEffect, useRef, useState } from 'react';

interface TreeProps {
  isVisible: boolean;
  target?: { i: number; n: number };
  auto?: boolean;
  theme?: number;
  onCanvas?: (c: HTMLCanvasElement | null) => void;
  photo?: { img: HTMLImageElement; n: number };
}

const N = 1700;
const R = Math.random;
const TAU = Math.PI * 2;
type Pt = number[]; // x, y, z, r, g, b, glow

const GREENS = [[16, 122, 66], [26, 158, 82], [10, 92, 52], [52, 190, 110]];
const THEMES: number[][][] = [
  [[255, 70, 80], [255, 214, 90], [90, 220, 255], [255, 120, 220], [255, 255, 255]],
  [[255, 200, 80], [255, 226, 140], [255, 160, 60], [255, 245, 210], [255, 255, 255]],
  [[120, 200, 255], [190, 235, 255], [90, 150, 255], [200, 190, 255], [255, 255, 255]],
  [[255, 70, 110], [255, 150, 170], [255, 40, 60], [255, 210, 220], [255, 255, 255]],
];
const pick = (a: number[][]) => a[(R() * a.length) | 0];
// SVG path shapes (200x200 box) drawn with Path2D, then sampled into particle targets
const SHAPES: [string, string][][] = [
  [['M100 18L124 74 184 80 138 120 152 180 100 148 48 180 62 120 16 80 76 74Z', '#ffd45a']],
  [['M100 172C18 112 30 36 72 38 90 39 100 54 100 66 100 54 110 39 128 38 170 36 182 112 100 172Z', '#ff4d6d']],
  [['M100 28C70 28 60 58 60 94 60 124 46 134 38 150L162 150C154 134 140 124 140 94 140 58 130 28 100 28Z', '#ffc94a'], ['M84 160A16 16 0 0 0 116 160Z', '#ff4d4d']],
  [['M40 92H160V172H40Z', '#e63946'], ['M30 66H170V92H30Z', '#ff6b6b'], ['M92 66H108V172H92Z', '#ffd45a'], ['M100 66C70 22 48 54 100 66 152 54 130 22 100 66Z', '#ffd45a']],
  [['M100 100A44 44 0 1 0 100 188 44 44 0 1 0 100 100Z', '#f4f8ff'], ['M100 40A30 30 0 1 0 100 100 30 30 0 1 0 100 40Z', '#ffffff'], ['M76 44H124V30H76Z', '#2b2b2b'], ['M66 104H134V116H66Z', '#e63946'], ['M100 66L132 72 100 78Z', '#ff8a2b']],
];

// Tiered tree: foliage + spiral garland + lights + trunk + star = exactly N points
const tree = (L: number[][]): Pt[] => {
  const p: Pt[] = [];
  const add = (x: number, y: number, z: number, c: number[], g = 0) => p.push([x, y, z, c[0], c[1], c[2], g]);
  const rad = (y: number) => {
    const t = (y + 0.85) / 1.55;
    return (0.08 + 0.62 * t) * (0.6 + 0.4 * ((t * 4) % 1));
  };
  for (let i = 0; i < 1100; i++) {
    const y = -0.85 + 1.55 * Math.sqrt(R()), a = R() * TAU, r = rad(y) * (0.55 + 0.45 * R());
    add(r * Math.cos(a), y, r * Math.sin(a), pick(GREENS));
  }
  for (let i = 0; i < 260; i++) {
    const t = i / 260, y = -0.8 + 1.5 * t, a = t * 18 * Math.PI, r = rad(y) * 1.03;
    add(r * Math.cos(a), y, r * Math.sin(a), L[1], 1);
  }
  for (let i = 0; i < 150; i++) {
    const y = -0.8 + 1.45 * Math.sqrt(R()), a = R() * TAU, r = rad(y);
    add(r * Math.cos(a), y, r * Math.sin(a), pick(L), 1);
  }
  for (let i = 0; i < 70; i++) add(R() * 0.14 - 0.07, 0.7 + R() * 0.18, R() * 0.14 - 0.07, [120, 78, 44]);
  for (let i = 0; i < 120; i++) {
    const a = R() * TAU;
    const r = (0.07 + 0.09 * Math.pow(Math.abs(Math.cos(2.5 * (a + Math.PI / 2))), 1.5)) * Math.sqrt(R());
    add(r * Math.cos(a), -0.98 + r * Math.sin(a), (R() - 0.5) * 0.04, [255, 226, 120], 1);
  }
  return p;
};

const fit = (p: Pt[]): Pt[] => {
  if (p.length >= N) return p.sort(() => R() - 0.5).slice(0, N);
  const o = p.slice();
  while (o.length < N) o.push(p[(R() * p.length) | 0]);
  return o;
};

// Draw an emoji / text offscreen and turn its coloured pixels into particle targets
const sample = (draw: (x: CanvasRenderingContext2D) => void, step = 2): Pt[] => {
  const s = 200, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  draw(x);
  const d = x.getImageData(0, 0, s, s).data, p: Pt[] = [];
  for (let y = 0; y < s; y += step)
    for (let u = 0; u < s; u += step) {
      const i = (y * s + u) * 4;
      if (d[i + 3] > 140) p.push([(u - 100) / 100, (y - 100) / 100, (R() - 0.5) * 0.3, d[i], d[i + 1], d[i + 2], R() < 0.15 ? 1 : 0]);
    }
  return fit(p);
};

const Tree: React.FC<TreeProps> = ({ isVisible, target, auto = true, theme = 0, onCanvas, photo }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ go: (n: number) => void; pal: (n: number) => void; photo: (img: HTMLImageElement) => void } | null>(null);
  const autoRef = useRef(auto);
  const themeRef = useRef(theme);
  autoRef.current = auto;
  themeRef.current = theme;
  const [hint, setHint] = useState(true);
  const [msg, setMsg] = useState('Chạm: đổi hình. Vuốt: vẽ hình của bạn');
  useEffect(() => { const id = setTimeout(() => setHint(false), 9000); return () => clearTimeout(id); }, []);
  useEffect(() => { if (target) api.current?.go(target.i); }, [target]);
  useEffect(() => { api.current?.pal(theme); }, [theme]);
  useEffect(() => { if (photo) api.current?.photo(photo.img); }, [photo]);
  useEffect(() => { onCanvas?.(isVisible ? ref.current : null); }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const cv = ref.current!, ctx = cv.getContext('2d')!;
    const shapes: Pt[][] = [
      tree(THEMES[themeRef.current]),
      ...SHAPES.map((ps) => sample((x) => ps.forEach(([d, c]) => { x.fillStyle = c; x.fill(new Path2D(d)); }))),
      sample((x) => {
        x.font = 'bold 46px Arial, sans-serif';
        x.fillStyle = '#ff5a64';
        x.fillText('MERRY', 100, 70);
        x.fillStyle = '#ffd86b';
        x.fillText('XMAS', 100, 130);
      }, 1),
    ];
    const NMAX = 5200;
    const f3 = () => new Float32Array(NMAX * 3);
    const fr = f3(), to = f3(), px = f3(), sw = f3(), fc = f3(), tc = f3(), cc = f3();
    const dl = new Float32Array(NMAX), ph = new Float32Array(NMAX), gl = new Uint8Array(NMAX);
    for (let k = 0; k < NMAX; k++) {
      const a = R() * TAU, b = Math.acos(2 * R() - 1), r = 2 + R();
      px.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], k * 3);
      cc.set([255, 255, 255], k * 3);
      ph[k] = R();
      for (let c = 0; c < 3; c++) sw[k * 3 + c] = (R() - 0.5) * 1.6;
    }
    let cellU = 0.03, cnt = N, cur = 0, prog = 0, hold = 0, t = 0, spin = 0, treeW = 0, d = 1, last = performance.now(), raf = 0;

    const morph = (s: Pt[]) => {
      prog = 0; hold = 0;
      cnt = Math.max(cnt, s.length);
      for (let k = 0; k < cnt; k++) {
        const q = k < s.length ? s[k] : s[(R() * s.length) | 0];
        for (let c = 0; c < 3; c++) {
          const i = k * 3 + c;
          fr[i] = px[i]; to[i] = q[c];
          fc[i] = cc[i]; tc[i] = q[3 + c];
        }
        gl[k] = q[6];
        dl[k] = R() * 0.45;
      }
    };
    const go = (n: number) => { cur = n; morph(shapes[n]); };

    // Finger-drawn stroke (CSS px) -> N rainbow particles, recentred and scaled to fit
    let stroke: number[][] | null = null;
    const doodle = (s: number[][]): Pt[] => {
      const xs = s.map((p) => p[0]), ys = s.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = 1.7 / Math.max(x1 - x0, y1 - y0, 40), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const cum = [0];
      for (let i = 1; i < s.length; i++) cum.push(cum[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
      const total = cum[cum.length - 1] || 1;
      const out: Pt[] = [];
      for (let i = 0, j = 1; i < N; i++) {
        const u = ((i + R()) / N) * total;
        while (j < cum.length - 1 && cum[j] < u) j++;
        const a = s[j - 1], b = s[j], f = Math.min(Math.max((u - cum[j - 1]) / (cum[j] - cum[j - 1] || 1), 0), 1);
        const h = (20 + 320 * (u / total)) / 30;
        const c = (n: number) => 255 * (0.65 - 0.35 * Math.max(-1, Math.min(((n + h) % 12) - 3, 9 - ((n + h) % 12), 1)));
        out.push([(a[0] + (b[0] - a[0]) * f - cx) * k + (R() - 0.5) * 0.07, (a[1] + (b[1] - a[1]) * f - cy) * k + (R() - 0.5) * 0.07, (R() - 0.5) * 0.12, c(0), c(8), c(4), R() < 0.2 ? 1 : 0]);
      }
      return out;
    };
    // Photo -> grid of coloured particles; brightness lifts them forward for a little 3D relief
    const photoPts = (img: HTMLImageElement): Pt[] => {
      const asp = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
      const rows = Math.floor(Math.sqrt(NMAX / asp)), cols = Math.min(Math.floor(rows * asp), Math.floor(NMAX / rows));
      const c = document.createElement('canvas');
      c.width = cols; c.height = rows;
      const x = c.getContext('2d', { willReadFrequently: true })!;
      x.drawImage(img, 0, 0, cols, rows);
      const data = x.getImageData(0, 0, cols, rows).data;
      const w = asp >= 1 ? 1.7 : 1.7 * asp, h = asp >= 1 ? 1.7 / asp : 1.7;
      cellU = w / cols;
      const out: Pt[] = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const o = (j * cols + i) * 4, lum = (data[o] * 0.3 + data[o + 1] * 0.59 + data[o + 2] * 0.11) / 255;
          out.push([((i + 0.5) / cols) * w - w / 2, ((j + 0.5) / rows) * h - h / 2, (lum - 0.5) * 0.3, data[o], data[o + 1], data[o + 2], 0]);
        }
      return out;
    };
    const showPhoto = (img: HTMLImageElement) => {
      const pts = photoPts(img);
      cur = -2;
      morph(pts);
      for (let k = 0; k < cnt; k++) dl[k] = Math.min(0.45, Math.hypot(to[k * 3], to[k * 3 + 1]) * 0.3 + R() * 0.08); // reveal from the centre
    };
    const size = () => {
      d = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cv.clientWidth * d;
      cv.height = cv.clientHeight * d;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; t += dt;
      prog = Math.min(prog + dt / 2.4, 1);
      if (prog >= 1 && cur !== -2 && cnt > N) cnt = N;
      if (prog >= 1 && autoRef.current && cur !== -2 && (hold += dt) > (cur === 0 ? 6 : cur < 0 ? 5 : 3)) go(cur < 0 ? 0 : (cur + 1) % shapes.length);
      treeW += ((cur === 0 ? 1 : 0) - treeW) * Math.min(dt * 2.5, 1);
      spin += dt * 0.55;
      const ang = spin * treeW + Math.sin(t * 0.9) * 0.4 * (1 - treeW);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const w = cv.width, h = cv.height, S = Math.min(h * 0.36, w * 0.48), ox = w / 2, oy = h / 2 + S * 0.1;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, S * 1.2);
      g.addColorStop(0, `rgba(255,214,120,${0.1 + 0.1 * treeW})`);
      g.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = cur === -2 ? 'source-over' : 'lighter';

      for (let k = 0; k < cnt; k++) {
        const i = k * 3;
        let e = Math.min(Math.max(prog * 1.45 - dl[k], 0), 1);
        e = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
        const m = Math.sin(e * Math.PI) * 0.55; // swirl arc while flying
        const x = fr[i] + (to[i] - fr[i]) * e + sw[i] * m;
        const y = fr[i + 1] + (to[i + 1] - fr[i + 1]) * e + sw[i + 1] * m;
        const z = fr[i + 2] + (to[i + 2] - fr[i + 2]) * e + sw[i + 2] * m;
        px[i] = x; px[i + 1] = y; px[i + 2] = z;
        for (let c = 0; c < 3; c++) cc[i + c] = fc[i + c] + (tc[i + c] - fc[i + c]) * e;
        const rx = x * ca - z * sa, rz = x * sa + z * ca, f = 3.2 / (3.2 - rz);
        const tw = 0.5 + 0.5 * Math.sin(t * (gl[k] ? 5 : 2) + ph[k] * TAU);
        const pm = cur === -2;
        const r = pm ? cellU * S * f * 0.62 : (gl[k] ? 2.6 : 1.5) * f * d, sx = ox + rx * S * f, sy = oy + y * S * f;
        ctx.fillStyle = `rgb(${cc[i] | 0},${cc[i + 1] | 0},${cc[i + 2] | 0})`;
        ctx.globalAlpha = pm ? 0.85 + 0.15 * tw : (0.4 + 0.6 * tw) * Math.min(1, 0.5 + f * 0.4);
        if (pm) { ctx.fillRect(sx - r, sy - r, r * 2, r * 2); continue; }
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill();
        if (gl[k]) {
          ctx.globalAlpha *= 0.2;
          ctx.beginPath(); ctx.arc(sx, sy, r * 4, 0, TAU); ctx.fill();
        }
      }
      if (stroke && stroke.length > 1) {
        ctx.globalAlpha = 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        stroke.forEach(([x, y], i) => (i ? ctx.lineTo(x * d, y * d) : ctx.moveTo(x * d, y * d)));
        ctx.strokeStyle = 'rgba(255,170,120,.18)'; ctx.lineWidth = 12 * d; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,230,160,.95)'; ctx.lineWidth = 3 * d; ctx.stroke();
      }
    };

    size();
    go(0);
    raf = requestAnimationFrame(frame);
    const at = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const down = (e: PointerEvent) => { cv.setPointerCapture(e.pointerId); stroke = [at(e)]; };
    const move = (e: PointerEvent) => {
      if (!stroke) return;
      const p = at(e), q = stroke[stroke.length - 1];
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 3) stroke.push(p);
    };
    const up = () => {
      const s = stroke;
      stroke = null;
      if (!s) return;
      let len = 0;
      for (let i = 1; i < s.length; i++) len += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
      if (len < 30) go(cur < 0 ? 0 : (cur + 1) % shapes.length);
      else { cur = -1; morph(doodle(s)); setHint(false); }
      navigator.vibrate?.(len < 30 ? 12 : 24);
    };
    const cancel = () => { stroke = null; };
    api.current = {
      go,
      pal: (n) => { shapes[0] = tree(THEMES[n]); if (cur === 0) go(0); },
      photo: (img) => {
        showPhoto(img);
        setMsg('Chạm để quay lại cây thông');
        setHint(true);
        setTimeout(() => setHint(false), 6000);
      },
    };
    window.addEventListener('resize', size);
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', cancel);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', cancel);
    };
  }, [isVisible]);

  if (!isVisible) return null;
  return (
    <>
      <canvas
        ref={ref}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
        style={{ touchAction: 'none' }}
        aria-label="Cây thông Noel - chạm để đổi hình, vuốt để vẽ hình riêng"
      />
      <div className={`absolute bottom-3 left-4 pointer-events-none transition-opacity duration-1000 ${hint ? 'opacity-100' : 'opacity-0'}`}>
        <span className="rounded-full border border-white/20 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-gray-200 font-mono">
          {msg}
        </span>
      </div>
    </>
  );
};

export default Tree;
