# 博雅動圖館（pro-video）

把[博雅書院](https://github.com/bstzeng/professor)課程裡的互動視覺化錄成 GIF，以卡片牆呈現。
純靜態網頁，用 GitHub Pages 部署。

## 結構

```
index.html          首頁：依分類列出 professor 的全部主題（不載入任何動圖）
topic.html          主題頁：topic.html?t=<主題 id>，該主題的動圖卡片放在這裡
css/style.css       樣式（色彩沿用 professor）
js/common.js        共用小工具
js/home.js          首頁邏輯（折疊分類、搜尋、只看有動圖的主題）
js/topic.js         主題頁邏輯（麵包屑、動圖卡片、滑過播放、大圖檢視）
data/gallery.js     分類、主題與動圖資料——由 tools/build.py 產生，不要手動編輯
clips/clips.json    每張動圖的設定（來源課程、要按哪些按鈕、錄幾格）
gifs/<主題>/<id>.gif  動圖；同名 .png 是卡片的靜態封面
tools/capture.py    錄製工具（Playwright 開課程頁 → 截圖 → 合成 GIF）
tools/build.py      由 professor 的主題資料、clips.json 與 GIF 產生 data/gallery.js
tools/anim/         three.js 教學動畫（規格見 STYLE.md）
  engine.js         共用骨架：版面、霧、格線、bloom、發光物件、HUD 元件
  stage.html        渲染舞台（stage.html?scene=<主題>/<id>&f=<格> 可在瀏覽器預覽單格）
  scenes/<主題>/    每張動畫一個檔案，匯出 { setup, update, hud }
  render.py         逐格渲染 → 合成 GIF（gifsicle 壓縮）→ 更新 data/gallery.js
```

分類與主題直接取自 professor 的 `data/topics.js`；professor 新增主題後跑一次
`python3 tools/build.py`，首頁就會同步出現。還沒有動圖的主題會標示「尚無動圖」。

## 新增一張動圖

1. 把 professor 抓到旁邊（預設路徑 `../professor`）。
2. 在 `clips/clips.json` 的 `clips` 加一筆：

   ```json
   {
     "id": "monte-carlo-pi",
     "page": "topics/monte-carlo/lesson-04.html",
     "widget": ".mc-w",
     "index": 0,
     "crop": ["canvas", "svg"],
     "title": "丟點估計 π",
     "caption": "一兩句說明，顯示在卡片上。",
     "pre": [{ "click": "↺ 重來" }],
     "actions": [{ "frame": 4, "click": "某個按鈕" }],
     "every": { "n": 2, "click": "+100 點" },
     "frames": 40,
     "interval": 180,
     "poster": "last",
     "colors": 128
   }
   ```

   | 欄位 | 說明 |
   |---|---|
   | `page` | professor 裡的課程頁路徑；主題名稱、分類、課名都會自動從 professor 讀 |
   | `widget` / `index` | 要錄的互動元件（CSS 選擇器，第幾個，預設 0） |
   | `crop` / `pad` | 只保留元件裡這些子元素的範圍（聯集），去掉說明文字與按鈕；`pad` 是留白像素，預設 10 |
   | `pre` | 開始錄之前依序按的按鈕（用按鈕上的文字找） |
   | `actions` | 錄到第幾格時按某個按鈕 |
   | `every` | 每 n 格按一次某個按鈕（例如「走一步」） |
   | `frames` / `interval` | 格數與每格間隔（毫秒） |
   | `hold` | 最後一格停留毫秒數，預設 1200 |
   | `poster` | 卡片封面用第幾格，或 `"last"`；預設第 0 格 |
   | `colors` | 調色盤顏色數，畫面雜訊多時調低可縮小檔案 |

3. 執行 `python3 tools/capture.py <id>`，會輸出 GIF、封面並更新 `data/gallery.js`。
   只改標題或說明時跑 `python3 tools/build.py` 就好，不用重錄。

`professorBase`（clips.json 最上面）是 professor 網站的網址，卡片上的課程連結都以它為開頭。

需要 Python 的 `playwright`、`Pillow`，以及 Node.js（用來讀 professor 的 `data/topics.js`）。
單張動圖盡量控制在 1 MB 以內。

## 製作 three.js 教學動畫

規格（1280×720、15 fps、12 秒無縫循環、配色、版面、字體）寫在 `STYLE.md`。

1. 第一次使用：`cd tools/anim && npm install`（three.js、Noto Sans TC、JetBrains Mono、gifsicle）。
2. 在 `tools/anim/scenes/<主題>/` 新增場景檔，照現有檔案的寫法匯出：
   - `camera`：鏡頭目標、距離、仰角、擺動幅度（可另加 `cameraPath(t)` 讓鏡頭轉到別的角度）
   - `setup(st)`：建立 3D 物件
   - `update(st, t, phase, s)`：依時間 t（0–12 秒）更新；第 180 格會接回第 0 格，所以所有動作都要在 12 秒內回到起點
   - `hud(st, h, t, phase, s)`：畫標題、右側面板、左下公式與 callout
3. 在 `clips/clips.json` 加一筆，用 `anim` 指向場景（例如 `"anim": "complex-numbers/l11-multiply"`），`page` 指向對應的課程頁。
4. 預覽幾格：`python3 tools/anim/render.py <id> --preview 0,60,120`（PNG 輸出到 `gifs/_preview/`）。
5. 正式輸出：`python3 tools/anim/render.py <id> [<id> …]`。

## 本機預覽

直接用瀏覽器打開 `index.html`，或 `python3 -m http.server` 後開 http://localhost:8000。

## 網址

- `topic.html?t=chaos-theory`：主題頁
- `topic.html?t=chaos-theory#<動圖 id>`：主題頁並直接打開那張動圖
- `index.html#cat-math`：首頁並展開「數學」分類
