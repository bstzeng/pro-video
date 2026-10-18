// 首頁：依分類列出主題（沿用博雅書院的折疊式分類），點主題進入主題頁。
// 首頁不載入任何動圖。
(function () {
  "use strict";

  var G = PV.G, el = PV.el, $ = PV.$;
  var groupsBox = $("groups");
  var state = { q: "", only: false };

  function topicCard(t) {
    var a = el("a", "topic-card" + (t.clips ? "" : " is-empty"));
    a.href = PV.topicHref(t.id);
    a.appendChild(el("div", "topic-icon", t.icon || "📘"));
    a.appendChild(el("h3", null, t.title));
    a.appendChild(el("p", null, t.description));
    a.appendChild(el("span", "clip-count" + (t.clips ? " has-clips" : ""),
      t.clips ? "🎞 " + t.clips + " 張動圖" : "尚無動圖"));
    return a;
  }

  function matches(t) {
    if (state.only && !t.clips) return false;
    if (!state.q) return true;
    var hay = (t.title + " " + t.description).toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }

  function render() {
    var openIds = {};
    groupsBox.querySelectorAll(".category-group[open]").forEach(function (d) { openIds[d.dataset.cat] = true; });
    groupsBox.textContent = "";
    var filtering = !!state.q;
    var shown = 0;

    G.categories.forEach(function (c) {
      var list = G.topics.filter(function (t) { return t.category === c.id && matches(t); });
      if (!list.length) return;
      shown += list.length;
      var clipsInCat = list.reduce(function (n, t) { return n + t.clips; }, 0);

      var d = el("details", "category-group");
      d.id = "cat-" + c.id;
      d.dataset.cat = c.id;
      d.open = filtering || !!openIds[c.id] || location.hash === "#cat-" + c.id;
      var s = el("summary", "category-summary");
      s.appendChild(el("span", "category-chevron"));
      s.appendChild(el("span", "category-icon", c.icon || "📁"));
      s.appendChild(el("span", "category-label", c.label));
      if (clipsInCat) s.appendChild(el("span", "category-clips", "🎞 " + clipsInCat));
      s.appendChild(el("span", "category-count", list.length + " 個主題"));
      d.appendChild(s);

      var grid = el("div", "topics-grid category-topics-grid");
      list.forEach(function (t) { grid.appendChild(topicCard(t)); });
      d.appendChild(grid);
      groupsBox.appendChild(d);
    });

    var empty = $("empty");
    empty.hidden = shown > 0;
    empty.textContent = state.only && !state.q ? "目前還沒有任何主題有動圖。" : "沒有符合的主題。";
    syncToggle();
  }

  function syncToggle() {
    var groups = groupsBox.querySelectorAll(".category-group");
    var allOpen = groups.length && Array.prototype.every.call(groups, function (g) { return g.open; });
    $("toggle-all").textContent = allOpen ? "全部收合" : "全部展開";
  }

  $("toggle-all").addEventListener("click", function () {
    var groups = groupsBox.querySelectorAll(".category-group");
    var allOpen = Array.prototype.every.call(groups, function (g) { return g.open; });
    groups.forEach(function (g) { g.open = !allOpen; });
    syncToggle();
  });
  groupsBox.addEventListener("toggle", syncToggle, true);

  var timer;
  $("search").addEventListener("input", function (e) {
    clearTimeout(timer);
    timer = setTimeout(function () { state.q = e.target.value.trim(); render(); }, 150);
  });
  $("only-clips").addEventListener("change", function () { state.only = this.checked; render(); });

  var withClips = G.topics.filter(function (t) { return t.clips; }).length;
  $("hero-stats").textContent = G.categories.length + " 個分類・" + G.topics.length + " 個主題・" +
    G.clips.length + " 張動圖" + (withClips ? "（" + withClips + " 個主題有動圖）" : "");

  render();

  // 從主題頁麵包屑回來（index.html#cat-xxx）時，展開並捲到那個分類
  function focusHash() {
    var m = /^#cat-(.+)$/.exec(location.hash);
    if (!m) return;
    var d = $("cat-" + m[1]);
    if (d) { d.open = true; syncToggle(); d.scrollIntoView(); }
  }
  focusHash();
  window.addEventListener("hashchange", focusHash);
})();
