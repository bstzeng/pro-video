// 教學動畫共用骨架：版面、霧、格線、bloom、發光物件與 HUD 元件。
// 規格見 STYLE.md。每張動畫寫成 scenes/<主題>/<id>.js，匯出 { setup, update, hud }。
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export { THREE };

export const W = 1280, H = 720, FPS = 15, SECONDS = 12, N = FPS * SECONDS;
export const VIEW_W = Math.round(W * 2 / 3);      // 左 2/3 是 3D 主畫面

export const C = {
  bg: 0x05070d,
  cyan: 0x22e5ff, red: 0xff4d5e, yellow: 0xffd23d, green: 0x5dffb0,
  blue: 0x5aa0ff, magenta: 0xff3df2, orange: 0xffb340,
  grid: 0x5aa0ff,
};
export const TEXT = "#e8f6ff";
// 粒子固定配色（光子沒有紫色，用洋紅）
export const PARTICLE = { electron: C.yellow, ion: C.red, radical: C.green, photon: C.magenta };

export const tag = (n) => `複數到底在做什麼 ｜ 第 ${n} 課`;

export const FONT_ZH = '"Noto Sans TC", sans-serif';
export const FONT_MONO = '"JetBrains Mono", "Noto Sans TC", monospace';   // 公式裡的中文退回 Noto

export const css = (hex, a = 1) => {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
};

// ---- 時間工具（全部以 0–12 秒計，第 180 格回到第 0 格）----
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
// 在 [a, b] 秒之間從 0 走到 1
export const seg = (t, a, b) => ease((t - a) / (b - a));
// 在 [a, b] 淡入、[c, d] 淡出
export const window4 = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d));

// 複數平面放在地面（XZ 平面）：實部 → +x，虛部 → −z（離鏡頭較遠的方向是「上」）
export const cp = (re, im, y = 0) => new THREE.Vector3(re, y, -im);

// ---- 3D 物件 ----
export function glowMesh(geometry, color, { opacity = 0.16, edgeOpacity = 1 } = {}) {
  const g = new THREE.Group();
  const fill = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide,
  }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: edgeOpacity }));
  g.add(fill, edges);
  g.userData = { fill, edges, opacity, edgeOpacity };
  g.setAlpha = (a) => {
    fill.material.opacity = opacity * a;
    edges.material.opacity = edgeOpacity * a;
    g.visible = a > 0.001;
  };
  return g;
}

// 一根發光箭頭，set(from, to) 更新位置
export function arrow(color, { radius = 0.05, head = 0.28, opacity = 1 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 12), mat);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 3, head, 16), mat);
  const g = new THREE.Group();
  g.add(shaft, cone);
  const up = new THREE.Vector3(0, 1, 0);
  g.set = (from, to) => {
    const d = new THREE.Vector3().subVectors(to, from);
    const len = d.length();
    g.visible = len > 1e-4;
    if (!g.visible) return g;
    const dir = d.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const shaftLen = Math.max(len - head, 0.001);
    shaft.scale.set(1, shaftLen, 1);
    shaft.position.copy(from).addScaledVector(dir, shaftLen / 2);
    shaft.quaternion.copy(q);
    cone.position.copy(from).addScaledVector(dir, len - head / 2);
    cone.quaternion.copy(q);
    return g;
  };
  g.setAlpha = (a) => { mat.opacity = opacity * a; g.visible = a > 0.001; };
  return g;
}

// 可更新的折線
export function polyline(color, { opacity = 1, max = 512 } = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(max * 3), 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  line.frustumCulled = false;
  line.setPoints = (pts) => {
    const a = geo.attributes.position;
    pts.forEach((p, i) => a.setXYZ(i, p.x, p.y, p.z));
    a.needsUpdate = true;
    geo.setDrawRange(0, pts.length);
    return line;
  };
  line.setAlpha = (al) => { line.material.opacity = opacity * al; line.visible = al > 0.001; };
  return line;
}

// 地面上的圓弧（複數平面上，半徑 r、角度 a0→a1，弧度）
export function arcPoints(r, a0, a1, y = 0.01, steps = 64) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (a1 - a0) * i / steps;
    pts.push(cp(r * Math.cos(a), r * Math.sin(a), y));
  }
  return pts;
}

