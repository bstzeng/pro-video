// 第 22 課：阻抗在複數平面上：Z_R 在實軸、Z_L 朝上、Z_C 朝下；ω 掃動時長度跟著變
import { THREE, C, css, cp, arrow, complexAxes, tag } from "../../engine.js";

const R = 1.6, L = 0.9, CC = 1 / 1.1;
const lw = (t) => 0.62 * Math.sin(2 * Math.PI * t / 12);          // log10 ω：在 10^±0.62 之間來回
const clampLen = (x) => Math.min(x, 2.7);

export default {
  id: "l22-impedance",
  poster: 40,
  camera: { target: [0.3, 0, 0.2], dist: 11, elev: 50, azim: -14, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-1, 3.2], im: [-3.2, 3.4] });
    const zr = st.add(arrow(C.cyan, { radius: 0.045, head: 0.26 })).set(cp(0, 0, 0.1), cp(R, 0, 0.1));
    const zl = st.add(arrow(C.green, { radius: 0.045, head: 0.26 }));
    const zc = st.add(arrow(C.magenta, { radius: 0.045, head: 0.26 }));
    return { axes, zl, zc };
  },

  update(st, t, phase, s) {
    const w = Math.pow(10, lw(t));
    s.w = w; s.l = clampLen(w * L); s.c = clampLen(1 / (w * CC));
    s.zl.set(cp(0.04, 0, 0.12), cp(0.04, s.l, 0.12));
    s.zc.set(cp(-0.04, 0, 0.12), cp(-0.04, -s.c, 0.12));
  },

  hud(st, h, t, phase, s) {
    h.title("阻抗：三種元件統一成一個數", "電阻在實軸上；電感是 +i 方向、頻率愈高愈長；電容是 −i 方向、頻率愈高愈短", tag(22));
    s.axes.labels(h);
    h.label(st, cp(R, 0, 0.1), "Z_R = R", C.cyan, { dx: 10, dy: 22, size: 15 });
    h.label(st, cp(0, s.l, 0.12), "Z_L = iωL", C.green, { dx: 14, dy: 12, size: 15 });
    h.label(st, cp(0, -s.c, 0.12), "Z_C = −i/(ωC)", C.magenta, { dx: 12, dy: 14, size: 15 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "|Z| 隨頻率變化");
    const map = h.plot(x + 30, y + 60, w - 60, 200, { xr: [-0.62, 0.62], yr: [0, 3.2], xLabel: "log ω", zero: false });
    h.curve(map.sample(() => R, -0.62, 0.62), C.cyan, { width: 2 });
    h.curve(map.sample((u) => clampLen(Math.pow(10, u) * L), -0.62, 0.62), C.green, { width: 2.2 });
    h.curve(map.sample((u) => clampLen(1 / (Math.pow(10, u) * CC)), -0.62, 0.62), C.magenta, { width: 2.2 });
    const cu = lw(t);
    const [cx] = map(cu, 0);
    h.curve([[cx, y + 60], [cx, y + 260]], 0xe8f6ff, { width: 1, glow: 0, alpha: 0.5 });
    h.text(`ω = ${s.w.toFixed(2)}`, x + 30, y + 312, { size: 18, mono: true });
    h.text("實部：耗散（變成熱）", x + 30, y + 352, { size: 15, color: css(C.cyan) });
    h.text("虛部：儲能、造成相位偏移", x + 30, y + 382, { size: 15, color: css(C.green) });
    h.text("V = Z · I，直流技巧照用", x + w / 2, y + hh - 22, { size: 16, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["Z_R = R    Z_L = iωL", "Z_C = 1/(iωC) = −i/(ωC)"]);
  },
};
