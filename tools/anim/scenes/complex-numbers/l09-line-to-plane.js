// 第 9 課：從線到面：實數躺在橫軸上；一個複數可以讀成點，也可以讀成箭頭
import { THREE, C, css, cp, seg, window4, polyline, fatLine, arrow, ball, particles, complexAxes, tag } from "../../engine.js";

const Z = [3, 2];
const REALS = [-3, -2.5, -1.5, -0.7, 0.5, 1, 1.8, 2.6, 3.3];

export default {
  id: "l09-line-to-plane",
  poster: 120,
  camera: { target: [0.4, 0, -0.6], dist: 10, elev: 50, azim: -10, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3.6, 3.8], im: [-0.01, 3.2], ticks: false });
    const imAxis = axes.children[1];
    const gl = [];
    for (let k = -3; k <= 3; k++) gl.push(cp(k, -2.6), cp(k, 2.9));
    for (let k = -2; k <= 2; k++) gl.push(cp(-3.4, k), cp(3.6, k));
    const grid = st.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gl),
      new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.2 })));
    const reals = st.add(particles(REALS.length, { radius: 0.08 }));
    REALS.forEach((r, i) => reals.place(i, cp(r, 0, 0.08), C.cyan));
    reals.commit();
    const pt = st.add(ball(C.yellow, 0.13)); pt.position.copy(cp(...Z, 0.13));
    const proj = st.add(fatLine(C.yellow, { width: 1.6, opacity: 0.8, dashed: true }));
    proj.setPoints([cp(Z[0], 0, 0.02), cp(...Z, 0.02), cp(0, Z[1], 0.02)]);
    const arr = st.add(arrow(C.orange, { radius: 0.035, head: 0.24 })).set(cp(0, 0, 0.1), cp(...Z, 0.1));
    return { axes, imAxis, grid, pt, proj, arr };
  },

  update(st, t, phase, s) {
    const plane = window4(t, 1.8, 3.6, 11.1, 11.9);
    s.grid.scale.set(1, 1, Math.max(plane, 0.001));
    s.grid.material.opacity = 0.2 * plane;
    s.imAxis.scale.set(1, 1, Math.max(plane, 0.001));
    s.pt.setAlpha(window4(t, 4.2, 4.8, 11.1, 11.9));
    s.proj.setAlpha(window4(t, 4.8, 5.6, 7.6, 8.2));
    s.arr.setAlpha(window4(t, 8, 8.8, 11.1, 11.9));
    s.plane = plane;
  },

  hud(st, h, t, phase, s) {
    h.title("從線到面", "實數住在一條線上，複數住在一個平面上：實數就是虛部為 0 的那一條線", tag(9));
    s.axes.labels(h, { alpha: Math.max(0.6, s.plane) });
    const lp = st.project(cp(-2.5, 0, 0.08));
    h.callout(lp, [lp[0] + 10, lp[1] + 70], "實數全部躺在橫軸上", C.cyan, { alpha: window4(t, 0.4, 1, 3.6, 4.2) });
    const zp = st.project(cp(...Z, 0.13));
    h.label(st, cp(...Z, 0.13), "3 + 2i", C.yellow, { dx: 14, dy: -10, alpha: window4(t, 4.4, 5, 11.1, 11.9) });
    h.label(st, cp(Z[0], 0), "3", C.yellow, { dx: -4, dy: 22, alpha: window4(t, 5.2, 5.8, 7.6, 8.2) });
    h.label(st, cp(0, Z[1]), "2", C.yellow, { dx: -20, dy: 4, alpha: window4(t, 5.2, 5.8, 7.6, 8.2) });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "z = 3 + 2i 的兩種讀法");
    const a1 = window4(t, 4.8, 5.4, 7.6, 8.2), a2 = window4(t, 8, 8.6, 11.1, 11.9);
    h.chip(x + 22, y + 64, "讀法一：點", C.yellow, { mono: false, alpha: Math.max(0.3, a1) });
    h.text("座標 (3, 2)", x + 22, y + 132, { size: 20, mono: true, alpha: Math.max(0.3, a1) });
    h.text("實部 3、虛部 2", x + 22, y + 162, { size: 15, color: "rgba(232,246,255,0.7)", alpha: Math.max(0.3, a1) });
    h.chip(x + 22, y + 200, "讀法二：箭頭", C.orange, { mono: false, alpha: Math.max(0.3, a2) });
    h.text("從原點指向 3 + 2i", x + 22, y + 268, { size: 18, alpha: Math.max(0.3, a2) });
    h.text("之後的「動作」都用這個讀法", x + 22, y + 298, { size: 15, color: "rgba(232,246,255,0.7)", alpha: Math.max(0.3, a2) });
    h.text("一維擴充成二維", x + w / 2, y + hh - 30, { size: 19, align: "center", color: css(C.cyan), glow: 8, alpha: window4(t, 2.6, 3.4, 4.2, 4.8) });

    h.formula(["z = a + bi  ↔  點 (a, b)", "實數 = 虛部為 0 的複數"], { highlight: t < 4.4 ? 1 : 0 });
  },
};
