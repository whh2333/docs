#!/usr/bin/env python3
"""
将 zh/ 目录下的中文 MDX 批量翻译为英文并写入 en/ 目录（仅补齐缺失/失效的英文文件）。

特性：
- OpenAI 兼容接口（Sealos 代理）: /v1/chat/completions
- 默认使用模型 gpt-5（可通过 --model 覆盖）
- 仅在目标英文文件缺失或为空时写入（--only-missing）
- 保持 MDX/frontmatter/链接/组件格式
- 不输出额外解释或代码块标记

用法示例：
  python3 scripts/zh_to_en_sealos.py \
    --api-base https://api.sealos.vip/v1/chat/completions \
    --api-key YOUR_KEY \
    --model gpt-5 --src zh --dst en --only-missing
"""

import os
import sys
import re
import time
import json
import glob
import argparse
from pathlib import Path
from typing import Optional, List
import urllib.request
import ssl


def build_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Translate zh MDX to en via Sealos proxy")
    parser.add_argument("--api-base", required=True, help="OpenAI-compatible chat completions endpoint")
    parser.add_argument("--api-key", required=True, help="API key for the endpoint")
    parser.add_argument("--model", default="gpt-5", help="Model name, e.g., gpt-5")
    parser.add_argument("--src", default="zh", help="Source directory (zh)")
    parser.add_argument("--dst", default="en", help="Destination directory (en)")
    parser.add_argument("--only-missing", action="store_true", help="Only create missing/empty en files")
    parser.add_argument("--overwrite-chinese", action="store_true", help="Overwrite existing en files if mostly Chinese content is detected")
    parser.add_argument("--insecure", action="store_true", help="Disable TLS certificate verification (not recommended)")
    parser.add_argument("--max-files", type=int, default=0, help="Limit number of files to process (0 = all)")
    parser.add_argument("--request-delay", type=float, default=0.8, help="Delay between requests (seconds)")
    parser.add_argument("--max-retries", type=int, default=3, help="Max retries per request")
    parser.add_argument("--retry-delay", type=float, default=2.0, help="Base retry delay (seconds)")
    parser.add_argument("--dry-run", action="store_true", help="List files to be processed without translating")
    return parser.parse_args()


def create_prompt_zh_to_en(content: str) -> str:
    return (
        "You are a professional technical documentation translator. Translate the following MDX content into natural, fluent English.\n"
        "Strict requirements:\n"
        "1) Return ONLY the translated MDX content. DO NOT add code fences.\n"
        "2) Preserve the full MDX/frontmatter format (--- blocks), components, links, and HTML tags.\n"
        "3) Translate human-readable text; keep brand names (\"Aitoearn\") and platform names (Instagram, Facebook, LinkedIn, etc.) as-is.\n"
        "4) Ensure terminology is accurate and the language is concise and clear.\n"
        "5) Do not add any explanations.\n\n"
        "Content to translate (MDX):\n\n"
        f"{content}"
    )


def clean_response(text: str) -> str:
    # Remove leading/trailing code fences if any
    text = re.sub(r"^```\w*\n", "", text)
    text = re.sub(r"\n```$", "", text)
    # Normalize extra blank lines
    text = re.sub(r"\n\n\n+", "\n\n", text)
    text = text.strip()
    if not text.endswith("\n"):
        text += "\n"
    return text


def call_chat_completions(api_base: str, api_key: str, model: str, content: str, max_retries: int, retry_delay: float, insecure: bool = False) -> Optional[str]:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You translate Chinese MDX docs into fluent English, preserving MDX structure."},
            {"role": "user", "content": create_prompt_zh_to_en(content)},
        ],
        "temperature": 0.1,
        "max_tokens": 4000,
        "stream": False,
    }

    data_bytes = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(api_base, data=data_bytes, method="POST")
    for k, v in headers.items():
        request.add_header(k, v)

    # Create SSL context
    ssl_ctx = ssl._create_unverified_context() if insecure else ssl.create_default_context()

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(request, context=ssl_ctx, timeout=120) as resp:
                if resp.status != 200:
                    body = resp.read().decode("utf-8", errors="ignore")
                    raise RuntimeError(f"HTTP {resp.status}: {body[:300]}")
                body = resp.read().decode("utf-8", errors="ignore")
                data = json.loads(body)
                if "choices" not in data or not data["choices"]:
                    raise RuntimeError(f"Malformed response: {json.dumps(data)[:300]}")
                text = data["choices"][0]["message"]["content"]
                return clean_response(text)
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(retry_delay * (attempt + 1))
            else:
                print(f"  ❌ API failed after {max_retries} attempts: {e}")
                return None


