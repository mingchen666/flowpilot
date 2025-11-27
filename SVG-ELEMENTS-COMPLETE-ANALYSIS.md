# SVG 元素完整支持分析

## 📊 当前支持的元素（已实现）

### ✅ 基础形状元素（Basic Shapes）
1. **`<rect>`** - 矩形
   - 完整支持：x, y, width, height, rx, ry
   - 编辑支持：✅ 移动、缩放、旋转、复制

2. **`<circle>`** - 圆形
   - 完整支持：cx, cy, r
   - 编辑支持：✅ 移动、缩放、旋转、复制
   - **刚修复**：现在保持为 circle 而不转换为 ellipse

3. **`<ellipse>`** - 椭圆
   - 完整支持：cx, cy, rx, ry
   - 编辑支持：✅ 移动、缩放、旋转、复制

4. **`<line>`** - 直线
   - 完整支持：x1, y1, x2, y2
   - 编辑支持：✅ 移动、连接引用
   - 特殊功能：startRef, endRef（连接到其他元素）

5. **`<path>`** - 路径
   - 完整支持：d（路径数据）
   - 编辑支持：✅ 移动、旋转、复制
   - **自动转换**：polyline, polygon 会转换为 path

6. **`<polyline>`** ⚠️ - 折线
   - 支持方式：**转换为 path**
   - 原因：简化编辑逻辑

7. **`<polygon>`** ⚠️ - 多边形
   - 支持方式：**转换为 path**（自动闭合）
   - 原因：简化编辑逻辑

### ✅ 文本元素
8. **`<text>`** - 文本
   - 完整支持：x, y, text, fontSize, fontWeight, textAnchor, dominantBaseline
   - 编辑支持：✅ 移动、样式编辑、复制

---

## ❌ 未支持的元素（需要实现）

### 🔴 高优先级 - 常用图形元素

#### 1. **`<g>`** - 分组容器
**重要性：** ⭐⭐⭐⭐⭐  
**用途：** 组织和管理多个元素，应用统一的 transform 和样式

```svg
<g id="layer1" transform="translate(100 50)">
  <rect x="0" y="0" width="50" height="50"/>
  <circle cx="25" cy="25" r="10"/>
</g>
```

**实现建议：**
```typescript
export type GroupElement = SvgElementBase & {
    type: "g";
    children: SvgElement[];  // 子元素列表
};
```

**挑战：**
- 需要支持嵌套结构
- Transform 继承
- 选择和编辑子元素
- 批量操作

---

#### 2. **`<image>`** - 图片嵌入
**重要性：** ⭐⭐⭐⭐  
**用途：** 在 SVG 中嵌入位图图片

```svg
<image href="photo.jpg" x="10" y="10" width="200" height="150"/>
<!-- 或使用 xlink:href (旧版) -->
<image xlink:href="photo.jpg" x="10" y="10" width="200" height="150"/>
```

**实现建议：**
```typescript
export type ImageElement = SvgElementBase & {
    type: "image";
    x: number;
    y: number;
    width: number;
    height: number;
    href: string;  // 图片 URL 或 data URI
    preserveAspectRatio?: string;
};
```

**注意事项：**
- 支持 `href` 和 `xlink:href` 两种属性
- 处理跨域问题
- Data URI 支持

---

#### 3. **`<use>`** - 元素复用/引用
**重要性：** ⭐⭐⭐⭐  
**用途：** 复用已定义的元素（通常在 `<defs>` 中）

```svg
<defs>
  <circle id="dot" cx="0" cy="0" r="5" fill="red"/>
</defs>
<use href="#dot" x="10" y="10"/>
<use href="#dot" x="30" y="20"/>
```

**实现建议：**
```typescript
export type UseElement = SvgElementBase & {
    type: "use";
    x: number;
    y: number;
    width?: number;
    height?: number;
    href: string;  // 引用的元素 ID (#id)
};
```

**挑战：**
- 需要维护引用关系
- 实例化时应用 x, y 偏移
- 删除被引用元素时的处理

