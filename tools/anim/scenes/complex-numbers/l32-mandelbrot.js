// 第 32 課：曼德博集合：c 點移動時，z → z² + c 的軌跡在集合內就繞圈不散，跑出去就飛走
import { THREE, C, css, cp, fatLine, ball, particles, tag } from "../../engine.js";

const K = 1.7;                                         // 複數 1 單位 = 畫面 1.7
const RE0 = -2.2, RE1 = 0.8, IM0 = -1.3, IM1 = 1.3;
const NIT = 40;
// c 沿一個橢圓繞：會穿過主心形、小圓盤與外面
const cOf = (t) => {
  const a = 2 * Math.PI * t / 12;
  return [-0.55 + 0.75 * Math.cos(a), 0.62 * Math.sin(a)];
};
function orbit(c) {
  const pts = [[0, 0]];
  let x = 0, y = 0;
  for (let n = 0; n < NIT; n++) {
    [x, y] = [x * x - y * y + c[0], 2 * x * y + c[1]];
    pts.push([x, y]);
    if (x * x + y * y > 4) return { pts, escaped: n + 1 };
  }
  return { pts, escaped: 0 };
}

function mandelTexture() {
  const W = 600, H = 520, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d"), img = ctx.createImageData(W, H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const cr = RE0 + (RE1 - RE0) * i / W, ci = IM1 - (IM1 - IM0) * j / H;
    let x = 0, y = 0, n = 0;
    while (n < 80 && x * x + y * y < 4) { [x, y] = [x * x - y * y + cr, 2 * x * y + ci]; n++; }
    const k = 4 * (j * W + i);
    if (n === 80) { img.data[k] = 20; img.data[k + 1] = 120; img.data[k + 2] = 150; img.data[k + 3] = 255; }
    else { const v = Math.sqrt(n / 80); img.data[k] = 30 * v; img.data[k + 1] = 140 * v; img.data[k + 2] = 255 * v; img.data[k + 3] = 255 * Math.min(1, v * 1.4); }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default {
  id: "l32-mandelbrot",
  poster: 70,
  camera: { target: [-1.1, 0, 0.1], dist: 9.4, elev: 58, azim: -6, sway: 6 },

  setup(st) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry((RE1 - RE0) * K, (IM1 - IM0) * K),
      new THREE.MeshBasicMaterial({ map: mandelTexture(), transparent: true, opacity: 0.85, depthWrite: false }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.copy(cp((RE0 + RE1) / 2 * K, (IM0 + IM1) / 2 * K, 0.005));
    st.add(plane);
    const path = st.add(fatLine(C.yellow, { width: 1.4, opacity: 0.4, dashed: true }));
    const pp = [];
    for (let k = 0; k <= 120; k++) { const c = cOf(12 * k / 120); pp.push(cp(c[0] * K, c[1] * K, 0.03)); }
    path.setPoints(pp);
    const line = st.add(fatLine(C.orange, { width: 2 }));
    const dots = st.add(particles(NIT + 1, { radius: 0.05 }));
    const cdot = st.add(ball(C.yellow, 0.1));
    return { line, dots, cdot };
  },

  update(st, t, phase, s) {
    const c = cOf(t);
    const { pts, escaped } = orbit(c);
    const col = escaped ? C.red : C.green;
    const vis = pts.map(([x, y]) => { const m = Math.hypot(x, y), k = m > 2.05 ? 2.05 / m : 1; return [x * k, y * k]; });   // 逃逸後的點收在半徑 2.05 的圓上
    s.line.setPoints(vis.map(([x, y], i) => cp(x * K, y * K, 0.08 + i * 0.004)));
    s.line.material.color.setHex(col);
    for (let i = 0; i <= NIT; i++) {
      if (i < vis.length) s.dots.place(i, cp(vis[i][0] * K, vis[i][1] * K, 0.08 + i * 0.004), col, 1);
      else s.dots.place(i, cp(0, 0, -5), col, 0.0001);
    }
    s.dots.commit();
    s.cdot.position.copy(cp(c[0] * K, c[1] * K, 0.1));
    Object.assign(s, { c, escaped, pts });
  },

  hud(st, h, t, phase, s) {
    h.title("曼德博集合", "從 z = 0 開始反覆做「平方再加 c」：軌跡一直有界，c 就在集合裡；跑出半徑 2，就不在", tag(32));
    h.label(st, cp(s.c[0] * K, s.c[1] * K, 0.1), "c", C.yellow, { dx: 10, dy: -8, size: 18 });
    const inside = !s.escaped;
    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "迭代 z → z² + c");
    h.text(`c = ${s.c[0].toFixed(2)} ${s.c[1] >= 0 ? "+" : "−"} ${Math.abs(s.c[1]).toFixed(2)}i`, x + 22, y + 74, { size: 18, mono: true, color: css(C.yellow) });
    // |z_n| 長條
    const n = Math.min(24, s.pts.length);
    for (let i = 0; i < n; i++) {
      const m = Math.hypot(...s.pts[i]);
      const bh = Math.min(1, m / 2.5) * 140;
      h.ctx.save();
      h.ctx.fillStyle = css(m > 2 ? C.red : C.green, 0.85);
      h.ctx.fillRect(x + 22 + i * 13, y + 250 - bh, 9, bh);
      h.ctx.restore();
    }
    h.curve([[x + 22, y + 250 - 2 / 2.5 * 140], [x + w - 22, y + 250 - 2 / 2.5 * 140]], C.red, { width: 1, glow: 0, dash: [4, 4] });
    h.text("|z| = 2", x + w - 22, y + 250 - 2 / 2.5 * 140 - 6, { size: 12, mono: true, align: "right", color: css(C.red) });
    h.text("每一步的 |z_n|", x + 22, y + 276, { size: 13, color: "rgba(232,246,255,0.6)" });
    h.chip(x + 22, y + 310, inside ? "有界 → 在集合內" : `第 ${s.escaped} 步逃逸 → 不在集合內`, inside ? C.green : C.red, { mono: false, size: 15 });
    h.text("平方：長度平方、角度加倍", x + w / 2, y + hh - 26, { size: 15, align: "center", color: css(C.yellow), glow: 6 });

    h.formula(["z_{n+1} = z_n² + c,   z₀ = 0"]);
  },
};
