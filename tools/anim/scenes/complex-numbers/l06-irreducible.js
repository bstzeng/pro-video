// 第 6 課：不可約情形：三個相異實根 ⇔ Δ < 0
import { THREE, C, css, seg, fatLine, polyline, sample, ball, tag } from "../../engine.js";

const V = (x, y) => new THREE.Vector3(x, y, 0);
const Q = 4, SC = 0.1;
const pOf = (t) => 9 - 9 * Math.cos(2 * Math.PI * t / 12);   // p 在 0 → 18 → 0 之間來回
const delta = (p) => Q * Q / 4 - p * p * p / 27;
const P_CRIT = Math.cbrt(27 * Q * Q / 4);                     // Δ = 0 的地方，約 4.76

function realRoots(p) {
  // x³ − p x − q = 0 的實根（三角解法／卡爾達諾）
  const d = delta(p);
  if (d < 0) {
    const r = 2 * Math.sqrt(p / 3), phi = Math.acos((Q / 2) / Math.pow(p / 3, 1.5));
    return [0, 1, 2].map((k) => r * Math.cos((phi - 2 * Math.PI * k) / 3));
  }
  const s = Math.sqrt(d);
  return [Math.cbrt(Q / 2 + s) + Math.cbrt(Q / 2 - s)];
}

export default {
  id: "l06-irreducible",
  poster: 90,
  camera: { target: [0.3, 0.1, 0], dist: 16, elev: 12, azim: -12, sway: 7, swayElev: 1.5 },

  setup(st) {
    st.add(polyline(C.blue, { opacity: 0.8 }).setPoints([V(-5.4, 0), V(5.4, 0)]));
    st.add(polyline(C.blue, { opacity: 0.5 }).setPoints([V(0, -3.4), V(0, 3.4)]));
    const curve = st.add(fatLine(C.orange, { width: 3.5 }));
    const dots = [0, 1, 2].map(() => st.add(ball(C.yellow, 0.13)));
    return { curve, dots };
  },

  update(st, t, phase, s) {
    const p = pOf(t);
    s.p = p; s.roots = realRoots(p);
    s.curve.setPoints(sample((x) => V(x, (x * x * x - p * x - Q) * SC), -5, 5, 260).filter((v) => v.y > -3.6 && v.y < 3.4));
    s.dots.forEach((d, i) => {
      d.setAlpha(i < s.roots.length ? 1 : 0);
      if (i < s.roots.length) d.position.copy(V(s.roots[i], 0));
    });
  },

  hud(st, h, t, phase, s) {
    h.title("不可約情形", "三個解都是實數時，判別式一定是負的：解愈「正常」，公式愈非得經過負數開根號", tag(6));
    const n = s.roots.length, d = delta(s.p);
    const lab = st.project(V(-3.2, 3.0));
    h.text(`y = x³ − ${s.p.toFixed(1)}x − 4`, lab[0], lab[1], { size: 15, mono: true, color: css(C.orange), align: "center" });

    const x = 884, y = 130, w = 356, hh = 460;
    h.panel(x, y, w, hh, "判別式 Δ = q²/4 − p³/27");
    const map = h.plot(x + 30, y + 64, w - 60, 200, { xr: [0, 18], yr: [-220, 20], xLabel: "p", yLabel: "Δ" });
    // Δ < 0 的區域
    const [x0] = map(P_CRIT, 0), [x1] = map(18, 0), [, yt] = map(0, 20), [, yb] = map(0, -220);
    h.ctx.save(); h.ctx.fillStyle = css(C.red, 0.1); h.ctx.fillRect(x0, yt, x1 - x0, yb - yt); h.ctx.restore();
    h.text("三個實根", (x0 + x1) / 2, yb - 12, { size: 13, align: "center", color: css(C.red) });
    h.curve(map.sample(delta, 0, 18, 120), C.cyan, { width: 2.2 });
    const [cx, cy] = map(s.p, Math.max(-220, d));
    h.dot(cx, cy, C.yellow, { r: 5 });

    h.text("p", x + 22, y + 318, { size: 15, mono: true, color: "rgba(232,246,255,0.65)" });
    h.text(s.p.toFixed(2), x + 120, y + 318, { size: 18, mono: true });
    h.text("Δ", x + 22, y + 350, { size: 15, mono: true, color: "rgba(232,246,255,0.65)" });
    h.text(d.toFixed(1), x + 120, y + 350, { size: 18, mono: true, color: d < 0 ? css(C.red) : TEXT_OK });
    h.text("實根", x + 22, y + 382, { size: 15, color: "rgba(232,246,255,0.65)" });
    h.text(n + " 個", x + 120, y + 382, { size: 18, color: n === 3 ? css(C.yellow) : "#e8f6ff" });
    h.chip(x + 22, y + hh - 54, n === 3 ? "要先算 √(Δ)，Δ 是負的" : "Δ ≥ 0，公式走得通", n === 3 ? C.red : C.green, { size: 14 });

    h.formula(["x³ = px + q", "x = ∛(q/2 + √Δ) + ∛(q/2 − √Δ)"], { highlight: n === 3 ? 1 : -1 });
  },
};

const TEXT_OK = "#e8f6ff";
