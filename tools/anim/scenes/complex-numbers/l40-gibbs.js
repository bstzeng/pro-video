// 第 40 課：吉布斯現象：方波的部分和項數愈加愈多，轉角的過衝始終約 9%，只是愈來愈窄
import { THREE, C, css, seg, fatLine, polyline, sample, tag } from "../../engine.js";

const X0 = -4.2, XL = 8.4, Y0 = 1.6, SY = 1.1;
const termsOf = (t) => Math.max(1, Math.round(1 + 49 * Math.pow(seg(t, 0.5, 9.5), 1.6) * (1 - seg(t, 10.8, 11.8))));
const S = (k, u) => { let s = 0; for (let j = 0; j < k; j++) { const n = 2 * j + 1; s += Math.sin(n * u) / n; } return s * 4 / Math.PI; };
function overshoot(k) {
  let m = 0;
  for (let i = 1; i <= 400; i++) { const u = Math.PI * i / 400 * 0.5; m = Math.max(m, S(k, u)); }
  return (m - 1) / 2;          // 以跳躍高度（−1 到 1，共 2）計算的過衝比例
}

export default {
  id: "l40-gibbs",
  poster: 140,
  camera: { target: [0, 1.4, 0], dist: 11.5, elev: 12, azim: -10, sway: 6, swayElev: 1.5 },

  setup(st) {
    const V = (x, y) => new THREE.Vector3(x, y, 0);
    st.add(polyline(C.blue, { opacity: 0.5 }).setPoints([V(X0, Y0), V(X0 + XL, Y0)]));
    const ideal = st.add(fatLine(0xe8f6ff, { width: 1.4, opacity: 0.35, dashed: true }));
    ideal.setPoints([V(X0, Y0 - SY), V(X0 + XL / 2, Y0 - SY), V(X0 + XL / 2, Y0 + SY), V(X0 + XL, Y0 + SY)]);
    st.add(fatLine(C.red, { width: 1.2, opacity: 0.6, dashed: true })).setPoints([V(X0 + XL / 2, Y0 + SY * 1.179), V(X0 + XL, Y0 + SY * 1.179)]);
    const curve = st.add(fatLine(C.yellow, { width: 3 }));
    return { curve };
  },

  update(st, t, phase, s) {
    const k = termsOf(t);
    // u ∈ [−π, π] 對應 x ∈ [X0, X0+XL]
    s.curve.setPoints(sample((x) => new THREE.Vector3(x, Y0 + SY * S(k, (x - X0) / XL * 2 * Math.PI - Math.PI), 0), X0, X0 + XL, 600));
    s.k = k; s.os = overshoot(k);
  },

  hud(st, h, t, phase, s) {
    h.title("吉布斯現象", "用愈來愈多的正弦波去疊方波，轉角那個尖角不會消失：高度一直停在約 9%，只是愈來愈窄", tag(40));
    const p = st.project(new THREE.Vector3(X0 + XL * 0.53, Y0 + SY * 1.12, 0));
    h.callout(p, [p[0] + 60, p[1] - 60], "過衝 ≈ 跳躍的 9%", C.red, { size: 16 });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "部分和");
    h.text("項數", x + 22, y + 82, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(String(s.k), x + w - 22, y + 82, { size: 30, mono: true, align: "right", color: css(C.yellow), glow: 6 });
    h.text("過衝（佔跳躍）", x + 22, y + 140, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${(s.os * 100).toFixed(1)}%`, x + w - 22, y + 140, { size: 30, mono: true, align: "right", color: css(C.red), glow: 6 });
    h.bar(x + 22, y + 170, w - 44, s.os / 0.12, C.red);
    h.text("項數一直增加", x + 22, y + 240, { size: 15 });
    h.text("→ 尖角愈來愈窄", x + 22, y + 270, { size: 15 });
    h.text("→ 高度停在 8.9% 附近", x + 22, y + 300, { size: 15, color: css(C.red) });
    h.text("不是計算錯誤，是逼近跳躍的必然", x + w / 2, y + hh - 28, { size: 15, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["S_N(t) = (4/π) Σ sin((2k+1)t)/(2k+1)", "max S_N → 1.179（跳躍 2 的 9%）"]);
  },
};
