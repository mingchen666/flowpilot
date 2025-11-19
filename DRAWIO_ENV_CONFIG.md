# DrawIO 环境变量配置说明

## 概述

本项目已将所有 diagrams.net 相关的硬编码 URL 配置为环境变量，方便在不同环境下灵活配置。

## 修改的文件

### 1. `env.example`
添加了以下环境变量配置：

```env
# DrawIO Services Configuration
# DrawIO Base URL (for editor and export)
# Default: https://app.diagrams.net
# Alternative: Use a locally deployed draw.io instance
NEXT_PUBLIC_DRAWIO_BASE_URL=https://app.diagrams.net

# DrawIO Viewer URL (for viewing diagrams)
# Default: https://viewer.diagrams.net
NEXT_PUBLIC_DRAWIO_VIEWER_URL=https://viewer.diagrams.net

# DrawIO Preview URL (for comparison workbench preview)
# Default: https://viewer.diagrams.net/
NEXT_PUBLIC_DRAWIO_PREVIEW_URL=https://viewer.diagrams.net/

# DrawIO Convert URL (for PPT export conversion)
# Default: https://convert.diagrams.net/export
NEXT_PUBLIC_DRAWIO_CONVERT_URL=https://convert.diagrams.net/export
```

### 2. `app/page.tsx` (第 27 行)
**修改前：**
```typescript
const drawioBaseUrl = "https://app.diagrams.net";
```

**修改后：**
```typescript
const drawioBaseUrl = process.env.NEXT_PUBLIC_DRAWIO_BASE_URL || "https://app.diagrams.net";
```

### 3. `app/api/model-compare/route.ts` (第 95 行)
**修改前：**
```typescript
const response = await fetch("https://app.diagrams.net/export3", {
```

**修改后：**
```typescript
const drawioBaseUrl = process.env.NEXT_PUBLIC_DRAWIO_BASE_URL || "https://app.diagrams.net";
const response = await fetch(`${drawioBaseUrl}/export3`, {
```

### 4. `app/api/ppt/export/route.ts` (第 21 行)
**修改前：**
```typescript
const CONVERT_ENDPOINT = "https://convert.diagrams.net/export";
```

**修改后：**
```typescript
const CONVERT_ENDPOINT = 
    process.env.NEXT_PUBLIC_DRAWIO_CONVERT_URL || 
    "https://convert.diagrams.net/export";
```

### 5. `features/ppt-studio/utils/viewer.ts` (第 3-5 行)
**已经使用环境变量：** ✅
```typescript
const VIEWER_BASE =
    process.env.NEXT_PUBLIC_DRAWIO_VIEWER_URL ||
    "https://viewer.diagrams.net";
```

### 6. `features/chat-panel/hooks/use-comparison-workbench.ts` (第 41-43 行)
**已经使用环境变量：** ✅
```typescript
const drawioPreviewBaseUrl =
    process.env.NEXT_PUBLIC_DRAWIO_PREVIEW_URL ??
    "https://viewer.diagrams.net/";
```

## 环境变量说明

| 环境变量 | 用途 | 默认值 | 使用位置 |
|---------|------|--------|----------|
| `NEXT_PUBLIC_DRAWIO_BASE_URL` | 主编辑器和导出服务 | `https://app.diagrams.net` | `app/page.tsx`<br>`app/api/model-compare/route.ts` |
| `NEXT_PUBLIC_DRAWIO_VIEWER_URL` | 图表查看器服务 | `https://viewer.diagrams.net` | `features/ppt-studio/utils/viewer.ts` |
| `NEXT_PUBLIC_DRAWIO_PREVIEW_URL` | 对比工作台预览服务 | `https://viewer.diagrams.net/` | `features/chat-panel/hooks/use-comparison-workbench.ts` |
| `NEXT_PUBLIC_DRAWIO_CONVERT_URL` | PPT 导出转换服务 | `https://convert.diagrams.net/export` | `app/api/ppt/export/route.ts` |

