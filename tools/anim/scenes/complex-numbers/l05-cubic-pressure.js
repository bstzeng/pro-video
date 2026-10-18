// 第 5 課：二次方程式無解可以接受；三次方程式有實數解，公式卻要經過負數開根號
import { THREE, C, css, seg, window4, fatLine, polyline, sample, ball, tag } from "../../engine.js";

// 曲線畫在直立平面（x 橫、y 往上），z = 0
const V = (x, y) => new THREE.Vector3(x, y, 0);
const SC = 0.1;                                    // 三次曲線的 y 縮小倍率
const cubic = (x) => (x * x * x - 15 * x - 4) * SC;
const quad = (x) => (x * x + 1) * 0.45;
const ROOTS = [4, -2 + Math.sqrt(3), -2 - Math.sqrt(3)];

export default {
  id: "l05-cubic-pressure",
  poster: 130,
  camera: { target: [0.2, 0.15, 0], dist: 16.5, elev: 12, azim: -14, sway: 7, swayElev: 1.5 },

  setup(st) {
    st.add(polyline(C.blue, { opacity: 0.8 }).setPoints([V(-5.2, 0), V(5.2, 0)]));
    st.add(polyline(C.blue, { opacity: 0.5 }).setPoints([V(0, -2.6), V(0, 3.4)]));
    const q = st.add(fatLine(C.cyan, { width: 3.5 }));
    q.setPoints(sample((x) => V(x, quad(x)), -2.3, 2.3, 120));
    const c = st.add(fatLine(C.orange, { width: 3.5 }));
    c.setPoints(sample((x) => V(x, cubic(x)), -4.6, 4.75, 200));
    const dots = ROOTS.map((r) => { const b = st.add(ball(C.yellow, 0.13)); b.position.copy(V(r, 0)); return b; });
    return { q, c, dots };
  },

  update(st, t, phase, s) {
    s.aq = window4(t, 0, 0.8, 5.2, 6);
    s.ac = window4(t, 5.6, 6.4, 11.2, 11.95);
    s.q.setAlpha(Math.max(s.aq, 0.12 * s.ac));
    s.c.setAlpha(s.ac);
    s.dots.forEach((d, i) => d.setAlpha(s.ac * seg(t, 6.8 + i * 0.5, 7.2 + i * 0.5)));
  },

  hud(st, h, t, phase, s) {
    h.title("壓力來自三次方程式", "二次方程式沒有解，說「無解」就好；三次方程式的解明明都在，公式卻要先經過 √(負數)", tag(5));
    const top = st.project(V(0, quad(0)));
    h.callout(top, [top[0] + 70, top[1] - 70], "碰不到 x 軸：無解，可以接受", C.cyan, { alpha: window4(t, 1.4, 2, 5, 5.6) });
    ROOTS.forEach((r, i) => {
      const p = st.project(V(r, 0));
      h.text(r === 4 ? "4" : (r > -1 ? "−2+√3" : "−2−√3"), p[0], p[1] + 26,
        { size: 14, mono: true, align: "center", color: css(C.yellow), alpha: s.ac * seg(t, 6.8 + i * 0.5, 7.2 + i * 0.5) });
    });
    const pk = st.project(V(-2.2, cubic(-2.2)));
    h.callout(pk, [pk[0] - 40, pk[1] - 60], "三個解全是實數", C.orange, { alpha: window4(t, 8.4, 9, 11, 11.6) });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "兩種方程式");
    const aq = Math.max(s.aq, 0.3), ac = Math.max(s.ac, 0.3);
    h.chip(x + 22, y + 60, "x² + 1 = 0", C.cyan, { alpha: aq });
    h.text("沒有實數解", x + 22, y + 118, { size: 17, alpha: aq });
    h.text("→ 不需要新的數", x + 22, y + 146, { size: 15, color: "rgba(232,246,255,0.65)", alpha: aq });
    h.chip(x + 22, y + 196, "x³ = 15x + 4", C.orange, { alpha: ac });
    h.text("解是 4、−2 ± √3", x + 22, y + 254, { size: 17, mono: true, alpha: ac });
    h.text("公式中途卻出現：", x + 22, y + 290, { size: 15, color: "rgba(232,246,255,0.65)", alpha: ac });
    h.chip(x + 22, y + 306, "√(−121)", C.red, { alpha: ac * seg(t, 9, 9.6) });
    h.text("繞不開，才逼出複數", x + 22, y + hh - 28, { size: 18, color: css(C.yellow), glow: 8, alpha: s.ac * seg(t, 9.6, 10.2) });

    h.formula(["x = ∛(2 + √−121) + ∛(2 − √−121)"], { highlight: s.ac > 0.5 && t > 9 ? 0 : -1 });
  },
};
