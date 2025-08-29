# Sonnet 自动翻译脚本使用指南

这个 Python 脚本使用 Claude Sonnet 模型自动翻译 zh/ 目录下的所有 MDX 文件。

## 安装依赖

```bash
# 安装 Anthropic Python SDK
pip install anthropic
```

## 设置 API Key

### 方法1: 环境变量（推荐）
```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 方法2: 添加到 shell 配置文件
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
echo 'export ANTHROPIC_API_KEY="your-anthropic-api-key"' >> ~/.bashrc
source ~/.bashrc
```

## 使用方法

```bash
# 在项目根目录运行
cd /Users/wanghonghao/Documents/GitHub/docs
python scripts/sonnet_translate.py
```

## 脚本功能

### 智能检测
- 自动检测哪些文件需要翻译（包含英文或中英混杂）
- 跳过已经是纯中文的文件，提高效率

### 安全备份
- 自动备份原文件（添加 .backup 后缀）
- 翻译失败时不会覆盖原文件

### 批量处理
- 支持递归处理子目录
- 智能错误重试机制
- 请求频率控制，避免 API 限制

### 翻译质量
- 使用 Claude 3.5 Sonnet 模型
- 专业的技术文档翻译提示词
- 保持 MDX 格式完整
- 保留品牌名称和专业术语

## 脚本配置

可以在脚本顶部调整以下参数：

```python
MAX_RETRIES = 3      # 最大重试次数
RETRY_DELAY = 2      # 重试延迟（秒）
BATCH_SIZE = 5       # 每批处理文件数
REQUEST_DELAY = 1    # 请求间隔（秒）
```

## 运行示例

```bash
$ python scripts/sonnet_translate.py

⚠️  警告：此操作将会覆盖 zh/ 目录下的所有 MDX 文件
   原文件将被备份为 .backup 后缀
是否继续？(y/N): y

🚀 开始使用 Claude Sonnet 翻译 zh/ 目录下的 MDX 文件
============================================================
📋 找到 129 个 MDX 文件

进度: 1/129
处理文件: zh/index.mdx
  正在翻译... (尝试 1/3)
  ✅ 翻译完成 (备份: zh/index.mdx.backup)

进度: 2/129
处理文件: zh/quickstart.mdx
  文件已是纯中文，跳过

...

============================================================
🎉 翻译任务完成！
📊 统计信息:
  - 总文件数: 129
  - 成功翻译: 95
  - 跳过文件: 30
  - 错误文件: 4
  - 总耗时: 1230.5 秒

✨ 所有翻译文件都已备份（.backup 后缀）
🔍 建议检查几个关键文件确认翻译质量
```

## 错误处理

### 常见错误及解决方案

1. **API Key 错误**
   ```
   ❌ 错误：请设置 ANTHROPIC_API_KEY 环境变量
   ```
   解决：检查并重新设置 API Key

2. **网络连接错误**
   ```
   翻译失败 (尝试 1/3): Connection error
   ```
   解决：脚本会自动重试，检查网络连接

3. **API 频率限制**
   ```
   翻译失败 (尝试 1/3): Rate limit exceeded
   ```
   解决：脚本会自动延迟重试，或增加 REQUEST_DELAY 参数

## 质量检查

翻译完成后，建议检查以下文件：

```bash
# 检查关键页面
cat zh/index.mdx
cat zh/help-center/getting-started/598-what-is-buffer-and-where-can-i-watch-a-demo.mdx
cat zh/help-center/publishing/656-saving-and-scheduling-draft-posts.mdx

# 检查是否还有中英混杂
grep -r "您 can\|您 will\|我们 can\|这个 is" zh/ | head -10
```

## 回滚操作

如果翻译结果不满意，可以快速回滚：

```bash
# 恢复所有备份文件
find zh/ -name "*.backup" | while read backup; do
    original="${backup%.backup}"
    mv "$backup" "$original"
    echo "恢复: $original"
done

# 或者只恢复特定文件
mv zh/index.mdx.backup zh/index.mdx
```

## 清理备份文件

翻译满意后，清理备份文件：

```bash
# 删除所有备份文件
find zh/ -name "*.backup" -delete

# 统计清理的文件数
find zh/ -name "*.backup" | wc -l
```

## 注意事项

1. **API 费用**：使用 Claude API 会产生费用，大约 129 个文件预计费用 $2-5
2. **网络稳定**：确保网络连接稳定，翻译过程可能需要 20-30 分钟
3. **备份重要**：脚本会自动备份，但建议运行前手动备份整个 zh/ 目录
4. **质量检查**：翻译完成后务必检查关键页面的翻译质量

## 高级用法

### 只翻译特定文件
```python
# 修改脚本中的 get_mdx_files 方法
def get_mdx_files(self) -> List[str]:
    # 只翻译特定模式的文件
    return [
        "zh/help-center/publishing/656-saving-and-scheduling-draft-posts.mdx",
        "zh/help-center/analytics/523-linkedin-metric-descriptions.mdx"
    ]
```

### 自定义翻译提示词
修改 `create_translation_prompt` 方法中的提示词来调整翻译风格。
