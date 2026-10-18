// 第 45 課：一句話：複數把「旋轉加縮放」變成可以相乘的數（三次乘法，乘積剛好是 1，回到原位）
import { THREE, C, css, cp, seg, glowMesh, tag } from "../../engine.js";

const MULS = [[1.25, 50], [0.8, -80], [1, 30]].map(([r, d]) => [r, d * Math.PI / 180]);   // 1.25·0.8·1 = 1，50−80+30 = 0
const TT = [[1.0, 2.8], [4.4, 6.2], [7.8, 9.6]];
const F = [[0.5, 0.3], [0.95, 0.3], [0.95, 1.15], [1.65, 1.15], [1.65, 1.55], [0.95, 1.55],
  [0.95, 2.0], [2.0, 2.0], [2.0, 2.45], [0.5, 2.45]];
const CHAIN = ["三次方程式逼出來", "加法＝平移", "乘法＝旋轉＋縮放", "e^{iθ}＝等速旋轉", "波＝旋轉的影子",
  "相量、阻抗", "頻域", "量子：相位", "穩定性", "代數封閉"];

export default {
  id: "l45-summary",
  poster: 90,
  camera: { target: [0.3, 0, -0.4], dist: 11.5, elev: 56, azim: -10, sway: 6 },

  setup(st) {
    const g = new THREE.Group();
    const p = [];
    for (let k = -2; k <= 3; k++) p.push(cp(k, -2), cp(k, 3), cp(-2, k), cp(3, k));
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p), new THREE.LineBasicMaterial({ color: C.yellow, transparent: true, opacity: 0.3 })));
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(F.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.12, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    g.add(glowMesh(geo, C.yellow, { opacity: 0.2 }));
    st.add(g);
    return { g };
  },

  update(st, t, phase, s) {
    let r = 1, a = 0;
    MULS.forEach(([m, d], i) => { const u = seg(t, ...TT[i]); r *= Math.pow(m, u); a += d * u; });
    s.g.rotation.y = a;
    s.g.scale.set(r, 1, r);
    Object.assign(s, { r, a });
  },

  hud(st, h, t, phase, s) {
    h.title("複數到底在做什麼", "一句話：複數把「旋轉加縮放」這個動作，變成一個可以拿來乘的數", tag(45));
    const cur = TT.findIndex(([a, b]) => t >= a - 0.4 && t <= b + 0.8);
    if (cur >= 0) {
      const [m, d] = MULS[cur];
      h.text(`× ${m}∠${Math.round(d * 180 / Math.PI)}°`, 330, 180, { size: 26, mono: true, color: css(C.yellow), glow: 8, align: "center" });
    }

    const x = 884, y = 120, w = 356, hh = 480;
    h.panel(x, y, w, hh, "整門課的推理鏈");
    const hl = Math.floor(t / 12 * CHAIN.length);
    CHAIN.forEach((c, i) => {
      const yy = y + 62 + i * 38;
      h.dot(x + 30, yy - 5, i === hl ? C.yellow : C.blue, { r: i === hl ? 5 : 3, alpha: i === hl ? 1 : 0.6 });
      h.text(c, x + 46, yy, { size: 15, alpha: i === hl ? 1 : 0.5, mono: i === 3 });
    });
    h.text(`目前：長度 ×${s.r.toFixed(2)}、轉 ${Math.round(s.a * 180 / Math.PI)}°`, x + w / 2, y + hh - 28, { size: 15, mono: true, align: "center", color: css(C.yellow) });

    h.formula(["乘上 z = r e^{iθ}", "  ＝ 放大 r 倍、轉 θ"]);
  },
};
