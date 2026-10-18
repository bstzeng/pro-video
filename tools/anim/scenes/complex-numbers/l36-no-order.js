// 第 36 課：複數不能比大小：平面上的點沒有先後；能比的只有模（離原點多遠）
import { THREE, C, css, cp, seg, window4, fatLine, arcPoints, complexAxes, particles, tag } from "../../engine.js";

const PTS = [[1.5, 1.2], [-0.8, 2.1], [-2.1, -0.6], [0.6, -1.4], [2.3, -0.4], [-1.2, 0.9], [0.3, 0.7]];
const MOD = PTS.map(([a, b]) => Math.hypot(a, b));
const COL = [C.cyan, C.green, C.magenta, C.orange, C.blue, C.red, C.yellow];

export default {
  id: "l36-no-order",
  poster: 120,
  camera: { target: [0, 0, 0.2], dist: 11, elev: 58, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.6, 2.6], ticks: false });
    const dots = st.add(particles(PTS.length, { radius: 0.12 }));
    const ring = st.add(fatLine(C.yellow, { width: 3 }));
    const rings = PTS.map((p, i) => st.add(fatLine(COL[i], { width: 1.2, opacity: 0.45 })));
    return { axes, dots, ring, rings };
  },

  update(st, t, phase, s) {
    const r = 2.8 * seg(t, 3, 10.4);
    const fade = 1 - seg(t, 11, 11.9);
    s.ring.setPoints(arcPoints(Math.max(r, 0.01), 0, 2 * Math.PI, 0.03, 128)).setAlpha(r > 0.02 ? fade : 0);
    PTS.forEach((p, i) => {
      const lit = r >= MOD[i];
      s.dots.place(i, cp(...p, 0.12), COL[i], lit ? 1.3 : 1);
      s.rings[i].setPoints(arcPoints(MOD[i], 0, 2 * Math.PI, 0.02, 96)).setAlpha(lit ? fade : 0);
    });
    s.dots.commit();
    s.r = r;
  },

  hud(st, h, t, phase, s) {
    h.title("複數不能比大小", "線上的點有左右，平面上的點沒有天然的先後；要比，只能比離原點多遠（模）", tag(36));
    s.axes.labels(h);
    PTS.forEach((p, i) => h.label(st, cp(...p, 0.12), "ABCDEFG"[i], COL[i], { dx: 10, dy: -8, size: 16 }));
    h.text("哪個比較大？", 300, 170, { size: 22, color: css(C.yellow), glow: 8, alpha: window4(t, 0.4, 1, 2.6, 3.2) });

    const order = PTS.map((p, i) => i).sort((a, b) => MOD[a] - MOD[b]);
    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "依模 |z| 排序");
    order.forEach((i, k) => {
      const lit = s.r >= MOD[i];
      const yy = y + 66 + k * 44;
      h.text("ABCDEFG"[i], x + 22, yy, { size: 17, mono: true, color: css(COL[i]), alpha: lit ? 1 : 0.3 });
      h.bar(x + 56, yy - 9, 200, MOD[i] / 2.8, COL[i], { alpha: lit ? 1 : 0.2 });
      h.text(MOD[i].toFixed(2), x + w - 22, yy, { size: 15, mono: true, align: "right", alpha: lit ? 1 : 0.3 });
    });
    h.text("比的是 |z|，不是 z 本身", x + w / 2, y + hh - 26, { size: 17, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["|z| = √(a² + b²)  是實數，可以比大小"]);
  },
};
