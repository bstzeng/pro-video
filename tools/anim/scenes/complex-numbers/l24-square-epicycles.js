// 第 24 課：任何訊號都是一堆旋轉疊起來的：1、3、5、7 倍頻的箭頭一節接一節，尖端畫出方波
import { THREE, C, css, cp, arrow, fatLine, polyline, arcPoints, ball, tag } from "../../engine.js";

const NS = [1, 3, 5, 7];
const COL = [C.cyan, C.green, C.magenta, C.orange];
const R1 = 1.1;                                   // 基頻半徑（4/π 倍率已併入）
const OM = 2 * Math.PI / 6;                       // 基頻：6 秒一週期
const CX = -2.6;                                  // 旋轉組的圓心（實部）
const WX = 0.0, WLEN = 4.2;                       // 右側波形的起點與長度

function tipAt(t) {
  let re = 0, im = 0;
  NS.forEach((n) => { re += R1 / n * Math.cos(n * OM * t); im += R1 / n * Math.sin(n * OM * t); });
  return [re, im];
}

export default {
  id: "l24-square-epicycles",
  poster: 40,
  camera: { target: [-0.4, 0, 0.1], dist: 11.8, elev: 56, azim: -4, sway: 5 },

  setup(st) {
    st.add(polyline(C.blue, { opacity: 0.6 }).setPoints([cp(WX, 0), cp(WX + WLEN + 0.2, 0)]));
    const rings = NS.map((n, i) => st.add(polyline(COL[i], { opacity: 0.3 })));
    const arms = NS.map((n, i) => st.add(arrow(COL[i], { radius: 0.03, head: 0.16 })));
    const wave = st.add(fatLine(C.yellow, { width: 3.2 }));
    const link = st.add(fatLine(C.yellow, { width: 1.3, opacity: 0.6, dashed: true }));
    const tip = st.add(ball(C.yellow, 0.09));
    return { rings, arms, wave, link, tip };
  },

  update(st, t, phase, s) {
    let re = CX, im = 0;
    NS.forEach((n, i) => {
      const r = R1 / n, a = n * OM * t;
      s.rings[i].setPoints(arcPoints(r, 0, 2 * Math.PI, 0.01, 64).map((p) => p.add(cp(re, im))));
      const nre = re + r * Math.cos(a), nim = im + r * Math.sin(a);
      s.arms[i].set(cp(re, im, 0.06 + i * 0.01), cp(nre, nim, 0.06 + i * 0.01));
      re = nre; im = nim;
    });
    s.tip.position.copy(cp(re, im, 0.08));
    const pts = [];
    for (let k = 0; k <= 160; k++) {
      const u = WLEN * k / 160;
      pts.push(cp(WX + u, tipAt(t - u * 9 / WLEN)[1], 0.03));   // 整段顯示 9 秒（1.5 個週期）
    }
    s.wave.setPoints(pts);
    s.link.setPoints([cp(re, im, 0.08), cp(WX, im, 0.03)]);
  },

  hud(st, h, t, phase, s) {
    h.title("旋轉疊出方波", "一節接一節轉動的箭頭（1、3、5、7 倍頻），尖端的高度隨時間畫出來，就接近方波", tag(24));
    h.label(st, cp(WX + WLEN, 0), "時間 →", 0xe8f6ff, { mono: false, size: 14, dx: 8, dy: 4 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "每一節箭頭");
    NS.forEach((n, i) => {
      const yy = y + 56 + i * 44;
      h.chip(x + 22, yy, `${n}×`, COL[i], { size: 15 });
      h.text(`半徑 1/${n}，轉速 ${n} 倍`, x + 90, yy + 20, { size: 15 });
    });
    const map = h.plot(x + 22, y + 250, w - 44, 120, { xr: [0, 2 * Math.PI], yr: [-1.6, 1.6] });
    const part = (k) => (u) => NS.slice(0, k).reduce((acc, n) => acc + Math.sin(n * u) / n, 0) * (4 / Math.PI) * 0.95;
    h.curve(map.sample((u) => (Math.sin(u) >= 0 ? 1 : -1), 0, 2 * Math.PI, 200), 0xe8f6ff, { width: 1.2, glow: 0, alpha: 0.4 });
    h.curve(map.sample(part(1), 0, 2 * Math.PI), C.cyan, { width: 1.6, alpha: 0.6 });
    h.curve(map.sample(part(4), 0, 2 * Math.PI, 200), C.yellow, { width: 2.2 });
    h.text("項數愈多，愈接近方波", x + w / 2, y + hh - 26, { size: 16, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["方波 ≈ (4/π)( sin t + sin 3t/3", "               + sin 5t/5 + sin 7t/7 + … )"]);
  },
};
