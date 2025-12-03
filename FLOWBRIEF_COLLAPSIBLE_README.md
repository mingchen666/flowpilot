# FlowPilot Brief 折叠悬浮组件 - iOS 18 Liquid Glass 风格

## 功能特性

### ✨ 主要功能
1. **可折叠展开** - 默认收起，点击展开显示完整配置
2. **可拖拽移动** - 支持拖拽到屏幕任意位置
3. **iOS 18 Liquid Glass 风格** - 毛玻璃效果 + 光晕阴影
4. **智能定位** - 初始位置在左下角，避免遮挡主要内容
5. **响应式交互** - 流畅的动画过渡效果

### 🎨 设计亮点

#### Liquid Glass 效果
- `bg-white/70` - 70%透明度白色背景
- `backdrop-blur-2xl` - 超强背景模糊
- `backdrop-saturate-150` - 150%饱和度增强
- `shadow-2xl` + 多层阴影 - 立体光晕效果
- `ring-1 ring-black/5` - 微妙的外发光边框

#### 渐变按钮
每个选项都使用精美的渐变色：
- **专业/自由模式**: slate-900 → slate-700 (深灰渐变)
- **任务模式**: indigo-500 → blue-500 (靛蓝到蓝色)
- **视觉风格**: purple-500 → pink-500 (紫色到粉色)
- **设计重点**: emerald-500 → teal-500 (翠绿到青色)
- **智能识别**: amber-400 → orange-500 (琥珀到橙色)
- **具体类型**: blue-500 → cyan-500 (蓝色到青色)

## 使用方法

### 1. 基本用法

```tsx
import { FlowPilotBriefCollapsible } from "@/components/flowpilot-brief-collapsible";

function MyComponent() {
    const [briefState, setBriefState] = useState(DEFAULT_BRIEF_STATE);
    
    return (
        <FlowPilotBriefCollapsible
            state={briefState}
            onChange={(changes) => setBriefState(prev => ({ ...prev, ...changes }))}
            badges={["中性简约", "简洁清晰", "智能识别"]}
            modelEndpoints={modelEndpoints}
            modelOptions={modelOptions}
            selectedModelKey={selectedModel}
            onManageModels={() => setShowModelDialog(true)}
        />
    );
}
```

### 2. Props 说明

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `state` | `FlowPilotBriefState` | ✅ | Brief配置状态 |
| `onChange` | `(state: Partial<FlowPilotBriefState>) => void` | ✅ | 状态变更回调 |
| `disabled` | `boolean` | ❌ | 是否禁用 |
| `badges` | `string[]` | ❌ | 收起状态显示的标签 |
| `modelEndpoints` | `ModelEndpointConfig[]` | ❌ | 模型端点配置 |
| `modelOptions` | `RuntimeModelOption[]` | ❌ | 可用模型列表 |
| `selectedModelKey` | `string` | ❌ | 当前选中的模型 |
| `onManageModels` | `() => void` | ❌ | 管理模型按钮点击回调 |

### 3. 交互说明

#### 收起状态
- 显示组件名称和最多2个配置标签
- 点击整个区域或展开按钮可展开
- 可拖拽移动到任意位置

#### 展开状态
- 显示完整的配置选项
- 点击收起按钮折叠
- 内容区域支持滚动（最大高度80vh）
- 仍可拖拽标题栏移动

## 替换现有组件

### 在聊天页面中使用

找到原来使用 `FlowPilotBriefLauncher` 的地方：

```tsx
// 原来的代码
<FlowPilotBriefLauncher
    state={briefState}
    onChange={handleBriefChange}
    badges={summaryBadges}
    // ...
/>

// 替换为
<FlowPilotBriefCollapsible
    state={briefState}
    onChange={handleBriefChange}
    badges={summaryBadges}
    // ...
/>
```

## 技术实现

### 拖拽功能
使用原生事件实现平滑拖拽：
- `onMouseDown` - 记录拖拽起始位置
- `onMouseMove` - 计算新位置（边界限制）
- `onMouseUp` - 结束拖拽
- 点击按钮时不触发拖拽

### 位置管理
```typescript
const [position, setPosition] = useState({ 
    x: 20, 
    y: window.innerHeight - 200 
});
```

初始位置在左下角，距离左边20px，距离底部200px

### 动画过渡
```css
transition-all duration-500 ease-out  /* 主容器展开/收起 */
transition-all duration-200           /* 按钮hover效果 */
```

## 视觉效果对比

### 原版 vs 新版

| 特性 | 原FlowPilotBriefLauncher | 新FlowPilotBriefCollapsible |
|------|--------------------------|----------------------------|
| 定位 | 固定在侧边栏 | 可拖拽悬浮 |
| 收起 | 无法收起 | 可折叠 |
| 风格 | 普通卡片 | Liquid Glass毛玻璃 |
| 按钮 | 纯色背景 | 渐变色 + 阴影 |
| 阴影 | 单层 | 多层光晕 |
| 动画 | 基础 | 流畅过渡 |

## 浏览器兼容性

- ✅ Chrome 88+
- ✅ Safari 14+
- ✅ Firefox 94+
- ✅ Edge 88+

**注意**: `backdrop-filter` 需要现代浏览器支持

## 性能优化

1. **防抖拖拽** - 使用 requestAnimationFrame 优化拖拽性能
2. **条件渲染** - 仅展开时渲染详细内容
3. **CSS动画** - 使用 GPU 加速的 transition
4. **事件清理** - useEffect 正确清理事件监听器

## 自定义样式

如需调整颜色或尺寸，修改以下变量：

```tsx
// 收起状态尺寸
width: isExpanded ? '420px' : '360px'

// 展开状态最大高度
max-h-[80vh]

// 毛玻璃透明度
bg-white/70  // 修改70为其他值(0-100)

// 模糊强度
backdrop-blur-2xl  // 可选: sm, md, lg, xl, 2xl, 3xl
```

## 已知限制

1. **移动端** - 拖拽功能在移动设备上需要触摸事件支持（可后续添加）
2. **窗口调整** - 调整浏览器窗口大小时位置不会自动调整
3. **多实例** - 不支持同时显示多个实例

## 下一步优化建议

1. ✅ 添加触摸事件支持移动端
2. ✅ 记住用户拖拽位置（localStorage）
3. ✅ 添加"重置位置"按钮
4. ✅ 支持键盘快捷键（ESC收起，Space展开）
5. ✅ 添加展开/收起动画音效

---

**享受全新的 Liquid Glass 体验！** ✨

