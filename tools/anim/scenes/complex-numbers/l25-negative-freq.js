// 第 25 課：負頻率＝反方向旋轉：cos ωt 是兩個反向旋轉箭頭的和，縱向分量互相抵銷
import { THREE, C, css, cp, arrow, fatLine, complexAxes, unitCircle, ball, tag } from "../../engine.js";

const R = 1.4;
const OM = 2 * Math.PI / 6;

export default {
  id: "l25-negative-freq",
  poster: 20,
  camera: { target: [0, 0, 0.1], dist: 10.2, elev: 60, azim: -6, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.6, 2.6], ticks: false });
    st.add(unitCircle(R, C.blue, 0.25));
    const pos = st.add(arrow(C.cyan, { radius: 0.035, head: 0.22 }));
    const neg = st.add(arrow(C.magenta, { radius: 0.035, head: 0.22 }));
    const sum = st.add(arrow(C.yellow, { radius: 0.045, head: 0.26 }));
    const dUp = st.add(fatLine(C.cyan, { width: 1.5, opacity: 0.6, dashed: true }));
    const dDn = st.add(fatLine(C.magenta, { width: 1.5, opacity: 0.6, dashed: true }));
    const track = st.add(fatLine(C.yellow, { width: 6, opacity: 0.25 })).setPoints([cp(-2 * R, 0, 0.02), cp(2 * R, 0, 0.02)]);
    const tip = st.add(ball(C.yellow, 0.1));
    return { axes, pos, neg, sum, dUp, dDn, tip };
  },

  update(st, t, phase, s) {
    const a = OM * t;
    const p = [R * Math.cos(a), R * Math.sin(a)];
    const n = [R * Math.cos(-a), R * Math.sin(-a)];
    s.pos.set(cp(0, 0, 0.1), cp(...p, 0.1));
    s.neg.set(cp(...p, 0.1), cp(p[0] + n[0], p[1] + n[1], 0.1));
    s.sum.set(cp(0, 0, 0.16), cp(2 * R * Math.cos(a), 0, 0.16));
    s.dUp.setPoints([cp(p[0], 0, 0.05), cp(...p, 0.05)]);
    s.dDn.setPoints([cp(...p, 0.05), cp(p[0] + n[0], 0, 0.05)]);
    s.tip.position.copy(cp(2 * R * Math.cos(a), 0, 0.16));
    Object.assign(s, { a, p });
  },

  hud(st, h, t, phase, s) {
    h.title("負頻率＝反方向旋轉", "e^{iωt} 逆時針轉、e^{−iωt} 順時針轉；兩者相加，上下分量抵銷，只剩在實軸上來回的 cos", tag(25));
    s.axes.labels(h);
    h.label(st, cp(s.p[0] / 2, s.p[1] / 2, 0.1), "e^{iωt}/2", C.cyan, { dx: -90, dy: -6, size: 14 });
    h.label(st, cp(s.p[0] * 1.5, s.p[1] * 0.5, 0.1), "e^{−iωt}/2", C.magenta, { dx: 12, dy: 0, size: 14 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "兩個方向、相加成一條波");
    h.chip(x + 22, y + 50, "+ω：逆時針", C.cyan, { mono: false, size: 14 });
    h.chip(x + 190, y + 50, "−ω：順時針", C.magenta, { mono: false, size: 14 });
    const map = h.plot(x + 22, y + 110, w - 44, 160, { xr: [0, 12], yr: [-1.3, 1.3] });
    h.curve(map.sample((u) => Math.cos(OM * u), 0, 12), C.yellow, { width: 2.2 });
    h.curve(map.sample((u) => 0.5 * Math.sin(OM * u), 0, 12), C.cyan, { width: 1.4, alpha: 0.6, glow: 0 });
    h.curve(map.sample((u) => -0.5 * Math.sin(OM * u), 0, 12), C.magenta, { width: 1.4, alpha: 0.6, glow: 0 });
    h.dot(...map(t, Math.cos(OM * t)), C.yellow, { r: 5 });
    h.text("虛部：+sin 與 −sin 抵銷", x + 22, y + 318, { size: 15, mono: true });
    h.text("實部：cos + cos → 一條實數波", x + 22, y + 350, { size: 15, mono: true });
    h.text("負頻率不是物理量，是數學的另一半", x + w / 2, y + hh - 26, { size: 15, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["cos ωt = ( e^{iωt} + e^{−iωt} ) / 2"]);
  },
};
