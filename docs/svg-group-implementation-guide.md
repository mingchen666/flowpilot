# SVG `<g>` 分组元素完整实现指南

## 🎯 目标

实现对 SVG `<g>` 分组元素的完整支持，包括：
- ✅ 解析和导出
- ✅ 嵌套分组
- ✅ Transform 继承
- ✅ 批量操作
- ✅ 图层管理

---

## 📐 架构设计

### 1. 类型定义

```typescript
// 文件：contexts/svg-editor-context.tsx

export type GroupElement = SvgElementBase & {
    type: "g";
    children: SvgElement[];
    // 可选：分组特有属性
    name?: string;  // 图层名称
    collapsed?: boolean;  // 图层面板中是否折叠
};

// 更新 SvgElement 联合类型
export type SvgElement =
    | RectElement
    | CircleElement
    | EllipseElement
    | LineElement
    | PathElement
    | TextElement
    | GroupElement;  // ✅ 新增
```

---

### 2. 解析实现

```typescript
function parseElement(node: Element, inheritedTransform?: string): SvgElement | null {
    const nodeTransform = node.getAttribute("transform");
    const combinedTransform = [inheritedTransform, nodeTransform]
        .filter(Boolean)
        .join(" ")
        .trim();
    const transform = parseTransform(combinedTransform || null);
    
    switch (node.tagName.toLowerCase()) {
        // ... 现有的 case ...
        
        case "g": {
            const children: SvgElement[] = [];
            
            // 递归解析子元素
            Array.from(node.children).forEach(child => {
                // ⚠️ 不传递 combinedTransform，因为已保存在当前 group 的 transform 中
                // 子元素的 transform 是相对于 group 的
                const parsed = parseElement(child as Element);
                if (parsed) {
                    children.push(parsed);
                }
            });
            
            return {
                id: node.getAttribute("id") || nanoid(),
                type: "g",
                children,
                name: node.getAttribute("data-name") || undefined,
                collapsed: node.getAttribute("data-collapsed") === "true",
                fill: node.getAttribute("fill") || undefined,
                stroke: node.getAttribute("stroke") || undefined,
                strokeWidth: parseOptionalNumber(node.getAttribute("stroke-width")),
                strokeDasharray: node.getAttribute("stroke-dasharray") || undefined,
                opacity: parseOptionalNumber(node.getAttribute("opacity")),
                transform,
                visible: node.getAttribute("data-visible") !== "false",
                locked: node.getAttribute("data-locked") === "true",
            } as GroupElement;
        }
    }
}
```

**关键点：**
- ✅ 递归解析子元素
- ✅ Transform 不向下传递（子元素相对于 group）
- ✅ 支持嵌套 group

---

### 3. 导出实现

```typescript
function elementToMarkup(element: SvgElement): string {
    const common = [
        element.fill !== undefined ? `fill="${element.}"` : 'fill="none"',
        element.stroke !== undefined ? `stroke="${element.stroke}"` : "",
        element.strokeWidth !== undefined ? `stroke-width="${element.strokeWidth}"` : "",
        element.strokeDasharray ? `stroke-dasharray="${element.strokeDasharray}"` : "",
        element.opacity != null ? `opacity="${element.opacity}"` : "",
    ]
        .filter(Boolean)
        .join(" ");

    const transform = serializeTransform(element.transform);
    const transformAttr = transform ? ` transform="${transform}"` : "";

    switch (element.type) {
        // ... 现有的 case ...
        
        case "g": {
            const name = element.name ? ` data-name="${element.name}"` : "";
            const collapsed = element.collapsed ? ` data-collapsed="true"` : "";
            
            // 递归导出子元素
            const childrenMarkup = element.children
                .filter(child => child.visible !== false)
                .map(child => elementToMarkup(child))
                .join("\n");
            
            return `<g id="${element.id}"${transformAttr}${name}${collapsed} ${common}>\n${childrenMarkup}\n</g>`;
        }
    }
}
```

---

### 4. 移动操作（递归）

