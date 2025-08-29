#!/usr/bin/env python3
"""
修复版 Sealos GPT-4o 翻译脚本
解决格式问题和翻译质量问题
"""

import os
import sys
import time
import glob
import json
import requests
import re
from pathlib import Path
from typing import List, Optional

# 配置
ZH_DIR = "zh"
MAX_RETRIES = 3
RETRY_DELAY = 2
BATCH_SIZE = 3   # 减少批处理大小，提高稳定性
REQUEST_DELAY = 2  # 增加请求间隔

# Sealos API 配置
API_BASE_URL = "https://api.sealos.vip/v1/chat/completions"
API_KEY = "sk-Q6QjUSH6JRYzo5EbEe8c5b2cA43f4613970cE37f450482E9"
MODEL = "gpt-4o"

class FixedSealosTranslator:
    def __init__(self):
        """初始化修复版 Sealos 翻译器"""
        self.api_key = API_KEY
        self.base_url = API_BASE_URL
        self.model = MODEL
        self.translated_count = 0
        self.error_count = 0
        self.skipped_count = 0
        
        # 设置请求头
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def create_translation_prompt(self, content: str) -> str:
        """创建改进的翻译提示词"""
        return f"""你是一个专业的技术文档翻译专家。请将以下 MDX 文档内容翻译成自然流畅的简体中文。

重要要求：
1. 直接返回翻译后的 MDX 内容，不要添加任何 ```mdx 或 ```md 标记
2. 保持完整的 frontmatter 格式（--- 包围的部分）
3. 将所有英文文本翻译成中文，包括表格内容、列表项、段落
4. 保留所有 HTML 标签、MDX 组件、链接地址不变
5. 保留品牌名称 "Aitoearn" 不翻译
6. 保留社交平台名称（Instagram、Facebook、LinkedIn 等）不翻译
7. 技术术语保持准确：
   - posts = 帖子
   - channels = 渠道
   - analytics = 分析
   - publishing = 发布
   - engagement = 互动
   - dashboard = 仪表板
8. 确保中文表达自然流畅，符合中文使用习惯
9. 不要添加任何解释、注释或额外内容

需要翻译的内容：
{content}

请直接返回完整的翻译结果："""

    def clean_translated_content(self, content: str) -> str:
        """清理翻译结果"""
        # 移除开头的代码块标记
        content = re.sub(r'^```\w*\n', '', content)
        content = re.sub(r'\n```$', '', content)
        
        # 移除多余的空行
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        # 确保以换行符结尾
        if not content.endswith('\n'):
            content += '\n'
        
        return content.strip() + '\n'

    def translate_content(self, content: str) -> Optional[str]:
        """使用 Sealos GPT-4o 翻译内容"""
        prompt = self.create_translation_prompt(content)
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个专业的技术文档翻译专家。你的任务是将英文技术文档翻译成自然流畅的简体中文，同时完美保持 MDX 格式。永远不要添加代码块标记，直接返回翻译后的内容。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 4000,
            "temperature": 0.1,
            "stream": False
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                print(f"  正在翻译... (尝试 {attempt + 1}/{MAX_RETRIES})")
                
                response = requests.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=120
                )
                
                if response.status_code != 200:
                    raise Exception(f"API 请求失败: {response.status_code} - {response.text}")
                
                result = response.json()
                
                if 'choices' not in result or not result['choices']:
                    raise Exception(f"API 响应格式错误: {result}")
                
                translated = result['choices'][0]['message']['content']
                
                # 清理翻译结果
                translated = self.clean_translated_content(translated)
                
                # 验证翻译质量
                if len(translated) < len(content) * 0.3:
                    print(f"  警告：翻译结果可能不完整（原文 {len(content)} 字符，译文 {len(translated)} 字符）")
                
                # 检查是否包含frontmatter
                if content.startswith('---') and not translated.startswith('---'):
                    print(f"  警告：翻译结果缺少 frontmatter")
                
                return translated
                
            except Exception as e:
                print(f"  翻译失败 (尝试 {attempt + 1}/{MAX_RETRIES}): {str(e)}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    print(f"  所有重试都失败了")
                    return None
        
        return None
    
    def needs_translation(self, content: str) -> bool:
        """更准确地判断是否需要翻译"""
        # 检查文件大小限制
        if len(content) > 20000:  # 20KB限制
            return False
        
        # 移除frontmatter进行检查
        lines = content.split('\n')
        content_without_frontmatter = []
        in_frontmatter = False
        frontmatter_count = 0
        
        for line in lines:
            if line.strip() == '---':
                frontmatter_count += 1
                in_frontmatter = frontmatter_count == 1
                continue
            if not in_frontmatter:
                content_without_frontmatter.append(line)
        
        text_to_check = '\n'.join(content_without_frontmatter)
        
        # 检查英文内容指标
        english_patterns = [
            r'\b(Using|with|How to|What is|Creating|Getting started)\b',
            r'\b(you can|we can|this is|that is|will be|can be)\b',
            r'\b(are available|is available|the following|in this article)\b',
            r'\b(Note:|Tips:|Warning:|Important:)\b',
            r'\bto (create|add|edit|delete|save|view|use|manage)\b'
        ]
        
        for pattern in english_patterns:
            if re.search(pattern, text_to_check, re.IGNORECASE):
                return True
        
        # 检查中英混杂
        mixed_patterns = [
            r'您\s+(can|will|are|is)',
            r'我们\s+(can|will|are|is)',
            r'这个\s+(is|will|can)',
            r'到\s+(create|add|edit)',
            r'在\s+(this|the|your)'
        ]
        
        for pattern in mixed_patterns:
            if re.search(pattern, text_to_check):
                return True
        
        return False

    def translate_file(self, file_path: str) -> bool:
        """翻译单个文件"""
        try:
            print(f"\n处理文件: {file_path}")
            
            # 读取文件内容
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # 检查是否需要翻译
            if not self.needs_translation(original_content):
                print("  文件已是纯中文或过大，跳过")
                self.skipped_count += 1
                return True
            
            # 翻译内容
            translated_content = self.translate_content(original_content)
            
            if translated_content is None:
                print("  翻译失败，跳过此文件")
                self.error_count += 1
                return False
            
            # 备份原文件
            backup_path = file_path + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入翻译结果
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(translated_content)
            
            print(f"  ✅ 翻译完成 (备份: {backup_path})")
            self.translated_count += 1
            
            # 添加请求延迟
            time.sleep(REQUEST_DELAY)
            return True
            
        except Exception as e:
            print(f"  ❌ 处理文件失败: {str(e)}")
            self.error_count += 1
            return False
    
    def get_mdx_files(self) -> List[str]:
        """获取所有 MDX 文件"""
        pattern = os.path.join(ZH_DIR, "**", "*.mdx")
        files = glob.glob(pattern, recursive=True)
        
        # 优先处理重要文件
        priority_files = []
        normal_files = []
        
        for file in files:
            if any(keyword in file for keyword in [
                'index.mdx', 'getting-started', 'what-is-buffer',
                'publishing', 'analytics', 'social-platforms'
            ]):
                priority_files.append(file)
            else:
                normal_files.append(file)
        
        # 返回按优先级排序的文件列表
        return sorted(priority_files) + sorted(normal_files)
    
    def test_api_connection(self) -> bool:
        """测试 API 连接"""
        print("🔍 测试 API 连接...")
        
        test_payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": "请回复：连接成功"
                }
            ],
            "max_tokens": 10
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=test_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and result['choices']:
                    print("✅ API 连接测试成功")
                    return True
            
            print(f"❌ API 连接测试失败: {response.status_code} - {response.text}")
            return False
            
        except Exception as e:
            print(f"❌ API 连接测试失败: {str(e)}")
            return False
    
    def translate_all(self):
        """翻译所有文件"""
        print("🚀 开始使用修复版 Sealos GPT-4o 翻译")
        print("=" * 60)
        print(f"📡 API 地址: {self.base_url}")
        print(f"🤖 模型: {self.model}")
        print("🔧 修复内容：")
        print("  - 解决格式问题（移除多余代码块标记）")
        print("  - 提高翻译完整性")
        print("  - 更准确的需求检测")
        
        # 测试 API 连接
        if not self.test_api_connection():
            print("❌ API 连接失败，请检查网络和配置")
            return
        
        # 检查目录
        if not os.path.exists(ZH_DIR):
            print(f"❌ 错误：目录 {ZH_DIR} 不存在")
            return
        
        # 获取文件列表
        files = self.get_mdx_files()
        if not files:
            print(f"❌ 在 {ZH_DIR} 目录下没有找到 MDX 文件")
            return
        
        print(f"📋 找到 {len(files)} 个 MDX 文件（按重要性排序）")
        
        # 处理文件
        start_time = time.time()
        
        for i, file_path in enumerate(files, 1):
            print(f"\n进度: {i}/{len(files)}")
            self.translate_file(file_path)
            
            # 每批次后休息
            if i % BATCH_SIZE == 0:
                print(f"\n💤 处理了 {BATCH_SIZE} 个文件，休息 5 秒...")
                time.sleep(5)
        
        # 统计结果
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 60)
        print("🎉 修复版翻译任务完成！")
        print(f"📊 统计信息:")
        print(f"  - 总文件数: {len(files)}")
        print(f"  - 成功翻译: {self.translated_count}")
        print(f"  - 跳过文件: {self.skipped_count}")
        print(f"  - 错误文件: {self.error_count}")
        print(f"  - 总耗时: {duration:.1f} 秒")
        
        if self.translated_count > 0:
            print(f"\n✨ 所有翻译文件都已备份（.backup 后缀）")
            print(f"🔍 建议检查几个关键文件确认翻译质量")
            
        if self.error_count > 0:
            print(f"\n⚠️  有 {self.error_count} 个文件翻译失败，请手动检查")

def main():
    """主函数"""
    try:
        print("🔧 修复版 Sealos GPT-4o 翻译工具")
        print("⚠️  此版本解决了以下问题：")
        print("   - 格式错误（多余的代码块标记）")
        print("   - 翻译不完整")
        print("   - 中英混杂")
        print("")
        print("⚠️  警告：此操作将会覆盖 zh/ 目录下的 MDX 文件")
        print("   原文件将被备份为 .backup 后缀")
        
        confirm = input("是否继续？(y/N): ").strip().lower()
        
        if confirm != 'y':
            print("操作已取消")
            sys.exit(0)
        
        # 开始翻译
        translator = FixedSealosTranslator()
        translator.translate_all()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  操作被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 发生错误: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
