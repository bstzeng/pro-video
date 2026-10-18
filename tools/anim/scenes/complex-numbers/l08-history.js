// 第 8 課：從中間值到真正的數：先有用、後有意義，直到畫上平面
import { THREE, C, css, cp, seg, window4, polyline, ball, glowMesh, tag } from "../../engine.js";

const EVENTS = [
  [1545, "卡爾達諾公開三次方程式公式", 0.6],
  [1572, "邦貝利：負數平方根照規則算", 2.2],
  [1637, "笛卡兒：「想像的數」（貶意）", 3.8],
  [1748, "尤拉：連起指數與三角", 5.4],
  [1797, "魏塞爾、阿爾岡、高斯：畫在平面上", 7.0],
];
const STAGES = [["工具期", 0, 3.8], ["質疑期", 3.8, 7.0], ["合法期", 7.0, 12]];

export default {
  id: "l08-history",
  poster: 140,
  camera: { target: [0, 0.6, 0.4], dist: 10, elev: 38, azim: -10, sway: 6 },

  setup(st) {
    const line = st.add(polyline(C.blue, { opacity: 0.9 }).setPoints([cp(-3.6, 0), cp(3.6, 0)]));
    const ticks = [];
    for (let k = -3; k <= 3; k++) ticks.push(cp(k, -0.1), cp(k, 0.1));
    st.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks),
      new THREE.LineBasicMaterial({ color: C.blue, transparent: true, opacity: 0.8 })));
    // 合法期：一片平面從實數線「立起來再放平」
    const plane = new THREE.Group();
    const sheet = glowMesh(new THREE.PlaneGeometry(7, 5), C.cyan, { opacity: 0.06, edgeOpacity: 0.5 });
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.z = -2.5;
    const gl = [];
    for (let k = 1; k <= 5; k++) gl.push(cp(-3.5, k), cp(3.5, k));
    for (let k = -3; k <= 3; k++) gl.push(cp(k, 0), cp(k, 5));
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gl),
      new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.25 }));
    const imAxis = polyline(C.blue, { opacity: 0.9 }).setPoints([cp(0, 0), cp(0, 4.6)]);
    plane.add(sheet, grid, imAxis);
    st.add(plane);
    const q = st.add(ball(C.magenta, 0.15));
    return { plane, sheet, grid, imAxis, q };
  },

  update(st, t, phase, s) {
    // 平面在 7–9 秒從直立轉成平放，結尾淡出
    const lie = seg(t, 7, 9.2);
    const a = window4(t, 6.6, 7.2, 11.2, 11.9);
    s.plane.rotation.x = (1 - lie) * Math.PI / 2 * 0.98;
    s.sheet.setAlpha(a);
    s.grid.material.opacity = 0.25 * a;
    s.imAxis.setAlpha(a);
    // √−1：前段在實數線上方飄、找不到位置；平面放平後落在 i
    const drift = [Math.sin(t * 1.7) * 1.4, 1.2 + 0.3 * Math.sin(t * 2.3)];
    const land = seg(t, 8.6, 10);
    const pos = cp(drift[0] * (1 - land), 0, 0);
    pos.y = (drift[1] * (1 - land)) + 0.15;
    pos.z = -1 * land;
    s.q.position.copy(pos);
    s.q.setAlpha(window4(t, 2.2, 2.8, 11.2, 11.9) * (land > 0.99 ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t * 5))));
    s.land = land;
  },

  hud(st, h, t, phase, s) {
    h.title("從中間值到真正的數", "兩百多年來大家都在用一個說不出是什麼的東西；直到把它畫上平面，才成為正式的數", tag(8));
    const qp = st.project(s.q.position);
    h.callout(qp, [qp[0] + 70, qp[1] - 50], s.land > 0.99 ? "√−1 = i：虛軸上的一個點" : "√−1：放在哪裡？",
      C.magenta, { alpha: window4(t, 2.6, 3.2, 11, 11.6) });
    h.label(st, cp(3.6, 0), "實數線", C.blue, { mono: false, size: 14, dx: 6, dy: 18 });

    const x = 884, y = 120, w = 356, hh = 480;
    h.panel(x, y, w, hh, "三個階段");
    STAGES.forEach(([n, a0, a1], i) => {
      const on = t >= a0 && t < a1;
      h.chip(x + 22 + i * 108, y + 50, n, on ? C.yellow : C.blue, { mono: false, size: 14, alpha: on ? 1 : 0.45 });
    });
    const x0 = x + 40;
    h.curve([[x0, y + 120], [x0, y + hh - 40]], C.blue, { width: 1.5, glow: 0, alpha: 0.6 });
    EVENTS.forEach(([yr, txt, at], i) => {
      const yy = y + 130 + i * 66;
      const on = t >= at;
      h.dot(x0, yy, on ? C.yellow : C.blue, { r: on ? 6 : 4, alpha: on ? 1 : 0.5 });
      h.text(String(yr), x0 + 20, yy + 6, { size: 17, mono: true, color: on ? css(C.yellow) : "rgba(232,246,255,0.5)" });
      h.text(txt, x0 + 82, yy + 6, { size: 14, alpha: on ? 1 : 0.4 });
    });

    h.formula(["e^{iθ} = cos θ + i sin θ    （尤拉）"], { highlight: t > 5.4 && t < 7 ? 0 : -1 });
  },
};
