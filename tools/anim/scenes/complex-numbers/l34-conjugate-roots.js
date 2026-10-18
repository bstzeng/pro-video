// 第 34 課：實係數多項式的複數根成對出現：z² + c = 0 中 c 變大時，兩實根相撞後分裂成共軛對
import { THREE, C, css, cp, glowMesh, ball, fatLine, complexAxes, tag } from "../../engine.js";

const cOf = (t) => -1.6 * Math.cos(2 * Math.PI * t / 12);    // c：−1.6 → 1.6 → −1.6
const K = 1.4;

export default {
  id: "l34-conjugate-roots",
  poster: 110,
  camera: { target: [0, 0.2, 0.3], dist: 10, elev: 38, azim: -22, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.8, 2.8], im: [-2.4, 2.4], ticks: false });
    const mirror = glowMesh(new THREE.PlaneGeometry(5.6, 1.2), C.blue, { opacity: 0.06, edgeOpacity: 0.35 });
    mirror.position.set(0, 0.6, 0);
    st.add(mirror);
    const r1 = st.add(ball(C.yellow, 0.14)), r2 = st.add(ball(C.yellow, 0.14));
    const trail = st.add(fatLine(C.yellow, { width: 2, opacity: 0.4 }));
    const pts = [];
    for (let v = -1.6; v <= 1.61; v += 0.05) {
      const r = Math.sqrt(Math.abs(v)) * K;
      pts.push(v < 0 ? cp(r, 0, 0.03) : cp(0, r, 0.03));
    }
    const pts2 = pts.map((p) => new THREE.Vector3(-p.x, p.y, -p.z));
    trail.setPoints(pts.reverse().concat(pts2));
    return { axes, r1, r2 };
  },

  update(st, t, phase, s) {
    const c = cOf(t), r = Math.sqrt(Math.abs(c)) * K;
    const a = c < 0 ? [r, 0] : [0, r], b = c < 0 ? [-r, 0] : [0, -r];
    s.r1.position.copy(cp(...a, 0.14));
    s.r2.position.copy(cp(...b, 0.14));
    Object.assign(s, { c, a, b });
  },

  hud(st, h, t, phase, s) {
    h.title("共軛根成對出現", "係數都是實數時，複數根一定上下對稱：兩個實根相撞之後，會分裂成一對共軛根", tag(34));
    s.axes.labels(h);
    const fmt = ([x, y]) => (Math.abs(y) < 1e-6 ? (x / K * K).toFixed(2) : `${y > 0 ? "" : "−"}${Math.abs(y / K * K).toFixed(2)}i`);
    const real = s.c < 0;
    h.label(st, cp(...s.a, 0.14), real ? `+${Math.sqrt(-s.c).toFixed(2)}` : `+${Math.sqrt(s.c).toFixed(2)}i`, C.yellow, { dx: 12, dy: -8, size: 15 });
    h.label(st, cp(...s.b, 0.14), real ? `−${Math.sqrt(-s.c).toFixed(2)}` : `−${Math.sqrt(s.c).toFixed(2)}i`, C.yellow, { dx: 12, dy: 18, size: 15 });
    const mp = st.project(new THREE.Vector3(2.6, 1.2, 0));
    h.text("實軸是鏡子", mp[0], mp[1], { size: 14, color: css(C.blue) });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "z² + c = 0");
    h.text(`c = ${s.c.toFixed(2)}`, x + 22, y + 80, { size: 22, mono: true });
    h.chip(x + 22, y + 104, real ? "兩個實根（左右）" : Math.abs(s.c) < 0.05 ? "相撞：重根" : "一對共軛根（上下）", real ? C.cyan : C.yellow, { mono: false, size: 15 });
    const map = h.plot(x + 30, y + 180, w - 60, 140, { xr: [-1.6, 1.6], yr: [-1.4, 1.4], xLabel: "c" });
    h.curve(map.sample((v) => (v < 0 ? Math.sqrt(-v) : 0), -1.6, 0), C.cyan, { width: 2 });
    h.curve(map.sample((v) => (v < 0 ? -Math.sqrt(-v) : 0), -1.6, 0), C.cyan, { width: 2 });
    h.curve(map.sample((v) => Math.sqrt(v), 0, 1.6), C.yellow, { width: 2, dash: [5, 4] });
    h.curve(map.sample((v) => -Math.sqrt(v), 0, 1.6), C.yellow, { width: 2, dash: [5, 4] });
    h.dot(...map(s.c, real ? Math.sqrt(-s.c) : Math.sqrt(s.c)), C.yellow, { r: 5 });
    h.text("實線：實部　虛線：虛部", x + 30, y + 350, { size: 13, color: "rgba(232,246,255,0.65)" });
    h.text("r 是根 ⇒ r̄ 也是根", x + w / 2, y + hh - 28, { size: 18, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["實係數多項式：p(r) = 0 ⇒ p(r̄) = 0"]);
  },
};
