#!/bin/bash

# 模型验证测试脚本

echo "🔍 测试模型验证 API"
echo "===================="
echo ""

BASE_URL="https://www.linkflow.run/v1"
API_KEY="sk-7oflvgMRXPZe0skck0qIqsFuDSvOBKiMqqGiC0Sx9gzAsALh"
MODEL_ID="claude-sonnet-4-5-20250929"

echo "📝 测试配置："
echo "  Base URL: $BASE_URL"
echo "  Model ID: $MODEL_ID"
echo "  API Key: ${API_KEY:0:10}..."
echo ""

echo "1️⃣ 测试直接 API 调用 (curl)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"model\": \"$MODEL_ID\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Hi\"}],
    \"max_tokens\": 50
  }" | jq -r 'if .error then "❌ 错误: \(.error.message)" else "✅ 成功: \(.choices[0].message.content[0:50])..." end'

echo ""
echo ""

echo "2️⃣ 测试 FlowPilot 验证 API (localhost:3000)"
echo "--------------------------------------------"

# 检查服务是否运行
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "⚠️  警告: FlowPilot 开发服务器未运行"
  echo "   请先运行: npm run dev"
  exit 1
fi

RESPONSE=$(curl -s -X POST "http://localhost:3000/api/model-validation" \
  -H "Content-Type: application/json" \
  -d "{
    \"baseUrl\": \"$BASE_URL\",
    \"apiKey\": \"$API_KEY\",
    \"modelId\": \"$MODEL_ID\"
  }")

echo "$RESPONSE" | jq -r '
  if .success then
    "✅ 验证成功\n" +
    "   响应时间: \(.details.responseTime)\n" +
    "   Token 使用: \(.details.tokensUsed.total) tokens\n" +
    "   测试响应: \(.details.testResponse)"
  else
    "❌ 验证失败\n" +
    "   错误: \(.error)\n" +
    "   详情: \(.details)"
  end
'

echo ""
echo "===================="
echo "💡 提示: 如果验证失败，请检查终端中的详细日志"
