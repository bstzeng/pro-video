// 第 42 課：除法＝轉回去再縮小：(1+3i)/(1+i) = 2+i
import { THREE, C, css, cp, seg, window4, arrow, fatLine, arcPoints, complexAxes, tag } from "../../engine.js";

const Z1 = [1, 3], Z2 = [1, 1];
const A1 = Math.atan2(3, 1), M1 = Math.hypot(1, 3), A2 = Math.PI / 4, M2 = Math.SQRT2;
const K = 0.85;

export default {
  id: "l42-division",
  poster: 110,
  camera: { target: [0.6, 0, -0.6], dist: 9.6, elev: 56, azim: -10, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-0.8, 3], im: [-0.6, 3.2] });
    const z2 = st.add(arrow(C.green, { radius: 0.03, head: 0.2 })).set(cp(0, 0, 0.06), cp(Z2[0] * K, Z2[1] * K, 0.06));
    const ghost = st.add(arrow(C.cyan, { radius: 0.02, head: 0.18, opacity: 0.35 })).set(cp(0, 0, 0.04), cp(Z1[0] * K, Z1[1] * K, 0.04));
    const w = st.add(arrow(C.yellow, { radius: 0.045, head: 0.26 }));
    const arc = st.add(fatLine(C.orange, { width: 2.5 }));
    return { axes, w, arc };
  },

  update(st, t, phase, s) {
    const rot = seg(t, 1.4, 4.2), shr = seg(t, 5, 7.4);
    const a = window4(t, 0, 0.5, 11.2, 11.9);
    const ang = A1 - A2 * rot, mod = M1 / Math.pow(M2, shr);
    s.w.set(cp(0, 0, 0.12), cp(mod * Math.cos(ang) * K, mod * Math.sin(ang) * K, 0.12)).setAlpha(a);
    s.arc.setPoints(arcPoints(1.2, A1, ang - 0.0001, 0.1)).setAlpha(a * (rot > 0.01 ? 1 : 0));
    Object.assign(s, { rot, shr, ang, mod });
  },

  hud(st, h, t, phase, s) {
    h.title("除法＝轉回去，再縮小", "除以 z₂ 就是倒著做乘法：角度減掉 arg z₂、長度除以 |z₂|", tag(42));
    s.axes.labels(h);
    h.label(st, cp(Z1[0] * K, Z1[1] * K, 0.04), "z₁ = 1+3i", C.cyan, { dx: 10, dy: -6, size: 15 });
    h.label(st, cp(Z2[0] * K, Z2[1] * K, 0.06), "z₂ = 1+i", C.green, { dx: 10, dy: 16, size: 15 });
    const wp = st.project(cp(s.mod * Math.cos(s.ang) * K, s.mod * Math.sin(s.ang) * K, 0.12));
    h.callout(wp, [wp[0] + 70, wp[1] - 30], "z₁/z₂ = 2+i", C.yellow, { mono: true, alpha: window4(t, 7.4, 8, 11.2, 11.8) });

    const x = 884, y = 130, w = 356, hh = 460;
    h.panel(x, y, w, hh, "兩種算法，同一個答案");
    h.chip(x + 22, y + 50, "幾何", C.orange, { mono: false, size: 14 });
    h.text(`角度 72° − 45° = ${Math.round(s.ang * 180 / Math.PI)}°`, x + 22, y + 112, { size: 16, mono: true, alpha: Math.max(0.35, s.rot) });
    h.text(`長度 3.16 ÷ 1.41 = ${s.mod.toFixed(2)}`, x + 22, y + 142, { size: 16, mono: true, alpha: Math.max(0.35, s.shr) });
    h.chip(x + 22, y + 176, "代數：乘上共軛", C.cyan, { mono: false, size: 14 });
    const al = Math.max(0.35, seg(t, 7.6, 8.6));
    h.text("(1+3i)/(1+i)", x + 22, y + 238, { size: 17, mono: true, alpha: al });
    h.text("= (1+3i)(1−i) / ((1+i)(1−i))", x + 22, y + 268, { size: 15, mono: true, alpha: al });
    h.text("= (4+2i) / 2", x + 22, y + 298, { size: 17, mono: true, alpha: al });
    h.text("= 2 + i", x + 22, y + 330, { size: 22, mono: true, color: css(C.yellow), glow: 6, alpha: al });
    h.text("分母乘上共軛就變成實數", x + w / 2, y + hh - 28, { size: 15, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["z₁ / z₂ = z₁·z̄₂ / |z₂|²"]);
  },
};
