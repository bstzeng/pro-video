// 第 14 課：1 的 n 次方根均勻分布在單位圓上，連成正 n 邊形（n = 3、4、5、6，各 3 秒）
import { THREE, C, css, cp, seg, window4, fatLine, complexAxes, unitCircle, particles, tag } from "../../engine.js";

const R = 2.2;
const NS = [3, 4, 5, 6];
const COL = [C.cyan, C.magenta, C.green, C.orange];

export default {
  id: "l14-roots",
  poster: 25,
  camera: { target: [0, 0, 0.2], dist: 11.2, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.8, 2.8], ticks: false });
    st.add(unitCircle(R, C.blue, 0.4));
    const dots = st.add(particles(6, { radius: 0.13 }));
    const poly = st.add(fatLine(C.yellow, { width: 3 }));
    return { axes, dots, poly };
  },

  update(st, t, phase, s) {
    const k = Math.floor(t / 3), u = t - 3 * k, n = NS[k];
    const spread = seg(u, 0.15, 1.3);                       // 從 1 這一點散開到各自的位置
    const a = window4(u, 0, 0.3, 2.65, 2.98);
    const pts = [];
    for (let j = 0; j < 6; j++) {
      if (j < n) {
        const ang = 2 * Math.PI * j / n * spread;
        const p = cp(R * Math.cos(ang), R * Math.sin(ang), 0.13);
        s.dots.place(j, p, COL[k], a);
        pts.push(p);
      } else s.dots.place(j, cp(0, 0, -5), COL[k], 0.0001);
    }
    s.dots.commit();
    const draw = seg(u, 1.3, 2.1);
    const ring = pts.concat([pts[0]]);
    const m = draw * n;
    const part = [];
    for (let j = 0; j <= Math.floor(m) && j < ring.length; j++) part.push(ring[j]);
    if (m % 1 > 0 && Math.floor(m) + 1 < ring.length) part.push(ring[Math.floor(m)].clone().lerp(ring[Math.floor(m) + 1], m % 1));
    s.poly.setPoints(part).setAlpha(a * (draw > 0 ? 1 : 0));
    Object.assign(s, { k, n, u, a, spread });
  },

  hud(st, h, t, phase, s) {
    h.title("n 次方根是正 n 邊形", "zⁿ = 1 有 n 個解：每個都在單位圓上，彼此相隔 360°/n", tag(14));
    s.axes.labels(h);
    const { k, n, a } = s;
    h.label(st, cp(R, 0, 0.13), "1", C.cyan, { dx: 12, dy: 22, size: 18 });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "zⁿ = 1 的解");
    NS.forEach((nn, i) => h.chip(x + 22 + i * 80, y + 52, "n=" + nn, COL[i], { size: 15, alpha: i === k ? 1 : 0.35 }));
    h.text(`${n} 個根`, x + 22, y + 150, { size: 30, color: css(COL[k]), glow: 8, alpha: Math.max(a, 0.3) });
    h.text(`相隔 360° / ${n} = ${360 / n}°`, x + 22, y + 196, { size: 18, mono: true, alpha: Math.max(a, 0.3) });
    h.text("每個根乘 n 次方：", x + 22, y + 256, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`角度 × ${n} = 360° 的倍數 → 回到 1`, x + 22, y + 288, { size: 16, mono: true });
    h.text("模取 n 次方、角度乘 n", x + w / 2, y + hh - 34, { size: 18, align: "center", color: css(C.yellow), glow: 8 });

    h.formula(["z_k = e^{i·2πk/n},  k = 0 … n−1", "(r e^{iθ})ⁿ = rⁿ e^{inθ}"]);
  },
};
