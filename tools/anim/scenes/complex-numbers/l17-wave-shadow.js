// 第 17 課：波就是旋轉的影子：旋轉箭頭沿時間軸拉出螺旋，影子是 cos 與 sin
import { THREE, C, css, arrow, fatLine, polyline, glowMesh, ball, sample, tag } from "../../engine.js";

const R = 0.9, H0 = 1.6;            // 旋轉半徑、旋轉軸離地高度
const OM = 2 * Math.PI / 6;        // 6 秒一圈
const LEN = 7, X0 = -3.4;        // 螺旋往 +x 延伸的長度與起點
const WALL = -1.9;                 // 背牆的 z
const SPEED = 4 * Math.PI / LEN;          // 沿 x 方向每單位對應的相位：整段兩個週期

// 時間軸往 +x，旋轉平面是 y–z：虛部朝上 (y)，實部朝鏡頭 (z)
const helixPt = (t, u) => {
  const a = OM * t - SPEED * u;
  return [X0 + u, H0 + R * Math.sin(a), R * Math.cos(a)];
};

export default {
  id: "l17-wave-shadow",
  poster: 30,
  camera: { target: [0.2, 1.0, -0.4], dist: 14, elev: 18, azim: -30, sway: 6, swayElev: 1.5 },

  setup(st) {
    st.add(polyline(C.blue, { opacity: 0.6 }).setPoints([new THREE.Vector3(X0, H0, 0), new THREE.Vector3(X0 + LEN + 0.3, H0, 0)]));
    const wall = glowMesh(new THREE.PlaneGeometry(LEN + 1, 2.6), C.magenta, { opacity: 0.05, edgeOpacity: 0.35 });
    wall.position.set(X0 + LEN / 2, H0, WALL);
    st.add(wall);
    const ring = st.add(polyline(C.cyan, { opacity: 0.5 }));
    ring.setPoints(sample((a) => new THREE.Vector3(X0, H0 + R * Math.sin(a), R * Math.cos(a)), 0, 2 * Math.PI, 64));
    const arm = st.add(arrow(C.yellow, { radius: 0.04, head: 0.22 }));
    const helix = st.add(fatLine(C.yellow, { width: 3 }));
    const sinW = st.add(fatLine(C.magenta, { width: 3 }));
    const cosW = st.add(fatLine(C.cyan, { width: 3 }));
    const tip = st.add(ball(C.yellow, 0.1));
    const d1 = st.add(fatLine(C.magenta, { width: 1.2, opacity: 0.6, dashed: true }));
    const d2 = st.add(fatLine(C.cyan, { width: 1.2, opacity: 0.6, dashed: true }));
    return { arm, helix, sinW, cosW, tip, d1, d2 };
  },

  update(st, t, phase, s) {
    const V = (p) => new THREE.Vector3(...p);
    const pts = sample((u) => V(helixPt(t, u)), 0, LEN, 200);
    s.helix.setPoints(pts);
    s.sinW.setPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, WALL)));
    s.cosW.setPoints(pts.map((p) => new THREE.Vector3(p.x, 0.02, p.z)));
    const p0 = pts[0];
    s.arm.set(new THREE.Vector3(X0, H0, 0), p0);
    s.tip.position.copy(p0);
    s.d1.setPoints([p0, new THREE.Vector3(p0.x, p0.y, WALL)]);
    s.d2.setPoints([p0, new THREE.Vector3(p0.x, 0.02, p0.z)]);
    s.ang = (OM * t) % (2 * Math.PI);
  },

  hud(st, h, t, phase, s) {
    h.title("波，就是旋轉的影子", "一根等速旋轉的箭頭沿時間軸拉開成螺旋：照在牆上是 sin 波，照在地上是 cos 波", tag(17));
    h.label(st, new THREE.Vector3(X0 - 0.4, H0 + 1.3, WALL), "牆上的影子：sin（虛部）", C.magenta, { mono: false, size: 15, dx: 0, dy: -8 });
    h.label(st, new THREE.Vector3(X0 + LEN, 0, 1.2), "地上的影子：cos（實部）", C.cyan, { mono: false, size: 15, align: "right", dx: 0, dy: 28 });
    h.label(st, new THREE.Vector3(X0 + LEN + 0.3, H0, 0), "時間 →", 0xe8f6ff, { mono: false, size: 14, dx: 6 });

    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "旋轉的參數 ↔ 波的參數");
    const rows = [["半徑", "振幅", "A"], ["角速度", "頻率", "ω"], ["起始角度", "相位", "φ"]];
    rows.forEach(([a, b, k], i) => {
      const yy = y + 70 + i * 74;
      h.chip(x + 22, yy, a, C.yellow, { mono: false, size: 15 });
      h.text("↔", x + 150, yy + 22, { size: 18 });
      h.chip(x + 186, yy, b, C.cyan, { mono: false, size: 15 });
      h.text(k, x + w - 26, yy + 22, { size: 20, mono: true, align: "right", color: css(C.yellow) });
    });
    h.text(`目前角度 ${Math.round(s.ang * 180 / Math.PI)}°`, x + 22, y + hh - 70, { size: 16, mono: true });
    h.text("波與旋轉是同一件事", x + w / 2, y + hh - 30, { size: 18, align: "center", color: css(C.yellow), glow: 8 });

    h.formula(["A cos(ωt + φ) = Re[ A e^{i(ωt+φ)} ]", "A sin(ωt + φ) = Im[ A e^{i(ωt+φ)} ]"]);
  },
};
