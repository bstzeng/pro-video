// 第 20 課：電阻同相、電感電壓超前 90°、電容電壓落後 90°（各 4 秒）；導線上電子（黃）隨電流來回
import { THREE, C, css, cp, seg, window4, arrow, fatLine, complexAxes, glowMesh, particles, PARTICLE, sample, tag } from "../../engine.js";

const OM = 2 * Math.PI / 4;              // 4 秒一週期，每段剛好一圈
const PARTS = [
  ["電阻 R", 0, "同相", C.cyan],
  ["電感 L", Math.PI / 2, "電壓超前 90°", C.green],
  ["電容 C", -Math.PI / 2, "電壓落後 90°", C.magenta],
];
const WIRE_Z = -3.4, NE = 26;            // 導線在平面後方

function coil() {
  const pts = sample((u) => new THREE.Vector3(-0.6 + 1.2 * u, 0.32 * Math.sin(u * 12 * Math.PI), 0.32 * Math.cos(u * 12 * Math.PI)), 0, 1, 240);
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.04, 6, false);
}

export default {
  id: "l20-lead-lag",
  poster: 20,
  camera: { target: [0, 0.2, -0.6], dist: 11.2, elev: 40, azim: -10, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-2.4, 2.4], im: [-2.2, 2.2], ticks: false });
    const v = st.add(arrow(C.orange, { radius: 0.045, head: 0.26 }));
    const i = st.add(arrow(C.cyan, { radius: 0.035, head: 0.22 }));
    st.add(fatLine(C.blue, { width: 2, opacity: 0.5 }).setPoints([new THREE.Vector3(-4, 0.6, WIRE_Z), new THREE.Vector3(4, 0.6, WIRE_Z)]));
    const comps = [
      glowMesh(new THREE.BoxGeometry(1.2, 0.5, 0.5), C.cyan),
      glowMesh(coil(), C.green, { opacity: 0.5 }),
      (() => { const g = new THREE.Group(); [-0.12, 0.12].forEach((x) => { const p = glowMesh(new THREE.BoxGeometry(0.06, 0.9, 0.7), C.magenta); p.position.x = x; g.add(p); });
        g.setAlpha = (a) => g.children.forEach((c) => c.setAlpha(a)); return g; })(),
    ];
    comps.forEach((c) => { c.position.add(new THREE.Vector3(0, 0.6, WIRE_Z)); st.add(c); });
    const el = st.add(particles(NE, { radius: 0.07 }));
    return { axes, v, i, comps, el };
  },

  update(st, t, phase, s) {
    const k = Math.min(2, Math.floor(t / 4)), u = t - 4 * k;
    const ph = PARTS[k][1], a = OM * t;
    const fade = window4(u, 0, 0.35, 3.65, 4);
    s.i.set(cp(0, 0, 0.1), cp(1.4 * Math.cos(a), 1.4 * Math.sin(a), 0.1));
    s.v.set(cp(0, 0, 0.14), cp(1.9 * Math.cos(a + ph), 1.9 * Math.sin(a + ph), 0.14)).setAlpha(fade);
    s.comps.forEach((c, j) => c.setAlpha(j === k ? fade : 0));
    // 電子位置：跟著電流 i(t) = cos(ωt) 來回移動（位移是電流的積分）
    const disp = 0.5 * Math.sin(a);
    for (let n = 0; n < NE; n++) {
      const x0 = -4 + 8 * n / NE;
      let x = x0 + disp;
      if (x > 4) x -= 8; if (x < -4) x += 8;
      s.el.place(n, new THREE.Vector3(x, 0.6, WIRE_Z + 0.02), PARTICLE.electron, Math.abs(x) < 0.75 ? 0.0001 : 1);
    }
    s.el.commit();
    Object.assign(s, { k, u, a, fade });
  },

  hud(st, h, t, phase, s) {
    const [name, ph, desc, col] = PARTS[s.k];
    h.title("電感超前、電容落後", "電阻讓電壓和電流同步；電感、電容各差 90°——正好是乘上 i 或 −i", tag(20));
    s.axes.labels(h);
    h.label(st, cp(1.4 * Math.cos(s.a), 1.4 * Math.sin(s.a), 0.1), "I", C.cyan, { dx: 8, dy: 16, size: 18 });
    h.label(st, cp(1.9 * Math.cos(s.a + ph), 1.9 * Math.sin(s.a + ph), 0.14), "V", C.orange, { dx: 8, dy: -8, size: 18, alpha: s.fade });
    const cpj = st.project(new THREE.Vector3(0, 1.3, WIRE_Z));
    h.text(name, cpj[0], cpj[1], { size: 16, align: "center", color: css(col), alpha: s.fade });
    h.label(st, new THREE.Vector3(-3.8, 0.9, WIRE_Z), "電子", C.yellow, { mono: false, size: 13 });

    const x = 884, y = 140, w = 356, hh = 440;
    h.panel(x, y, w, hh, "電壓 V 與電流 I 的波形");
    PARTS.forEach(([n, , , c], j) => h.chip(x + 22 + j * 108, y + 50, n, c, { mono: false, size: 14, alpha: j === s.k ? 1 : 0.35 }));
    const map = h.plot(x + 22, y + 110, w - 44, 180, { xr: [0, 4], yr: [-2.2, 2.2] });
    h.curve(map.sample((x2) => 1.4 * Math.cos(OM * x2), 0, 4), C.cyan, { width: 2.2 });
    h.curve(map.sample((x2) => 1.9 * Math.cos(OM * x2 + ph), 0, 4), C.orange, { width: 2.2, alpha: s.fade });
    const [cx] = map(s.u, 0);
    h.curve([[cx, y + 110], [cx, y + 290]], 0xe8f6ff, { width: 1, glow: 0, alpha: 0.5 });
    h.text(desc, x + w / 2, y + 340, { size: 22, align: "center", color: css(col), glow: 8, alpha: s.fade });
    h.text(s.k === 0 ? "V = R·I" : s.k === 1 ? "V = iωL · I（乘 i：轉 +90°）" : "V = I / (iωC)（除以 i：轉 −90°）",
      x + w / 2, y + 384, { size: 15, mono: true, align: "center", alpha: s.fade });

    h.formula(["Z_R = R    Z_L = iωL    Z_C = 1/(iωC)"]);
  },
};
