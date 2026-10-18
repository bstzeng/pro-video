// 第 31 課：電腦繪圖：連續旋轉只要角度相加，一次乘法 e^{i(θ₁+θ₂+θ₃)}
import { THREE, C, css, cp, seg, window4, glowMesh, fatLine, arcPoints, complexAxes, tag } from "../../engine.js";

const STEPS = [30, 45, 60].map((d) => d * Math.PI / 180);
const T = [[1.2, 2.6], [3.4, 4.8], [5.6, 7.0]];           // 三次旋轉的時間
const BACK = [9.4, 11.4];                                // 一次乘 e^{−i135°} 轉回來

function shipGeometry() {
  const s = new THREE.Shape([[2.2, 0], [0.9, 0.55], [1.1, 0.18], [0.3, 0.18], [0.3, -0.18], [1.1, -0.18], [0.9, -0.55]]
    .map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g;
}

export default {
  id: "l31-rotation",
  poster: 120,
  camera: { target: [0.3, 0, -0.4], dist: 10.5, elev: 58, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.6, 2.8], im: [-1, 2.8], ticks: false });
    const geo = shipGeometry();
    const ghosts = [0, 1, 2].map(() => { const g = glowMesh(geo, C.blue, { opacity: 0.06, edgeOpacity: 0.35 }); st.add(g); return g; });
    const ship = glowMesh(geo, C.cyan, { opacity: 0.22 });
    st.add(ship);
    const arcs = [C.green, C.magenta, C.orange].map((c) => st.add(fatLine(c, { width: 3 })));
    return { axes, ghosts, ship, arcs };
  },

  update(st, t, phase, s) {
    const parts = STEPS.map((a, i) => a * seg(t, ...T[i]));
    const back = (STEPS[0] + STEPS[1] + STEPS[2]) * seg(t, ...BACK);
    const ang = parts.reduce((x, y) => x + y, 0) - back;
    s.ship.rotation.y = ang;
    let acc = 0;
    s.ghosts.forEach((g, i) => { g.rotation.y = acc; g.setAlpha(window4(t, T[i][0], T[i][0] + 0.3, BACK[0], BACK[0] + 0.6)); acc += STEPS[i]; });
    acc = 0;
    s.arcs.forEach((l, i) => {
      l.setPoints(arcPoints(2.5 + i * 0.12, acc, acc + Math.max(parts[i], 0.0001), 0.12));
      l.setAlpha(window4(t, T[i][0], T[i][0] + 0.2, BACK[0], BACK[1]) * (parts[i] > 0.001 ? 1 : 0));
      acc += STEPS[i];
    });
    Object.assign(s, { ang, parts });
  },

  hud(st, h, t, phase, s) {
    h.title("旋轉不必用矩陣", "連轉三次：用複數，角度直接相加，一次乘法搞定；要轉回來，乘上一個角度相反的數就好", tag(31));
    s.axes.labels(h);
    const deg = Math.round(s.ang * 180 / Math.PI);
    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "兩種做法比一比");
    h.chip(x + 22, y + 50, "複數", C.cyan, { mono: false, size: 15 });
    const shownSteps = STEPS.map((a, i) => (t >= T[i][0] ? Math.round(a * 180 / Math.PI) : null)).filter((v) => v !== null);
    h.text(shownSteps.length ? shownSteps.join("° + ") + "°" : "—", x + 22, y + 116, { size: 19, mono: true });
    h.text(`= ${shownSteps.reduce((a, b) => a + b, 0)}°  → 一次乘法`, x + 22, y + 148, { size: 17, mono: true, color: css(C.yellow) });
    h.chip(x + 22, y + 186, "矩陣", C.blue, { mono: false, size: 15 });
    h.text(`${shownSteps.length} 次 2×2 矩陣乘法`, x + 22, y + 252, { size: 17, mono: true });
    h.text(`= ${shownSteps.length * 8} 次乘法、${shownSteps.length * 4} 次加法`, x + 22, y + 282, { size: 15, mono: true, color: "rgba(232,246,255,0.7)" });
    h.text("目前角度", x + 22, y + 340, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${deg}°`, x + w - 22, y + 340, { size: 22, mono: true, align: "right", color: css(C.cyan), glow: 6 });
    h.text(t > BACK[0] - 0.3 ? "乘 e^{−i135°}：一步轉回來" : "三維旋轉則改用四元數", x + w / 2, y + hh - 26, { size: 15, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["e^{iθ₁}·e^{iθ₂}·e^{iθ₃} = e^{i(θ₁+θ₂+θ₃)}"]);
  },
};
