// 第 27 課：機率幅相加：雙狹縫，光子（洋紅）一顆顆打上屏幕，累積出干涉條紋
import { THREE, C, css, seg, window4, glowMesh, particles, PARTICLE, tag } from "../../engine.js";

const SRC = new THREE.Vector3(-4.6, 1.4, 0);
const SLIT_X = -1.2, SCREEN_X = 3.6, SLIT_D = 0.7;   // 兩條狹縫在 z = ±SLIT_D/2
const KW = 3.2;                                       // 屏幕上的條紋密度
const NH = 420, NF = 18;                              // 累積的落點數、飛行中的光子數
const prob = (z) => Math.cos(KW * z) ** 2 * Math.exp(-z * z / 4.5);   // |ψ₁+ψ₂|² 的形狀（含包絡）

// 固定亂數，讓每次渲染一樣
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const HITS = [];
while (HITS.length < NH) {
  const z = (rnd() - 0.5) * 6, y = 0.4 + rnd() * 2;
  if (rnd() < prob(z)) HITS.push([z, y]);
}

export default {
  id: "l27-interference",
  poster: 150,
  camera: { target: [-0.2, 1.2, 0], dist: 12, elev: 26, azim: -48, sway: 6, swayElev: 1.5 },

  setup(st) {
    // 擋板（中間兩條縫）
    const mk = (w, z) => { const b = glowMesh(new THREE.BoxGeometry(0.12, 2.6, w), C.blue, { opacity: 0.18, edgeOpacity: 0.7 }); b.position.set(SLIT_X, 1.4, z); st.add(b); };
    mk(2.2, -SLIT_D / 2 - 0.15 - 1.1); mk(SLIT_D - 0.3, 0); mk(2.2, SLIT_D / 2 + 0.15 + 1.1);
    const screen = glowMesh(new THREE.PlaneGeometry(6.4, 2.6), C.magenta, { opacity: 0.05, edgeOpacity: 0.5 });
    screen.rotation.y = -Math.PI / 2; screen.position.set(SCREEN_X, 1.4, 0);
    st.add(screen);
    const src = glowMesh(new THREE.SphereGeometry(0.22, 16, 12), C.magenta, { opacity: 0.4 });
    src.position.copy(SRC); st.add(src);
    const hits = st.add(particles(NH, { radius: 0.045 }));
    const fly = st.add(particles(NF, { radius: 0.07 }));
    return { hits, fly };
  },

  update(st, t, phase, s) {
    const shown = Math.floor(NH * seg(t, 0.3, 10.6));
    const fade = 1 - seg(t, 11, 11.9);
    HITS.forEach(([z, y], i) => s.hits.place(i, new THREE.Vector3(SCREEN_X - 0.02, y, z), PARTICLE.photon, i < shown ? fade : 0.0001));
    s.hits.commit();
    for (let k = 0; k < NF; k++) {
      const u = ((t * 0.9 + k / NF) % 1);
      const [hz, hy] = HITS[(k * 37 + Math.floor(t * 0.9 + k / NF) * 11) % NH];
      const slitZ = (k % 2 ? 1 : -1) * SLIT_D / 2;
      let p;
      if (u < 0.45) p = SRC.clone().lerp(new THREE.Vector3(SLIT_X, 1.4, slitZ), u / 0.45);
      else p = new THREE.Vector3(SLIT_X, 1.4, slitZ).lerp(new THREE.Vector3(SCREEN_X, hy, hz), (u - 0.45) / 0.55);
      s.fly.place(k, p, PARTICLE.photon, t > 11.2 ? 0.0001 : 1);
    }
    s.fly.commit();
    s.shown = shown;
  },

  hud(st, h, t, phase, s) {
    h.title("機率幅相加：干涉", "每顆光子都同時走兩條縫：兩個帶相位的箭頭先相加、再取長度平方，才是機率", tag(27));
    h.label(st, new THREE.Vector3(SCREEN_X, 0.1, 3.2), "屏幕", C.magenta, { mono: false, size: 15, dy: 20 });
    h.label(st, new THREE.Vector3(SLIT_X, 2.9, 0), "雙狹縫", C.blue, { mono: false, size: 15, align: "center", dx: 0 });

    // 掃描位置：相對相位 Δφ 隨屏幕位置改變
    const zc = 2.4 * Math.sin(2 * Math.PI * t / 12);
    const dphi = 2 * KW * zc;
    const x = 884, y = 130, w = 356, hh = 460;
    h.panel(x, y, w, hh, "屏幕上某一點的兩個機率幅");
    const ox = x + 60, oy = y + 170, L = 66;
    const a1 = [L, 0], a2 = [L * Math.cos(dphi), L * Math.sin(dphi)];
    h.curve([[ox, oy], [ox + a1[0], oy - a1[1]]], C.cyan, { width: 3 });
    h.curve([[ox + a1[0], oy - a1[1]], [ox + a1[0] + a2[0], oy - a1[1] - a2[1]]], C.green, { width: 3 });
    h.curve([[ox, oy], [ox + a1[0] + a2[0], oy - a1[1] - a2[1]]], C.yellow, { width: 3.4 });
    const amp2 = ((1 + Math.cos(dphi)) / 2);
    h.text("ψ₁", x + 210, y + 120, { size: 16, mono: true, color: css(C.cyan) });
    h.text("ψ₂", x + 260, y + 120, { size: 16, mono: true, color: css(C.green) });
    h.text(`Δφ = ${(((dphi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI).toFixed(0)}°`, x + 210, y + 160, { size: 16, mono: true });
    const map = h.plot(x + 22, y + 250, w - 44, 110, { xr: [-3, 3], yr: [0, 1.05], xLabel: "屏幕位置", zero: false });
    h.curve(map.sample(prob, -3, 3, 200), C.magenta, { width: 2.2 });
    h.dot(...map(zc, prob(zc)), C.yellow, { r: 5 });
    h.text(`亮度 ∝ |ψ₁+ψ₂|² = ${amp2.toFixed(2)}`, x + 22, y + hh - 50, { size: 15, mono: true, color: css(C.yellow) });
    h.text(`已到達 ${s.shown} 顆光子`, x + 22, y + hh - 20, { size: 14, color: "rgba(232,246,255,0.7)" });

    h.formula(["P = |ψ₁ + ψ₂|²", "  = |ψ₁|² + |ψ₂|² + 2|ψ₁||ψ₂| cos Δφ"]);
  },
};
