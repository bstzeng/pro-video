// 主題頁：topic.html?t=<主題 id>，列出這個主題的動圖卡片。
// 卡片平時顯示靜態封面，滑過、聚焦或點一下才載入 GIF。
(function () {
  "use strict";

  var G = PV.G, el = PV.el, $ = PV.$;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var id = new URLSearchParams(location.search).get("t") || "";
  var t = PV.topic(id);
  var grid = $("grid");

  // ---- 主題資訊 ----
  var bc = $("breadcrumb");
  var home = el("a", null, "首頁");
  home.href = "index.html";
  bc.appendChild(home);

  if (!t) {
    document.title = "找不到主題 ｜ 博雅動圖館";
    bc.appendChild(el("span", "sep", "›"));
    bc.appendChild(el("span", null, "找不到主題"));
    $("topic-title").textContent = "找不到這個主題";
    $("topic-desc").textContent = "網址可能打錯了，請回首頁重新選擇。";
    $("topic-course").hidden = true;
    document.querySelector(".clips-section").hidden = true;
    return;
  }

  var cat = PV.category(t.category);
  if (cat) {
    bc.appendChild(el("span", "sep", "›"));
    var ca = el("a", null, (cat.icon ? cat.icon + " " : "") + cat.label);
    ca.href = "index.html#cat-" + cat.id;
    bc.appendChild(ca);
  }
  bc.appendChild(el("span", "sep", "›"));
  bc.appendChild(el("span", null, t.title.split("：")[0]));

  document.title = t.title.split("：")[0] + " ｜ 博雅動圖館";
  $("topic-icon").textContent = t.icon || "📘";
  $("topic-title").textContent = t.title;
  $("topic-desc").textContent = t.description;
  if (t.url) $("topic-course").href = t.url; else $("topic-course").hidden = true;

  // 依課次排序；沒有課次的（實驗室、圖鑑頁）排最後
  function lessonNo(c) {
    var m = /(\d+)/.exec(c.lesson.label || "");
    return m ? +m[1] : 9999;
  }
  var clips = G.clips.filter(function (c) { return c.topic === id; })
    .sort(function (a, b) { return lessonNo(a) - lessonNo(b); });
  $("topic-count").textContent = clips.length ? clips.length + " 張動圖" : "";

  // ---- 播放控制 ----
  function autoplayOn() { return $("autoplay").checked; }
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
      if (!autoplayOn()) return;
      if (en.isIntersecting) play(en.target); else stop(en.target);
    });
  }, { threshold: 0.6 }) : null;

  // ---- 卡片 ----
  function card(c) {
    var art = el("article", "card");
    art.id = c.id;

    var media = el("button", "card-media");
    media.type = "button";
    media.setAttribute("aria-label", "播放：" + c.title);
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
    if (c.lesson.label) body.appendChild(el("span", "lesson-chip", c.lesson.label));
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
      if (e.pointerType === "mouse" && !autoplayOn()) stop(art);
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
    media.addEventListener("blur", function () { if (!autoplayOn()) stop(art); });
    return art;
  }

  clips.forEach(function (c) {
    var n = card(c);
    grid.appendChild(n);
    if (observer) observer.observe(n);
  });

  if (!clips.length) {
    $("autoplay-wrap").hidden = true;
    var empty = $("empty");
    empty.textContent = "";
    empty.appendChild(el("p", null, "這個主題還沒有動圖，製作中。"));
    if (t.url) {
      var go = el("a", null, "先到博雅書院看這門課 ↗");
      go.href = t.url;
      go.target = "_blank";
      go.rel = "noopener";
      empty.appendChild(go);
    }
    empty.hidden = false;
  }

  if (reduceMotion) $("autoplay").disabled = true;
  $("autoplay").addEventListener("change", function () {
    grid.querySelectorAll(".card").forEach(stop);
    if (this.checked && observer) {
      grid.querySelectorAll(".card").forEach(function (n) { observer.unobserve(n); observer.observe(n); });
    }
  });

  // ---- 大圖檢視 ----
  var viewer = $("viewer");
  function openViewer(c) {
    $("viewer-img").src = c.gif;
    $("viewer-img").alt = c.title;
    $("viewer-img").width = c.w;
    $("viewer-img").height = c.h;
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

  // topic.html?t=xxx#<動圖 id> 直接打開那張
  function openFromHash() {
    var hit = clips.filter(function (c) { return "#" + c.id === location.hash; })[0];
    if (hit) openViewer(hit);
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
