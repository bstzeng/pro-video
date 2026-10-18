// 第 26 課：時域與頻域：同一個訊號從正面看是波形，轉到側面看是一根根頻率柱
import { THREE, C, css, seg, fatLine, glowMesh, polyline, sample, tag } from "../../engine.js";

const COMP = [[1, 1.0, C.cyan], [3, 0.55, C.green], [5, 0.32, C.magenta]];   // [倍頻, 振幅, 顏色]
const Y0 = 1.6, T0 = -3.6, TL = 7.2;           // 波形中線高度、時間軸起點與長度
const ZF = (f) => -0.9 * f + 0.4;              // 每個頻率分量放在不同深度（頻率軸往 −z）
const sig = (x, t) => COMP.reduce((s, [f, a]) => s + a * Math.sin(f * (x * 2 * Math.PI / TL * 2 - 2 * Math.PI * t / 6)), 0);

export default {
  id: "l26-time-freq",
  poster: 110,
  camera: { target: [0, 1.2, -1.6], dist: 13.5, elev: 14, azim: 0, sway: 4, swayElev: 1 },
  // 0–3 秒正面（時域）→ 5–7.5 秒轉到側面（頻域）→ 9.5–11.5 秒轉回正面
  cameraPath: (t) => ({ azim: -8 + 78 * (seg(t, 4.6, 7.4) - seg(t, 9.2, 11.6)) }),

  setup(st) {
    const sum = st.add(fatLine(C.yellow, { width: 3.4 }));
    const parts = COMP.map(([, , c]) => st.add(fatLine(c, { width: 2.4 })));
    const bars = COMP.map(([f, a, c]) => {
      const b = glowMesh(new THREE.BoxGeometry(0.45, a * 2.2, 0.45), c, { opacity: 0.35 });
      b.position.set(T0 - 0.8, Y0 + a * 1.1 - 0.9, ZF(f));
      st.add(b);
      return b;
    });
    st.add(polyline(C.blue, { opacity: 0.6 }).setPoints([new THREE.Vector3(T0 - 0.8, Y0 - 0.9, 0.6), new THREE.Vector3(T0 - 0.8, Y0 - 0.9, ZF(6))]));
    return { sum, parts, bars };
  },

  update(st, t, phase, s) {
    const sep = seg(t, 2.4, 4.4) * (1 - seg(t, 10.6, 11.8));     // 分量從總和裡分離出來
    s.side0 = seg(t, 5.6, 7.4) * (1 - seg(t, 9.2, 10.4));
    s.sum.setPoints(sample((x) => new THREE.Vector3(T0 + x, Y0 + sig(x, t) * 0.75, 0.4), 0, TL, 260)).setAlpha((1 - 0.6 * sep) * (1 - 0.95 * s.side0));
    COMP.forEach(([f, a], i) => {
      const z = 0.4 + (ZF(f) - 0.4) * sep;
      s.parts[i].setPoints(sample((x) => new THREE.Vector3(T0 + x, Y0 + 0.75 * a * Math.sin(f * (x * 2 * Math.PI / TL * 2 - 2 * Math.PI * t / 6)), z), 0, TL, 220)).setAlpha(sep * (1 - 0.85 * s.side0));
    });
    const side = seg(t, 5.6, 7.4) * (1 - seg(t, 9.2, 10.4));
    s.bars.forEach((b) => b.setAlpha(side));
    Object.assign(s, { sep, side });
  },

  hud(st, h, t, phase, s) {
    h.title("時域與頻域", "同一份資訊兩種排法：正面看是「每個時刻的值」，側面看是「由哪些頻率組成」", tag(26));
    const fr = s.side > 0.5;

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, fr ? "頻域：像樂譜" : "時域：像錄音波形");
    h.chip(x + 22, y + 52, "時域", C.yellow, { mono: false, size: 15, alpha: fr ? 0.35 : 1 });
    h.chip(x + 110, y + 52, "頻域", C.cyan, { mono: false, size: 15, alpha: fr ? 1 : 0.35 });
    const map = h.plot(x + 40, y + 120, w - 80, 160, { xr: [0, 6], yr: [0, 1.15], xLabel: "頻率", zero: false });
    COMP.forEach(([f, a, c]) => {
      const [bx, by] = map(f, a), [, b0] = map(f, 0);
      h.curve([[bx, b0], [bx, by]], c, { width: 10, alpha: 0.35 + 0.65 * s.sep });
      h.text(`${f}ω`, bx, b0 + 18, { size: 13, mono: true, align: "center", alpha: 0.8 });
    });
    h.text("每個頻率柱是一個複數：", x + 22, y + 330, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("模 = 強度，輻角 = 相位", x + 22, y + 362, { size: 17, color: css(C.yellow) });

    h.formula(["x(t) = Σ c_k e^{ikωt}", "|c_k| 強度    arg c_k 相位"]);
  },
};
