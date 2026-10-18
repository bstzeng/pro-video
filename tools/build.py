"""由 clips/clips.json 與已錄好的 GIF 產生 data/gallery.js。

用法（在 pro-video 根目錄執行）：
    python3 tools/build.py [--professor ../professor]

主題名稱、圖示、分類與課名都直接從 professor repo 讀取，
所以只要在 clips.json 填 page（課程頁路徑），其餘資訊會自動帶入。
只改了標題或說明、不需要重錄時，跑這支就好。
"""
import argparse
import json
import os
import re
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DUMP_JS = """
global.window = {};
require(process.argv[1]);
process.stdout.write(JSON.stringify(window.SITE_DATA));
"""


def load_site_data(prof):
    path = os.path.join(prof, "data", "topics.js")
    if not os.path.exists(path):
        sys.exit(f"找不到 {path}，請用 --professor 指定 professor repo 的位置")
    out = subprocess.run(["node", "-e", DUMP_JS, path], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def page_title(prof, page):
    with open(os.path.join(prof, page), encoding="utf-8") as f:
        m = re.search(r"<title>([^<]*)</title>", f.read())
    return m.group(1).split(" ｜ ")[0].strip() if m else ""


def lesson_info(prof, page, base):
    # "第 4 課：丟點估計 π" → label「第 4 課」、title「丟點估計 π」
    full = page_title(prof, page)
    label, _, title = full.partition("：")
    if not re.fullmatch(r"第 \d+ 課", label):
        label, title = "", full
    return {"label": label, "title": title, "url": base + page}


def gif_info(path):
    with Image.open(path) as im:
        w, h = im.size
        ms = 0
        for i in range(im.n_frames):
            im.seek(i)
            ms += im.info.get("duration", 100)
    return w, h, round(ms / 1000, 1), round(os.path.getsize(path) / 1024)


def main(prof):
    with open(os.path.join(ROOT, "clips", "clips.json"), encoding="utf-8") as f:
        spec = json.load(f)
    base = spec["professorBase"]
    site = load_site_data(prof)
    topics_by_id = {t["id"]: t for t in site["topics"]}

    clips, skipped = [], []
    for c in spec["clips"]:
        slug = c["page"].split("/")[1]
        gif = f"gifs/{slug}/{c['id']}.gif"
        if not os.path.exists(os.path.join(ROOT, gif)):
            skipped.append(c["id"])
            continue
        if slug not in topics_by_id:
            sys.exit(f"{c['id']}：professor 裡沒有主題 {slug}")
        w, h, sec, kb = gif_info(os.path.join(ROOT, gif))
        clips.append({
            "id": c["id"],
            "topic": slug,
            "title": c["title"],
            "caption": c.get("caption", ""),
            "gif": gif,
            "poster": gif[:-4] + ".png",
            "w": w, "h": h, "seconds": sec, "kb": kb,
            "lesson": lesson_info(prof, c["page"], base),
        })

    # 首頁要列出 professor 的全部分類與主題（沒有動圖的也列，標示「尚無動圖」）
    counts = {}
    for c in clips:
        counts[c["topic"]] = counts.get(c["topic"], 0) + 1
    topics = [{
        "id": t["id"],
        "category": t.get("category", ""),
        "title": t["title"],
        "icon": t.get("icon", ""),
        "description": t.get("description", ""),
        "url": base + t["url"] if t.get("url") else "",
        "clips": counts.get(t["id"], 0),
    } for t in site["topics"]]

    data = {
        "professorBase": base,
        "categories": site["categories"],
        "topics": topics,
        "clips": clips,
    }
    out = os.path.join(ROOT, "data", "gallery.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("// 由 tools/build.py 產生，請勿手動編輯；要改內容請改 clips/clips.json 後重跑。\n")
        f.write("window.GALLERY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    print(f"data/gallery.js：{len(topics)} 個主題、{len(clips)} 張動圖（{len(counts)} 個主題有動圖）")
    if skipped:
        print("尚未錄製（略過）：" + "、".join(skipped))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--professor", default=os.path.join(os.path.dirname(ROOT), "professor"))
    main(os.path.abspath(ap.parse_args().professor))