```typescript
const moveElement = useCallback(
    (id: string, dx: number, dy: number, options?: { record?: boolean }) => {
        if (options?.record) {
            pushHistorySnapshot();
        }
        
        setElements((prev) =            // 递归移动函数
            const moveElementRecursive = (element: SvgElement): SvgElement => {
                if (element.id === id) {
                    switch (element.type) {
                        case "rect":
                            return { ...element, x: element.x + dx, y: element.y + dy };
                        case "circle":
                            return { ...element, cx: element.cx + dx, cy: element.cy + dy };
                        case "ellipse":
                            return { ...element, cx: element.cx + dx, cy: element.cy + dy };
                        case "line":
                            return {
                                ...element,
                                x1: element.x1 + dx,
                                y1: element.y1 + dy,
                                x2: element.x2 + dx,
                                y2: element.y2 + dy,
                            };
                        case "text":
                            return { ...element, x: element.x + dx, y: element.y + dy };
                        case "path": {
                            const transform = {
                                ...(element.transform || {}),
                                x: (element.transform?.x || 0) + dx,
                                y: (element.transform?.y || 0) + dy,
                            };
                            return { ...element, transform };
                        }
                        case "g": {
                            // Group 移动通过 transform
                            const transform = {
                                ...(element.transform || {}),
                                x: (element.transform?.x || 0) + dx,
                                y: (element.transform?.y || 0) + dy,
                            };
                            return { ...element, transform };
                        }
                        default:
                            return element;
                    }
                }
                
                // 递归处理子元素
                if (element.type === "g") {
                    return {
                        ...element,
                        children: element.children.map(moveElementRecursive),
                    };
                }
                
                return element;
            };
            
            return prev.map(moveElementRecursive);
        });
    },
    [pushHistorySnapshot]
);
```

---

### 5. 更新操作（递归）

```typescript
const updateElement = useCallback(
    (
        id: string,
        updater: Partial<SvgElement> | ((element: SvgElement) => SvgElement),
        options?: { record?: boolean }
    ) => {
        if (options?.record !== false) {
            pushHistorySnapshot();
        }
        
        setElements((prev) => {
            const updateElementRecursive = (element: SvgElement): SvgElement => {
                if (element.id === id) {
                    return typeof updater === "function"
                        ? updater(element)
                        : { ...element, ...updater };
                }
                
                // 递归处理 group 的子元素
                if (element.type === "g") {
                    return {
                        ...element,
                        children: element.children.map(updateElementRecursive),
                    };
                }
                
                return element;
            };
            
            return prev.map(updateElementRecursive);
        });
    },
    [pushHistorySnapshot]
);
```

---

### 6. 删除操作

```typescript
const removeElement = useCallback(
    (id: string) => {
        pushHistorySnapshot();
        
        setElements((prev) => {
            const removeElementRecursive = (elements: SvgElement[]): SvgElement[] => {
                return elements
                    .filter(element => element.id !== id)
                    .map(element => {
                        if (element.type === "g") {
                            return {
                                ...element,
                                children: removeElementRecursive(element.children),
                            };
                        }
                        return element;
                    });
            };
            
            return removeElementRecursive(prev);
        });
        
        setSelectedId((prev) => (prev === id ? null : prev));
    },
    [pushHistorySnapshot]
);
```

---

### 7. 查找元素（工具函数）

```typescript
// 新增：在嵌套结构中查找元素
const findElementById = useCallback(
    (id: string, elements: SvgElement[] = elementsState): SvgElement | null => {
        for (const element of elements) {
            if (element.id === id) {
                return element;
            }
            if (element.type === "g") {
                const found = findElementById(id, element.children);
                if (found) return found;
            }
        }
        return null;
    },
    [elementsState]
);

// 获取元素的父 group
const getParentGroup = useCallback(
    (id: string, elements: SvgElement[] = elementsState): GroupElement | null => {
        for (const element of elements) {
            if (element.type === "g") {
                if (element.children.some(child => child.id === id)) {
                    return element;
                }
                const found = getParentGroup(id, element.children);
                if (found) return found;
            }
        }
        return null;
    },
    [elementsState]
);
```

---

### 8. 分组操作

