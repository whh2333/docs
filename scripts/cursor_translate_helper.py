#!/usr/bin/env python3
"""
Cursor 翻译辅助工具
生成翻译提示词，让您在 Cursor 中高效地翻译文档
"""

import os
import glob
from pathlib import Path

def get_translation_prompt(content: str) -> str:
    """生成适合 Cursor 的翻译提示词"""
    return f"""请将以下 MDX 文档内容翻译成自然流畅的简体中文。

翻译要求：
1. 保持 MDX 格式完整（frontmatter、组件、链接等）
2. 只翻译文本内容，保留所有 HTML 标签、组件语法、链接地址
3. 保持专业术语的准确性
4. 确保语言自然流畅，符合中文表达习惯
5. 保留品牌名称 "Aitoearn"
6. 保留社交平台名称（Instagram、Facebook、LinkedIn 等）
7. 不要添加任何解释或评论，只返回翻译后的内容

需要翻译的内容：

{content}

请直接返回翻译后的完整内容："""

def should_translate_file(file_path: str) -> bool:
    """判断文件是否需要翻译"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否有英文内容
        english_indicators = [
            'Using ', 'with Aitoearn', 'How to', 'What is',
            'Creating ', 'Getting started', 'you can',
            'we can', 'this is', 'that is', 'will be',
            'can be', 'are available', 'is available'
        ]
        
        for indicator in english_indicators:
            if indicator in content:
                return True
        
        # 检查中英混杂
        mixed_indicators = [
            '您 can', '您 will', '我们 can', '这个 is',
            '到 create', '到 add', '在 this'
        ]
        
        for indicator in mixed_indicators:
            if indicator in content:
                return True
        
        return False
        
    except Exception as e:
        print(f"检查文件失败: {str(e)}")
        return False

def get_files_to_translate():
    """获取需要翻译的文件列表"""
    pattern = os.path.join("zh", "**", "*.mdx")
    files = glob.glob(pattern, recursive=True)
    
    # 过滤需要翻译的文件
    files_to_translate = []
    for file_path in files:
        if should_translate_file(file_path):
            files_to_translate.append(file_path)
    
    return sorted(files_to_translate)

def main():
    """主函数"""
    print("🔧 Cursor 翻译辅助工具")
    print("=" * 50)
    
    files = get_files_to_translate()
    
    if not files:
        print("✅ 所有文件都已是纯中文，无需翻译")
        return
    
    print(f"📋 找到 {len(files)} 个需要翻译的文件：")
    for i, file_path in enumerate(files, 1):
        print(f"  {i}. {file_path}")
    
    print("\n" + "=" * 50)
    print("📝 使用方法：")
    print("1. 在 Cursor 中打开需要翻译的文件")
    print("2. 选中全部内容（Cmd/Ctrl + A）")
    print("3. 打开 Cursor Chat (Cmd/Ctrl + L)")
    print("4. 输入以下翻译提示词：")
    print("\n" + "-" * 30)
    
    # 生成通用翻译提示词
    sample_prompt = """请将选中的 MDX 文档内容翻译成自然流畅的简体中文。

翻译要求：
1. 保持 MDX 格式完整（frontmatter、组件、链接等）
2. 只翻译文本内容，保留所有 HTML 标签、组件语法、链接地址
3. 保持专业术语的准确性
4. 确保语言自然流畅，符合中文表达习惯
5. 保留品牌名称 "Aitoearn"
6. 保留社交平台名称（Instagram、Facebook、LinkedIn 等）
7. 不要添加任何解释或评论，只返回翻译后的完整内容

请直接返回翻译后的完整内容。"""
    
    print(sample_prompt)
    print("-" * 30)
    
    print("\n📋 建议翻译顺序（按重要性）：")
    
    # 按重要性排序
    priority_files = []
    normal_files = []
    
    for file_path in files:
        if any(keyword in file_path for keyword in [
            'index.mdx', 'getting-started', 'what-is-buffer',
            'publishing', 'analytics', 'social-platforms'
        ]):
            priority_files.append(file_path)
        else:
            normal_files.append(file_path)
    
    print("\n🔥 高优先级文件：")
    for i, file_path in enumerate(priority_files, 1):
        print(f"  {i}. {file_path}")
    
    print("\n📄 普通文件：")
    for i, file_path in enumerate(normal_files, 1):
        print(f"  {i}. {file_path}")
    
    print("\n" + "=" * 50)
    print("💡 提示：")
    print("- 每次翻译完成后，记得保存文件")
    print("- 建议先翻译几个重要文件测试效果")
    print("- 可以使用 Cursor 的 'Apply' 功能直接应用翻译结果")
    print("- 翻译大文件时可能需要分段进行")

if __name__ == "__main__":
    main()
