// 第 14 課：長度相乘、角度相加（z₂ 的角度與長度變動時，乘積即時跟著變）
import { THREE, C, css, cp, arrow, fatLine, arcPoints, complexAxes, unitCircle, tag } from "../../engine.js";

const R1 = 1.3, A1 = 30 * Math.PI / 180;
const z2At = (t) => {
  const a = (50 + 35 * Math.sin(2 * Math.PI * t / 12)) * Math.PI / 180;
  const r = 1.5 + 0.35 * Math.sin(2 * Math.PI * t / 6);
  return [r, a];
};
const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

export default {
  id: "l14-mul-rule",
  poster: 30,
  camera: { target: [0.3, 0, -0.9], dist: 9.6, elev: 54, azim: -10, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-1.6, 3.2], im: [-0.6, 3.2] });
    st.add(unitCircle(1, C.blue, 0.3));
    const a1 = st.add(arrow(C.cyan, { radius: 0.035, head: 0.22 })).set(cp(0, 0, 0.08), cp(...pol(R1, A1), 0.08));
    const a2 = st.add(arrow(C.green, { radius: 0.035, head: 0.22 }));
    const ap = st.add(arrow(C.yellow, { radius: 0.045, head: 0.26 }));
    const arc1 = st.add(fatLine(C.cyan, { width: 2.5 })).setPoints(arcPoints(0.55, 0, A1, 0.08));
    const arc2 = st.add(fatLine(C.green, { width: 2.5 }));
    const arcP = st.add(fatLine(C.yellow, { width: 2.5 }));
    const trail = st.add(fatLine(C.yellow, { width: 1.5, opacity: 0.35 }));
    const pts = [];
    for (let k = 0; k <= 120; k++) {
      const [r, a] = z2At(12 * k / 120);
      pts.push(cp(...pol(R1 * r, A1 + a), 0.02));
    }
    trail.setPoints(pts);
    return { axes, a2, ap, arc2, arcP };
  },

  update(st, t, phase, s) {
    const [r2, a2] = z2At(t);
    s.a2.set(cp(0, 0, 0.1), cp(...pol(r2, a2), 0.1));
    s.ap.set(cp(0, 0, 0.14), cp(...pol(R1 * r2, A1 + a2), 0.14));
    s.arc2.setPoints(arcPoints(0.8, 0, a2, 0.1));
    s.arcP.setPoints(arcPoints(1.05, 0, A1 + a2, 0.14));
    Object.assign(s, { r2, ang2: a2 });
  },

  hud(st, h, t, phase, s) {
    h.title("長度相乘、角度相加", "隨便換一個 z₂，乘積 z₁z₂ 的長度永遠是兩者長度相乘，角度永遠是兩者角度相加", tag(14));
    s.axes.labels(h);
    const { r2, ang2: a2 } = s;
    const d = (x) => Math.round(x * 180 / Math.PI);
    h.label(st, cp(...pol(R1, A1), 0.08), "z₁", C.cyan, { dx: 10, dy: 14, size: 18 });
    h.label(st, cp(...pol(r2, a2), 0.1), "z₂", C.green, { dx: 10, dy: -6, size: 18 });
    h.label(st, cp(...pol(R1 * r2, A1 + a2), 0.14), "z₁z₂", C.yellow, { dx: 10, dy: -8, size: 18 });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "即時驗算");
    h.text("長度", x + 22, y + 74, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${R1.toFixed(2)} × ${r2.toFixed(2)}`, x + 22, y + 110, { size: 20, mono: true });
    h.text(`= ${(R1 * r2).toFixed(2)}`, x + w - 22, y + 110, { size: 20, mono: true, align: "right", color: css(C.yellow) });
    h.text("角度", x + 22, y + 170, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${d(A1)}° + ${d(a2)}°`, x + 22, y + 206, { size: 20, mono: true });
    h.text(`= ${d(A1) + d(a2)}°`, x + w - 22, y + 206, { size: 20, mono: true, align: "right", color: css(C.yellow) });
    h.bar(x + 22, y + 250, w - 44, (A1 + a2) / Math.PI, C.yellow);
    h.bar(x + 22, y + 250, (w - 44) * A1 / Math.PI, 1, C.cyan);
    h.text("乘法 = 模相乘、輻角相加", x + w / 2, y + hh - 70, { size: 18, align: "center", color: css(C.yellow), glow: 8 });
    h.text("（這就是三角和角公式）", x + w / 2, y + hh - 38, { size: 14, align: "center", color: "rgba(232,246,255,0.65)" });

    h.formula(["|z₁z₂| = |z₁|·|z₂|", "arg(z₁z₂) = arg z₁ + arg z₂"]);
  },
};