// 有寬度的發光線（Line2），width 以像素計
export function fatLine(color, { width = 3, opacity = 1, dashed = false } = {}) {
  const mat = new LineMaterial({ color, linewidth: width, transparent: true, opacity, dashed,
    dashSize: 0.15, gapSize: 0.1, worldUnits: false });
  mat.resolution.set(W, H);
  const geo = new LineGeometry();
  geo.setPositions([0, 0, 0, 0, 0, 0]);
  const line = new Line2(geo, mat);
  line.frustumCulled = false;
  line.setPoints = (pts) => {
    if (pts.length < 2) { line.visible = false; return line; }
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => { arr[3 * i] = p.x; arr[3 * i + 1] = p.y; arr[3 * i + 2] = p.z; });
    line.geometry.dispose();
    line.geometry = new LineGeometry();
    line.geometry.setPositions(arr);
    if (dashed) line.computeLineDistances();
    line.visible = mat.opacity > 0.001;
    return line;
  };
  line.setAlpha = (a) => { mat.opacity = opacity * a; line.visible = a > 0.001; };
  return line;
}

// 取樣函數成點列：f(u) → Vector3，u 從 a 到 b
export function sample(f, a, b, n = 160) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(f(a + (b - a) * i / n));
  return pts;
}

// 複數平面的實軸與虛軸；回傳 labels(st, h) 讓 HUD 標出「實軸」「虛軸」
export function complexAxes(st, { re = [-3, 3], im = [-3, 3], color = C.blue, opacity = 0.75, ticks = true } = {}) {
  const g = new THREE.Group();
  g.add(polyline(color, { opacity }).setPoints([cp(re[0], 0), cp(re[1], 0)]));
  g.add(polyline(color, { opacity }).setPoints([cp(0, im[0]), cp(0, im[1])]));
  if (ticks) {
    const tk = [];
    for (let k = Math.ceil(re[0]); k <= re[1]; k++) if (k) tk.push(cp(k, -0.08), cp(k, 0.08));
    for (let k = Math.ceil(im[0]); k <= im[1]; k++) if (k) tk.push(cp(-0.08, k), cp(0.08, k));
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tk),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })));
  }
  st.add(g);
  g.labels = (h, { alpha = 1, reText = "實軸", imText = "虛軸" } = {}) => {
    const a = st.project(cp(re[1], 0)), b = st.project(cp(0, im[1]));
    h.text(reText, a[0] + 8, a[1] + 5, { size: 14, color: css(color), alpha });
    h.text(imText, b[0] + 8, b[1] - 4, { size: 14, color: css(color), alpha });
  };
  return g;
}

export const unitCircle = (r = 1, color = C.blue, opacity = 0.45, y = 0.005) =>
  polyline(color, { opacity }).setPoints(arcPoints(r, 0, Math.PI * 2, y, 128));

// 單顆發光球
export function ball(color, r = 0.09) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }));
  m.setAlpha = (a) => { m.material.opacity = a; m.visible = a > 0.001; };
  return m;
}

// 小發光球粒子（InstancedMesh），用 PARTICLE 的顏色
export function particles(count, { radius = 0.07 } = {}) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff }), count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  mesh.place = (i, pos, color, scale = 1) => {
    m.makeScale(scale, scale, scale).setPosition(pos);
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, col.setHex(color));
  };
  mesh.commit = () => {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  return mesh;
}