---

#### 4. **`<symbol>`** - 可复用符号
**重要性：** ⭐⭐⭐  
**用途：** 定义可复用的图形模板（不直接渲染）

```svg
<defs>
  <symbol id="icon-star" viewBox="0 0 100 100">
    <path d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,70 L25,90 L35,60 L10,40 L40,40 Z"/>
 l>
</defs>
<use href="#icon-star" x="10" y="10" width="50" height="50"/>
```

**实现建议：**
- 存储在 defs 中，不作为可编辑元素
- 与 `<use>` 配合使用

---

### 🟡 中优先级 - 文本增强

#### 5. **`<tspan>`** - 文本内嵌段落
**重要性：** ⭐⭐⭐  
**用途：** 在 `<text>` 内实现多行、多样式文本

```svg
<text x="10" y="20">
  Hello <tspan font-weight="bold" fill="red">World</tspan>!
  <tspan x="10" dy="20">Second line</tspan>
</text>
```

**实现建议：**
```typescript
export type TspanElement = {
    text: string;
    x?: number;
    y?: number;
    dx?: number;  // 相对偏移
    dy?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
};

export type TextElement = SvgElementBase & {
    type: "text";
    x: number;
    y: number;
    spans?: TspanElement[];  // ✅ 支持多段
    // 或单段文本
    text?: string;
};
```

---

#### 6. **`<textPath>`** - 路径文字
**重要性：** ⭐⭐  
**用途：** 让文字沿路径排列

```svg
<defs>
  <path id="curve" d="M10,90 Q90,90 90,45 Q90,10 50,10"/>
</defs>
<text>
  <textPath href="#curve">Text on a curve</textPath>
</text>
```

---

### 🟢 低优先级 - 高级图形

#### 7. **`<foreignObject>`** - HTML 嵌入
**重要性：** ⭐⭐  
**用途：** 在 SVG 中嵌入 HTML 内容

```svg
<foreignObject x="10" y="10" width="200" height="100">
  <div xmlns="http://www.w3.org/1999/xhtml">
    <p>This is <b>HTML</b> inside SVG!</p>
  </div>
</foreignObject>
```

**注意：** 兼容性问题较多

---

#### 8. **`<clipPath>`** - 裁剪路径
**重要性：** ⭐⭐⭐  
**用途：** 定义裁剪区域

```svg
<defs>
  <clipPath id="clip">
    <circle cx="50" cy="50" r="40"/>
  </clipPath>
</defs>
<rect x="0" y="0" width="100" height="100" fill="red" clip-path="url(#clip)"/>
```

**实现方式：** 存储在 defs 中

---

#### 9. **`<mask>`** - 蒙版
**重要性：** ⭐⭐⭐  
**用途：** 基于亮度的透明度控制

```svg
<defs>
  <mask id="mask">
    <rect width="100" height="100" fill="white"/>
    <circle cx="50" cy="50" r="30" fill="black"/>
  </mask>
</defs>
<rect x="0" y="0" width="100" height="100" fill="red" mask="url(#mask)"/>
```

---

### 🔵 特殊元素 - 动画和交互

#### 10. **`<animate>`** - 动画
**重要性：** ⭐  
**用途：** 属性动画

```svg
<circle cx="50" cy="50" r="10">
  <animate attributeName="r" from="10" to="30" dur="2s" repeatCount="indefinite"/>
</circle>
```

**建议：** 暂不支持，使用 CSS 动画代替

---

#### 11. **`<animateTransform>`** - 变换动画
**重要性：** ⭐  
**用途：** Transform 属性动画

---

#### 12. **`<a>`** - 超链接
**重要性：** ⭐⭐  
**用途：** 为元素添加链接

```svg
<a href="https://example.com">
  <text x="10" y="20">Click me</text>
</a>
```

---

#### 13. **`<switch>`** - 条件渲染
**重要性：** ⭐  
**用途：** 根据条件显示不同内容

---