def collect_zh_files(src_dir: str) -> List[Path]:
    files = [Path(p) for p in glob.glob(os.path.join(src_dir, "**", "*.mdx"), recursive=True)]
    files.sort()
    return files


def is_mostly_chinese(text: str, threshold: float = 0.3) -> bool:
    if not text:
        return False
    total = len(text)
    cjk = sum(1 for ch in text if '\u4e00' <= ch <= '\u9fff')
    return (cjk / max(total, 1)) >= threshold


def should_process(zh_path: Path, en_root: Path, only_missing: bool, overwrite_chinese: bool) -> bool:
    rel = zh_path.relative_to(zh_path.parents[0]) if zh_path.parts[0] == "zh" else zh_path
    en_path = Path(str(zh_path).replace(os.sep + "zh" + os.sep, os.sep + "en" + os.sep, 1))
    if only_missing:
        if not en_path.exists():
            return True
        try:
            txt = en_path.read_text(encoding="utf-8")
            if len(txt.strip()) == 0:
                return True
            if overwrite_chinese and is_mostly_chinese(txt):
                return True
            return False
        except Exception:
            return True
    return True


def map_en_path(zh_path: Path, src_root: str, dst_root: str) -> Path:
    # Replace leading src_root with dst_root in path
    zh_str = str(zh_path)
    if f"{os.sep}{src_root}{os.sep}" in zh_str:
        return Path(zh_str.replace(f"{os.sep}{src_root}{os.sep}", f"{os.sep}{dst_root}{os.sep}", 1))
    # Fallback: join dst_root with relative
    rel = zh_path.relative_to(src_root)
    return Path(dst_root) / rel


def main():
    args = build_args()
    src_root = args.src
    dst_root = args.dst

    if not Path(src_root).exists():
        print(f"❌ Source directory not found: {src_root}")
        sys.exit(1)

    zh_files = collect_zh_files(src_root)
    if args.max_files and args.max_files > 0:
        zh_files = zh_files[: args.max_files]

    to_process: List[Path] = []
    for f in zh_files:
        if should_process(f, Path(dst_root), args.only_missing, args.overwrite_chinese):
            to_process.append(f)

    print(f"📋 待处理文件数: {len(to_process)} (总计 {len(zh_files)})")
    if args.dry_run:
        for p in to_process[:50]:
            print(" - ", p)
        if len(to_process) > 50:
            print(" ... (更多省略)")
        return

    processed = 0
    created = 0
    skipped = 0
    errors = 0

    for idx, zh_path in enumerate(to_process, 1):
        print(f"\n[{idx}/{len(to_process)}] 处理: {zh_path}")
        en_path = map_en_path(zh_path, src_root, dst_root)
        en_path.parent.mkdir(parents=True, exist_ok=True)

        # 读取中文
        try:
            content = zh_path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"  ❌ 读取失败: {e}")
            errors += 1
            continue

        # 如果 only-missing 并且目标已存在且非空，则跳过
        if args.only_missing and en_path.exists():
            try:
                existing = en_path.read_text(encoding="utf-8").strip()
                if existing:
                    print("  ⏭ 已存在有效英文版本，跳过")
                    skipped += 1
                    continue
            except Exception:
                pass

        # 调用翻译
        translated = call_chat_completions(
            api_base=args.api_base,
            api_key=args.api_key,
            model=args.model,
            content=content,
            max_retries=args.max_retries,
            retry_delay=args.retry_delay,
            insecure=args.insecure,
        )

        if translated is None:
            errors += 1
            continue

        # 写入英文文件
        try:
            if not en_path.exists():
                created += 1
            en_path.write_text(translated, encoding="utf-8")
            print(f"  ✅ 已写入: {en_path}")
            processed += 1
        except Exception as e:
            print(f"  ❌ 写入失败: {e}")
            errors += 1
            continue

        time.sleep(args.request_delay)

    print("\n===== 统计 =====")
    print(f"处理: {processed}")
    print(f"新建: {created}")
    print(f"跳过: {skipped}")
    print(f"错误: {errors}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n中断")
        sys.exit(1)

