#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
把 heroes-splash/ 里的原画（Riot 公开最高 1280x720 / 1215x717）
重采样到 2K（2560 宽），用于点击头像放大时保证清晰度。

用法：
  <python> scripts/upscale-splash-2k.py            # 生成到 src/assets/heroes-splash-2k/
  <python> scripts/upscale-splash-2k.py --force    # 已存在也重新生成
"""
import sys
import argparse
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
SRC = FRONTEND / "src" / "assets" / "heroes-splash"
DST = FRONTEND / "src" / "assets" / "heroes-splash-2k"

TARGET_W = 2560          # 2K（16:9 -> 2560x1440）
QUALITY = 92
SHARPNESS = 1.18         # 放大后轻微锐化，抵消重采样的软边


def upscale(src_path: Path, dst_path: Path) -> tuple[int, int]:
    with Image.open(src_path) as im:
        im = im.convert("RGB")
        w, h = im.size
        if w >= TARGET_W:                      # 已有资源足够清晰，直接转存
            out = im
        else:
            ratio = TARGET_W / w
            target_h = round(h * ratio / 2) * 2  # 取偶数，便于 JPEG 色度抽样
            out = im.resize((TARGET_W, target_h), Image.LANCZOS)
            out = out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=68, threshold=3))
            out = ImageEnhance.Sharpness(out).enhance(SHARPNESS)
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        out.save(dst_path, "JPEG", quality=QUALITY, subsampling=0, optimize=True)
        return out.size


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="已存在也重新生成")
    args = ap.parse_args()

    if not SRC.is_dir():
        print(f"源目录不存在：{SRC}")
        return 1

    files = sorted(SRC.glob("*.jpg"))
    if not files:
        print("源目录里没有 jpg")
        return 1

    total = 0
    for f in files:
        dst = DST / f.name
        if dst.exists() and not args.force:
            print(f"跳过（已存在）{f.name}")
            continue
        size = upscale(f, dst)
        kb = dst.stat().st_size / 1024
        total += dst.stat().st_size
        print(f"{f.name:14s} {size[0]}x{size[1]}  {kb:8.0f} KB")

    print(f"\n完成 {len(files)} 张，总计 {total / 1024 / 1024:.1f} MB -> {DST}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