// ---- 舞台 ----
export function createStage(sceneDef) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.setClearColor(C.bg, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.bg);
  scene.fog = new THREE.Fog(C.bg, 24, 44);

  // 地面淡藍格線
  const grid = new THREE.GridHelper(80, 80, C.grid, C.grid);
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  grid.position.y = -0.01;
  scene.add(grid);

  const cam = Object.assign({ target: [0, 0, 0], dist: 12, elev: 48, azim: 0, sway: 7, swayElev: 2 },
    sceneDef.camera || {});
  const camera = new THREE.PerspectiveCamera(cam.fov || 40, W / H, 0.1, 200);
  // 讓 3D 的視覺中心落在左 2/3 的正中間
  const extra = W - VIEW_W;
  camera.setViewOffset(W + extra, H, extra, 0, W, H);
  const target = new THREE.Vector3(...cam.target);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.9, 0.45, 0.55));
  composer.addPass(new OutputPass());

  const hudCanvas = document.createElement("canvas");
  hudCanvas.width = W; hudCanvas.height = H;
  const out = document.createElement("canvas");
  out.width = W; out.height = H;
  const outCtx = out.getContext("2d");

  const stage = {
    THREE, scene, camera, renderer, target,
    add: (...objs) => { objs.forEach((o) => scene.add(o)); return objs[0]; },
    // 3D → 畫面座標
    project(v) {
      const p = v.clone().project(camera);
      return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H];
    },
  };
  const hud = makeHud(hudCanvas.getContext("2d"));
  stage.hud = hud;

  function placeCamera(phase) {
    // 場景可以用 cameraPath(t) 改變基準角度（例如從正面轉到側面），擺動照常疊上去
    const p = sceneDef.cameraPath ? sceneDef.cameraPath(phase * SECONDS) : {};
    const base = Object.assign({}, cam, p);
    const az = THREE.MathUtils.degToRad(base.azim + cam.sway * Math.sin(2 * Math.PI * phase));
    const el = THREE.MathUtils.degToRad(base.elev + cam.swayElev * Math.sin(4 * Math.PI * phase));
    camera.position.set(
      target.x + base.dist * Math.cos(el) * Math.sin(az),
      target.y + base.dist * Math.sin(el),
      target.z + base.dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  const state = sceneDef.setup(stage) || {};

  stage.drawHud = (i) => {
    const t = (i % N) / FPS, phase = (i % N) / N;
    hud.clear();
    sceneDef.hud(stage, hud, t, phase, state);
  };

  // 只跑邏輯與 HUD、不做 3D 渲染（載字型前的預跑用）
  stage.warm = (i) => {
    const t = (i % N) / FPS, phase = (i % N) / N;
    placeCamera(phase);
    sceneDef.update(stage, t, phase, state);
    stage.drawHud(i);
  };

  stage.frame = (i) => {
    const t = (i % N) / FPS, phase = (i % N) / N;
    placeCamera(phase);
    sceneDef.update(stage, t, phase, state);
    composer.render();
    stage.drawHud(i);
    outCtx.drawImage(renderer.domElement, 0, 0);
    outCtx.drawImage(hudCanvas, 0, 0);
    return out;
  };
  stage.canvas = out;
  return stage;
}

// ---- HUD（2D canvas 疊在上面）----
function makeHud(ctx) {
  const used = new Set();   // 記錄用過的字，渲染前先把字型子集載好
  const h = {
    ctx, used,
    clear() { ctx.clearRect(0, 0, W, H); },

    text(str, x, y, { size = 18, color = TEXT, mono = false, weight = 700, align = "left",
      base = "alphabetic", alpha = 1, glow = 0 } = {}) {
      str = String(str);
      for (const ch of str) used.add((mono ? "m" : "z") + ch);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${mono ? 500 : weight} ${size}px ${mono ? FONT_MONO : FONT_ZH}`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = base;
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
      ctx.fillText(str, x, y);
      const w = ctx.measureText(str).width;
      ctx.restore();
      return w;
    },
    measure(str, { size = 18, mono = false, weight = 700 } = {}) {
      ctx.save();
      ctx.font = `${mono ? 500 : weight} ${size}px ${mono ? FONT_MONO : FONT_ZH}`;
      const w = ctx.measureText(String(str)).width;
      ctx.restore();
      return w;
    },

    roundRect(x, y, w, hh, r) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, hh, r);
    },

    // 左上：標題與副標（上方一行小字標出課程出處）
    title(main, sub, tag) {
      if (tag) h.text(tag, 40, 44, { size: 14, color: css(C.cyan, 0.85), weight: 700 });
      h.text(main, 40, 84, { size: 34, glow: 8 });
      if (sub) h.text(sub, 40, 118, { size: 17, color: "rgba(232,246,255,0.72)", weight: 500 });
    },

    // 細線框面板
    panel(x, y, w, hh, label, { color = C.cyan, alpha = 1 } = {}) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(10,16,30,0.62)";
      h.roundRect(x, y, w, hh, 10); ctx.fill();
      ctx.strokeStyle = css(color, 0.38); ctx.lineWidth = 1;
      h.roundRect(x + 0.5, y + 0.5, w - 1, hh - 1, 10); ctx.stroke();
      // 四角短亮線
      ctx.strokeStyle = css(color, 0.9); ctx.lineWidth = 1.5;
      const k = 14;
      [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + hh, 1, -1], [x + w, y + hh, -1, -1]].forEach(([cx, cy, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(cx + sx * k, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * k); ctx.stroke();
      });
      ctx.restore();
      if (label) h.text(label, x + 18, y + 30, { size: 15, color: css(color, 0.95), alpha });
    },

    // 圓角 chip
    chip(x, y, str, color = C.cyan, { mono = true, size = 15, alpha = 1, fill = 0.14, align = "left" } = {}) {
      const tw = h.measure(str, { size, mono });
      const pw = tw + 22, ph = size + 14;
      const x0 = align === "right" ? x - pw : align === "center" ? x - pw / 2 : x;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = css(color, fill);
      h.roundRect(x0, y, pw, ph, ph / 2); ctx.fill();
      ctx.strokeStyle = css(color, 0.85); ctx.lineWidth = 1.2;
      h.roundRect(x0 + 0.5, y + 0.5, pw - 1, ph - 1, ph / 2); ctx.stroke();
      ctx.restore();
      h.text(str, x0 + 11, y + ph / 2 + 1, { size, mono, color: css(color), base: "middle", alpha });
      return pw;
    },

    // 發光曲線（pts 是畫面座標）
    curve(pts, color, { width = 2.2, alpha = 1, glow = 10, dash = null } = {}) {
      if (pts.length < 2) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = css(color); ctx.lineWidth = width;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (dash) ctx.setLineDash(dash);
      ctx.shadowColor = css(color); ctx.shadowBlur = glow;
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.stroke();
      ctx.restore();
    },

    dot(x, y, color, { r = 4, alpha = 1, glow = 10 } = {}) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = css(color); ctx.shadowColor = css(color); ctx.shadowBlur = glow;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    },

    // callout 指示線：從錨點拉一條折線到文字
    callout(anchor, at, str, color = C.cyan, { alpha = 1, size = 16, mono = false } = {}) {
      if (alpha <= 0.001) return;
      const [ax, ay] = anchor, [lx, ly] = at;
      const right = lx >= ax;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = css(color, 0.9); ctx.lineWidth = 1.2;
      ctx.shadowColor = css(color); ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx, ly); ctx.lineTo(lx + (right ? 24 : -24), ly); ctx.stroke();
      ctx.restore();
      h.dot(ax, ay, color, { r: 3.5, alpha });
      const tx = lx + (right ? 30 : -30);
      h.text(str, tx, ly, { size, color: TEXT, mono, base: "middle", align: right ? "left" : "right", alpha });
    },

    // 左下：公式框（每行一個字串，等寬字）
    formula(lines, { color = C.cyan, alpha = 1, highlight = -1 } = {}) {
      const size = 19, lh = 30;
      const w = Math.max(...lines.map((l) => h.measure(l, { size, mono: true }))) + 44;
      const hh = lines.length * lh + 26;
      const x = 40, y = H - 40 - hh;
      h.panel(x, y, w, hh, null, { color, alpha });
      lines.forEach((l, i) => h.text(l, x + 22, y + 34 + i * lh, {
        size, mono: true, alpha, color: i === highlight ? css(C.yellow) : TEXT, glow: i === highlight ? 8 : 0,
      }));
    },

    // 圖表座標框：回傳 map(x, y) → 畫面座標；xr、yr 是資料範圍
    plot(x, y, w, hh, { xr = [0, 1], yr = [-1, 1], xLabel = "", yLabel = "", zero = true, alpha = 1 } = {}) {
      const map = (px, py) => [x + (px - xr[0]) / (xr[1] - xr[0]) * w, y + hh - (py - yr[0]) / (yr[1] - yr[0]) * hh];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(232,246,255,0.22)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + hh); ctx.lineTo(x + w, y + hh); ctx.stroke();
      if (zero && yr[0] < 0 && yr[1] > 0) {
        const z = map(xr[0], 0)[1];
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(x, z); ctx.lineTo(x + w, z); ctx.stroke();
      }
      ctx.restore();
      if (xLabel) h.text(xLabel, x + w, y + hh + 18, { size: 12, mono: true, align: "right", color: "rgba(232,246,255,0.6)", alpha });
      if (yLabel) h.text(yLabel, x + 4, y - 8, { size: 12, mono: true, color: "rgba(232,246,255,0.6)", alpha });
      map.sample = (f, a, b, n = 120) => {
        const pts = [];
        for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n; pts.push(map(u, f(u))); }
        return pts;
      };
      return map;
    },

    // 3D 點的標籤（不畫指示線）
    label(st, v, str, color = TEXT, { dx = 10, dy = -10, size = 15, mono = true, alpha = 1, align = "left" } = {}) {
      const [px, py] = st.project(v);
      h.text(str, px + dx, py + dy, { size, mono, color: typeof color === "number" ? css(color) : color, alpha, align });
    },

    // 水平長條（KPI 用）
    bar(x, y, w, frac, color, { hh = 8, alpha = 1 } = {}) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(232,246,255,0.08)";
      h.roundRect(x, y, w, hh, hh / 2); ctx.fill();
      ctx.fillStyle = css(color); ctx.shadowColor = css(color); ctx.shadowBlur = 10;
      h.roundRect(x, y, Math.max(hh, w * clamp(frac)), hh, hh / 2); ctx.fill();
      ctx.restore();
    },
  };
  return h;
}