## 📋 完整的 SVG 元素清单

### 结构元素
- [x] `<svg>` - 根元素（解析时处理）
- [x] `<defs>` - 定义容器（保存到 defsMarkup）
- [ ] `<g>` - 分组 ⭐⭐⭐⭐⭐
- [ ] `<symbol>` - 符号定义 ⭐⭐⭐
- [ ] `<use>` - 引用元素 ⭐⭐⭐⭐

### 基础形状
- [x] `<rect>` - 矩形
- [x] `<circle>` - 圆形
- [x] `<ellipse>` - 椭圆
- [x] `<line>` - 直线
- [x] `<polyline>` - 折线（转为 path）
- [x] `<polygon>` - 多边形（转为 path）
- [x] `<path>` - 路径

### 文本
- [x] `<text>` - 文本（基础）
- [ ] `<tspan>` - 文本段落 ⭐⭐⭐
- [ ] `<textPath>` - 路径文字 ⭐⭐

### 图片和嵌入
- [ ] `<image>` - 图片 ⭐⭐⭐⭐
- [ ] `<foreignObject>` - HTML 嵌入 ⭐⭐

### 渐变和图案
- [x] `<linearGradient>` - 线性渐变（defs）
- [x] `<radialGradient>` - 径向渐变（defs）
- [x] `<pattern>` - 图案填充（defs）
- [ ] `<stop>` - 渐变色标（defs 内部）

### 滤镜和特效
- [x] `<filter>` - 滤镜容器（defs）
- [ ] `<feGaussianBlur>` - 高斯模糊
- [ ] `<feOffset>` - 偏移
- [ ] `<feBlend>` - 混合
- [ ] `<feColorMatrix>` - 颜色矩阵
- [ ] ...其他滤镜元素

### 裁剪和蒙版
- [ ] `<clipPath>` - 裁剪路径 ⭐⭐⭐
- [ ] `<mask>` - 蒙版 ⭐⭐⭐

### 标记
- [x] `<marker>` - 标记定义（defs）

### 动画
- [ ] `<animate>` - 属性动画
- [ ] `<animateTransform>` - 变换动画
- [ ] `<animateMotion>` - 运动路径动画
- [ ] `<set>` - 设置属性

### 交互和元数据
- [ ] `<a>` - 超链接 ⭐⭐
- [x] `<title>` - 标题（跳过）
- [x] `<desc>` - 描述（跳过）
- [x] `<metadata>` - 元数据（跳过）
- [x] `<style>` - 样式（跳过，未来可支持）
- [x] `<script>` - 脚本（安全跳过）

### 其他
- [ ] `<switch>` - 条件渲染
- [ ] `<view>` - 视图定义

---

## 🎯 推荐实现优先级

### Phase 1: 核心增强（必须）
1. **`<g>` 分组** ⭐⭐⭐⭐⭐
   - 解决：层级管理、批量操作
   - 难度：⭐⭐⭐⭐
   - 影响：大

2. **`<image>` 图片** ⭐⭐⭐⭐
   - 解决：嵌入位图、混合编辑
   - 难度：⭐⭐
   - 影响：大

3. **`<use>` 引用** ⭐⭐⭐⭐
   - 解决：元素复用、减少重复
   - 难度：⭐⭐⭐
   - 影响：中

### Phase 2: 文本增强
4. **`<tspan>` 多行文本** ⭐⭐⭐
   - 解决：富文本、多行排版
   - 难度：⭐⭐⭐
   - 影响：中

### Phase 3: 高级特效
5. **`<clipPath>` 裁剪** ⭐⭐⭐
6. **`<mask>` 蒙版** ⭐⭐⭐
7. **`<symbol>` 符号** ⭐⭐⭐

### Phase 4: 交互增强
8. **`<a>` 链接** ⭐⭐
9. **`<textPath>` 路径文字** ⭐⭐
10. **`<foreignObject>` HTML 嵌入** ⭐⭐

---

## 💡 实现建议

### 1. Group (`<g>`) 实现方案

