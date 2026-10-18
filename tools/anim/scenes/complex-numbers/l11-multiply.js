// 第 11 課：乘法就是旋轉加縮放
// 乘上 z = 1.2∠40°，整個平面（格線＋F 字形）一起轉 40°、放大 1.2 倍。
import { THREE, C, css, cp, seg, window4, glowMesh, arrow, polyline, arcPoints } from "../../engine.js";

const Z_ABS = 1.2, Z_ARG = 40 * Math.PI / 180;
const W_PT = [2.0, 2.0];                         // F 右上角，|w| = 2.83、arg w = 45°
const W_ABS = Math.hypot(...W_PT), W_ARG = Math.atan2(W_PT[1], W_PT[0]);
const deg = (r) => Math.round(r * 180 / Math.PI);

// 地面格線就是原本的平面；橘色格線是乘上 z 之後的平面
// F 字形（複數座標），不對稱才看得出有沒有轉
const F = [[0.5, 0.3], [0.95, 0.3], [0.95, 1.15], [1.65, 1.15], [1.65, 1.55], [0.95, 1.55],
  [0.95, 2.0], [2.0, 2.0], [2.0, 2.45], [0.5, 2.45]];

function fGeometry() {
  const s = new THREE.Shape(F.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);                       // (x, y) → 地面 (x, 0, −y)
  return g;
}

