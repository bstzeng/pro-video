// 第 38 課：i 就是旋轉 90° 的矩陣：套用兩次得到 −I
import { THREE, C, css, cp, seg, glowMesh, tag } from "../../engine.js";

const F = [[0.5, 0.3], [0.95, 0.3], [0.95, 1.15], [1.65, 1.15], [1.65, 1.55], [0.95, 1.55],
  [0.95, 2.0], [2.0, 2.0], [2.0, 2.45], [0.5, 2.45]];
function fGeo() {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(F.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.1, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g;
}
function grid(color, opacity) {
  const p = [];
  for (let k = -2; k <= 2; k++) p.push(cp(k, -2), cp(k, 2), cp(-2, k), cp(2, k));
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
// 1.2–3.6 秒乘一次 i；5.2–7.6 秒再乘一次；9–11.4 秒再轉 180° 回原位
const angOf = (t) => Math.PI / 2 * (seg(t, 1.2, 3.6) + seg(t, 5.2, 7.6) + 2 * seg(t, 9, 11.4));

export default {
  id: "l38-matrix",
  poster: 100,
  camera: { target: [0, 0, 0.2], dist: 10.5, elev: 58, azim: -8, sway: 6 },

  setup(st) {
    const ghost = glowMesh(fGeo(), C.blue, { opacity: 0.06, edgeOpacity: 0.3 });
    st.add(ghost);
    const g = new THREE.Group();
    g.add(grid(C.cyan, 0.3));
    const f = glowMesh(fGeo(), C.cyan, { opacity: 0.22 });
    g.add(f);
    st.add(g);
    return { g };
  },

  update(st, t, phase, s) {
    s.ang = angOf(t);
    s.g.rotation.y = s.ang;
  },

  hud(st, h, t, phase, s) {
    h.title("i 就是「旋轉 90°」的矩陣", "把 i 寫成矩陣 [[0, −1], [1, 0]]：作用在平面上就是轉 90°，套兩次就是 −I（轉半圈）", tag(38));
    const n = Math.round(s.ang / (Math.PI / 2)) % 4;
    const x = 884, y = 130, w = 356, hh = 460;
    h.panel(x, y, w, hh, "a + bi ↔ [[a, −b], [b, a]]");
    const mat = (cx, cy, rows, col) => {
      h.text("[", cx - 14, cy + 34, { size: 52, weight: 500, color: css(col) });
      h.text("]", cx + 98, cy + 34, { size: 52, weight: 500, color: css(col) });
      rows.forEach((r, i) => r.forEach((v, j) => h.text(v, cx + 20 + j * 50, cy + 10 + i * 34, { size: 20, mono: true, align: "center" })));
    };
    h.text("i  ↔", x + 22, y + 92, { size: 20, mono: true });
    mat(x + 110, y + 74, [["0", "−1"], ["1", "0"]], C.cyan);
    h.text("i² ↔", x + 22, y + 192, { size: 20, mono: true });
    mat(x + 110, y + 174, [["−1", "0"], ["0", "−1"]], C.red);
    h.text("= −I", x + 250, y + 192, { size: 20, mono: true, color: css(C.red) });
    h.text("目前乘了幾次 i", x + 22, y + 290, { size: 15, color: "rgba(232,246,255,0.7)" });
    ["1", "i", "−1", "−i"].forEach((v, k) => h.chip(x + 22 + k * 76, y + 306, v, k === 2 ? C.red : C.cyan, { size: 15, alpha: k === n ? 1 : 0.3 }));
    h.text(n === 2 ? "整個圖形倒過來：i² = −1" : "每乘一次 i 轉 90°", x + w / 2, y + hh - 34, { size: 17, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["[[0,−1],[1,0]]² = [[−1,0],[0,−1]] = −I"]);
  },
};
