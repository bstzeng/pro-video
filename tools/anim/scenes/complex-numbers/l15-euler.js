// 第 15 課：e^{iθ} 是等速旋轉：速度永遠等於 i × 位置，垂直於半徑
import { THREE, C, css, cp, arrow, fatLine, arcPoints, complexAxes, unitCircle, ball, tag } from "../../engine.js";

const R = 2.1;
const OM = 2 * Math.PI / 6;     // 6 秒一圈

export default {
  id: "l15-euler",
  poster: 14,
  camera: { target: [0, 0, 0.2], dist: 11.2, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.8, 2.8], ticks: false });
    st.add(unitCircle(R, C.blue, 0.4));
    const pos = st.add(arrow(C.cyan, { radius: 0.04, head: 0.24 }));
    const vel = st.add(arrow(C.orange, { radius: 0.04, head: 0.24 }));
    const sq = st.add(fatLine(C.text ?? 0xe8f6ff, { width: 1.5, opacity: 0.8 }));
    const dot = st.add(ball(C.cyan, 0.11));
    const trail = st.add(fatLine(C.cyan, { width: 3, opacity: 0.85 }));
    return { axes, pos, vel, sq, dot, trail };
  },

  update(st, t, phase, s) {
    const th = OM * t;
    const p = [R * Math.cos(th), R * Math.sin(th)];
    const v = [-Math.sin(th), Math.cos(th)].map((x) => x * 1.3);       // i × 位置的方向
    s.pos.set(cp(0, 0, 0.1), cp(...p, 0.1));
    s.vel.set(cp(...p, 0.1), cp(p[0] + v[0], p[1] + v[1], 0.1));
    s.dot.position.copy(cp(...p, 0.1));
    // 直角記號
    const u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)], q = 0.25;
    const c0 = [p[0] - u[0] * q, p[1] - u[1] * q];
    s.sq.setPoints([cp(...c0, 0.1), cp(c0[0] + n[0] * q, c0[1] + n[1] * q, 0.1), cp(p[0] + n[0] * q, p[1] + n[1] * q, 0.1)]);
    const k = th % (2 * Math.PI);
    s.trail.setPoints(arcPoints(R, Math.max(0, th - 1.6), th, 0.04, 40));
    Object.assign(s, { th: k, p });
  },

  hud(st, h, t, phase, s) {
    h.title("e^{iθ} 是等速旋轉", "指數函數的特性是「變化率 = 自己」；乘上 i 之後，變化的方向永遠轉 90°，點就沿著圓走", tag(15));
    s.axes.labels(h);
    const { th, p } = s;
    h.label(st, cp(...p, 0.1), "e^{iθ}", C.cyan, { dx: 12, dy: -10, size: 16 });
    const vp = st.project(cp(p[0] - Math.sin(th) * 1.3, p[1] + Math.cos(th) * 1.3, 0.1));
    h.text("速度 = i·e^{iθ}", vp[0] + 10, vp[1] + 4, { size: 15, mono: true, color: css(C.orange) });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "實部、虛部是兩條波");
    const map = h.plot(x + 30, y + 70, w - 60, 200, { xr: [0, 2 * Math.PI], yr: [-1.2, 1.2], xLabel: "θ" });
    h.curve(map.sample(Math.cos, 0, 2 * Math.PI), C.cyan, { width: 2.2 });
    h.curve(map.sample(Math.sin, 0, 2 * Math.PI), C.magenta, { width: 2.2 });
    const [cx] = map(th, 0);
    h.curve([[cx, y + 70], [cx, y + 270]], 0xe8f6ff, { width: 1, glow: 0, alpha: 0.5 });
    h.dot(...map(th, Math.cos(th)), C.cyan, { r: 5 });
    h.dot(...map(th, Math.sin(th)), C.magenta, { r: 5 });
    h.text("cos θ（實部）", x + 30, y + 312, { size: 15, mono: true, color: css(C.cyan) });
    h.text("sin θ（虛部）", x + 200, y + 312, { size: 15, mono: true, color: css(C.magenta) });
    h.text(`θ = ${(th * 180 / Math.PI).toFixed(0)}°`, x + 30, y + 360, { size: 18, mono: true });
    h.text("速度 ⟂ 半徑 → 圓周運動", x + w / 2, y + hh - 30, { size: 18, align: "center", color: css(C.orange), glow: 8 });

    h.formula(["d/dθ e^{iθ} = i · e^{iθ}", "e^{iθ} = cos θ + i sin θ"]);
  },
};
