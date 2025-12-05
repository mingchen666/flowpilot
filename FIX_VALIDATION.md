# 模型验证失败问题修复

## 问题
虽然使用 curl 直接调用 API 成功，但在 FlowPilot 中验证模型配置时失败。

## 根本原因分析

### 1. **缺少 `maxTokens` 参数**
你的 curl 测试中使用了 `max_tokens: 50`，但 FlowPilot 的验证 API 没有传递这个参数。某些模型可能要求必须设置 `maxTokens`。

### 2. **超时时间计算错误**
```typescript
// ❌ 错误：requestMaxDuration 已经是秒，但又乘以 1000
const testMaxDuration = Math.min((requestMaxDuration ?? 30) * 1000, 60000);
await generateText({
  abortSignal: AbortSignal.timeout(testMaxDuration), // 这里得到的是超大的数字
});
```

应该改为：
```typescript
// ✅ 正确：保持秒为单位
const testMaxDuration = Math.min((requestMaxDuration ?? 30), 60);
await generateText({
  abortSignal: AbortSignal.timeout(testMaxDuration * 1000), // 转换为毫秒
});
```

### 3. **错误日志不够详细**
之前的错误处理没有记录 AI SDK 的 `cause` 字段，导致难以诊断真实错误。

## 修复内容

### 文件：`app/api/model-validation/route.ts`

#### 修复 1: 使用正确的参数名 `maxOutputTokens`
```typescript
const result = await generateText({
  model: resolvedModel.model,
  messages: [{ role: "user", content: "Hi" }],
  maxOutputTokens: 50,  // ✅ AI SDK 标准参数名（不是 maxTokens 或 max_tokens）
  temperature: 0,
  maxRetries: 1,
  abortSignal: AbortSignal.timeout(testMaxDuration * 1000),
});
```

**原因**: 
- ❌ `maxTokens` - 旧版本的参数名，已弃用
- ❌ `max_tokens` - OpenAI API 的原始参数名，但 AI SDK 不直接使用
- ✅ `maxOutputTokens` - AI SDK v5+ 的标准参数名

根据 [AI SDK 官方文档](https://ai-sdk.dev/docs/ai-sdk-core/settings)，`maxOutputTokens` 是控制生成 token 数量的正确参数。

#### 修复 2: 修正超时计算
```typescript
// ✅ testMaxDuration 保持为秒
const testMaxDuration = Math.min((requestMaxDuration ?? 30), 60);

// ✅ 传给 AbortSignal 时转换为毫秒
abortSignal: AbortSignal.timeout(testMaxDuration * 1000)
```

#### 修复 3: 增强错误日志
```typescript
console.error("模型验证失败:", {
  error: modelError,
  message: modelError.message,
  cause: modelError.cause,  // ✅ 新增
  stack: modelError.stack?.split('\n').slice(0, 5).join('\n'),
});

// ✅ 检查 cause 字段获取更详细的错误信息
if (modelError.cause) {
  const cause = modelError.cause;
  if (cause.message) {
    errorDetails = cause.message;
  }
  if (cause.response) {
    console.error("API 响应错误:", {
      status: cause.response.status,
      statusText: cause.response.statusText,
    });
  }
}
```

## 测试方法

### 方法 1: 使用测试脚本（推荐）
```bash
cd /Users/huangtao/WebstormProjects/flowpilot
./test-validation.sh
```

这会自动测试：
1. ✅ 直接 API 调用（curl）
2. ✅ FlowPilot 验证 API

### 方法 2: 浏览器手动测试
1. 启动开发服务器：`npm run dev`
2. 打开 FlowPilot
3. 点击「配置」→「添加接口」
4. 填写：
   - Base URL: `https://www.linkflow.run/v1`
   - API Key: `sk-7oflvgMRXPZe0skck0qIqsFuDSvOBKiMqqGiC0Sx9gzAsALh`
5. 添加模型：`claude-sonnet-4-5-20250929`
6. 点击「验证」按钮
7. 查看浏览器控制台和终端日志

## 预期结果

### 成功时：
```
✅ 验证成功
   响应时间: 1234ms
   Token 使用: 72 tokens
   测试响应: Hello! I'm Claude...
```

### 失败时：
终端会显示详细的错误日志，包括：
- 错误类型（401/403/404/timeout等）
- 错误详情（cause、response等）
- 堆栈跟踪（前5行）

## 调试建议

如果问题仍然存在，请：

1. **查看终端日志**：运行 `npm run dev` 的终端窗口会显示详细的服务端日志
2. **查看浏览器控制台**：F12 打开开发者工具，查看网络请求
3. **运行测试脚本**：`./test-validation.sh` 会对比两种调用方式
4. **提供完整日志**：包括终端和浏览器控制台的完整错误信息

## 额外优化进（可选）
1. 在前端添加重试机制
2. 增加验证超时时间的 UI 配置
3. 显示更友好的错误提示
4. 缓存验证结果（避免重复验证）

## 相关文件
- `app/api/model-validation/route.ts` - 后端验证 API
- `components/model-config-dialog.tsx` - 前端配置界面
- `lib/server-models.ts` - 模型解析逻辑
- `test-validation.sh` - 测试脚本
- `TEST_VALIDATION.md` - 详细诊断文档
