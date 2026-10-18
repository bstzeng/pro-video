// 第 33 課：代數基本定理：|p(z)| 畫成曲面，n 次多項式剛好有 n 個凹陷碰到地面
import { THREE, C, css, cp, seg, ball, tag } from "../../engine.js";

const ROOTS = {
  2: [[0, 1.2], [0, -1.2]],
  3: [0, 1, 2].map((k) => [1.4 * Math.cos(Math.PI / 2 + 2 * Math.PI * k / 3), 1.4 * Math.sin(Math.PI / 2 + 2 * Math.PI * k / 3)]),
  4: [[1.5, 0.5], [-0.4, 1.4], [-1.3, -0.7], [0.6, -1.3]],
};
const ORDER = [2, 3, 4];
const SPAN = 2.6, NG = 90;

// 高度 = |p(z)|^(1/n)：遠處像 |z|，靠近根時線性降到 0，凹陷清楚
function height(n, x, y) {
  let m = 1;
  ROOTS[n].forEach(([a, b]) => { m *= Math.hypot(x - a, y - b); });
  return Math.min(1.6, 0.55 * Math.pow(m, 1 / n));
}

export default {
  id: "l33-fundamental",
  poster: 100,
  camera: { target: [0, 0.2, -0.2], dist: 11.5, elev: 40, azim: -20, sway: 7 },

  setup(st) {
    const geo = new THREE.PlaneGeometry(2 * SPAN, 2 * SPAN, NG, NG);
    geo.rotateX(-Math.PI / 2);
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    const fill = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }));
    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.cyan, wireframe: true, transparent: true, opacity: 0.16 }));
    st.add(fill, wire);
    const dots = [0, 1, 2, 3].map(() => st.add(ball(C.yellow, 0.12)));
    return { geo, dots };
  },

  update(st, t, phase, s) {
    // 每 4 秒一個次數，段尾 0.8 秒漸變到下一個
    const k = Math.floor(t / 4), u = t - 4 * k;
    const n = ORDER[k], next = ORDER[(k + 1) % 3];
    const m = seg(u, 3.2, 4);
    const pos = s.geo.attributes.position, col = s.geo.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = -pos.getZ(i);
      const hgt = (1 - m) * height(n, x, y) + m * height(next, x, y);
      pos.setY(i, hgt);
      const c = Math.min(1, hgt / 1.6);
      col.setXYZ(i, 0.04 + 0.06 * c, 0.15 + 0.4 * c, 0.3 + 0.4 * c);
    }
    pos.needsUpdate = true; col.needsUpdate = true;
    s.dots.forEach((d, i) => {
      const r = ROOTS[n][i];
      d.setAlpha(r ? (1 - m) * seg(u, 0.2, 0.8) : 0);
      if (r) d.position.copy(cp(r[0], r[1], 0.08));
    });
    Object.assign(s, { n, m, u });
  },

  hud(st, h, t, phase, s) {
    h.title("代數基本定理：n 次就有 n 個根", "把 |p(z)| 畫成地形：n 次多項式的地形剛好有 n 個凹陷碰到地面，那些點就是根", tag(33));
    ROOTS[s.n].forEach(([a, b], i) => h.label(st, cp(a, b, 0.1), `r${"₁₂₃₄"[i]}`, C.yellow, { dx: 10, dy: 16, size: 15, alpha: (1 - s.m) * seg(s.u, 0.4, 1) }));

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "次數 = 根的個數");
    ORDER.forEach((nn, i) => h.chip(x + 22 + i * 100, y + 52, `n = ${nn}`, C.yellow, { size: 15, alpha: nn === s.n ? 1 : 0.35 }));
    h.text(`${s.n} 次多項式`, x + 22, y + 150, { size: 22 });
    h.text(`→ ${s.n} 個根`, x + 22, y + 188, { size: 26, color: css(C.yellow), glow: 8 });
    h.text(s.n === 2 ? "例：z² + 1.44 的根是 ±1.2i" : "（重根照次數算）", x + 22, y + 236, { size: 15, mono: s.n === 2, color: "rgba(232,246,255,0.75)" });
    h.text("實數裡 x² + 1 = 0 沒有根", x + 22, y + 300, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("複數裡一定有，而且剛好 n 個", x + 22, y + 330, { size: 16 });
    h.text("補一個洞，所有洞都補上了", x + w / 2, y + hh - 28, { size: 17, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["p(z) = (z − r₁)(z − r₂) … (z − rₙ)"]);
  },
};
