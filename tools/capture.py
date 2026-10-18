"""把 professor 課程裡的互動元件錄成 GIF。

用法（在 pro-video 根目錄執行）：
    python3 tools/capture.py                 # 錄 clips/clips.json 裡全部的片段
    python3 tools/capture.py gradient-descent ising-model   # 只錄指定 id
    python3 tools/capture.py --professor ../professor

每個片段會輸出：
    gifs/<topic>/<id>.gif   動圖
    gifs/<topic>/<id>.png   靜態封面（卡片未播放時顯示）
錄完會自動執行 build.py 重新產生 data/gallery.js。
"""
import argparse
import asyncio
import io
import json
import os
import sys
import time

from PIL import Image
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMIUM = "/opt/pw-browsers/chromium"
MAX_W = 680       # GIF 最大寬度（像素）；professor 的元件最寬 680，維持原尺寸畫面最清楚
COLORS = 128      # 預設調色盤顏色數，越少檔案越小；可在 clips.json 用 colors 個別調整


def topic_of(page):
    # "topics/chaos-theory/lesson-01.html" → "chaos-theory"
    return page.split("/")[1]


async def click(widget, label):
    btn = widget.locator("button", has_text=label).first
    await btn.click()


async def record(page, prof, clip):
    await page.goto("file://" + os.path.join(prof, clip["page"]))
    await page.wait_for_timeout(clip.get("wait", 600))
    widget = page.locator(clip["widget"]).nth(clip.get("index", 0))
    await widget.scroll_into_view_if_needed()
    for step in clip.get("pre", []):
        await click(widget, step["click"])
        await page.wait_for_timeout(150)

    box = None
    if clip.get("crop"):
        # 只保留元件裡這些子元素的範圍（聯集），去掉上方說明文字等雜訊
        box = await widget.evaluate("""(w, [sels, pad]) => {
            const W = w.getBoundingClientRect();
            const rs = sels.flatMap(s => [...w.querySelectorAll(s)]).map(e => e.getBoundingClientRect());
            return [Math.max(0, Math.min(...rs.map(r => r.left)) - W.left - pad),
                    Math.max(0, Math.min(...rs.map(r => r.top)) - W.top - pad),
                    Math.min(W.width, Math.max(...rs.map(r => r.right)) - W.left + pad),
                    Math.min(W.height, Math.max(...rs.map(r => r.bottom)) - W.top + pad)].map(Math.round);
        }""", [clip["crop"], clip.get("pad", 10)])

    actions = {a["frame"]: a["click"] for a in clip.get("actions", [])}
    every = clip.get("every")
    interval = clip.get("interval", 100) / 1000
    frames = []
    for i in range(clip.get("frames", 50)):
        t0 = time.monotonic()
        if i in actions:
            await click(widget, actions[i])
        if every and i % every["n"] == 0 and i > 0:
            await click(widget, every["click"])
        png = await widget.screenshot(animations="allow")
        im = Image.open(io.BytesIO(png)).convert("RGB")
        frames.append(im.crop(box) if box else im)
        left = interval - (time.monotonic() - t0)
        if left > 0:
            await asyncio.sleep(left)
    return frames


def save(frames, clip, out_dir):
    w, h = frames[0].size
    if w > MAX_W:
        size = (MAX_W, round(h * MAX_W / w))
        frames = [f.resize(size, Image.LANCZOS) for f in frames]
        w, h = size

    # 用頭、中、尾三格拼成一張圖來決定共用調色盤，避免每格顏色跳動
    picks = [frames[0], frames[len(frames) // 2], frames[-1]]
    sheet = Image.new("RGB", (w, h * len(picks)))
    for k, f in enumerate(picks):
        sheet.paste(f, (0, h * k))
    pal = sheet.quantize(colors=clip.get("colors", COLORS), method=Image.Quantize.MEDIANCUT)
    gif = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]

    hold = clip.get("hold", 1200)   # 最後一格停久一點再重播
    durations = [clip.get("interval", 100)] * len(gif)
    durations[-1] = hold

    os.makedirs(out_dir, exist_ok=True)
    gif_path = os.path.join(out_dir, clip["id"] + ".gif")
    gif[0].save(gif_path, save_all=True, append_images=gif[1:], loop=0,
                duration=durations, optimize=True, disposal=1)

    poster = clip.get("poster", 0)
    still = frames[-1] if poster == "last" else frames[int(poster)]
    still.save(os.path.join(out_dir, clip["id"] + ".png"), optimize=True)
    return gif_path


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="只錄這些 id（預設全部）")
    ap.add_argument("--professor", default=os.path.join(os.path.dirname(ROOT), "professor"),
                    help="professor repo 的路徑（預設 ../professor）")
    args = ap.parse_args()
    prof = os.path.abspath(args.professor)

    with open(os.path.join(ROOT, "clips", "clips.json"), encoding="utf-8") as f:
        clips = json.load(f)["clips"]
    if args.ids:
        clips = [c for c in clips if c["id"] in args.ids]
        missing = set(args.ids) - {c["id"] for c in clips}
        if missing:
            sys.exit("找不到這些 id：" + "、".join(sorted(missing)))

    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROMIUM)
        page = await browser.new_page(viewport={"width": 760, "height": 1000})
        for clip in clips:
            frames = await record(page, prof, clip)
            path = save(frames, clip, os.path.join(ROOT, "gifs", topic_of(clip["page"])))
            with Image.open(path) as im:
                w, h = im.size
            kb = os.path.getsize(path) / 1024
            print(f"{clip['id']}: {len(frames)} 格, {w}×{h}, {kb:.0f} KB")
        await browser.close()

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import build
    build.main(prof)


if __name__ == "__main__":
    asyncio.run(main())
