# 模型验证问题诊断

## 问题描述
虽然 curl 测试可以成功调用 API：
```bash
curl -X POST "https://www.linkflow.run/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-7oflvgMRXPZe0skck0qIqsFuDSvOBKiMqqGiC0Sx9gzAsALh" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "messages": [{"role": "user", "content": "Hi"}],
    "max_tokens": 50
  }'
```

但在 FlowPilot 中验证时却失败。

## 可能的原因

### 1. AI SDK 请求格式问题
AI SDK (`@ai-sdk/openai`) 会自动处理 OpenAI 兼容的 API 请求，但可能有以下差异：
- 请求头格式
- 请求体字段映射
- 超时处理

### 2. 已修复的问题

#### 问题 A: 缺少 `maxTokens` 参数
**修复前**:
```typescript
const result = await generateText({
  model: resolvedModel.model,
  messages: [...],
  temperature: 0,
  // ❌ 缺少 maxTokens
});
```

**修复后**:
```typescript
const result = await generateText({
  model: resolvedModel.model,
  messages: [...],
  maxTokens: 50,  // ✅ 添加 maxTokens
  temperature: 0,
});
```

#### 问题 B: 超时时间单位错误
**修复前**:
```typescript
// requestMaxDuration 已经是秒，但又乘以 1000
const testMaxDuration = Math.min((requestMaxDuration ?? 30) * 1000, 60000);
```

**修复后**:
```typescript
// 保持秒为单位，传给 AbortSignal 时才转换
const testMaxDuration = Math.min((requestMaxDuration ?? 30), 60);
const result = await generateText({
  ...
  abortSignal: AbortSignal.timeout(testMaxDuration * 1000),
});
```

#### 问题 C: 错误日志不完整
**改进**: 添加了更详细的错误日志，包括 `cause`、`response` 等信息。

## 测试步骤

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 打开浏览器控制台
打开 FlowPilot → 打开浏览器开发者工具 (F12) → Console 标签

### 3. 配置模型并验证
1. 点击「配置」按钮
2. 添加新接口：
   - **Base URL**: `https://www.linkflow.run/v1`
   - **API Key**: `sk-7oflvgMRXPZe0skck0qIqsFuDSvOBKiMqqGiC0Sx9gzAsALh`
3. 添加模型：
   - **模型 ID**: `claude-sonnet-4-5-20250929`
4. 点击「验证」按钮

### 4. 查看控制台日志
在浏览器控制台和终端（运行 dev server 的地方）查看详细日志：

**浏览器控制台** - 前端日志
**终端** - 后端 API 日志，会显示：
```
开始验证模型配置: { baseUrl: '...', modelId: '...', hasApiKey: true }
模型解析成功，准备发送测试请求
模型验证成功: { modelId: '...', duration: '...', ... }
```

或错误信息：
```
模型验证失败: { error: ..., message: ..., cause: ..., stack: ... }
```

## 常见错误及解决方案

### 错误 1: "模型 ID 不存在或不可用"
**原因**: API 返回模型不存在
**解决**: 确认模型 ID 拼写正确，或者该 API Key 有权限访问该模型

### 错误 2: "API Key 无效或已过期"
**原因**: 401 错误
**解决**: 检查 API Key 是否正确，是否有前后空格

### 错误 3: "请求超时"
**原因**: 网络问题或 Base URL 错误
**解决**: 
- 检查网络连接
- 确认 Base URL 末尾没有多余的 `/`
- 尝试增加超时时间

### 错误 4: "API 接口未找到"
**原因**: 404 错误，Base URL 可能不完整
**解决**: 确保 Base URL 包含完整路径，例如 `https://api.example.com/v1`（而不是 `https://api.example.com`）

## 调试技巧

### 查看完整请求
在 `lib/server-models.ts` 的 `resolveChatModel` 函数中添加日志：

```typescript
export function rolveChatModel(runtime?: RuntimeModelConfig): ResolvedModel {
  console.log("Creating OpenAI client:", {
    baseURL: normalizedBaseUrl,
    modelId: runtime.modelId,
  });
  
  const client = createOpenAI({
    apiKey: runtime.apiKey,
    baseURL: normalizedBaseUrl,
  });
  
  return { ... };
}
```

### 对比 curl 和 AI SDK 请求
你可以使用工具如 [Proxyman](https://proxyman.io/) 或 [Charles Proxy](https://www.charlesproxy.com/) 拦截 HTTP 请求，对比两者的差异。

## 预期结果

修复后，验证应该成功并显示：
- ✅ 绿色的"通过"状态
- 响应时间（如 `1234ms`）
- Token 使用信息

## 如果问题仍然存在

请提供以下信息：
1. **浏览器控制台**的完整错误日志
2. **终端（dev server）**的完整错误日志
3. 使用的配置（Base URL、模型 ID）
4. curl 测试的完整响应
