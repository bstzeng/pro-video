// 第 12 課：i 的四次循環：每乘一次 i 轉 90°
import { THREE, C, css, cp, seg, arrow, fatLine, arcPoints, complexAxes, ball, unitCircle, tag } from "../../engine.js";

const R = 2.2;
const LABELS = ["1", "i", "−1", "−i"];
const COLORS = [C.cyan, C.magenta, C.red, C.green];
// 每 3 秒一步：先停 0.9 秒，再用 2.1 秒轉 90°
const stepAngle = (t) => {
  const k = Math.floor(t / 3), u = seg(t - 3 * k, 0.9, 3);
  return { k, u, th: (k + u) * Math.PI / 2 };
};

export default {
  id: "l12-i-cycle",
  poster: 40,
  camera: { target: [0, 0, 0.2], dist: 11.4, elev: 52, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.8, 2.8], ticks: false });
    st.add(unitCircle(R, C.blue, 0.35));
    const dots = [0, 1, 2, 3].map((k) => {
      const b = st.add(ball(COLORS[k], 0.12));
      b.position.copy(cp(R * Math.cos(k * Math.PI / 2), R * Math.sin(k * Math.PI / 2), 0.12));
      return b;
    });
    const arm = st.add(arrow(C.yellow, { radius: 0.045, head: 0.28 }));
    const arc = st.add(fatLine(C.yellow, { width: 3 }));
    return { axes, dots, arm, arc };
  },

  update(st, t, phase, s) {
    const { k, u, th } = stepAngle(t);
    s.arm.set(cp(0, 0, 0.14), cp(R * Math.cos(th), R * Math.sin(th), 0.14));
    s.arc.setPoints(arcPoints(R * 0.55, k * Math.PI / 2, th + 0.0001, 0.06)).setAlpha(u > 0.01 && u < 0.999 ? 1 : 0.0);
    s.dots.forEach((d, i) => d.scale.setScalar(i === (k + (u > 0.5 ? 1 : 0)) % 4 ? 1.45 : 1));
    Object.assign(s, { k, u, th });
  },

  hud(st, h, t, phase, s) {
    h.title("i 的四次循環", "每乘一次 i 就轉 90°：1 → i → −1 → −i → 1；i² = −1 就是轉兩次 90°", tag(12));
    s.axes.labels(h);
    [0, 1, 2, 3].forEach((k) => {
      const off = [[14, 22], [12, -12], [-34, 22], [12, 24]][k];
      h.label(st, cp(R * Math.cos(k * Math.PI / 2), R * Math.sin(k * Math.PI / 2), 0.12), LABELS[k], COLORS[k],
        { dx: off[0], dy: off[1], size: 20 });
    });
    if (s.u > 0.02 && s.u < 0.98) {
      const mid = s.k * Math.PI / 2 + Math.PI / 4;
      h.label(st, cp(R * 0.7 * Math.cos(mid), R * 0.7 * Math.sin(mid), 0.1), "×i", C.yellow, { dx: -10, dy: 6, size: 18 });
    }

    const cur = (s.k + (s.u > 0.5 ? 1 : 0)) % 4;
    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "i 的次方");
    const pow = ["i⁰", "i¹", "i²", "i³", "i⁴"];
    for (let n = 0; n <= 4; n++) {
      const yy = y + 62 + n * 58;
      const on = n === cur || (n === 4 && cur === 0 && s.k === 3 && s.u > 0.5);
      h.text(pow[n], x + 30, yy + 22, { size: 22, mono: true, alpha: on ? 1 : 0.45 });
      h.text("=", x + 90, yy + 22, { size: 20, mono: true, alpha: on ? 1 : 0.45 });
      h.chip(x + 120, yy, LABELS[n % 4], COLORS[n % 4], { size: 16, alpha: on ? 1 : 0.35 });
      h.text((n * 90) + "°", x + w - 26, yy + 22, { size: 17, mono: true, align: "right", alpha: on ? 1 : 0.45 });
    }

    h.formula(["i² = −1  ⇔  轉 90° 兩次 = 轉 180°", "i⁴ = 1   ⇔  轉滿一圈"], { highlight: cur === 2 ? 0 : (cur === 0 && s.k === 3 ? 1 : -1) });
  },
};
