// 第 21 課：相量：全電路同頻，把共同的轉動 e^{iωt} 拿掉，就剩一張靜止的圖
import { THREE, C, css, cp, seg, arrow, complexAxes, unitCircle, tag } from "../../engine.js";

const PH = [
  ["V₁", 1.8, 0, C.orange],
  ["V₂", 1.1, 60, C.green],
  ["I", 1.3, -35, C.cyan],
].map(([n, r, d, c]) => [n, r, d * Math.PI / 180, c]);
// 轉速倍率 s(t)：1 → 0（4–6 秒）→ 停住 → 0 → 1（9–11 秒）。∫s dt = 7，所以 ω = 4π/7 剛好轉 2 圈
const speed = (t) => 1 - seg(t, 4, 6) + seg(t, 9, 11);
const OM = 4 * Math.PI / 7;
function angleAt(t) {                 // 數值積分 ∫₀ᵗ ω s(τ) dτ
  let a = 0; const n = Math.max(1, Math.round(t * 30));
  for (let k = 0; k < n; k++) a += OM * speed((k + 0.5) * t / n) * t / n;
  return a;
}

export default {
  id: "l21-phasor",
  poster: 110,
  camera: { target: [0, 0, 0.2], dist: 11, elev: 56, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.8, 2.8], im: [-2.6, 2.6], ticks: false });
    st.add(unitCircle(1.8, C.blue, 0.2));
    const arrows = PH.map(([, , , c]) => st.add(arrow(c, { radius: 0.04, head: 0.24 })));
    return { axes, arrows };
  },

  update(st, t, phase, s) {
    const a = angleAt(t);
    PH.forEach(([, r, p], i) => s.arrows[i].set(cp(0, 0, 0.1 + i * 0.03), cp(r * Math.cos(a + p), r * Math.sin(a + p), 0.1 + i * 0.03)));
    s.a = a; s.sp = speed(t);
  },

  hud(st, h, t, phase, s) {
    h.title("相量：把一條波壓成一個複數", "全電路都用同一個頻率轉；把共同的轉動拿掉，每條波就只剩「長度＋角度」", tag(21));
    s.axes.labels(h);
    PH.forEach(([n, r, p, c]) => h.label(st, cp(r * Math.cos(s.a + p), r * Math.sin(s.a + p), 0.12), n, c, { dx: 8, dy: -6, size: 18 }));
    const still = s.sp < 0.05;

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, still ? "相量（靜止）" : "一起轉的箭頭");
    h.chip(x + 22, y + 52, still ? "e^{iωt} 已約掉" : "× e^{iωt}", still ? C.green : C.yellow, { size: 15 });
    PH.forEach(([n, r, p, c], i) => {
      const yy = y + 130 + i * 52;
      h.text(n, x + 22, yy, { size: 19, mono: true, color: css(c) });
      h.text(`${r.toFixed(1)}∠${Math.round(p * 180 / Math.PI)}°`, x + 90, yy, { size: 19, mono: true });
    });
    h.text("轉速", x + 22, y + 310, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.bar(x + 80, y + 300, w - 110, s.sp, C.yellow);
    h.text("只記振幅與相位，時間因子約掉", x + w / 2, y + hh - 30, { size: 16, align: "center", color: css(C.yellow), glow: 6, alpha: Math.max(0.35, 1 - s.sp) });

    h.formula(["v(t) = Re[ V e^{iωt} ]", "V = V₀ e^{iφ}   （相量）"], { highlight: still ? 1 : 0 });
  },
};
