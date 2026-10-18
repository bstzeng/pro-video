// 第 35 課：為什麼不繼續擴充：每升一階，維度加倍、少一個性質
import { THREE, C, css, seg, window4, glowMesh, ball, tag } from "../../engine.js";

const LV = [
  ["實數", 1, C.blue, ""],
  ["複數", 2, C.cyan, "大小順序"],
  ["四元數", 4, C.green, "交換律"],
  ["八元數", 8, C.orange, "結合律"],
  ["十六元數", 16, C.red, "除法"],
];
const PROPS = ["順序", "交換律", "結合律", "除法"];

export default {
  id: "l35-extension-cost",
  poster: 60,
  camera: { target: [0.4, 1.3, 0], dist: 12, elev: 22, azim: -28, sway: 6, swayElev: 1.5 },

  setup(st) {
    const steps = LV.map(([, d, c], i) => {
      const hgt = 0.4 + i * 0.55;
      const b = glowMesh(new THREE.BoxGeometry(1.3, hgt, 1.6), c, { opacity: 0.14 });
      b.position.set(-2.8 + i * 1.4, hgt / 2, 0);
      st.add(b);
      return b;
    });
    const me = st.add(ball(C.yellow, 0.18));
    return { steps, me };
  },

  update(st, t, phase, s) {
    // 每 2 秒爬一階；最後淡出回到實數
    const lv = Math.min(4, 2 * 0 + seg(t, 0.8, 1.6) + seg(t, 2.8, 3.6) + seg(t, 4.8, 5.6) + seg(t, 6.8, 7.6));
    const back = seg(t, 10.6, 11.6);
    const f = lv * (1 - back);
    const i = Math.floor(f), u = f - i;
    const x = -2.8 + f * 1.4, hgt = 0.4 + Math.min(4, Math.round(f)) * 0.55;
    const y = 0.4 + (i + Math.min(1, u * 1.6)) * 0.55 + 0.25 + 0.5 * Math.sin(Math.PI * u);
    s.me.position.set(x, Math.min(y, 0.4 + 4 * 0.55 + 0.25), 0);
    s.steps.forEach((b, k) => b.setAlpha(k <= Math.round(f) + 0.01 ? 1 : 0.35));
    s.lv = Math.round(f);
  },

  hud(st, h, t, phase, s) {
    h.title("為什麼不繼續擴充下去", "從實數往上每升一階，維度加倍，卻要丟掉一個好用的性質：複數是剛好停下來的甜蜜點", tag(35));
    LV.forEach(([n, d, c], i) => {
      const p = st.project(new THREE.Vector3(-2.8 + i * 1.4, 0.4 + i * 0.55 + 0.4, 0));
      h.text(n, p[0], p[1], { size: 15, align: "center", color: css(c), alpha: i <= s.lv ? 1 : 0.4 });
      h.text(`${d} 維`, p[0], p[1] + 20, { size: 13, mono: true, align: "center", alpha: i <= s.lv ? 0.9 : 0.35 });
    });
    if (s.lv >= 1) {
      const p = st.project(new THREE.Vector3(-1.4, 1.2, 0.8));
      h.callout(p, [p[0] - 60, p[1] + 110], "甜蜜點：代數封閉，只少了順序", C.cyan, { size: 14 });
    }

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "每一階還剩下哪些性質");
    PROPS.forEach((p, j) => h.text(p, x + 130 + j * 56, y + 60, { size: 13, align: "center", color: "rgba(232,246,255,0.7)" }));
    LV.forEach(([n, , c], i) => {
      const yy = y + 100 + i * 52, on = i <= s.lv;
      h.text(n, x + 22, yy, { size: 15, color: css(c), alpha: on ? 1 : 0.35 });
      PROPS.forEach((p, j) => {
        const ok = j >= i;              // 第 i 階失去前 i 個性質
        h.text(ok ? "✓" : "✗", x + 130 + j * 56, yy, { size: 17, align: "center", color: ok ? css(C.green) : css(C.red), alpha: on ? 1 : 0.25 });
      });
    });
    const lost = LV[s.lv][3];
    h.text(lost ? `這一階失去：${lost}` : "起點：什麼都有，但不封閉", x + w / 2, y + hh - 30, { size: 16, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["複數：代數封閉，只失去大小順序"]);
  },
};
