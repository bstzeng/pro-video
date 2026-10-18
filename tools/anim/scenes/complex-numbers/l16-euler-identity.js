// 第 16 課：e^{iπ} = −1：沿單位圓走弧長 π，轉半圈到對面
import { THREE, C, css, cp, seg, window4, arrow, fatLine, arcPoints, complexAxes, unitCircle, ball, tag } from "../../engine.js";

const R = 2.2;

export default {
  id: "l16-euler-identity",
  poster: 100,
  camera: { target: [0, 0, -0.1], dist: 10.8, elev: 50, azim: -6, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-1, 2.9], ticks: false });
    st.add(unitCircle(R, C.blue, 0.3));
    const one = st.add(ball(C.cyan, 0.12)); one.position.copy(cp(R, 0, 0.12));
    const neg = st.add(ball(C.red, 0.14)); neg.position.copy(cp(-R, 0, 0.14));
    const arm = st.add(arrow(C.yellow, { radius: 0.04, head: 0.26 }));
    const path = st.add(fatLine(C.yellow, { width: 4 }));
    return { axes, neg, arm, path };
  },

  update(st, t, phase, s) {
    // 1.2–5.6 秒走上半圈；8.6–11.4 秒繼續走下半圈回到 1
    const th = Math.PI * seg(t, 1.2, 5.6) + Math.PI * seg(t, 8.6, 11.4);
    s.arm.set(cp(0, 0, 0.12), cp(R * Math.cos(th), R * Math.sin(th), 0.12));
    s.path.setPoints(arcPoints(R, 0, Math.max(th, 0.0001), 0.05, 96)).setAlpha(th > 0.01 ? 1 - seg(t, 11.4, 11.95) : 0);
    s.neg.scale.setScalar(1 + 0.5 * window4(t, 5.4, 6, 8.2, 8.8));
    s.th = th;
  },

  hud(st, h, t, phase, s) {
    h.title("e^{iπ} = −1", "不是神秘的巧合：沿單位圓走弧長 π，剛好轉半圈，走到 −1", tag(16));
    s.axes.labels(h);
    const th = s.th;
    h.label(st, cp(R, 0, 0.12), "1", C.cyan, { dx: 12, dy: 22, size: 18 });
    const np = st.project(cp(-R, 0, 0.14));
    h.callout(np, [np[0] + 60, np[1] + 80], "e^{iπ} = −1：轉半圈走到對面", C.red, { mono: false, alpha: window4(t, 5.4, 6, 8.4, 9) });
    const op = st.project(cp(R, 0, 0.12));
    h.callout(op, [op[0] - 40, op[1] + 80], "e^{i2π} = 1：轉滿一圈", C.cyan, { alpha: window4(t, 11, 11.3, 11.7, 11.95) });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "三個常數各管一件事");
    const rows = [
      ["e", "指數：變化率 = 自己 → 等速旋轉", C.cyan],
      ["i", "方向：乘 i 就轉 90°", C.magenta],
      ["π", "距離：半圈的弧長", C.yellow],
    ];
    rows.forEach(([k, v, col], i) => {
      const yy = y + 60 + i * 66;
      h.chip(x + 22, yy, k, col, { size: 18 });
      h.text(v, x + 76, yy + 22, { size: 15 });
    });
    h.text("走過的弧長 θ", x + 22, y + 290, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(th.toFixed(2), x + w - 22, y + 290, { size: 22, mono: true, align: "right", color: css(C.yellow), glow: 6 });
    h.bar(x + 22, y + 310, w - 44, th / (2 * Math.PI), C.yellow);
    h.text("π = 3.14 → 剛好半圈", x + 22, y + hh - 34, { size: 17, mono: true, alpha: Math.max(0.35, window4(t, 5.4, 6, 8.4, 9)) });

    h.formula(["e^{iπ} + 1 = 0", "e^{iθ}：沿單位圓走弧長 θ"], { highlight: t > 5.4 && t < 9 ? 0 : -1 });
  },
};
