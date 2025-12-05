# SVG 消息显示优化

## 问题描述
在转绘功能中，用户消息会携带被转绘的 SVG 内容。之前的实现存在两个问题：
1. **界面显示问题**：SVG 直接渲染时占用大量空间，影响对话流畅性
2. **性能问题**：大型 SVG 会导致页面渲染缓慢
3. **提取错误**：从消息文本中提取 SVG 时，正则表达式匹配不准确，导致将整个提示词文本（包括 "Convert this SVG..."）都当作 SVG 编码，造成图片显示为空白

## 解决方案
1. 修改了 `components/message-item.tsx` 中的 SVG 显示逻辑（使用 `<img>` 标签而非直接渲染 SVG DOM）
2. 修改了 `components/chat-message-display-optimized.tsx` 中的 SVG 提取逻辑（改进正则表达式，精确提取 SVG 内容）

### 修改前（message-item.tsx）
```tsx
// 直接渲染 SVG 矢量图
if (part.mediaType === "image/svg+xml" && part.url?.startsWith("data:image/svg+xml")) {
    const svgContent = decodeURIComponent(part.url.replace(/^data:image\/svg\+xml[^,]*,/, ""));
    return (
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    );
}
```

### 修改后（message-item.tsx）
```tsx
// 使用原生 <img> 标签预览 SVG（Next.js Image 组件不支持 SVG data URL）
if (part.mediaType === "image/svg+xml" && part.url?.startsWith("data:image/svg+xml")) {
    return (
        <button onClick={() => setPreviewImage(part.url)}>
            <img 
                src={part.url} 
                alt={`svg-${index}`}
                className="max-w-full max-h-full object-contain p-2"
            />
        </button>
    );
}
```

### 修改前（chat-message-display-optimized.tsx）
```tsx
// 提取 SVG 的正则表达式不准确
const codeBlockMatch = rawText.match(/```svg\\n([\\s\\S]*?)```/i);
const inlineMatch = rawText.includes("<svg") ? rawText : null;
const svgPayload = codeBlockMatch?.[1] || inlineMatch;  // ❌ 会将整个 rawText 当作 SVG
```

### 修改后（chat-message-display-optimized.tsx）
```tsx
// 改进的 SVG 提取逻辑
const codeBlockMatch = rawText.match(/```svg\s*\n([\s\S]*?)```/i);
let svgPayload = codeBlockMatch?.[1];

if (!svgPayload && rawText.includes("<svg")) {
    // 尝试提取从 <svg 到 </svg> 的内容
    const svgMatch = rawText.match(/(<svg[\s\S]*?<\/svg>)/i);
    if (svgMatch) {
        svgPayload = svgMatch[1];
    }
}

const dataUrl = svgPayload ? svgToDataUrl(svgPayload.trim()) : null;
```

## 优势
1. ✅ **界面整洁**：SVG 以小尺寸缩略图形式展示（160x120px）
2. ✅ **性能优化**：避免直接渲染大型 SVG DOM
3. ✅ **数据完整性**：`part.url` 中仍然保留完整的 SVG code（data URL 格式），大模型仍然可以获取完整的 SVG 数据
4. ✅ **交互友好**：点击缩略图可以放大预览
5. ✅ **精确提取**：改进的正则表达式能准确从 markdown 代码块或文本中提取 SVG 内容，避免误将提示词编码为图片

## 技术细节
- SVG 数据以 `data:image/svg+xml` 格式存储在 `part.url` 中
- **使用原生 `<img>` 标签而非 Next.js `<Image>` 组件**：Next.js 的 Image 组件对 SVG data URL 的支持有限，会导致图片无法显示
- **改进的 SVG 提取逻辑**：
  1. 优先尝试匹配 markdown 代码块 ` ```svg\n...\n``` `
  2. 如果失败，则尝试从文本中提取 `<svg>...</svg>` 标签对
  3. 在提取到的 SVG 内容上调用 `svgToDataUrl()`，而非整个消息文本
- 点击图片会触发放大预览弹窗，预览窗口也使用原生 `<img>` 标签确保正确渲染
- 发送给 AI 的消息中，`part.url` 保持不变，确保 AI 能够获取完整的 SVG code

## 影响范围
- `components/message-item.tsx` - SVG 文件显示组件
- 适用场景：
  - 转绘功能中的 SVG 转 Draw.io 请求
  - 其他任何包含 SVG 附件的用户消息

## 测试建议
1. 在转绘功能中上传一个大型 SVG 文件
2. 确认对话中显示为小型缩略图
3. 点击缩略图验证放大预览功能
4. 确认大模型能正常处理 SVG 转绘请求

## 相关文件
- `components/message-item.tsx` - 消息展示组件（修改 SVG 渲染方式）
- `components/chat-message-display-optimized.tsx` - 消息列表容器（修改 SVG 提取逻辑）
- `components/chat-panel-optimized.tsx` - 转绘功能入口
- `lib/svg.ts` - SVG 工具函数（`svgToDataUrl`）

## 核心改动
### 1. SVG 提取逻辑优化
**文件**: `components/chat-message-display-optimized.tsx`

**问题**: 旧的正则 `/```svg\\n([\\s\\S]*?)```/i` 无法匹配某些换行符格式，导致回退到 `inlineMatch`，将整个包含 SVG 的文本都编码为 data URL。

**解决**: 
- 改用 `/```svg\s*\n([\s\S]*?)```/i` 支持多种空白符
- 添加备用提取逻辑：直接匹配 `<svg>...</svg>` 标签对
- 确保只将 SVG 内容编码，而不是整个消息文本

### 2. SVG 显示组件优化  
**文件**: `components/message-item.tsx`

**问题**: Next.js `<Image>` 组件无法正确渲染 SVG data URL，导致图片为空白。

**解决**: 使用原生 `<img>` 标签代替 Next.js `<Image>` 组件。
