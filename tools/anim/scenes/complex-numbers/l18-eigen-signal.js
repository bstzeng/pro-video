// 第 18 課：正弦波是線性系統的本徵訊號：進出同頻，只改振幅與相位；方波進去會變形
import { THREE, C, css, seg, window4, fatLine, glowMesh, arrow, sample, polyline, tag } from "../../engine.js";

const TAU = 0.35;                                   // 系統（RC 低通）的時間常數
const H = (w) => { const d = 1 + (w * TAU) ** 2; return [1 / d, -w * TAU / d]; };   // 1/(1+iωτ)
const W0 = 2 * Math.PI / 3;                         // 輸入正弦的角頻率（3 秒一週期）
const G = Math.hypot(...H(W0)), PH = Math.atan2(H(W0)[1], H(W0)[0]);
const HARM = [1, 3, 5, 7, 9, 11, 13];
const square = (x) => HARM.reduce((s, n) => s + 4 / Math.PI * Math.sin(n * x) / n, 0);
const squareOut = (x) => HARM.reduce((s, n) => {
  const [re, im] = H(n * W0); const g = Math.hypot(re, im), ph = Math.atan2(im, re);
  return s + 4 / Math.PI * g * Math.sin(n * x + ph) / n;
}, 0);

const YIN = 1.7, XL = -5.6, XM = -1.1, XR = 1.1, XE = 5.6, SCL = 0.75;

export default {
  id: "l18-eigen-signal",
  poster: 40,
  camera: { target: [0, 1.5, 0], dist: 15, elev: 14, azim: -12, sway: 6, swayElev: 1.5 },

  setup(st) {
    const box = glowMesh(new THREE.BoxGeometry(2.2, 1.8, 1.4), C.blue, { opacity: 0.12 });
    box.position.set(0, YIN, 0);
    st.add(box);
    st.add(polyline(C.blue, { opacity: 0.35 }).setPoints([new THREE.Vector3(XL, YIN, 0), new THREE.Vector3(XM, YIN, 0)]));
    st.add(polyline(C.blue, { opacity: 0.35 }).setPoints([new THREE.Vector3(XR, YIN, 0), new THREE.Vector3(XE, YIN, 0)]));
    const win = st.add(fatLine(C.cyan, { width: 3.2 }));
    const wout = st.add(fatLine(C.orange, { width: 3.2 }));
    return { win, wout };
  },

  update(st, t, phase, s) {
    // 0–5.6 秒正弦、6.4–11.2 秒方波；交界淡入淡出
    const sq = window4(t, 5.6, 6.4, 11.2, 11.95);
    const V = (x, y) => new THREE.Vector3(x, YIN + y * SCL, 0);
    const k = 1.6;                                   // 每單位長度對應的相位
    const fIn = (x) => (1 - sq) * Math.sin(W0 * t - k * (x - XL)) + sq * square(W0 * t - k * (x - XL)) * 0.8;
    const fOut = (x) => (1 - sq) * G * Math.sin(W0 * t - k * (x - XL) + PH) + sq * squareOut(W0 * t - k * (x - XL)) * 0.8;
    s.win.setPoints(sample((x) => V(x, fIn(x)), XL, XM, 140));
    s.wout.setPoints(sample((x) => V(x, fOut(x)), XR, XE, 140));
    s.sq = sq;
  },

  hud(st, h, t, phase, s) {
    h.title("正弦波進、正弦波出", "線性系統對正弦波只做兩件事：改振幅、移相位——這兩個數合起來，正好是一個複數", tag(18));
    const bp = st.project(new THREE.Vector3(0, YIN + 1.1, 0));
    h.text("線性系統", bp[0], bp[1], { size: 16, align: "center", color: css(C.blue) });
    h.label(st, new THREE.Vector3(XL + 0.4, YIN - 1.4, 0), s.sq < 0.5 ? "輸入：正弦" : "輸入：方波", C.cyan, { mono: false, size: 15 });
    h.label(st, new THREE.Vector3(XR + 0.3, YIN - 1.4, 0), s.sq < 0.5 ? "輸出：還是正弦" : "輸出：形狀變了", C.orange, { mono: false, size: 15 });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "系統對這個頻率做了什麼");
    const a = Math.max(0.3, 1 - s.sq);
    h.text("振幅", x + 22, y + 80, { size: 15, color: "rgba(232,246,255,0.7)", alpha: a });
    h.text(`× ${G.toFixed(2)}`, x + w - 22, y + 80, { size: 20, mono: true, align: "right", alpha: a });
    h.text("相位", x + 22, y + 124, { size: 15, color: "rgba(232,246,255,0.7)", alpha: a });
    h.text(`${Math.round(PH * 180 / Math.PI)}°`, x + w - 22, y + 124, { size: 20, mono: true, align: "right", alpha: a });
    h.chip(x + 22, y + 156, `H = ${G.toFixed(2)}∠${Math.round(PH * 180 / Math.PI)}°`, C.yellow, { size: 17, alpha: a });
    h.text("一個複數就說完了", x + 22, y + 230, { size: 17, color: css(C.yellow), alpha: a });
    h.text("方波沒有這個保證：", x + 22, y + 300, { size: 15, color: "rgba(232,246,255,0.7)", alpha: Math.max(0.3, s.sq) });
    h.text("每個頻率被改得不一樣", x + 22, y + 330, { size: 16, alpha: Math.max(0.3, s.sq) });
    h.text("→ 先拆成正弦波再處理", x + 22, y + 360, { size: 16, color: css(C.orange), alpha: Math.max(0.3, s.sq) });

    h.formula(["輸出 = H(ω) · 輸入", "H(ω) = |H| e^{iφ}"]);
  },
};
