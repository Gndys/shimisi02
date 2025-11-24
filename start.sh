#!/bin/bash

echo "🚀 启动表5工资表生成系统..."
echo ""
echo "📂 项目目录: $(pwd)"
echo ""
echo "🌐 启动本地服务器..."
echo "   访问地址: http://localhost:8000"
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务器"
echo ""
echo "----------------------------------------"
echo ""

# 启动 Python HTTP 服务器
python3 -m http.server 8000
