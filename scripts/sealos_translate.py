#!/usr/bin/env python3
"""
使用 Sealos 代理的 GPT-4o 模型自动翻译 zh/ 目录下的所有 MDX 文件
使用代理地址: https://api.sealos.vip/v1/chat/completions
"""

import os
import sys
import time
import glob
import json
import requests
from pathlib import Path
from typing import List, Optional

# 配置
ZH_DIR = "zh"
MAX_RETRIES = 3
RETRY_DELAY = 2  # 秒
BATCH_SIZE = 5   # 每批处理的文件数
REQUEST_DELAY = 1  # 请求间隔，避免频率限制

# Sealos API 配置
API_BASE_URL = "https://api.sealos.vip/v1/chat/completions"
API_KEY = "sk-Q6QjUSH6JRYzo5EbEe8c5b2cA43f4613970cE37f450482E9"
MODEL = "gpt-4o"

class SealosTranslator:
    def __init__(self):
        """初始化 Sealos 翻译器"""
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
        """创建翻译提示词"""
        return f"""你是一个专业的技术文档翻译专家。请将以下 MDX 文档内容翻译成自然流畅的简体中文。

翻译要求：
1. 保持 MDX 格式完整（frontmatter、组件、链接等）
2. 只翻译文本内容，保留所有 HTML 标签、组件语法、链接地址
3. 保持专业术语的准确性
4. 确保语言自然流畅，符合中文表达习惯
5. 保留品牌名称 "Aitoearn"
6. 保留社交平台名称（Instagram、Facebook、LinkedIn 等）
7. 不要添加任何解释或评论，只返回翻译后的内容

需要翻译的内容：

{content}"""

    def translate_content(self, content: str) -> Optional[str]:
        """使用 Sealos GPT-4o 翻译内容"""
        prompt = self.create_translation_prompt(content)
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个专业的技术文档翻译专家，专门将英文技术文档翻译成自然流畅的简体中文。"
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
                
                translated = result['choices'][0]['message']['content'].strip()
                
                # 基本验证
                if len(translated) < len(content) * 0.3:
                    print(f"  警告：翻译结果可能不完整（原文 {len(content)} 字符，译文 {len(translated)} 字符）")
                
                return translated
                
            except Exception as e:
                print(f"  翻译失败 (尝试 {attempt + 1}/{MAX_RETRIES}): {str(e)}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    print(f"  所有重试都失败了")
                    return None
        
        return None
    
    def should_translate_file(self, file_path: str) -> bool:
        """判断文件是否需要翻译"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查文件大小，跳过过大的文件
            if len(content) > 15000:  # 约15KB限制
                print(f"  文件过大({len(content)}字符)，建议手动翻译")
                return False
            
            # 检查是否有英文内容（简单启发式）
            english_indicators = [
                'Using ', 'with Aitoearn', 'How to', 'What is',
                'Creating ', 'Getting started', 'you can',
                'we can', 'this is', 'that is', 'will be',
                'can be', 'are available', 'is available',
                'the following', 'in this article'
            ]
            
            for indicator in english_indicators:
                if indicator in content:
                    return True
            
            # 检查中英混杂
            mixed_indicators = [
                '您 can', '您 will', '我们 can', '这个 is',
                '那个 is', '到 create', '到 add', '在 this',
                'with 您的', 'and 您的', 'for 您的', 'of 您的'
            ]
            
            for indicator in mixed_indicators:
                if indicator in content:
                    return True
            
            return False
            
        except Exception as e:
            print(f"  检查文件失败: {str(e)}")
            return False
    
    def translate_file(self, file_path: str) -> bool:
        """翻译单个文件"""
        try:
            print(f"\n处理文件: {file_path}")
            
            # 读取文件内容
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # 检查是否需要翻译
            if not self.should_translate_file(file_path):
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
        """获取所有需要翻译的 MDX 文件"""
        pattern = os.path.join(ZH_DIR, "**", "*.mdx")
        files = glob.glob(pattern, recursive=True)
        files.sort()  # 按文件名排序，便于跟踪进度
        return files
    
    def test_api_connection(self) -> bool:
        """测试 API 连接"""
        print("🔍 测试 API 连接...")
        
        test_payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": "你好，请回复'连接成功'"
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
        print("🚀 开始使用 Sealos GPT-4o 翻译 zh/ 目录下的 MDX 文件")
        print("=" * 60)
        print(f"📡 API 地址: {self.base_url}")
        print(f"🤖 模型: {self.model}")
        
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
        
        print(f"📋 找到 {len(files)} 个 MDX 文件")
        
        # 处理文件
        start_time = time.time()
        
        for i, file_path in enumerate(files, 1):
            print(f"\n进度: {i}/{len(files)}")
            self.translate_file(file_path)
            
            # 每批次后短暂休息
            if i % BATCH_SIZE == 0:
                print(f"\n💤 处理了 {BATCH_SIZE} 个文件，休息 3 秒...")
                time.sleep(3)
        
        # 统计结果
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 60)
        print("🎉 翻译任务完成！")
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
        # 确认操作
        print("⚠️  警告：此操作将会覆盖 zh/ 目录下的所有 MDX 文件")
        print("   原文件将被备份为 .backup 后缀")
        print("   使用 Sealos 代理 GPT-4o 模型进行翻译")
        confirm = input("是否继续？(y/N): ").strip().lower()
        
        if confirm != 'y':
            print("操作已取消")
            sys.exit(0)
        
        # 开始翻译
        translator = SealosTranslator()
        translator.translate_all()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  操作被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 发生错误: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
