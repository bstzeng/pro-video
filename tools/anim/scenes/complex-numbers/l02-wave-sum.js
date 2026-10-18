// 第 2 課：兩條同頻率的波相加＝兩根箭頭頭尾相接
import { THREE, C, css, cp, seg, arrow, fatLine, complexAxes, tag } from "../../engine.js";

const A1 = 1.6, P1 = 0, A2 = 1.0, P2 = 70 * Math.PI / 180;
const OM = 2 * Math.PI / 6;                       // 6 秒一圈，12 秒兩圈剛好接回
const sum = (wt) => {
  const re = A1 * Math.cos(wt + P1) + A2 * Math.cos(wt + P2);
  const im = A1 * Math.sin(wt + P1) + A2 * Math.sin(wt + P2);
  return [re, im];
};
const A = Math.hypot(...sum(0)), P = Math.atan2(sum(0)[1], sum(0)[0]);

export default {
  id: "l02-wave-sum",
  poster: 20,
  camera: { target: [0.2, 0, 0.9], dist: 10.6, elev: 54, azim: -4, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-3, 3], ticks: false });
    const a1 = st.add(arrow(C.cyan, { radius: 0.035, head: 0.24 }));
    const a2 = st.add(arrow(C.green, { radius: 0.035, head: 0.24 }));
    const a2o = st.add(arrow(C.green, { radius: 0.02, head: 0.18, opacity: 0.35 }));
    const as = st.add(arrow(C.yellow, { radius: 0.045, head: 0.28 }));
    const trail = st.add(fatLine(C.yellow, { width: 2, opacity: 0.4 }));
    const pts = [];
    for (let k = 0; k <= 128; k++) { const [re, im] = sum(2 * Math.PI * k / 128); pts.push(cp(re, im, 0.02)); }
    trail.setPoints(pts);
    return { axes, a1, a2, a2o, as };
  },

  update(st, t, phase, s) {
    const wt = OM * t;
    const z1 = [A1 * Math.cos(wt + P1), A1 * Math.sin(wt + P1)];
    const z2 = [A2 * Math.cos(wt + P2), A2 * Math.sin(wt + P2)];
    const zs = sum(wt);
    s.a1.set(cp(0, 0, 0.1), cp(...z1, 0.1));
    s.a2.set(cp(...z1, 0.1), cp(z1[0] + z2[0], z1[1] + z2[1], 0.1));
    s.a2o.set(cp(0, 0, 0.06), cp(...z2, 0.06));
    s.as.set(cp(0, 0, 0.16), cp(...zs, 0.16));
    Object.assign(s, { wt, z1, z2, zs });
  },

  hud(st, h, t, phase, s) {
    h.title("兩條波相加＝兩根箭頭相加", "同頻率的波相加，不用背三角恆等式：箭頭頭尾相接，就是新的振幅和相位", tag(2));
    s.axes.labels(h);
    h.label(st, cp(...s.z1, 0.1), "A₁", C.cyan, { dx: 8, dy: 18 });
    h.label(st, cp(s.zs[0], s.zs[1], 0.16), "A", C.yellow, { dx: 10, dy: -8 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "箭頭的影子＝波");
    const rows = [
      [(u) => A1 * Math.sin(OM * u + P1), C.cyan, "A₁ sin(ωt+φ₁)"],
      [(u) => A2 * Math.sin(OM * u + P2), C.green, "A₂ sin(ωt+φ₂)"],
      [(u) => A * Math.sin(OM * u + P), C.yellow, "相加＝A sin(ωt+φ)"],
    ];
    rows.forEach(([f, col, lab], i) => {
      const py = y + 70 + i * 120;
      h.text(lab, x + 22, py, { size: 14, mono: true, color: css(col) });
      const map = h.plot(x + 22, py + 12, w - 44, 80, { xr: [0, 12], yr: [-2.6, 2.6] });
      h.curve(map.sample(f, 0, 12, 160), col, { width: 2, alpha: 0.35, glow: 0 });
      h.curve(map.sample(f, 0, t, Math.max(2, Math.round(t * 14))), col, { width: 2.4 });
      const [cx, cy] = map(t, f(t));
      h.dot(cx, cy, col, { r: 4 });
    });

    h.formula([
      "A₁e^{iφ₁} + A₂e^{iφ₂} = A e^{iφ}",
      `A = ${A.toFixed(2)}   φ = ${Math.round(P * 180 / Math.PI)}°`,
    ]);
  },
};
