// 第 13 課：模與輻角：直角座標與極座標同步；算輻角要看象限
import { THREE, C, css, cp, arrow, fatLine, arcPoints, complexAxes, ball, tag } from "../../engine.js";

const pathAt = (t) => {
  const th = 0.5 + 2 * Math.PI * t / 12;                 // 12 秒繞一圈，經過四個象限
  const r = 2 + 0.45 * Math.sin(4 * Math.PI * t / 12);
  return [r, th];
};

export default {
  id: "l13-polar",
  poster: 50,
  camera: { target: [0, 0, 0.2], dist: 11.4, elev: 52, azim: -8, sway: 6 },

  setup(st) {
    const axes = complexAxes(st, { re: [-3, 3], im: [-2.8, 2.8] });
    const arm = st.add(arrow(C.yellow, { radius: 0.04, head: 0.26 }));
    const px = st.add(fatLine(C.cyan, { width: 2, dashed: true }));
    const py = st.add(fatLine(C.cyan, { width: 2, dashed: true }));
    const arc = st.add(fatLine(C.orange, { width: 3 }));
    const dot = st.add(ball(C.yellow, 0.12));
    return { axes, arm, px, py, arc, dot };
  },

  update(st, t, phase, s) {
    const [r, th] = pathAt(t);
    const x = r * Math.cos(th), y = r * Math.sin(th);
    s.arm.set(cp(0, 0, 0.12), cp(x, y, 0.12));
    s.dot.position.copy(cp(x, y, 0.12));
    s.px.setPoints([cp(x, y, 0.03), cp(x, 0, 0.03)]);
    s.py.setPoints([cp(x, y, 0.03), cp(0, y, 0.03)]);
    const a = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    s.arc.setPoints(arcPoints(0.6, 0, a, 0.06));
    Object.assign(s, { r, th: a, x, y });
  },

  hud(st, h, t, phase, s) {
    h.title("模與輻角", "同一個點的兩種寫法：(x, y) 告訴你往右、往上多少；(r, θ) 告訴你多遠、朝哪個方向", tag(13));
    s.axes.labels(h);
    const { r, th, x, y } = s;
    h.label(st, cp(x, 0), "x", C.cyan, { dx: -4, dy: 22, size: 16 });
    h.label(st, cp(0, y), "y", C.cyan, { dx: -22, dy: 4, size: 16 });
    h.label(st, cp(x / 2, y / 2, 0.12), "r", C.yellow, { dx: 8, dy: -8, size: 18 });
    h.label(st, cp(0.75 * Math.cos(th / 2), 0.75 * Math.sin(th / 2)), "θ", C.orange, { dx: 4, dy: 4, size: 18 });

    const deg = th * 180 / Math.PI;
    const quad = x >= 0 ? (y >= 0 ? 1 : 4) : (y >= 0 ? 2 : 3);
    const naive = Math.atan(y / x) * 180 / Math.PI;
    const wrong = x < 0;
    const X = 884, Y = 130, w = 356, hh = 460;
    h.panel(X, Y, w, hh, "同一個點，兩種座標");
    h.chip(X + 22, Y + 50, "直角座標", C.cyan, { mono: false, size: 14 });
    h.text(`x = ${x.toFixed(2)}`, X + 22, Y + 112, { size: 19, mono: true });
    h.text(`y = ${y.toFixed(2)}`, X + 190, Y + 112, { size: 19, mono: true });
    h.chip(X + 22, Y + 140, "極座標", C.yellow, { mono: false, size: 14 });
    h.text(`r = ${r.toFixed(2)}`, X + 22, Y + 202, { size: 19, mono: true });
    h.text(`θ = ${deg.toFixed(0)}°`, X + 190, Y + 202, { size: 19, mono: true, color: css(C.orange) });
    h.text(`第 ${quad} 象限`, X + 22, Y + 260, { size: 17, color: css(C.yellow) });
    h.text("atan(y/x)", X + 22, Y + 300, { size: 16, mono: true, color: "rgba(232,246,255,0.7)" });
    h.text(`${naive.toFixed(0)}°`, X + w - 22, Y + 300, { size: 17, mono: true, align: "right", color: wrong ? css(C.red) : "#e8f6ff" });
    h.text("atan2(y, x)", X + 22, Y + 334, { size: 16, mono: true, color: "rgba(232,246,255,0.7)" });
    h.text(`${(Math.atan2(y, x) * 180 / Math.PI).toFixed(0)}°`, X + w - 22, Y + 334, { size: 17, mono: true, align: "right", color: css(C.green) });
    h.chip(X + 22, Y + hh - 62, wrong ? "x < 0：atan 差了 180°，要看象限" : "x > 0：兩種算法一致", wrong ? C.red : C.green, { mono: false, size: 14 });

    h.formula(["r = √(x² + y²)    θ = atan2(y, x)", "x = r cos θ       y = r sin θ"]);
  },
};
