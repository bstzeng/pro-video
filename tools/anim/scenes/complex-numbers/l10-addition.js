// 第 10 課：加法就是平移：第二根箭頭平移到第一根的尖端
import { THREE, C, css, cp, seg, window4, arrow, fatLine, complexAxes, tag } from "../../engine.js";

const Z1 = [2, 1], Z2 = [1, 2], S = [3, 3];

export default {
  id: "l10-addition",
  poster: 100,
  camera: { target: [1.4, 0, -1.1], dist: 9, elev: 52, azim: -12, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-0.8, 3.8], im: [-0.6, 3.6] });
    const a1 = st.add(arrow(C.cyan, { radius: 0.035, head: 0.24 }));
    const a2 = st.add(arrow(C.green, { radius: 0.035, head: 0.24 }));
    const ghost1 = st.add(arrow(C.cyan, { radius: 0.02, head: 0.18, opacity: 0.3 }));
    const ghost2 = st.add(arrow(C.green, { radius: 0.02, head: 0.18, opacity: 0.3 }));
    const sum = st.add(arrow(C.yellow, { radius: 0.045, head: 0.28 }));
    const path = st.add(fatLine(C.green, { width: 1.5, opacity: 0.6, dashed: true }));
    return { axes, a1, a2, ghost1, ghost2, sum, path };
  },

  update(st, t, phase, s) {
    const a = window4(t, 0, 0.6, 11.2, 11.9);
    // 1.2–3.8 秒：z₂ 平移到 z₁ 尖端；7–9 秒：反過來，z₁ 平移到 z₂ 尖端（平行四邊形）
    const m1 = seg(t, 1.2, 3.8), m2 = seg(t, 7, 9);
    const b2 = [Z1[0] * m1, Z1[1] * m1], b1 = [Z2[0] * m2, Z2[1] * m2];
    s.a1.set(cp(...b1, 0.1), cp(b1[0] + Z1[0], b1[1] + Z1[1], 0.1)).setAlpha(a);
    s.a2.set(cp(...b2, 0.1), cp(b2[0] + Z2[0], b2[1] + Z2[1], 0.1)).setAlpha(a);
    s.ghost1.set(cp(0, 0, 0.05), cp(...Z1, 0.05)).setAlpha(a * m2);
    s.ghost2.set(cp(0, 0, 0.05), cp(...Z2, 0.05)).setAlpha(a * m1);
    s.sum.set(cp(0, 0, 0.16), cp(...S, 0.16)).setAlpha(a * seg(t, 3.8, 4.6));
    s.path.setPoints([cp(0, 0, 0.03), cp(...Z1, 0.03)]).setAlpha(a * window4(t, 1.2, 1.6, 3.4, 3.9));
    Object.assign(s, { a, m1, m2 });
  },

  hud(st, h, t, phase, s) {
    h.title("加法就是平移", "把第二根箭頭搬到第一根的尖端，頭尾相接，終點就是和", tag(10));
    s.axes.labels(h);
    h.label(st, cp(Z1[0] / 2 + Z2[0] * s.m2, Z1[1] / 2 + Z2[1] * s.m2, 0.1), "z₁ = 2 + i", C.cyan, { dx: 14, dy: 18, alpha: s.a * (1 - seg(t, 6.2, 6.8)) });
    h.label(st, cp(Z2[0] / 2 + Z1[0] * s.m1, Z2[1] / 2 + Z1[1] * s.m1, 0.1), "z₂ = 1 + 2i", C.green, { dx: -110, dy: -6, alpha: s.a * (1 - seg(t, 6.2, 6.8)) });
    const sp = st.project(cp(...S, 0.16));
    h.callout(sp, [sp[0] + 60, sp[1] - 40], "z₁ + z₂ = 3 + 3i", C.yellow, { mono: true, alpha: s.a * seg(t, 4.2, 4.8) });
    const mp = st.project(cp(1.5, 1.5, 0.1));
    h.callout(mp, [mp[0] - 120, mp[1] + 90], "換個順序也一樣：平行四邊形", C.cyan, { alpha: window4(t, 9, 9.6, 11, 11.6) });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "實部加實部、虛部加虛部");
    const k = seg(t, 4.4, 6);
    h.text("實部", x + 22, y + 80, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.bar(x + 80, y + 70, 220 * 2 / 3, 1, C.cyan);
    h.bar(x + 80 + 220 * 2 / 3 * 1, y + 70, 220 / 3 * 1, 1, C.green, { alpha: 1 });
    h.text("2 + 1 = 3", x + 80, y + 108, { size: 16, mono: true });
    h.text("虛部", x + 22, y + 160, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.bar(x + 80, y + 150, 220 / 3, 1, C.cyan);
    h.bar(x + 80 + 220 / 3, y + 150, 220 * 2 / 3, 1, C.green);
    h.text("1 + 2 = 3", x + 80, y + 188, { size: 16, mono: true });
    h.text("(2 + i) + (1 + 2i)", x + 22, y + 260, { size: 18, mono: true, alpha: Math.max(0.4, k) });
    h.text("= 3 + 3i", x + 22, y + 292, { size: 22, mono: true, color: css(C.yellow), glow: 8, alpha: k });
    h.text("加法 = 平移", x + w / 2, y + hh - 30, { size: 20, align: "center", color: css(C.yellow), glow: 8, alpha: s.a * seg(t, 5, 5.8) });

    h.formula(["(a + bi) + (c + di)", "  = (a + c) + (b + d)i"]);
  },
};
