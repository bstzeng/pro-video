// 第 23 課：RC 低通濾波：H(ω) = 1/(1+iωRC) 隨頻率沿半圓從 1 走向 0、相位從 0° 移到 −90°
import { THREE, C, css, cp, arrow, fatLine, arcPoints, complexAxes, ball, sample, tag } from "../../engine.js";

const K = 2.6;                                               // 畫面放大倍率
const uOf = (t) => -1.6 + 3.2 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 12));   // log10(ωRC)
const Hof = (x) => [1 / (1 + x * x), -x / (1 + x * x)];

export default {
  id: "l23-lowpass",
  poster: 60,
  camera: { target: [1.3, 0, -0.4], dist: 9, elev: 56, azim: -10, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-0.6, 3.4], im: [-1.8, 1.2], ticks: false });
    const locus = st.add(fatLine(C.orange, { width: 2, opacity: 0.6, dashed: true }));
    locus.setPoints(sample((a) => cp(K * (0.5 + 0.5 * Math.cos(a)), K * 0.5 * Math.sin(a), 0.02), 0, -Math.PI, 80));
    const vin = st.add(arrow(C.cyan, { radius: 0.03, head: 0.2, opacity: 0.6 })).set(cp(0, 0, 0.06), cp(K, 0, 0.06));
    const hArr = st.add(arrow(C.yellow, { radius: 0.045, head: 0.26 }));
    const arc = st.add(fatLine(C.yellow, { width: 2.5 }));
    const cut = st.add(ball(C.red, 0.09));
    cut.position.copy(cp(K * 0.5, -K * 0.5, 0.06));
    return { axes, hArr, arc };
  },

  update(st, t, phase, s) {
    const x = Math.pow(10, uOf(t));
    const [re, im] = Hof(x);
    s.hArr.set(cp(0, 0, 0.12), cp(K * re, K * im, 0.12));
    const ang = Math.atan2(im, re);
    s.arc.setPoints(arcPoints(0.7, 0, ang - 0.0001, 0.12));
    Object.assign(s, { x, re, im, ang });
  },

  hud(st, h, t, phase, s) {
    h.title("RC 低通濾波", "三步算出 H(ω) = 1/(1+iωRC)：頻率愈高，輸出愈小、相位愈往 −90° 偏", tag(23));
    s.axes.labels(h);
    h.label(st, cp(K, 0, 0.06), "輸入 1", C.cyan, { mono: false, dx: 8, dy: 22, size: 14 });
    h.label(st, cp(K * s.re, K * s.im, 0.12), "H(ω)", C.yellow, { dx: 10, dy: 18, size: 16 });
    const cp1 = st.project(cp(K * 0.5, -K * 0.5, 0.06));
    h.callout(cp1, [cp1[0] + 60, cp1[1] + 40], "ωRC = 1：|H| = 0.707、−45°", C.red, { size: 14 });

    const g = Math.hypot(s.re, s.im), deg = s.ang * 180 / Math.PI;
    const x = 884, y = 130, w = 356, hh = 460;
    h.panel(x, y, w, hh, "頻率響應");
    const m1 = h.plot(x + 30, y + 54, w - 60, 120, { xr: [-1.6, 1.6], yr: [0, 1.1], yLabel: "|H|", zero: false });
    h.curve(m1.sample((u) => 1 / Math.sqrt(1 + Math.pow(10, 2 * u)), -1.6, 1.6), C.yellow, { width: 2.2 });
    h.dot(...m1(uOf(t), g), C.yellow, { r: 5 });
    const m2 = h.plot(x + 30, y + 214, w - 60, 100, { xr: [-1.6, 1.6], yr: [-95, 5], yLabel: "相位", xLabel: "log ωRC", zero: false });
    h.curve(m2.sample((u) => -Math.atan(Math.pow(10, u)) * 180 / Math.PI, -1.6, 1.6), C.orange, { width: 2.2 });
    h.dot(...m2(uOf(t), deg), C.orange, { r: 5 });
    h.text(`ωRC = ${s.x.toFixed(2)}`, x + 30, y + 366, { size: 16, mono: true });
    h.text(`|H| = ${g.toFixed(2)}`, x + 30, y + 396, { size: 16, mono: true, color: css(C.yellow) });
    h.text(`arg H = ${deg.toFixed(0)}°`, x + 190, y + 396, { size: 16, mono: true, color: css(C.orange) });
    h.text("低頻通過、高頻擋掉", x + w / 2, y + hh - 22, { size: 17, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["V_out = V_in · Z_C / (Z_R + Z_C)", "H(ω) = 1 / (1 + iωRC)"]);
  },
};
