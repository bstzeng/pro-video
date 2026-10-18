// 第 7 課：邦貝利：∛(2+11i) + ∛(2−11i) = (2+i) + (2−i) = 4
import { THREE, C, css, cp, seg, window4, arrow, complexAxes, ball, tag } from "../../engine.js";

const K = 0.22;                                   // 每單位複數在畫面上的長度
const P = (re, im, y = 0.1) => cp(re * K, im * K, y);
// 把 2±11i 沿「模取 s 次方、角度乘 s」的路徑縮到立方根 2±i（s: 1 → 1/3）
const ARG = Math.atan2(11, 2), MOD = Math.hypot(2, 11);
const along = (s, sign) => {
  const r = Math.pow(MOD, s), a = ARG * s;
  return [r * Math.cos(a), sign * r * Math.sin(a)];
};

export default {
  id: "l07-bombelli",
  poster: 135,
  camera: { target: [0.4, 0, 0.1], dist: 10.5, elev: 36, azim: -16, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-0.6, 1.6], im: [-3.0, 3.0], ticks: false });
    const up = st.add(arrow(C.cyan, { radius: 0.04, head: 0.24 }));
    const dn = st.add(arrow(C.magenta, { radius: 0.04, head: 0.24 }));
    const res = st.add(ball(C.yellow, 0.14));
    res.position.copy(P(4, 0, 0.12));
    return { axes, up, dn, res };
  },

  update(st, t, phase, s) {
    const a = window4(t, 0, 0.8, 11, 11.8);
    const s3 = 1 - (2 / 3) * seg(t, 2.2, 5.2);              // 開立方根
    const join = seg(t, 6.2, 8.6);                          // 第二根箭頭接到第一根尾端
    const u = along(s3, 1), d = along(s3, -1);
    s.u = u; s.d = d; s.join = join; s.a = a;
    s.up.set(P(0, 0), P(...u)).setAlpha(a);
    const base = [u[0] * join, u[1] * join];
    s.dn.set(P(...base), P(base[0] + d[0], base[1] + d[1])).setAlpha(a);
    s.res.setAlpha(a * seg(t, 8.4, 9));
    s.res.scale.setScalar(1 + 0.3 * window4(t, 8.4, 9, 9.6, 10.4));
  },

  hud(st, h, t, phase, s) {
    h.title("邦貝利：先算下去再說", "x³ = 15x + 4 的公式要經過 √(−121)；照規則算下去，虛部剛好抵銷，答案是 4", tag(7));
    s.axes.labels(h, { alpha: 0.9 });
    const n1 = (v) => v.toFixed(1).replace(/\.0$/, "");
    const fmt = (z) => `${n1(z[0])}${z[1] >= 0 ? "+" : "−"}${n1(Math.abs(z[1]))}i`;
    h.label(st, P(...s.u), fmt(s.u), C.cyan, { dx: 12, dy: -6, alpha: s.a });
    h.label(st, P(s.u[0] * s.join + s.d[0], s.u[1] * s.join + s.d[1]), fmt(s.d), C.magenta, { dx: 12, dy: 18, alpha: s.a });
    const r = st.project(P(4, 0, 0.12));
    h.callout(r, [r[0] + 40, r[1] + 70], "虛部 +i 與 −i 抵銷 → 4", C.yellow, { alpha: window4(t, 8.8, 9.4, 11, 11.6) });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "x³ = 15x + 4");
    const steps = [
      ["①", "公式給出 ∛(2 ± 11i)", 0.5, 2.2],
      ["②", "開立方根：2 ± i", 2.2, 6.2],
      ["③", "兩者相加", 6.2, 8.6],
      ["④", "(2+i)+(2−i) = 4", 8.6, 12],
    ];
    steps.forEach(([n, txt, a0, a1], i) => {
      const on = t >= a0 && t < a1;
      const yy = y + 66 + i * 56;
      h.chip(x + 22, yy, n, on ? C.yellow : C.blue, { mono: false, size: 14, alpha: on ? 1 : 0.5 });
      h.text(txt, x + 76, yy + 20, { size: 16, mono: i !== 0 && i !== 2, alpha: on ? 1 : 0.55 });
    });
    h.text("驗算：4³ = 64 = 15·4 + 4 ✓", x + 22, y + hh - 70, { size: 15, mono: true, color: css(C.green), alpha: seg(t, 9.4, 10) * (1 - seg(t, 11.2, 11.8)) });
    h.text("算得出答案，就不能說它不存在", x + 22, y + hh - 30, { size: 16, color: css(C.yellow), glow: 6, alpha: seg(t, 9.8, 10.4) * (1 - seg(t, 11.2, 11.8)) });

    h.formula(["(2 ± i)³ = 2 ± 11i = 2 ± √−121", "∛(2+11i) + ∛(2−11i) = 4"], { highlight: t > 8.6 ? 1 : 0 });
  },
};
