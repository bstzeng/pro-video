// 第 1 課：乘 −1 是轉半圈；轉一半停在 i
import { THREE, C, css, cp, seg, window4, arrow, fatLine, arcPoints, complexAxes, ball, tag } from "../../engine.js";

const R = 2.4;

export default {
  id: "l01-half-turn",
  poster: 100,
  camera: { target: [0, 0, 0.5], dist: 10.2, elev: 50, azim: -6, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3.4, 3.4], im: [-1.2, 3.2], ticks: false });
    const one = st.add(ball(C.cyan, 0.11)); one.position.copy(cp(R, 0, 0.11));
    const neg = st.add(ball(C.red, 0.11)); neg.position.copy(cp(-R, 0, 0.11));
    const iDot = st.add(ball(C.magenta, 0.13)); iDot.position.copy(cp(0, R, 0.13));
    const arm = st.add(arrow(C.yellow, { radius: 0.04, head: 0.26 }));
    const trail = st.add(fatLine(C.yellow, { width: 3, opacity: 0.85 }));
    return { axes, iDot, arm, trail };
  },

  update(st, t, phase, s) {
    // 1–4 秒轉到 −1（上半圈），8–11 秒再轉半圈回到 1（下半圈）
    const th = Math.PI * seg(t, 1, 4) + Math.PI * seg(t, 8, 11);
    s.th = th;
    s.arm.set(cp(0, 0, 0.12), cp(R * Math.cos(th), R * Math.sin(th), 0.12));
    const fade = 1 - seg(t, 11.2, 11.9);
    s.trail.setPoints(arcPoints(R, 0, Math.max(th, 0.001), 0.06, 96)).setAlpha(th > 0.01 ? fade : 0);
    s.iDot.setAlpha(0.25 + 0.75 * window4(t, 4.6, 5.4, 10.6, 11.4));
    s.iDot.scale.setScalar(1 + 0.25 * window4(t, 4.6, 5.4, 7.6, 8.2));
  },

  hud(st, h, t, phase, s) {
    h.title("乘 −1 就是轉半圈", "實數的乘法只會放大、翻到對面；把「翻面」看成轉 180°，轉一半就停在 i", tag(1));
    s.axes.labels(h);
    h.label(st, cp(R, 0, 0.1), "1", C.cyan, { dx: 10, dy: 22 });
    h.label(st, cp(-R, 0, 0.1), "−1", C.red, { dx: -30, dy: 22 });
    const iP = st.project(cp(0, R, 0.13));
    h.callout(iP, [iP[0] + 90, iP[1] - 40], "轉一半停在這裡：i", C.magenta, { alpha: window4(t, 4.8, 5.4, 10.4, 11) });
    const nP = st.project(cp(-R, 0, 0.1));
    h.callout(nP, [nP[0] + 40, nP[1] + 70], "×(−1)：轉了 180°", C.red, { alpha: window4(t, 3.6, 4.2, 7.6, 8.2) });
    const oP = st.project(cp(R, 0, 0.1));
    h.callout(oP, [oP[0] - 30, oP[1] + 80], "再 ×(−1)：又轉回 1", C.cyan, { alpha: window4(t, 10.6, 11, 11.6, 11.95) });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "乘法在做什麼");
    const rows = [
      ["×2", "放大兩倍", C.cyan, 1],
      ["×(−1)", "翻到對面＝轉 180°", C.red, 1],
      ["×i", "轉 90°（轉一半）", C.magenta, seg(t, 5, 5.8) * (1 - seg(t, 11.3, 11.9))],
    ];
    rows.forEach(([k, v, col, a], i) => {
      const yy = y + 66 + i * 64;
      h.chip(x + 22, yy, k, col, { alpha: Math.max(a, 0.2) });
      h.text(v, x + 120, yy + 20, { size: 17, alpha: Math.max(a, 0.2) });
    });
    h.text("實數只會前兩種", x + 22, y + 290, { size: 15, color: "rgba(232,246,255,0.65)" });
    h.text("複數多了一種：轉任意角度", x + 22, y + 322, { size: 18, color: css(C.yellow), glow: 8, alpha: seg(t, 5.4, 6.2) * (1 - seg(t, 11.3, 11.9)) });
    h.text("目前轉了 " + Math.round(s.th * 180 / Math.PI) + "°", x + w - 22, y + hh - 26, { size: 16, mono: true, align: "right" });

    h.formula([
      "(−1)×(−1) = 1   ⇔  180° + 180° = 360°",
      "  i × i  = −1   ⇔   90° +  90° = 180°",
    ], { highlight: t > 5 && t < 11 ? 1 : 0 });
  },
};
