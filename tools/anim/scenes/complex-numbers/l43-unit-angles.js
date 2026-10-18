// 第 43 課：單位圓上的常用角度：指針逐一停在 16 個常用角度，對照 cos、sin 的精確值
import { THREE, C, css, cp, seg, arrow, fatLine, arcPoints, complexAxes, unitCircle, particles, tag } from "../../engine.js";

const R = 2.2;
const DEG = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const EX = { 0: ["1", "0"], 30: ["√3/2", "1/2"], 45: ["√2/2", "√2/2"], 60: ["1/2", "√3/2"], 90: ["0", "1"] };
const RAD = { 0: "0", 30: "π/6", 45: "π/4", 60: "π/3", 90: "π/2", 120: "2π/3", 135: "3π/4", 150: "5π/6", 180: "π",
  210: "7π/6", 225: "5π/4", 240: "4π/3", 270: "3π/2", 300: "5π/3", 315: "7π/4", 330: "11π/6" };
function exact(d) {
  const ref = d % 180 === 0 ? 0 : d % 90 === 0 ? 90 : [30, 45, 60].find((r) => [r, 180 - r, 180 + r, 360 - r].includes(d));
  const [c, s] = EX[ref];
  const sc = Math.cos(d * Math.PI / 180) < -1e-9 ? "−" : "", ss = Math.sin(d * Math.PI / 180) < -1e-9 ? "−" : "";
  return [c === "0" ? "0" : sc + c, s === "0" ? "0" : ss + s];
}
const STEP = 12 / DEG.length;    // 每個角度 0.75 秒

export default {
  id: "l43-unit-angles",
  poster: 24,
  camera: { target: [0, 0, 0.2], dist: 11.2, elev: 60, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.9, 2.9], im: [-2.7, 2.7], ticks: false });
    st.add(unitCircle(R, C.blue, 0.4));
    const marks = st.add(particles(DEG.length, { radius: 0.06 }));
    DEG.forEach((d, i) => marks.place(i, cp(R * Math.cos(d * Math.PI / 180), R * Math.sin(d * Math.PI / 180), 0.06), C.cyan));
    marks.commit();
    const arm = st.add(arrow(C.yellow, { radius: 0.04, head: 0.24 }));
    const arc = st.add(fatLine(C.orange, { width: 2.5 }));
    const pc = st.add(fatLine(C.cyan, { width: 1.5, dashed: true }));
    const ps = st.add(fatLine(C.magenta, { width: 1.5, dashed: true }));
    return { axes, arm, arc, pc, ps };
  },

  update(st, t, phase, s) {
    const k = Math.floor(t / STEP), u = (t - k * STEP) / STEP;
    const d0 = DEG[k], d1 = k + 1 < DEG.length ? DEG[k + 1] : 360;
    const d = d0 + (d1 - d0) * seg(u, 0.55, 1);
    const a = d * Math.PI / 180;
    const p = [R * Math.cos(a), R * Math.sin(a)];
    s.arm.set(cp(0, 0, 0.1), cp(...p, 0.1));
    s.arc.setPoints(arcPoints(0.6, 0, Math.max(a, 0.0001), 0.08, 80));
    s.pc.setPoints([cp(...p, 0.04), cp(p[0], 0, 0.04)]);
    s.ps.setPoints([cp(...p, 0.04), cp(0, p[1], 0.04)]);
    Object.assign(s, { k, d0, u });
  },

  hud(st, h, t, phase, s) {
    h.title("單位圓上的常用角度", "e^{iθ} 落在單位圓上：橫座標是 cos θ、縱座標是 sin θ；這 16 個角度的值都可以寫成精確分數", tag(43));
    s.axes.labels(h);
    const d = s.d0, [c, sn] = exact(d);
    const on = s.u < 0.55;
    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "e^{iθ} = cos θ + i sin θ");
    h.text("θ", x + 22, y + 90, { size: 16, color: "rgba(232,246,255,0.7)" });
    h.text(`${d}°  =  ${RAD[d]}`, x + w - 22, y + 90, { size: 22, mono: true, align: "right", color: css(C.orange), alpha: on ? 1 : 0.5 });
    h.text("cos θ", x + 22, y + 160, { size: 16, mono: true, color: css(C.cyan) });
    h.text(c, x + w - 22, y + 160, { size: 26, mono: true, align: "right", alpha: on ? 1 : 0.5 });
    h.text("sin θ", x + 22, y + 220, { size: 16, mono: true, color: css(C.magenta) });
    h.text(sn, x + w - 22, y + 220, { size: 26, mono: true, align: "right", alpha: on ? 1 : 0.5 });
    h.text("記 30°、45°、60° 三組就夠：", x + 22, y + 300, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("其他角度只差正負號", x + 22, y + 330, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("輻角務必看象限（atan2）", x + w / 2, y + hh - 28, { size: 15, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["e^{iπ/6} = √3/2 + i/2", "e^{iπ/4} = (1 + i)/√2"]);
  },
};
