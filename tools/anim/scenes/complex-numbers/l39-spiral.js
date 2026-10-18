// 第 39 課：連續乘同一個數：模大於 1 往外旋開，模小於 1 往內收
import { THREE, C, css, cp, seg, window4, fatLine, complexAxes, unitCircle, particles, tag } from "../../engine.js";

const ANG = 25 * Math.PI / 180, N = 16;
const OUT = { r0: 0.55, m: 1.09, col: C.orange }, IN = { r0: 2.5, m: 0.91, col: C.cyan };
const pt = (cfg, n) => { const r = cfg.r0 * Math.pow(cfg.m, n); return [r * Math.cos(n * ANG), r * Math.sin(n * ANG)]; };

export default {
  id: "l39-spiral",
  poster: 70,
  camera: { target: [0, 0, 0.1], dist: 9.4, elev: 58, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.8, 2.8], im: [-2.6, 2.6], ticks: false });
    st.add(unitCircle(1, C.blue, 0.35));
    const dots = st.add(particles(N, { radius: 0.09 }));
    const line = st.add(fatLine(C.orange, { width: 2.4 }));
    return { axes, dots, line };
  },

  update(st, t, phase, s) {
    const outPhase = t < 6;
    const cfg = outPhase ? OUT : IN;
    const u = outPhase ? t : t - 6;
    const shown = Math.floor(N * seg(u, 0.3, 4.8));
    const a = window4(u, 0, 0.3, 5.5, 5.95);
    const pts = [];
    for (let n = 0; n < N; n++) {
      const p = pt(cfg, n);
      s.dots.place(n, cp(...p, 0.1), cfg.col, n <= shown ? a : 0.0001);
      if (n <= shown) pts.push(cp(...p, 0.08));
    }
    s.dots.commit();
    s.line.material.color.setHex(cfg.col);
    s.line.setPoints(pts).setAlpha(a);
    Object.assign(s, { cfg, shown, outPhase });
  },

  hud(st, h, t, phase, s) {
    h.title("連續乘同一個數：螺線", "每乘一次就轉 25°、長度乘 |base|：|base| > 1 往外旋開，|base| < 1 往內收", tag(39));
    s.axes.labels(h);
    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "zₙ = baseⁿ");
    h.chip(x + 22, y + 52, `|base| = ${s.cfg.m.toFixed(2)}`, s.cfg.col, { size: 15 });
    h.chip(x + 200, y + 52, "轉 25°", C.yellow, { mono: false, size: 15 });
    const map = h.plot(x + 30, y + 120, w - 60, 170, { xr: [0, N - 1], yr: [0, 3], xLabel: "n", yLabel: "|zₙ|", zero: false });
    h.curve([map(0, 1), map(N - 1, 1)], C.blue, { width: 1, glow: 0, dash: [4, 4], alpha: 0.6 });
    const pts = [];
    for (let n = 0; n <= s.shown && n < N; n++) pts.push(map(n, s.cfg.r0 * Math.pow(s.cfg.m, n)));
    h.curve(pts, s.cfg.col, { width: 2.4 });
    pts.forEach(([px, py]) => h.dot(px, py, s.cfg.col, { r: 3 }));
    h.text(s.outPhase ? "|base| > 1：愈轉愈大" : "|base| < 1：愈轉愈小", x + w / 2, y + 340, { size: 20, align: "center", color: css(s.cfg.col), glow: 8 });
    h.text("模決定收斂或發散", x + w / 2, y + hh - 28, { size: 16, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["zₙ = baseⁿ = |base|ⁿ · e^{inθ}"]);
  },
};
