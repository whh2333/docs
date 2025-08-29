#!/usr/bin/env python3
"""
修复已翻译文件的格式问题
移除多余的代码块标记，清理格式
"""

import os
import glob
import re

def fix_file_format(file_path: str) -> bool:
    """修复单个文件的格式问题"""
    try:
        print(f"修复文件: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 移除开头的代码块标记
        content = re.sub(r'^```\w*\n', '', content)
        content = re.sub(r'\n```$', '', content)
        
        # 移除其他位置的多余代码块标记
        content = re.sub(r'^```mdx\n', '', content, flags=re.MULTILINE)
        content = re.sub(r'^```md\n', '', content, flags=re.MULTILINE)
        
        # 清理多余的空行
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        # 确保以换行符结尾
        if not content.endswith('\n'):
            content += '\n'
        
        # 如果内容有变化，写入文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ 修复完成")
            return True
        else:
            print(f"  ⏭️  无需修复")
            return False
            
    except Exception as e:
        print(f"  ❌ 修复失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("🔧 修复已翻译文件的格式问题")
    print("=" * 40)
    
    # 获取所有 MDX 文件
    pattern = os.path.join("zh", "**", "*.mdx")
    files = glob.glob(pattern, recursive=True)
    
    print(f"📋 找到 {len(files)} 个 MDX 文件")
    
    fixed_count = 0
    for file_path in files:
        if fix_file_format(file_path):
            fixed_count += 1
    
    print("\n" + "=" * 40)
    print(f"🎉 格式修复完成！")
    print(f"📊 修复了 {fixed_count} 个文件")
    
    if fixed_count > 0:
        print("\n✨ 建议检查几个文件确认修复效果")

if __name__ == "__main__":
    main()