```typescript
// 创建分组（将选中的元素组合）
const groupElements = useCallback(
    (ids: string[]) => {
        if (ids.length === 0) return null;
        
        pushHistorySnapshot();
        
        const groupId = nanoid();
        let groupElements: SvgElement[] = [];
        
        setElements((prev) => {
            // 收集要分组的元素
            groupElements = prev.filter(el => ids.includes(el.id));
            
            // 从顶层移除这些元素
            const remaining = prev.filter(el => !ids.includes(el.id));
            
            // 创建新的 group
            const newGroup: GroupElement = {
                id: groupId,
                type: "g",
                children: groupElements,
                visible: true,
                locked: false,
            };
            
            return [...remaining, newGroup];
        });
        
        setSelectedId(groupId);
        return groupId;
    },
    [pushHistorySnapshot]
);

// 解散分组（将 group 的子元素提升到父级）
const ungroupElement = useCallback(
    (groupId: string) => {
        pushHistorySnapshot();
        
        setElements((prev) => {
            const ungroupRecursive = (elements: SvgElement[]): SvgElement[] => {
                return elements.flatMap(element => {
                    if (element.id === groupId && element.type === "g") {
                        // 应用 group 的 transform 到子元素
                        return element.children.map(child => {
                            if (!element.transform) return child;
                            
                            // 合并 transform
                            const combinedTransform = {
                                ...element.transform,
                                ...(child.transform || {}),
                                x: (element.transform.x || 0) + (child.transform?.x || 0),
                                y: (element.transform.y || 0) + (child.transform?.y || 0),
                            };
                            
                            return {
                                ...child,
                                transform: combinedTransform,
                            };
                        });
                    }
                    
                    if (element.type === "g") {
                        return {
                            ...element,
                            children: ungroupRecursive(element.children),
                        };
                    }
                    
                    return element;
                });
            };
            
            return ungroupRecursive(prev);
        });
        
        setSelectedId(null);
    },
    [pushHistorySnapshot]
);
```

---

### 9. 扁平化元素列表（用于渲染）

```typescript
// 将嵌套结构扁平化为列表（用于图层面板等）
const flattenElements = useCallback(
    (elements: SvgElement[] = elementsState, level: number = 0): Array<SvgElement & { level: number }> => {
        return elements.flatMap(element => {
            const item = { ...element, level };
            
            if (element.type === "g") {
                return [
                    item,
                    ...flattenElements(element.children, level + 1),
                ];
            }
            
            return [item];
        });
    },
    [elementsState]
);
```

---

## 🎨 UI 组件

### 图层面板组件

```typescript
// components/svg-layers-panel.tsx

import { useSvgEditor } from "@/contexts/svg-editor-context";

export function SvgLayersPanel() {
    const { elements, selectedId, setSelectedId, removeElement, groupElements, ungroupElement } = useSvgEditor();
    
    const flatElements = flattenElements(elements);
    
    return (
        <div className="w-64 border-l border-gray-200 bg-white">
            <div className="p-2 border-b">
                <h3 className="font-semibold">图层</h3>
            </div>
            
            <div className="overflow-auto">
                {flatElements.map(({ element, level }) => (
                    <LayerItem
                        key={element.id}
                        element={element}
                        level={level}
                        selected={element.id === selectedId}
                        onSelect={() => setSelectedId(element.id)}
                        onDelete={() => removeElement(element.id)}
                    />
                ))}
            </div>
            
            <div className="p-2 border-t flex gap-2">
                <button onClick={() => {
                    const selectedIds = getSelectedIds();
                    if (selectedIds.length > 1) {
                        groupElements(selectedIds);
                    }
                }}>
                    分组
                </button>
                
                <button onClick={() => {
                    if (selectedId) {
                        const element = findElementById(selectedId);
                        if (element?.type === "g") {
                            ungroupElement(selectedId);
                        }
                    }
                }}>
                    解散分组
                </button>
            </div>
        </div>
    );
}

function LayerItem({ element, level, selected, onSelect, onDelete }) {
    const [expanded, setExpanded] = useState(true);
    const isGroup = element.type === "g";
    
    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer",
                    selected && "bg-blue-100"
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={onSelect}
            >
                {isGroup && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="w-4 h-4"
                    >
                        {expanded ? "▼" : "▶"}
                    </button>
                )}
                
                <span className="flex-1 truncate">
                    {element.name || `${element.type} ${element.id.slice(0, 8)}`}
                </span>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-4 h-4 opacity-0 group-hover:opacity-100"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}
```