## 配置方法

### 1. 复制环境变量配置文件
```bash
cp env.example .env.local
```

### 2. 编辑 `.env.local` 文件
根据你的需求修改相应的环境变量值。例如：

```env
# 使用自建的 draw.io 服务
NEXT_PUBLIC_DRAWIO_BASE_URL=https://your-drawio-instance.com
NEXT_PUBLIC_DRAWIO_VIEWER_URL=https://your-drawio-instance.com/viewer
NEXT_PUBLIC_DRAWIO_PREVIEW_URL=https://your-drawio-instance.com/viewer/
NEXT_PUBLIC_DRAWIO_CONVERT_URL=https://your-drawio-instance.com/export
```

### 3. 重启开发服务器
```bash
pnpm dev
```

## 使用场景

### 场景 1：使用官方服务（默认）
无需配置，直接使用默认值即可。

### 场景 2：使用自建 draw.io 服务
如果你部署了自己的 draw.io 实例：

```env
NEXT_PUBLIC_DRAWIO_BASE_URL=https://drawio.yourcompany.com
NEXT_PUBLIC_DRAWIO_VIEWER_URL=https://drawio.yourcompany.com/viewer
NEXT_PUBLIC_DRAWIO_PREVIEW_URL=https://drawio.yourcompany.com/viewer/
NEXT_PUBLIC_DRAWIO_CONVERT_URL=https://drawio.yourcompany.com/export
```

### 场景 3：本地开发环境
如果在本地运行 draw.io：

```env
NEXT_PUBLIC_DRAWIO_BASE_URL=http://localhost:8080
NEXT_PUBLIC_DRAWIO_VIEWER_URL=http://localhost:8080/viewer
NEXT_PUBLIC_DRAWIO_PREVIEW_URL=http://localhost:8080/viewer/
NEXT_PUBLIC_DRAWIO_CONVERT_URL=http://localhost:8080/export
```

## 注意事项

1. **环境变量前缀**：所有环境变量都以 `NEXT_PUBLIC_` 开头，这样才能在客户端访问。

2. **默认值**：所有配置都有默认值，如果不设置环境变量，将使用官方的 diagrams.net 服务。

3. **重启服务**：修改环境变量后需要重启开发服务器才能生效。

4. **生产环境**：在生产环境中，确保在构建前设置好这些环境变量。

## 验证配置

你可以通过以下方式验证配置是否生效：

1. 打开浏览器开发者工具的 Console
2. 输入以下代码查看当前配置：

```javascript
console.log({
  baseUrl: process.env.NEXT_PUBLIC_DRAWIO_BASE_URL,
  viewerUrl: process.env.NEXT_PUBLIC_DRAWIO_VIEWER_URL,
  previewUrl: process.env.NEXT_PUBLIC_DRAWIO_PREVIEW_URL,
  convertUrl: process.env.NEXT_PUBLIC_DRAWIO_CONVERT_URL
});
```

## 故障排查

### 问题 1：DrawIO 编辑器无法加载
检查 `NEXT_PUBLIC_DRAWIO_BASE_URL` 是否正确，并确保该服务可访问。

### 问题 2：模型对比预览失败
检查 `NEXT_PUBLIC_DRAWIO_PREVIEW_URL` 是否正确。

### 问题 3：PPT 导出失败
检查 `NEXT_PUBLIC_DRAWIO_CONVERT_URL` 是否正确，并确保转换服务可访问。

### 问题 4：图表查看器无法打开
检查 `NEXT_PUBLIC_DRAWIO_VIEWER_URL` 是否正确。

## 相关文档

- [Draw.io 官方文档](https://www.diagrams.net/)
- [Draw.io GitHub](https://github.com/jgraph/drawio)
- [自建 Draw.io 服务指南](https://github.com/jgraph/docker-drawio)
