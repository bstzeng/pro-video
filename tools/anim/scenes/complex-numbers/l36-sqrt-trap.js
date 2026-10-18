// 第 36 課：√ 的陷阱：z 繞一圈，√z 只走半圈，回到起點時正負號已經翻過來
import { THREE, C, css, cp, seg, arrow, fatLine, arcPoints, complexAxes, unitCircle, ball, tag } from "../../engine.js";

const R = 2.0;
const thOf = (t) => 4 * Math.PI * seg(t, 0.4, 11.6);     // z 繞兩圈，√z 剛好一圈

export default {
  id: "l36-sqrt-trap",
  poster: 92,
  camera: { target: [0, 0, 0.2], dist: 11, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.8, 2.8], im: [-2.6, 2.6], ticks: false });
    st.add(unitCircle(R, C.blue, 0.3));
    const z = st.add(arrow(C.cyan, { radius: 0.035, head: 0.22 }));
    const w = st.add(arrow(C.orange, { radius: 0.045, head: 0.26 }));
    const tz = st.add(fatLine(C.cyan, { width: 2, opacity: 0.5 }));
    const tw = st.add(fatLine(C.orange, { width: 3 }));
    const p = st.add(ball(C.green, 0.1)); p.position.copy(cp(R, 0, 0.1));
    const m = st.add(ball(C.red, 0.1)); m.position.copy(cp(-R, 0, 0.1));
    return { axes, z, w, tz, tw };
  },

  update(st, t, phase, s) {
    const th = thOf(t);
    s.z.set(cp(0, 0, 0.1), cp(R * 0.82 * Math.cos(th), R * 0.82 * Math.sin(th), 0.1));
    s.w.set(cp(0, 0, 0.14), cp(R * Math.cos(th / 2), R * Math.sin(th / 2), 0.14));
    const lap = th % (2 * Math.PI);
    s.tz.setPoints(arcPoints(R * 0.82, th - lap, th + 0.0001, 0.05, 80));
    s.tw.setPoints(arcPoints(R, 0, th / 2 + 0.0001, 0.08, 80)).setAlpha(1 - seg(t, 11.3, 11.9));
    s.th = th;
  },

  hud(st, h, t, phase, s) {
    h.title("√ 的陷阱", "讓 z 沿單位圓繞一圈回到 1，跟著連續變化的 √z 只走了半圈，停在 −1：根號沒辦法一致地挑一個", tag(36));
    s.axes.labels(h);
    const th = s.th, zd = Math.round(th * 180 / Math.PI), wd = Math.round(th * 90 / Math.PI);
    h.label(st, cp(R * 0.82 * Math.cos(th), R * 0.82 * Math.sin(th), 0.1), "z", C.cyan, { dx: 8, dy: 18, size: 18 });
    h.label(st, cp(R * Math.cos(th / 2), R * Math.sin(th / 2), 0.14), "√z", C.orange, { dx: 10, dy: -8, size: 18 });
    const lapDone = Math.abs(th - 2 * Math.PI) < 0.6;
    const mp = st.project(cp(-R, 0, 0.1));
    h.callout(mp, [mp[0] + 50, mp[1] + 90], "z 回到 1，√z 卻在 −1", C.red, { alpha: lapDone ? 1 : 0 });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "角度對照");
    h.text("z 的角度", x + 22, y + 76, { size: 15, color: css(C.cyan) });
    h.text(`${zd}°`, x + w - 22, y + 76, { size: 20, mono: true, align: "right" });
    h.text("√z 的角度（一半）", x + 22, y + 116, { size: 15, color: css(C.orange) });
    h.text(`${wd}°`, x + w - 22, y + 116, { size: 20, mono: true, align: "right" });
    h.chip(x + 22, y + 150, "−1 有兩個平方根：i 和 −i", C.magenta, { mono: false, size: 14 });
    h.text("錯誤示範", x + 22, y + 240, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("−1 = i·i = √−1·√−1", x + 22, y + 272, { size: 16, mono: true });
    h.text("   ≠ √((−1)(−1)) = 1", x + 22, y + 300, { size: 16, mono: true, color: css(C.red) });
    h.text("i 是「滿足 i² = −1 的數」", x + w / 2, y + hh - 28, { size: 16, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["√a·√b = √(ab)  只在 a、b ≥ 0 時成立"]);
  },
};