---

## 🧪 测试用例

```typescript
// 测试 1: 基础分组
const basicGroupSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <g id="group1" transform="translate(50 50)">
    <rect x="0" y="0" width="50" height="50" fill="red"/>
    <circle cx="25" cy="25" r="10" fill="blue"/>
  </g>
</svg>
`;

// 测试 2: 嵌套分组
const nestedGroupSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <g id="layer1" transform="translate(100 100)">
    <rect x="0" y="0" width="100" height="100" fill="lightgray"/>
    
    <g id="layer2" transform="translate(10 10)">
      <rect x="0" y="0" width="30" height="30" fill="red"/>
      <circle cx="15" cy="15" r="5" fill="white"/>
    </g>
    
    <g id="layer3" transform="translate(60 60)">
      <rect x="0" y="0" width="30" height="30" fill="blue"/>
    </g>
  </g>
</svg>
`;

// 测试 3: 分组继承样式
const groupStyleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <g id="group1" fill="red" stroke="black" stroke-width="2">
    <rect x="10" y="10" width="50" height="50"/>
    <circle cx="100" cy="100" r="30"/>
  </g>
</svg>
`;

// 验证函数
function testGroupParsing() {
    loadSvgMarkup(basicGroupSvg);
    
    // 检查是否正确解析
    const groups = elements.filter(el => el.type === "g");
    console.assert(groups.length === 1, "Should have 1 group");
    
    const group = groups[0] as GroupElement;
    console.assert(group.children.length === 2, "Group should have 2 children");
    console.assert(group.transform?.x === 50, "Transform X should be 50");
    
    // 导出并验证
    const exported = exportSvgMarkup();
    console.assert(exported.includes("<g id="), "Should contain group tag");
    console.assert(exported.includes("transform="), "Should contain transform");
}
```

---

## 🚧 实施步骤

### Step 1: 类型定义 ✅
- [x] 添加 GroupElement 类型
- [x] 更新 SvgElement 联合类型

### Step 2: 核心解析 ⏳
- [ ] 实现 parseElement 中的 "g" case
- [ ] 递归解析子元素
- [ ] Transform 继承处理

### Step 3: 导出功能 ⏳
- [ ] 实现 elementToMarkup 中的 "g" case
- [ ] 递归导出子元素

### Step 4: 编辑操作 ⏳
- [ ] 更新 moveElement（递归）
- [ ] 更新 updateElement（递归）
- [ ] 更新 removeElement（递归）
- [ ] 更新 duplicateElement（递归）

### Step 5: 分组管理 ⏳
- [ ] 实现 groupElements
- [ ] 实现 ungroupElement
- [ ] 实现 findElementById
- [ ] 实现 getParentGroup

### Step 6: UI 组件 ⏳
- [ ] 图层面板组件
- [ ] 分组/解散按钮
- [ ] 拖拽重排序

### Step 7: 测试验证 ⏳
- [ ] 单元测试
- [ ] 集成测试
- [ ] 真实 SVG 测试

---

## ⚠️ 注意事项

### 1. Transform 继承
- Group 的 transform 不向下传递到子元素的 transform 属性
- 子元素的坐标是相对于 group 的
- 导出时保持这种关系

### 2. 样式继承
- Fill, stroke 等样式可以从 group 继承
- 需要在渲染时处理继承逻辑

### 3. 选择行为
- 点击 group 应该选择整个 group
- Ctrl/Cmd + 点击可以选择 group 内的子元素
- 拖拽 group 移动所有子元素

### 4. 性能优化
- 大型嵌套结构可能影响性能
- 考虑虚拟化渲染（图层面板）
- 缓存扁平化结果

---

## 📚 参考资料

- [SVG <g> 规范](https://www.w3.org/TR/SVG2/struct.html#Groups)
- [MDN - SVG g element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g)
- [SVG Transform 规范](https://www.w3.org/TR/SVG2/coords.html#TransformAttribute)
