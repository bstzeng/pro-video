// 首頁：讀取 data/gallery.js（window.GALLERY）並渲染動圖卡片。
// 卡片平時顯示靜態封面，滑過、聚焦或點一下才載入 GIF，避免一次下載全部動圖。
(function () {
  "use strict";

  var G = window.GALLERY || { categories: [], topics: {}, clips: [] };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { cat: "all", topic: "", q: "" };

  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // ---- 播放控制 ----
  function play(card) {
    if (card.classList.contains("playing")) return;
    var img = card.querySelector(".card-img");
    img.src = img.dataset.gif;
    card.classList.add("playing");
  }
  function stop(card) {
    if (!card.classList.contains("playing")) return;
    var img = card.querySelector(".card-img");
    img.src = img.dataset.poster;
    card.classList.remove("playing");
  }

  var observer = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!$("autoplay").checked) return;
      if (en.isIntersecting) play(en.target); else stop(en.target);
    });
  }, { threshold: 0.6 }) : null;

  // ---- 卡片 ----
  function card(c) {
    var t = G.topics[c.topic];
    var art = el("article", "card");
    art.dataset.id = c.id;

    var media = el("button", "card-media");
    media.type = "button";
    media.setAttribute("aria-label", "播放／暫停：" + c.title);
    media.style.aspectRatio = c.w + " / " + c.h;
    var img = el("img", "card-img");
    img.src = c.poster;
    img.dataset.poster = c.poster;
    img.dataset.gif = c.gif;
    img.alt = c.title;
    img.loading = "lazy";
    img.width = c.w;
    img.height = c.h;
    media.appendChild(img);
    media.appendChild(el("span", "badge", "GIF · " + c.seconds + " 秒"));
    media.appendChild(el("span", "play-hint", "▶"));
    art.appendChild(media);

    var body = el("div", "card-body");
    var chip = el("button", "topic-chip", (t.icon ? t.icon + " " : "") + t.short);
    chip.type = "button";
    chip.title = "只看「" + t.title + "」";
    chip.addEventListener("click", function () { setTopic(c.topic); });
    body.appendChild(chip);

    var h3 = el("h3", "card-title");
    var open = el("a", null, c.title);
    open.href = "#" + c.id;
    open.addEventListener("click", function (e) { e.preventDefault(); openViewer(c); });
    h3.appendChild(open);
    body.appendChild(h3);
    body.appendChild(el("p", "card-caption", c.caption));

    var foot = el("a", "card-lesson");
    foot.href = c.lesson.url;
    foot.target = "_blank";
    foot.rel = "noopener";
    foot.textContent = (c.lesson.label ? c.lesson.label + "・" : "") + c.lesson.title + " ↗";
    body.appendChild(foot);
    art.appendChild(body);

    // 滑鼠：滑過播放、點擊開大圖；觸控：點一下切換播放
    var pointer = "mouse";
    art.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse" && !reduceMotion) play(art);
    });
    art.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse" && !$("autoplay").checked) stop(art);
    });
    media.addEventListener("pointerdown", function (e) { pointer = e.pointerType; });
    media.addEventListener("click", function () {
      if (pointer === "mouse") { openViewer(c); return; }
      art.classList.contains("playing") ? stop(art) : play(art);
    });
    // 只有鍵盤 Tab 聚焦時才播放；觸控點擊也會觸發 focus，交給 click 處理
    media.addEventListener("focus", function () {
      if (!reduceMotion && media.matches(":focus-visible")) play(art);
    });
    media.addEventListener("blur", function () { if (!$("autoplay").checked) stop(art); });
    return art;
  }

  // ---- 篩選 ----
  function matches(c) {
    var t = G.topics[c.topic];
    if (state.cat !== "all" && t.category !== state.cat) return false;
    if (state.topic && c.topic !== state.topic) return false;
    if (!state.q) return true;
    var hay = [c.title, c.caption, t.title, c.lesson.title, c.lesson.label].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }

  function render() {
    grid.querySelectorAll(".card").forEach(function (n) { if (observer) observer.unobserve(n); });
    grid.textContent = "";
    var shown = G.clips.filter(matches);
    shown.forEach(function (c) {
      var n = card(c);
      grid.appendChild(n);
      if (observer) observer.observe(n);
    });
    $("empty").hidden = shown.length > 0;

    document.querySelectorAll(".chip").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.cat === state.cat ? "true" : "false");
    });
    var tf = $("topic-filter");
    if (state.topic) {
      var t = G.topics[state.topic];
      tf.textContent = "";
      tf.appendChild(el("span", null, "只看主題：" + (t.icon ? t.icon + " " : "") + t.title));
      var x = el("button", "clear", "✕ 清除");
      x.type = "button";
      x.addEventListener("click", function () { setTopic(""); });
      tf.appendChild(x);
      tf.hidden = false;
    } else {
      tf.hidden = true;
    }
    writeHash();
  }

  function setTopic(id) {
    state.topic = id;
    if (id) state.cat = "all";
    render();
    if (id) $("gallery").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  function chips() {
    var box = $("chips");
    var all = [{ id: "all", label: "全部", icon: "" }].concat(G.categories);
    all.forEach(function (c) {
      var n = c.id === "all" ? G.clips.length
        : G.clips.filter(function (x) { return G.topics[x.topic].category === c.id; }).length;
      var b = el("button", "chip");
      b.type = "button";
      b.dataset.cat = c.id;
      b.textContent = (c.icon ? c.icon + " " : "") + c.label + " ";
      b.appendChild(el("span", "count", String(n)));
      b.addEventListener("click", function () { state.cat = c.id; state.topic = ""; render(); });
      box.appendChild(b);
    });
  }

  // ---- 網址 hash：#cat=math&topic=chaos-theory&q=π，或 #<clip-id> 直接開啟 ----
  function readHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h) return null;
    if (h.indexOf("=") < 0) return h;
    state.cat = "all"; state.topic = ""; state.q = "";
    h.split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0] in state) state[p[0]] = p[1] || "";
    });
    if (state.cat !== "all" && !G.categories.some(function (c) { return c.id === state.cat; })) state.cat = "all";
    if (state.topic && !G.topics[state.topic]) state.topic = "";
    return null;
  }
  function writeHash() {
    var parts = [];
    if (state.cat !== "all") parts.push("cat=" + state.cat);
    if (state.topic) parts.push("topic=" + state.topic);
    if (state.q) parts.push("q=" + encodeURIComponent(state.q));
    var h = parts.length ? "#" + parts.join("&") : "";
    if (location.hash !== h) history.replaceState(null, "", h || location.pathname + location.search);
  }

  // ---- 大圖檢視 ----
  var viewer = $("viewer");
  function openViewer(c) {
    var t = G.topics[c.topic];
    $("viewer-img").src = c.gif;
    $("viewer-img").alt = c.title;
    $("viewer-img").width = c.w;
    $("viewer-img").height = c.h;
    $("viewer-topic").textContent = (t.icon ? t.icon + " " : "") + t.title;
    $("viewer-topic").href = t.url;
    $("viewer-title").textContent = c.title;
    $("viewer-caption").textContent = c.caption;
    $("viewer-lesson").textContent = "到" + (c.lesson.label || "課程頁") + "自己玩 ↗";
    $("viewer-lesson").href = c.lesson.url;
    $("viewer-download").href = c.gif;
    $("viewer-meta").textContent = c.w + "×" + c.h + "・" + c.seconds + " 秒・" + c.kb + " KB";
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute("open", "");
  }
  function closeViewer() {
    if (viewer.close) viewer.close(); else viewer.removeAttribute("open");
  }
  viewer.querySelector(".viewer-close").addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
  viewer.addEventListener("close", function () { $("viewer-img").removeAttribute("src"); });

  // ---- 初始化 ----
  var topicCount = Object.keys(G.topics).length;
  $("hero-stats").textContent = G.clips.length + " 張動圖・" + topicCount + " 個主題";
  if (G.professorBase) $("professor-link").href = G.professorBase;

  var direct = readHash();
  $("search").value = state.q;
  chips();
  render();

  var timer;
  $("search").addEventListener("input", function (e) {
    clearTimeout(timer);
    timer = setTimeout(function () { state.q = e.target.value.trim(); render(); }, 150);
  });

  if (reduceMotion) $("autoplay").disabled = true;
  $("autoplay").addEventListener("change", function () {
    grid.querySelectorAll(".card").forEach(stop);
    if (this.checked && observer) {
      grid.querySelectorAll(".card").forEach(function (n) { observer.unobserve(n); observer.observe(n); });
    }
  });

  function openFromHash(id) {
    var hit = G.clips.filter(function (c) { return c.id === id; })[0];
    if (hit) openViewer(hit);
  }
  if (direct) openFromHash(direct);
  window.addEventListener("hashchange", function () {
    var id = readHash();
    $("search").value = state.q;
    if (id) openFromHash(id); else render();
  });
})();