```typescript
// 类型定义
export type GroupElement = SvgElementBase & {
    type: "g";
    children: SvgElement[];
};

export type SvgElement =
    | RectElement
    | CircleElement
    | EllipseElement
    | LineElement
    | PathElement
    | TextElement
    | GroupElement;  // ✅ 新增

// 解析函数
case "g": {
    const children: SvgElement[] = [];
    const groupTransform = node.getAttribute("transform");
    
    // 递归解析子元素
    Array.from(node.children).forEach(child => {
        const parsed = parseElement(child, groupTransform);
        if (parsed) children.push(parsed);
    });
    
    return {
        id: node.getAttribute("id") || nanoid(),
        type: "g",
        children,
        transform: parseTransform(groupTransform),
        // ...
    } as GroupElement;
}

// 导出函数
case "g": {
    const childrenMarkup = element.children
        .map(child => elementToMarkup(child))
        .join("\n");
    return `<g id="${element.id}"${transformAttr}>${childrenMarkup}</g>`;
}
```

**挑战：**
- 编辑器需要支持选择子元素
- 移动 group 时同步移动所有子元素
- 展开/折叠功能

---

### 2. Image (`<image>`) 实现方案

```typescript
export type ImageElement = SvgElementBase & {
    type: "image";
    x: number;
    y: number;
    width: number;
    height: number;
    href: string;
    preserveAspectRatio?: string;
};

// 解析
case "image": {
    const href = node.getAttribute("href") || node.getAttribute("xlink:href") || "";
    return {
        id: node.getAttribute("id") || nanoid(),
        type: "image",
        x: parseNumber(node.getAttribute("x")),
        y: parseNumber(node.getAttribute("y")),
        width: parseNumber(node.getAttribute("width")),
        height: parseNumber(node.getAttribute("height")),
        href,
        preserveAspectRatio: node.getAttribute("preserveAspectRatio") || undefined,
        // ...
    } as ImageElement;
}

// 导出
case "image": {
    return `<image id="${element.id}" x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" href="${element.href}"${element.preserveAspectRatio ? ` preserveAspectRatio="${element.preserveAspectRatio}"` : ""} ${common}${transformAttr} />`;
}
```

---

### 3. Use (`<use>`) 实现方案

```typescript
export type UseElement = SvgElementBase & {
    type: "use";
    x: number;
    y: number;
    width?: number;
    height?: number;
    href: string;  // #elementId
};

// 需要额外维护
type SvgEditorContextValue = {
    // ...
    symbolLibrary: Map<string, SvgElement>;  // 存储可复用的元素
    registerSymbol: (id: string, element: SvgElement) => void;
    resolveUseReference: (href: string) => SvgElement | null;
};
```

---

## 🧪 测试建议

```typescript
// 测试 Group
const groupSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <g id="layer1" transform="translate(50 50)">
    <rect x="0" y="0" width="50" height="50" fill="red"/>
    <circle cx="25" cy="25" r="10" fill="blue"/>
  </g>
</svg>
`;

// 测试 Image
const imageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <image href="data:image/png;base64,..." x="10" y="10" width="200" height="150"/>
</svg>
`;

// 测试 Use
const useSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <defs>
    <circle id="dot" r="5" fill="red"/>
  </defs>
  <use href="#dot" x="10" y="10"/>
  <use href="#dot" x="30" y="30"/>
  <use href="#dot" x="50" y="50"/>
</svg>
`;
```

---

## 📊 统计总结

- **已支持：** 8 种元素（rect, circle, ellipse, line, path, polyline, polygon, text）
- **部分支持：** 定义元素（defs, marker, gradient, filter, pattern）
- **未支持：** ~20 种元素
- **推荐优先实现：** g, image, use, tspan（4 种）

---

## 🔗 参考资料

- [SVG 元素参考 - MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
- [SVG 2 规范](https://www.w3.org/TR/SVG2/)
- [Can I use - SVG](https://caniuse.com/?search=svg)
