// 第 44 課：複數平面地圖：同一張平面，在控制與阻抗裡各自代表什麼
import { THREE, C, css, cp, seg, window4, glowMesh, fatLine, complexAxes, unitCircle, tag } from "../../engine.js";

const ITEMS = [
  ["左半平面", "控制：穩定（振幅衰減）", C.green],
  ["右半平面", "控制：不穩定（發散）", C.red],
  ["虛軸", "控制：臨界、等幅振盪", C.yellow],
  ["正實軸", "阻抗：純電阻", C.cyan],
  ["+i 方向", "阻抗：純電感（超前 90°）", C.green],
  ["−i 方向", "阻抗：純電容（落後 90°）", C.magenta],
];
const DUR = 2;

export default {
  id: "l44-plane-map",
  poster: 10,
  camera: { target: [0, 0, 0.2], dist: 11, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.8, 2.8], im: [-2.6, 2.6], ticks: false });
    const half = (w, x, c) => { const m = glowMesh(new THREE.PlaneGeometry(w, 5.2), c, { opacity: 0.12, edgeOpacity: 0 }); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, 0); st.add(m); return m; };
    const L = half(2.8, -1.4, C.green), Rr = half(2.8, 1.4, C.red);
    const iax = st.add(fatLine(C.yellow, { width: 5 })).setPoints([cp(0, -2.6, 0.03), cp(0, 2.6, 0.03)]);
    const pre = st.add(fatLine(C.cyan, { width: 6 })).setPoints([cp(0.05, 0, 0.04), cp(2.8, 0, 0.04)]);
    const pim = st.add(fatLine(C.green, { width: 6 })).setPoints([cp(0, 0.05, 0.05), cp(0, 2.6, 0.05)]);
    const nim = st.add(fatLine(C.magenta, { width: 6 })).setPoints([cp(0, -0.05, 0.05), cp(0, -2.6, 0.05)]);
    return { axes, parts: [L, Rr, iax, pre, pim, nim] };
  },

  update(st, t, phase, s) {
    const k = Math.min(5, Math.floor(t / DUR)), u = t - k * DUR;
    s.parts.forEach((p, i) => {
      const a = i === k ? window4(u, 0, 0.3, 1.7, 2) : 0.12;
      if (p.setAlpha) p.setAlpha(i < 2 ? a : Math.max(a, 0.1));
    });
    s.k = k; s.u = u;
  },

  hud(st, h, t, phase, s) {
    h.title("複數平面地圖", "同一張平面，位置就是答案：控制系統看左右，阻抗看方向", tag(44));
    s.axes.labels(h);
    const anchors = [cp(-1.6, 1.4), cp(1.6, 1.4), cp(0, -1.8, 0.05), cp(2, 0, 0.05), cp(0, 2, 0.05), cp(0, -1.2, 0.05)];
    const [name, desc, col] = ITEMS[s.k];
    const ap = st.project(anchors[s.k]);
    h.callout(ap, [ap[0] + (s.k === 0 ? -40 : 70), ap[1] - 60], name, col, { alpha: Math.min(1, s.u * 3, (DUR - s.u) * 3) });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "位置的意義");
    ITEMS.forEach(([n, d, c], i) => {
      const yy = y + 66 + i * 56, on = i === s.k;
      h.text(n, x + 22, yy, { size: 16, color: css(c), alpha: on ? 1 : 0.4 });
      h.text(d, x + 22, yy + 24, { size: 14, alpha: on ? 1 : 0.35 });
    });

    h.formula(["模管「多少」，輻角管「什麼時候、哪個方向」"]);
  },
};
