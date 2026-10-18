"""把 three.js 場景逐格渲染成 GIF。

用法（在 pro-video 根目錄執行）：
    python3 tools/anim/render.py l11-multiply            # 依 clips/clips.json 的 id 渲染
    python3 tools/anim/render.py l11-multiply --preview 0,60,120   # 只輸出幾格 PNG 預覽

第一次使用先在 tools/anim 執行 npm install（three.js、字型、gifsicle）。
每個 id 輸出 gifs/<主題>/<id>.gif 與同名 .png 封面，完成後自動更新 data/gallery.js。
"""
import argparse
import asyncio
import base64
import functools
import http.server
import io
import json
import os
import subprocess
import sys
import threading

from PIL import Image
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CHROMIUM = "/opt/pw-browsers/chromium"
GIFSICLE = os.path.join(HERE, "node_modules", ".bin", "gifsicle")
# 15 fps 的每格 66.7 ms；GIF 只能以 10 ms 為單位，用 70/70/60 輪流，12 秒剛好
DELAYS = [70, 70, 60]
LOSSY = 30          # gifsicle 有損壓縮強度；越大越小、雜點越多


def serve(directory):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=directory)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


async def render(scene, frames, port):
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROMIUM,
                                          args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(f"http://127.0.0.1:{port}/stage.html?scene={scene}")
        try:
            await page.wait_for_function("window.stageReady === true", timeout=60000)
        except Exception:
            raise RuntimeError("舞台載入失敗：" + "；".join(errors))
        info = await page.evaluate("window.sceneInfo")
        if frames is None:
            frames = range(info["frames"])
        out = []
        for i in frames:
            url = await page.evaluate("i => window.renderFrame(i)", i)
            out.append(Image.open(io.BytesIO(base64.b64decode(url.split(",", 1)[1]))).convert("RGB"))
        await browser.close()
        if errors:
            raise RuntimeError("渲染時出錯：" + "；".join(errors))
        return out, info


def to_gif(frames, path):
    # 從均勻抽樣的格子建立共用調色盤，避免每格顏色跳動
    picks = frames[:: max(1, len(frames) // 12)][:12]
    w, h = frames[0].size
    sheet = Image.new("RGB", (w // 2, h // 2 * len(picks)))
    for k, f in enumerate(picks):
        sheet.paste(f.resize((w // 2, h // 2)), (0, h // 2 * k))
    pal = sheet.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    durations = [DELAYS[i % 3] for i in range(len(q))]
    raw = path + ".raw.gif"
    q[0].save(raw, save_all=True, append_images=q[1:], loop=0, duration=durations, disposal=1)
    subprocess.run([GIFSICLE, "-O3", f"--lossy={LOSSY}", "--no-warnings", raw, "-o", path], check=True)
    os.remove(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    ap.add_argument("--preview", help="只輸出這幾格的 PNG，例如 0,60,120")
    ap.add_argument("--out", help="預覽 PNG 的輸出資料夾（預設 gifs/_preview）")
    args = ap.parse_args()

    with open(os.path.join(ROOT, "clips", "clips.json"), encoding="utf-8") as f:
        clips = {c["id"]: c for c in json.load(f)["clips"] if "anim" in c}
    missing = [i for i in args.ids if i not in clips]
    if missing:
        sys.exit("clips.json 裡沒有這些動畫：" + "、".join(missing))

    httpd = serve(HERE)
    port = httpd.server_address[1]
    failed = []
    for cid in args.ids:
        try:
            one(cid, clips[cid], args, port)
        except RuntimeError as e:
            print(f"{cid}：{e}")
            failed.append(cid)
    httpd.shutdown()
    if failed:
        print("失敗：" + "、".join(failed))

    if not args.preview:
        sys.path.insert(0, os.path.join(ROOT, "tools"))
        import build
        build.main(os.path.join(os.path.dirname(ROOT), "professor"))
    if failed:
        sys.exit(1)


def one(cid, clip, args, port):
    if True:
        topic = clip["page"].split("/")[1]
        if args.preview:
            idx = [int(x) for x in args.preview.split(",")]
            frames, _ = asyncio.run(render(clip["anim"], idx, port))
            out_dir = args.out or os.path.join(ROOT, "gifs", "_preview")
            os.makedirs(out_dir, exist_ok=True)
            for i, im in zip(idx, frames):
                im.save(os.path.join(out_dir, f"{cid}-{i:03d}.png"))
            print(f"{cid}：預覽 {len(idx)} 格 → {out_dir}")
            return

        frames, info = asyncio.run(render(clip["anim"], None, port))
        out_dir = os.path.join(ROOT, "gifs", topic)
        os.makedirs(out_dir, exist_ok=True)
        gif = os.path.join(out_dir, cid + ".gif")
        to_gif(frames, gif)
        poster = frames[info.get("poster", 0)]
        poster.quantize(colors=255, method=Image.Quantize.MEDIANCUT).save(
            os.path.join(out_dir, cid + ".png"), optimize=True)
        print(f"{cid}：{len(frames)} 格，{os.path.getsize(gif) / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
