// 第 41 課：曼德博集合怎麼畫：每個像素當成 c 去迭代，最大迭代次數逐步增加，圖像愈來愈清晰
import { THREE, C, css, cp, seg, tag } from "../../engine.js";

const K = 1.8, RE0 = -2.2, RE1 = 0.8, IM0 = -1.25, IM1 = 1.25;
const TW = 360, TH = 300;
const maxOf = (t) => Math.max(1, Math.round(1 + 59 * Math.pow(seg(t, 0.4, 9.6), 1.3) * (1 - seg(t, 11, 11.8))));

// 先算好每個像素的逃逸步數（最多 60）；畫某個上限 M 時，步數 ≥ M 的都當成「還沒逃逸」
const ESC = new Uint8Array(TW * TH);
for (let j = 0; j < TH; j++) for (let i = 0; i < TW; i++) {
  const cr = RE0 + (RE1 - RE0) * i / TW, ci = IM1 - (IM1 - IM0) * j / TH;
  let x = 0, y = 0, n = 0;
  while (n < 60 && x * x + y * y < 4) { [x, y] = [x * x - y * y + cr, 2 * x * y + ci]; n++; }
  ESC[j * TW + i] = n;
}

export default {
  id: "l41-mandel-draw",
  poster: 150,
  camera: { target: [-1.0, 0, 0.1], dist: 9.4, elev: 60, azim: -6, sway: 6 },

  setup(st) {
    const cv = document.createElement("canvas");
    cv.width = TW; cv.height = TH;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry((RE1 - RE0) * K, (IM1 - IM0) * K),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.copy(cp((RE0 + RE1) / 2 * K, (IM0 + IM1) / 2 * K, 0.005));
    st.add(plane);
    return { cv, ctx: cv.getContext("2d"), img: cv.getContext("2d").createImageData(TW, TH), tex, last: -1 };
  },

  update(st, t, phase, s) {
    const M = maxOf(t);
    s.M = M;
    if (M === s.last) return;
    s.last = M;
    const d = s.img.data;
    for (let p = 0; p < TW * TH; p++) {
      const n = ESC[p], k = 4 * p;
      if (n >= M) { d[k] = 12; d[k + 1] = 16; d[k + 2] = 34; d[k + 3] = 255; }            // 還沒逃逸：塗深色
      else { const v = Math.sqrt(n / M); d[k] = 34 * v; d[k + 1] = 229 * v; d[k + 2] = 255 * v; d[k + 3] = 255 * Math.min(1, v * 1.3); }
    }
    s.ctx.putImageData(s.img, 0, 0);
    s.tex.needsUpdate = true;
  },

  hud(st, h, t, phase, s) {
    h.title("曼德博集合怎麼畫", "每個像素當成一個 c，從 0 開始迭代；在上限之前逃出半徑 2 就依步數上色，沒逃出的塗深色", tag(41));
    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "演算法只有一行");
    h.text("最大迭代次數", x + 22, y + 76, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(String(s.M), x + w - 22, y + 76, { size: 30, mono: true, align: "right", color: css(C.yellow), glow: 6 });
    h.bar(x + 22, y + 96, w - 44, s.M / 60, C.yellow);
    const code = ["for 每個像素 c:", "  z = 0", "  重複 N 次:", "    z = z*z + c", "    if |z| > 2: 依次數上色", "  沒逃出：塗深色"];
    code.forEach((l, i) => h.text(l, x + 22, y + 160 + i * 30, { size: 15, mono: true, color: i === 3 ? css(C.yellow) : "#e8f6ff" }));
    h.text("上限愈高，邊界愈細", x + w / 2, y + hh - 28, { size: 16, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["z = z*z + c    # 核心只有這一行"]);
  },
};
