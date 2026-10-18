// 第 10 課：共軛是對實軸的鏡射；z·z̄ 的角度相消，永遠落在實軸上
import { THREE, C, css, cp, seg, arrow, fatLine, arcPoints, complexAxes, glowMesh, ball, tag } from "../../engine.js";

const R = 1.6;
const angOf = (t) => 0.35 + 0.75 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 12)) + 0.6 * Math.sin(2 * Math.PI * t / 6) * 0.3;

export default {
  id: "l10-conjugate",
  poster: 60,
  camera: { target: [0.9, 0, 0.1], dist: 9.2, elev: 34, azim: -24, sway: 7 },

  setup(st) {
    const axes = complexAxes(st, { re: [-1, 3.4], im: [-2.4, 2.4] });
    const mirror = glowMesh(new THREE.PlaneGeometry(4.4, 1.6), C.blue, { opacity: 0.07, edgeOpacity: 0.4 });
    mirror.position.set(1.2, 0.8, 0);
    st.add(mirror);
    const z = st.add(arrow(C.cyan, { radius: 0.035, head: 0.24 }));
    const zb = st.add(arrow(C.magenta, { radius: 0.035, head: 0.24 }));
    const link = st.add(fatLine(C.blue, { width: 1.5, opacity: 0.7, dashed: true }));
    const arcA = st.add(fatLine(C.cyan, { width: 2 }));
    const arcB = st.add(fatLine(C.magenta, { width: 2 }));
    const prod = st.add(ball(C.yellow, 0.14));
    prod.position.copy(cp(R * R, 0, 0.14));
    return { axes, z, zb, link, arcA, arcB, prod };
  },

  update(st, t, phase, s) {
    const th = angOf(t);
    const p = [R * Math.cos(th), R * Math.sin(th)];
    s.z.set(cp(0, 0, 0.1), cp(...p, 0.1));
    s.zb.set(cp(0, 0, 0.1), cp(p[0], -p[1], 0.1));
    s.link.setPoints([cp(...p, 0.1), cp(p[0], -p[1], 0.1)]);
    s.arcA.setPoints(arcPoints(0.7, 0, th, 0.1));
    s.arcB.setPoints(arcPoints(0.7, 0, -th, 0.1));
    s.prod.scale.setScalar(1 + 0.12 * Math.sin(t * 4));
    Object.assign(s, { th, p });
  },

  hud(st, h, t, phase, s) {
    h.title("共軛是鏡射", "z̄ 是 z 對實軸的鏡像；z 乘上 z̄ 時角度 θ 與 −θ 相消，結果一定落在實軸上", tag(10));
    s.axes.labels(h);
    const { p, th } = s;
    h.label(st, cp(...p, 0.1), "z", C.cyan, { dx: 10, dy: -8, size: 18 });
    h.label(st, cp(p[0], -p[1], 0.1), "z̄", C.magenta, { dx: 10, dy: 20, size: 18 });
    const pp = st.project(cp(R * R, 0, 0.14));
    h.callout(pp, [pp[0] + 40, pp[1] - 70], "z·z̄ = |z|² = 2.56", C.yellow, { mono: true });
    const mp = st.project(cp(2.8, 0, 1.4));
    h.callout(mp, [mp[0] + 30, mp[1] - 30], "實軸是鏡子", C.blue, { size: 15 });

    const deg = Math.round(th * 180 / Math.PI);
    const x = 884, y = 150, w = 356, hh = 420;
    h.panel(x, y, w, hh, "角度相消 → 落在實軸");
    h.text("z", x + 22, y + 80, { size: 18, mono: true, color: css(C.cyan) });
    h.text(`${p[0].toFixed(2)} + ${p[1].toFixed(2)}i`, x + 70, y + 80, { size: 17, mono: true });
    h.text("z̄", x + 22, y + 116, { size: 18, mono: true, color: css(C.magenta) });
    h.text(`${p[0].toFixed(2)} − ${p[1].toFixed(2)}i`, x + 70, y + 116, { size: 17, mono: true });
    h.text("角度", x + 22, y + 176, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text(`${deg}° + (−${deg}°) = 0°`, x + 22, y + 208, { size: 19, mono: true });
    h.text("長度", x + 22, y + 256, { size: 15, color: "rgba(232,246,255,0.7)" });
    h.text("1.6 × 1.6 = 2.56", x + 22, y + 288, { size: 19, mono: true });
    h.text("z 怎麼轉，z·z̄ 都不動", x + w / 2, y + hh - 30, { size: 18, align: "center", color: css(C.yellow), glow: 8 });

    h.formula(["z̄ = a − bi", "z·z̄ = a² + b² = |z|²"]);
  },
};
