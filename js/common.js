// 首頁與主題頁共用的小工具。
(function () {
  "use strict";

  var G = window.GALLERY || { categories: [], topics: [], clips: [] };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  window.PV = {
    G: G,
    el: el,
    $: function (id) { return document.getElementById(id); },
    topicHref: function (id) { return "topic.html?t=" + encodeURIComponent(id); },
    category: function (id) {
      return G.categories.filter(function (c) { return c.id === id; })[0];
    },
    topic: function (id) {
      return G.topics.filter(function (t) { return t.id === id; })[0];
    }
  };

  // 頁首「博雅書院」連結跟著 clips.json 的 professorBase 走
  document.addEventListener("DOMContentLoaded", function () {
    if (!G.professorBase) return;
    document.querySelectorAll(".professor-link").forEach(function (a) { a.href = G.professorBase; });
  });
})();
