#!/bin/bash

# Sonnet 自动翻译脚本启动器
# 使用方法: ./scripts/run_translation.sh

echo "🚀 Aitoearn 文档 Sonnet 自动翻译工具"
echo "========================================"

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python3"
    echo "请先安装 Python3"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
if ! python3 -c "import anthropic" 2>/dev/null; then
    echo "📥 安装 anthropic 依赖..."
    pip3 install anthropic
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖检查通过"
fi

# 检查 API Key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo ""
    echo "⚠️  未检测到 ANTHROPIC_API_KEY 环境变量"
    echo "请输入您的 Anthropic API Key："
    read -s api_key
    export ANTHROPIC_API_KEY="$api_key"
    echo ""
fi

# 检查目录
if [ ! -d "zh" ]; then
    echo "❌ 错误：当前目录不存在 zh/ 文件夹"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

# 显示文件统计
mdx_count=$(find zh/ -name "*.mdx" | wc -l)
echo "📋 检测到 $mdx_count 个 MDX 文件"

# 预估费用和时间
echo "💰 预估费用：\$2-5 USD"
echo "⏱️  预估时间：20-30 分钟"
echo ""

# 确认执行
echo "⚠️  注意事项："
echo "   1. 此操作会覆盖 zh/ 目录下的 MDX 文件"
echo "   2. 原文件会自动备份（.backup 后缀）"
echo "   3. 翻译过程中请保持网络连接稳定"
echo ""

read -p "确认开始翻译？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

# 开始翻译
echo "🎯 开始翻译..."
python3 scripts/sonnet_translate.py

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "🎉 翻译完成！"
    echo ""
    echo "📋 后续步骤："
    echo "   1. 检查翻译质量：cat zh/index.mdx"
    echo "   2. 启动开发服务器：npx mintlify dev"
    echo "   3. 测试页面显示：http://localhost:3000/zh"
    echo "   4. 如满意，清理备份：find zh/ -name '*.backup' -delete"
    echo ""
    echo "🔧 如需回滚："
    echo "   find zh/ -name '*.backup' | while read backup; do"
    echo "     mv \"\$backup\" \"\${backup%.backup}\""
    echo "   done"
else
    echo ""
    echo "❌ 翻译过程中出现错误"
    echo "请检查错误信息并重试"
fi