function gridPatch(color, opacity) {
  const pts = [];
  for (let k = -2; k <= 3; k++) {
    pts.push(cp(k, -2), cp(k, 3), cp(-2, k), cp(3, k));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const l = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  l.position.y = 0.005;
  return l;
}

// 乘上 m = s·e^{iα} 的物件變換：繞 y 軸轉 α、在地面方向放大 s
function applyMul(obj, s, a) {
  obj.rotation.set(0, a, 0);
  obj.scale.set(s, 1, s);
}

export default {
  id: "l11-multiply",
  poster: 120,
  camera: { target: [0.7, 0, -1.5], dist: 9.6, elev: 58, azim: -8, sway: 6 },

  setup(st) {
    const axes = polyline(C.blue, { opacity: 0.7 }).setPoints([cp(-2.6, 0), cp(3.6, 0)]);
    const axesI = polyline(C.blue, { opacity: 0.7 }).setPoints([cp(0, -1.2), cp(0, 3.9)]);
    const ghostF = glowMesh(fGeometry(), C.cyan, { opacity: 0.14, edgeOpacity: 0.75 });

    const copy = new THREE.Group();
    const copyGrid = gridPatch(C.orange, 0.32);
    const copyF = glowMesh(fGeometry(), C.orange, { opacity: 0.2 });
    copy.add(copyGrid, copyF);

    const zArrow = arrow(C.yellow, { radius: 0.035, head: 0.22 }).set(cp(0, 0, 0.06),
      cp(Z_ABS * Math.cos(Z_ARG), Z_ABS * Math.sin(Z_ARG), 0.06));
    const zArc = polyline(C.yellow, { opacity: 0.9 }).setPoints(arcPoints(0.55, 0, Z_ARG, 0.06));
    const wArrow = arrow(C.cyan, { radius: 0.024, head: 0.2 }).set(cp(0, 0, 0.16), cp(...W_PT, 0.16));
    const zwArrow = arrow(C.orange, { radius: 0.028, head: 0.22 });
    const angArc = polyline(C.orange, { opacity: 1 });

    st.add(axes, axesI, ghostF, copy, zArrow, zArc, wArrow, zwArrow, angArc);
    return { copy, copyGrid, copyF, zwArrow, angArc };
  },

  update(st, t, phase, s) {
    const p = seg(t, 1.6, 5.6);                       // 0 → 1：從 ×1 走到 ×z
    const a = window4(t, 0.0, 0.8, 10.6, 11.6);       // 結尾淡出、開頭淡入，無縫循環
    const sc = Math.pow(Z_ABS, p), ang = Z_ARG * p;
    applyMul(s.copy, sc, ang);
    s.copyGrid.material.opacity = 0.32 * a;
    s.copyF.setAlpha(a);
    const r = W_ABS * sc, th = W_ARG + ang;
    s.zwArrow.set(cp(0, 0, 0.2), cp(r * Math.cos(th), r * Math.sin(th), 0.2)).setAlpha(a);
    s.angArc.setPoints(arcPoints(1.35, W_ARG, th, 0.2)).setAlpha(a * (p > 0.01 ? 1 : 0));
    Object.assign(s, { p, a, sc, ang, r, th });
  },

  hud(st, h, t, phase, s) {
    const { p = 0, a = 0, r = W_ABS, th = W_ARG } = s;
    h.title("乘法就是旋轉加縮放", "乘上一個複數 z：整個平面一起轉 arg z、一起放大 |z| 倍",
      "複數到底在做什麼 ｜ 第 11 課");

    // 3D 上的標記
    const P = (re, im, y = 0.2) => st.project(cp(re, im, y));
    const zTip = P(Z_ABS * Math.cos(Z_ARG), Z_ABS * Math.sin(Z_ARG), 0.06);
    h.callout(zTip, [zTip[0] - 70, zTip[1] + 58], "z = 1.2∠40°", C.yellow, { mono: true, size: 15 });
    const wTip = P(...W_PT, 0.16);
    h.callout(wTip, [wTip[0] + 60, wTip[1] + 46], "w", C.cyan, { mono: true });
    const zwTip = P(r * Math.cos(th), r * Math.sin(th));
    h.callout(zwTip, [zwTip[0] - 80, zwTip[1] - 40], "z·w", C.orange, { mono: true, alpha: a * seg(t, 1.2, 1.8) });
    const mid = P(1.35 * Math.cos(W_ARG + (th - W_ARG) / 2), 1.35 * Math.sin(W_ARG + (th - W_ARG) / 2));
    h.callout(mid, [mid[0] - 120, mid[1] - 10], "轉了 " + Math.round((th - W_ARG) * 180 / Math.PI) + "°",
      C.orange, { alpha: a * seg(t, 2.2, 2.8) });

    const re = P(3.6, 0, 0), im = P(0, 3.9, 0);
    h.text("實軸", re[0] + 8, re[1] + 6, { size: 14, color: css(C.blue) });
    h.text("虛軸", im[0] + 8, im[1] - 4, { size: 14, color: css(C.blue) });

    // 右側 HUD 面板
    const x = 884, y = 150, w = 356, hh = 432;
    h.panel(x, y, w, hh, "乘上 z = 1.2∠40°", { color: C.yellow });

    // 長度
    h.text("長度", x + 22, y + 74, { size: 16, color: "rgba(232,246,255,0.7)" });
    h.chip(x + w - 22, y + 56, "×1.2", C.yellow, { align: "right", size: 14 });
    h.text("|w|", x + 22, y + 108, { size: 15, mono: true, color: css(C.cyan) });
    h.bar(x + 74, y + 99, 196, W_ABS / 3.6, C.cyan);
    h.text(W_ABS.toFixed(2), x + w - 22, y + 108, { size: 15, mono: true, align: "right" });
    h.text("|zw|", x + 22, y + 138, { size: 15, mono: true, color: css(C.orange), alpha: Math.max(a, 0.25) });
    h.bar(x + 74, y + 129, 196, r / 3.6, C.orange, { alpha: Math.max(a, 0.25) });
    h.text(r.toFixed(2), x + w - 22, y + 138, { size: 15, mono: true, align: "right", alpha: Math.max(a, 0.25) });

    // 角度：小量角器
    h.text("角度", x + 22, y + 192, { size: 16, color: "rgba(232,246,255,0.7)" });
    h.chip(x + w - 22, y + 174, "+40°", C.yellow, { align: "right", size: 14 });
    const ox = x + 70, oy = y + 330, R = 110;
    const ctx = h.ctx;
    ctx.save();
    ctx.strokeStyle = "rgba(232,246,255,0.18)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ox, oy, R, -Math.PI / 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + R + 12, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - R - 12); ctx.stroke();
    ctx.restore();
    const ray = (ang, col, al) => h.curve([[ox, oy], [ox + R * Math.cos(ang), oy - R * Math.sin(ang)]], col, { alpha: al, width: 2.4 });
    ray(W_ARG, C.cyan, 1);
    ray(th, C.orange, Math.max(a, 0.25));
    const arcPts = [];
    for (let k = 0; k <= 24; k++) {
      const an = W_ARG + (th - W_ARG) * k / 24;
      arcPts.push([ox + 64 * Math.cos(an), oy - 64 * Math.sin(an)]);
    }
    h.curve(arcPts, C.orange, { alpha: a * (p > 0.01 ? 1 : 0), width: 2 });
    h.text("45°", ox + R * 0.72 + 14, oy - R * 0.72 + 18, { size: 14, mono: true, color: css(C.cyan) });
    h.text(deg(th) + "°", ox + R * Math.cos(th) + 10, oy - R * Math.sin(th) - 6,
      { size: 14, mono: true, color: css(C.orange), alpha: Math.max(a, 0.25) });
    h.text(deg(W_ARG) + "° → " + deg(th) + "°", x + w - 22, y + 300, { size: 16, mono: true, align: "right" });

    // 重點句
    h.text("長度相乘、角度相加", x + w / 2, y + hh - 28,
      { size: 20, align: "center", color: css(C.yellow), glow: 10, alpha: a * seg(t, 5.6, 6.4) });

    h.formula([
      "z·w = |z|·|w| · e^{i(θz+θw)}",
      "|zw| = 1.2 × 2.83 = 3.39",
      "θzw  = 40° + 45° = 85°",
    ]);
  },
};
