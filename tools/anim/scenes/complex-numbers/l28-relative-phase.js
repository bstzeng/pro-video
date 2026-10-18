// 第 28 課：整體相位不可觀測、相對相位可觀測
import { THREE, C, css, cp, seg, window4, arrow, complexAxes, unitCircle, glowMesh, tag } from "../../engine.js";

const R = 1.1;
// 0–5.5 秒：兩根一起轉（整體相位）；6–11.5 秒：只轉 ψ₂ 一圈（相對相位）
const glob = (t) => 2 * Math.PI * seg(t, 0.4, 5.4);
const rel = (t) => 2 * Math.PI * seg(t, 6.2, 11.4);

export default {
  id: "l28-relative-phase",
  poster: 120,
  camera: { target: [0, 0, 0.1], dist: 11, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.8, 2.8], im: [-2.6, 2.6], ticks: false });
    st.add(unitCircle(2 * R, C.blue, 0.2));
    const a1 = st.add(arrow(C.cyan, { radius: 0.035, head: 0.22 }));
    const a2 = st.add(arrow(C.green, { radius: 0.035, head: 0.22 }));
    const as = st.add(arrow(C.yellow, { radius: 0.05, head: 0.28 }));
    const lamp = glowMesh(new THREE.SphereGeometry(0.4, 24, 16), C.yellow, { opacity: 0.6 });
    lamp.position.set(3.1, 0.5, 1.6);
    st.add(lamp);
    return { axes, a1, a2, as, lamp };
  },

  update(st, t, phase, s) {
    const g = glob(t), r = rel(t);
    const p1 = [R * Math.cos(g), R * Math.sin(g)], p2 = [R * Math.cos(g + r), R * Math.sin(g + r)];
    s.a1.set(cp(0, 0, 0.1), cp(...p1, 0.1));
    s.a2.set(cp(...p1, 0.1), cp(p1[0] + p2[0], p1[1] + p2[1], 0.1));
    s.as.set(cp(0, 0, 0.16), cp(p1[0] + p2[0], p1[1] + p2[1], 0.16));
    const b = (1 + Math.cos(r)) / 2;
    s.lamp.setAlpha(0.08 + 0.92 * b);
    s.lamp.scale.setScalar(0.6 + 0.6 * b);
    Object.assign(s, { g, r, b, p1, p2 });
  },

  hud(st, h, t, phase, s) {
    h.title("整體相位 vs 相對相位", "兩根指針一起轉，相加結果不變；只轉其中一根，亮度就變——看得到的只有相對相位", tag(28));
    s.axes.labels(h);
    const lp = st.project(new THREE.Vector3(3.1, 1.2, 1.6));
    h.text("亮度", lp[0], lp[1], { size: 15, align: "center", color: css(C.yellow) });
    h.label(st, cp(s.p1[0] / 2, s.p1[1] / 2, 0.1), "ψ₁", C.cyan, { dx: 6, dy: 18, size: 17 });
    h.label(st, cp(s.p1[0] + s.p2[0] / 2, s.p1[1] + s.p2[1] / 2, 0.1), "ψ₂", C.green, { dx: 8, dy: -6, size: 17 });

    const phase1 = t < 5.8;
    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, phase1 ? "兩根一起轉" : "只轉 ψ₂");
    h.chip(x + 22, y + 52, "整體相位：看不到", C.cyan, { mono: false, size: 14, alpha: phase1 ? 1 : 0.35 });
    h.chip(x + 22, y + 96, "相對相位：看得到", C.green, { mono: false, size: 14, alpha: phase1 ? 0.35 : 1 });
    h.text("整體轉了", x + 22, y + 180, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${Math.round(s.g * 180 / Math.PI) % 360}°`, x + w - 22, y + 180, { size: 19, mono: true, align: "right" });
    h.text("相對相位 Δφ", x + 22, y + 220, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${Math.round(s.r * 180 / Math.PI) % 360}°`, x + w - 22, y + 220, { size: 19, mono: true, align: "right", color: css(C.green) });
    h.text("|ψ₁ + ψ₂|²", x + 22, y + 280, { size: 16, mono: true });
    h.bar(x + 22, y + 296, w - 44, s.b, C.yellow, { hh: 12 });
    h.text(phase1 ? "結果完全沒變" : s.b < 0.15 ? "反向：相消，變暗" : s.b > 0.85 ? "同向：相長，最亮" : "介於兩者之間",
      x + w / 2, y + hh - 34, { size: 18, align: "center", color: css(C.yellow), glow: 8 });

    h.formula(["|e^{iα}(ψ₁ + ψ₂)|² = |ψ₁ + ψ₂|²", "|ψ₁ + e^{iΔφ}ψ₂|² 隨 Δφ 改變"], { highlight: phase1 ? 0 : 1 });
  },
};
