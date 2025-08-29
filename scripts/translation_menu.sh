#!/bin/bash

# 翻译方案选择菜单
echo "🌐 Aitoearn 文档翻译工具"
echo "=========================="
echo ""
echo "请选择翻译方案："
echo ""
echo "1. 📡 使用 Anthropic Claude API (推荐)"
echo "   - 最高质量翻译"
echo "   - 全自动处理"
echo "   - 需要 API Key ($2-5)"
echo ""
echo "2. 🤖 使用 OpenAI GPT-4 API"
echo "   - 高质量翻译"
echo "   - 全自动处理" 
echo "   - 需要 API Key ($5-10)"
echo ""
echo "3. ✍️  使用 Cursor 手动翻译 (免费)"
echo "   - 利用 Cursor 内置 AI"
echo "   - 手动操作，可控性强"
echo "   - 无需 API Key"
echo ""
echo "4. ❌ 取消"
echo ""

read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📡 启动 Anthropic Claude 翻译..."
        
        if [ -z "$ANTHROPIC_API_KEY" ]; then
            echo "请输入 Anthropic API Key:"
            read -s api_key
            export ANTHROPIC_API_KEY="$api_key"
        fi
        
        echo "安装依赖..."
        pip3 install anthropic
        
        echo "开始翻译..."
        python3 scripts/sonnet_translate.py
        ;;
        
    2)
        echo ""
        echo "🤖 启动 OpenAI GPT-4 翻译..."
        
        if [ -z "$OPENAI_API_KEY" ]; then
            echo "请输入 OpenAI API Key:"
            read -s api_key
            export OPENAI_API_KEY="$api_key"
        fi
        
        echo "安装依赖..."
        pip3 install openai
        
        echo "开始翻译..."
        python3 scripts/openai_translate.py
        ;;
        
    3)
        echo ""
        echo "✍️  启动 Cursor 翻译助手..."
        python3 scripts/cursor_translate_helper.py
        
        echo ""
        echo "🎯 下一步操作："
        echo "1. 在 Cursor 中按照上述说明逐个翻译文件"
        echo "2. 翻译完成后可运行: npx mintlify dev"
        echo "3. 检查效果: http://localhost:3000/zh"
        ;;
        
    4)
        echo "操作已取消"
        exit 0
        ;;
        
    *)
        echo "无效选择，请重新运行脚本"
        exit 1
        ;;
esac
