// 第 30 課：極點的位置決定系統穩不穩：左半平面衰減、虛軸上等幅振盪、右半平面發散
import { THREE, C, css, cp, glowMesh, ball, fatLine, complexAxes, tag } from "../../engine.js";

const OMG = 1.6;                                              // 極點的虛部（振盪頻率）
const sigOf = (t) => -1.1 + 1.6 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 12));   // σ：−1.1 → 0.5 → −1.1

export default {
  id: "l30-poles",
  poster: 25,
  camera: { target: [0, 0, 0.2], dist: 11, elev: 54, azim: -10, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.6, 2.4], im: [-2.6, 2.6], ticks: false });
    const left = glowMesh(new THREE.PlaneGeometry(2.6, 5.2), C.green, { opacity: 0.08, edgeOpacity: 0 });
    left.rotation.x = -Math.PI / 2; left.position.set(-1.3, 0, 0);
    const right = glowMesh(new THREE.PlaneGeometry(2.4, 5.2), C.red, { opacity: 0.08, edgeOpacity: 0 });
    right.rotation.x = -Math.PI / 2; right.position.set(1.2, 0, 0);
    st.add(left, right);
    const p1 = st.add(ball(C.yellow, 0.14)), p2 = st.add(ball(C.yellow, 0.14));
    const d1 = st.add(fatLine(C.yellow, { width: 1.5, opacity: 0.6, dashed: true }));
    return { axes, p1, p2, d1 };
  },

  update(st, t, phase, s) {
    const sg = sigOf(t);
    s.p1.position.copy(cp(sg, OMG, 0.14));
    s.p2.position.copy(cp(sg, -OMG, 0.14));
    s.d1.setPoints([cp(0, OMG, 0.06), cp(sg, OMG, 0.06)]);
    s.sg = sg;
  },

  hud(st, h, t, phase, s) {
    const sg = s.sg;
    const state = sg < -0.08 ? ["穩定：振幅衰減", C.green] : sg > 0.08 ? ["不穩定：振幅發散", C.red] : ["臨界：等幅振盪", C.yellow];
    h.title("極點的位置決定機器會不會失控", "看那對共軛點在虛軸的左邊還是右邊：左邊穩定、右邊發散", tag(30));
    s.axes.labels(h, { reText: "σ（實部）", imText: "ω（虛部）" });
    h.label(st, cp(-1.6, -2.2), "左半平面：穩定", C.green, { mono: false, size: 15, dx: -40 });
    h.label(st, cp(1.0, -2.2), "右半平面：發散", C.red, { mono: false, size: 15, dx: -20 });
    h.label(st, cp(sg, OMG, 0.14), "s = σ + iω", C.yellow, { dx: 12, dy: -8, size: 15 });
    h.label(st, cp(sg, -OMG, 0.14), "共軛", C.yellow, { mono: false, dx: 12, dy: 16, size: 14 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "受擾動後的響應 e^{σt} cos ωt");
    const map = h.plot(x + 22, y + 70, w - 44, 200, { xr: [0, 8], yr: [-3, 3], xLabel: "時間" });
    const f = (u) => Math.max(-3, Math.min(3, Math.exp(sg * u * 0.45) * Math.cos(OMG * u * 1.4)));
    h.curve(map.sample((u) => Math.min(3, Math.exp(sg * u * 0.45)), 0, 8), state[1], { width: 1.2, glow: 0, alpha: 0.5, dash: [4, 4] });
    h.curve(map.sample((u) => Math.max(-3, -Math.exp(sg * u * 0.45)), 0, 8), state[1], { width: 1.2, glow: 0, alpha: 0.5, dash: [4, 4] });
    h.curve(map.sample(f, 0, 8, 240), state[1], { width: 2.4 });
    h.text(`σ = ${sg.toFixed(2)}`, x + 22, y + 330, { size: 18, mono: true });
    h.text(`ω = ${OMG.toFixed(1)}`, x + 190, y + 330, { size: 18, mono: true });
    h.chip(x + 22, y + 356, state[0], state[1], { mono: false, size: 15 });

    h.formula(["e^{st} = e^{σt} · e^{iωt}", "σ < 0 衰減   σ = 0 臨界   σ > 0 發散"]);
  },
};
