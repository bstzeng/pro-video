// 第 19 課：微分＝乘 iω：導數箭頭永遠超前 90°，長度是 ω 倍
import { THREE, C, css, cp, arrow, fatLine, arcPoints, complexAxes, unitCircle, tag } from "../../engine.js";

const R = 1.3, W = 1.6;               // 位置的半徑；ω（導數長度的倍率）
const OM = 2 * Math.PI / 6;           // 畫面上的轉速：6 秒一圈

export default {
  id: "l19-derivative",
  poster: 20,
  camera: { target: [0, 0, 0.2], dist: 11, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.8, 2.8], ticks: false });
    st.add(unitCircle(R, C.cyan, 0.3));
    st.add(unitCircle(R * W, C.orange, 0.25));
    const z = st.add(arrow(C.cyan, { radius: 0.04, head: 0.24 }));
    const dz = st.add(arrow(C.orange, { radius: 0.04, head: 0.24 }));
    const arc = st.add(fatLine(C.yellow, { width: 2.5 }));
    return { axes, z, dz, arc };
  },

  update(st, t, phase, s) {
    const a = OM * t;
    s.z.set(cp(0, 0, 0.1), cp(R * Math.cos(a), R * Math.sin(a), 0.1));
    s.dz.set(cp(0, 0, 0.14), cp(R * W * Math.cos(a + Math.PI / 2), R * W * Math.sin(a + Math.PI / 2), 0.14));
    s.arc.setPoints(arcPoints(0.55, a, a + Math.PI / 2, 0.12));
    s.a = a;
  },

  hud(st, h, t, phase, s) {
    h.title("微分＝乘以 iω", "對 e^{iωt} 微分，函數不換名字，只是前面多乘 iω：轉 90°、放大 ω 倍", tag(19));
    s.axes.labels(h);
    const a = s.a;
    h.label(st, cp(R * Math.cos(a), R * Math.sin(a), 0.1), "e^{iωt}", C.cyan, { dx: 10, dy: 16, size: 15 });
    h.label(st, cp(R * W * Math.cos(a + Math.PI / 2), R * W * Math.sin(a + Math.PI / 2), 0.14), "iω·e^{iωt}", C.orange, { dx: 10, dy: -8, size: 15 });
    h.label(st, cp(0.75 * Math.cos(a + Math.PI / 4), 0.75 * Math.sin(a + Math.PI / 4), 0.12), "90°", C.yellow, { size: 14, dx: -6, dy: 4 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "兩種微分");
    h.text("實數寫法：會換名字", x + 22, y + 72, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("sin → cos → −sin → …", x + 22, y + 104, { size: 17, mono: true });
    const map = h.plot(x + 22, y + 124, w - 44, 120, { xr: [0, 12], yr: [-1.8, 1.8] });
    const tt = (u) => OM * u;
    h.curve(map.sample((u) => Math.sin(tt(u)), 0, 12), C.cyan, { width: 2 });
    h.curve(map.sample((u) => W * Math.cos(tt(u)) * 0.95, 0, 12), C.orange, { width: 2 });
    h.dot(...map(t, Math.sin(tt(t))), C.cyan, { r: 4 });
    h.dot(...map(t, W * Math.cos(tt(t)) * 0.95), C.orange, { r: 4 });
    h.text("複數寫法：只多一個因子", x + 22, y + 300, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("e^{iωt}  →  iω · e^{iωt}", x + 22, y + 334, { size: 18, mono: true, color: css(C.orange) });
    h.text("微分方程 → 代數方程", x + w / 2, y + hh - 30, { size: 18, align: "center", color: css(C.yellow), glow: 8 });

    h.formula(["d/dt e^{iωt} = iω · e^{iωt}", "∫ e^{iωt} dt = e^{iωt} / (iω)"]);
  },
};
