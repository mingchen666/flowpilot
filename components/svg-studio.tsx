"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MousePointer2,
    Square,
    Circle,
    Minus,
    Type,
    Upload,
    Eraser,
    Copy,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Grid,
    AlignStartHorizontal,
    AlignCenterHorizontal,
    AlignEndHorizontal,
    AlignStartVertical,
    AlignCenterVertical,
    ArrowDownToLine,
    RotateCcw,
    RotateCw,
} from "lucide-react";
import { useSvgEditor, SvgElement, SvgTool } from "@/contexts/svg-editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DraftShape =
    | {
        mode: "rect" | "ellipse" | "line";
        start: { x: number; y: number };
        current: { x: number; y: number };
    }
    | null;

type PointerDrag =
    | {
        id: string;
        start: { x: number; y: number };
    }
    | null;

type ResizeHandle =
    | "n"
    | "s"
    | "e"
    | "w"
    | "ne"
    | "nw"
    | "se"
    | "sw";

const TOOL_CONFIG: Array<{
    id: SvgTool;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: "select", label: "选择", icon: MousePointer2 },
    { id: "rect", label: "矩形", icon: Square },
    { id: "ellipse", label: "圆/椭圆", icon: Circle },
    { id: "line", label: "线条", icon: Minus },
    { id: "text", label: "文本", icon: Type },
];

const GRID_SIZE = 12;

function getBounds(element: SvgElement): { x: number; y: number; width: number; height: number } | null {
    const applyTransform = (
        bounds: { x: number; y: number; width: number; height: number },
        transform?: { x?: number; y?: number; scaleX?: number; scaleY?: number }
    ) => {
        if (!transform) return bounds;
        const scaleX = transform.scaleX ?? 1;
        const scaleY = transform.scaleY ?? transform.scaleX ?? 1;
        return {
            x: (bounds.x + (transform.x ?? 0)) * scaleX,
            y: (bounds.y + (transform.y ?? 0)) * scaleY,
            width: bounds.width * scaleX,
            height: bounds.height * scaleY,
        };
    };

    switch (element.type) {
        case "rect":
            return applyTransform(
                {
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                },
                element.transform
            );
        case "ellipse":
            return applyTransform(
                {
                    x: element.cx - element.rx,
                    y: element.cy - element.ry,
                    width: element.rx * 2,
                    height: element.ry * 2,
                },
                element.transform
            );
        case "line": {
            const x1 = (element.x1 + (element.transform?.x ?? 0)) * (element.transform?.scaleX ?? 1);
            const x2 = (element.x2 + (element.transform?.x ?? 0)) * (element.transform?.scaleX ?? 1);
            const y1 = (element.y1 + (element.transform?.y ?? 0)) * (element.transform?.scaleY ?? element.transform?.scaleX ?? 1);
            const y2 = (element.y2 + (element.transform?.y ?? 0)) * (element.transform?.scaleY ?? element.transform?.scaleX ?? 1);
            return {
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1),
            };
        }
        case "text":
            return applyTransform(
                {
                    x: element.x,
                    y: element.y - (element.fontSize || 16),
                    width: Math.max((element.text?.length || 1) * (element.fontSize || 16) * 0.5, 10),
                    height: element.fontSize || 16,
                },
                element.transform
            );
        default:
            return null;
    }
}

function transformStyle(element: SvgElement) {
    if (!element.transform) return undefined;
    const parts: string[] = [];
    if (element.transform.x || element.transform.y) {
        parts.push(`translate(${element.transform.x || 0} ${element.transform.y || 0})`);
    }
    if (element.transform.scaleX || element.transform.scaleY) {
        const sx = element.transform.scaleX ?? 1;
        const sy = element.transform.scaleY ?? sx;
        parts.push(`scale(${sx} ${sy})`);
    }
    if (element.transform.rotation) {
        parts.push(`rotate(${element.transform.rotation})`);
    }
    return parts.length > 0 ? parts.join(" ") : undefined;
}

export function SvgStudio() {
    const {
        doc,
        elements,
        tool,
        setTool,
        selectedId,
        setSelectedId,
        selectedIds,
        setSelectedIds,
        addElement,
        updateElement,
        moveElement,
        removeElement,
        duplicateElement,
        exportSvgMarkup,
        loadSvgMarkup,
        clearSvg,
        history,
        undo,
        redo,
        commitSnapshot,
        duplicateMany,
        removeMany,
        defsMarkup,
    } = useSvgEditor();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [draft, setDraft] = useState<DraftShape>(null);
    const [dragging, setDragging] = useState<PointerDrag>(null);
    const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
    const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
    const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
    const elementRefs = useRef<Record<string, SVGGraphicsElement | null>>({});
    const [measuredBounds, setMeasuredBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const resizeOriginRef = useRef<{
        handle: ResizeHandle;
        start: { x: number; y: number };
        bbox: { x: number; y: number; width: number; height: number };
        elementId: string;
        snapshot: SvgElement;
    } | null>(null);

    const snapValue = (value: number) =>
        snapEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

    const canvasPoint = (event: React.PointerEvent | PointerEvent) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const ctm = svg.getScreenCTM();
        const local = ctm ? pt.matrixTransform(ctm.inverse()) : pt;
        return { x: snapValue(local.x), y: snapValue(local.y) };
    };

    useEffect(() => {
        const targetId = selectedId || (selectedIds.size === 1 ? Array.from(selectedIds)[0] : null);
        if (!targetId) {
            setMeasuredBounds(null);
            return;
        }
        const node = elementRefs.current[targetId];
        if (node && "getBBox" in node) {
            const box = (node as SVGGraphicsElement).getBBox();
            setMeasuredBounds({ x: box.x, y: box.y, width: box.width, height: box.height });
        } else {
            const element = elements.find((item) => item.id === targetId);
            if (!element) return;
            const bounds = getBounds(element);
            setMeasuredBounds(bounds);
        }
    }, [selectedId, selectedIds, elements]);

    useEffect(() => {
        const handleMove = (event: PointerEvent) => {
            if (isMarqueeSelecting) {
                const start = marqueeStartRef.current;
                if (!start) return;
                const { x, y } = canvasPoint(event);
                const rect = {
                    x: Math.min(start.x, x),
                    y: Math.min(start.y, y),
                    width: Math.abs(x - start.x),
                    height: Math.abs(y - start.y),
                };
                setMarqueeRect(rect);
                const next = new Set<string>();
                elements.forEach((el) => {
                    if (el.visible === false) return;
                    const bounds = getBounds(el);
                    if (!bounds) return;
                    const intersects =
                        bounds.x >= rect.x &&
                        bounds.y >= rect.y &&
                        bounds.x + bounds.width <= rect.x + rect.width &&
                        bounds.y + bounds.height <= rect.y + rect.height;
                    if (intersects) {
                        next.add(el.id);
                    }
                });
                setSelectedIds(next);
                setSelectedId(next.size === 1 ? Array.from(next)[0] : null);
                return;
            }
            if (!dragging) return;
            const { x, y } = canvasPoint(event);
            const dx = x - dragging.start.x;
            const dy = y - dragging.start.y;
            if (selectedIds.size > 1) {
                selectedIds.forEach((id) => moveElement(id, dx, dy, { record: false }));
            } else {
                moveElement(dragging.id, dx, dy, { record: false });
            }
            setDragging((prev) => prev ? { ...prev, start: { x, y } } : null);
        };
        const handleUp = () => {
            if (isMarqueeSelecting) {
                setIsMarqueeSelecting(false);
                setMarqueeRect(null);
                marqueeStartRef.current = null;
            }
            setDragging(null);
        };
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        window.addEventListener("pointercancel", handleUp);
        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
            window.removeEventListener("pointercancel", handleUp);
        };
    }, [dragging, moveElement, isMarqueeSelecting, selectedIds, elements, canvasPoint]);

    useEffect(() => {
        const handleResizeMove = (event: PointerEvent) => {
            if (!resizeOriginRef.current) return;
            const { start, handle, bbox, elementId, snapshot } =
                resizeOriginRef.current;
            const { x, y } = canvasPoint(event);
            const dx = x - start.x;
            const dy = y - start.y;
            const applyRectResize = (el: SvgElement) => {
                const next = { ...(el as any) };
                let newX = bbox.x;
                let newY = bbox.y;
                let newW = bbox.width;
                let newH = bbox.height;
                const applyX = () => {
                    if (handle.includes("e")) newW = Math.max(2, bbox.width + dx);
                    if (handle.includes("w")) {
                        newW = Math.max(2, bbox.width - dx);
                        newX = bbox.x + dx;
                    }
                };
                const applyY = () => {
                    if (handle.includes("s")) newH = Math.max(2, bbox.height + dy);
                    if (handle.includes("n")) {
                        newH = Math.max(2, bbox.height - dy);
                        newY = bbox.y + dy;
                    }
                };
                applyX();
                applyY();
                return { next, newX, newY, newW, newH };
            };
            updateElement(elementId, () => {
                switch (snapshot.type) {
                    case "rect": {
                        const { newX, newY, newW, newH } = applyRectResize(snapshot);
                        return {
                            ...snapshot,
                            x: snapValue(newX),
                            y: snapValue(newY),
                            width: snapValue(newW),
                            height: snapValue(newH),
                        };
                    }
                    case "ellipse": {
                        const { newX, newY, newW, newH } = applyRectResize(snapshot);
                        return {
                            ...snapshot,
                            cx: snapValue(newX + newW / 2),
                            cy: snapValue(newY + newH / 2),
                            rx: snapValue(newW / 2),
                            ry: snapValue(newH / 2),
                        };
                    }
                    case "line": {
                        const { newX, newY, newW, newH } = applyRectResize(snapshot);
                        const cx = newX + newW / 2;
                        const cy = newY + newH / 2;
                        return {
                            ...snapshot,
                            x1: snapValue(cx - newW / 2),
                            x2: snapValue(cx + newW / 2),
                            y1: snapValue(cy - newH / 2),
                            y2: snapValue(cy + newH / 2),
                        };
                    }
                    case "text": {
                        const { newY, newH } = applyRectResize(snapshot);
                        const nextSize = Math.max(8, newH);
                        return {
                            ...snapshot,
                            y: snapValue(newY + nextSize),
                            fontSize: snapValue(nextSize),
                        };
                    }
                    case "path": {
                        const { newX, newY, newW, newH } = applyRectResize(snapshot);
                        const scaleX = newW / Math.max(1, bbox.width);
                        const scaleY = newH / Math.max(1, bbox.height);
                        return {
                            ...snapshot,
                            transform: {
                                ...(snapshot.transform || {}),
                                x: snapValue(newX),
                                y: snapValue(newY),
                                scaleX,
                                scaleY,
                            },
                        };
                    }
                    default:
                        return snapshot;
                }
            }, { record: false });
        };
        const handleResizeUp = () => {
            resizeOriginRef.current = null;
            setActiveHandle(null);
        };
        window.addEventListener("pointermove", handleResizeMove);
        window.addEventListener("pointerup", handleResizeUp);
        window.addEventListener("pointercancel", handleResizeUp);
        return () => {
            window.removeEventListener("pointermove", handleResizeMove);
            window.removeEventListener("pointerup", handleResizeUp);
            window.removeEventListener("pointercancel", handleResizeUp);
        };
    }, [canvasPoint, updateElement]);

    const handleCanvasPointerDown = (event: React.PointerEvent) => {
        if (event.button !== 0) return;
        const point = canvasPoint(event);
        if (tool === "select") {
            // draw.io 风格：空白拖拽直接框选，不要求按 Shift
            // 如果已有选中且点击落在选中包围盒内，则直接进入拖动选中集合
            if (selectedIds.size > 0) {
                const ids = Array.from(selectedIds);
                const boxes = ids
                    .map((id) => {
                        const el = elements.find((item) => item.id === id && item.visible !== false);
                        return el ? getBounds(el) : null;
                    })
                    .filter(Boolean) as Array<{ x: number; y: number; width: number; height: number }>;
                if (boxes.length > 0) {
                    const minX = Math.min(...boxes.map((b) => b.x));
                    const minY = Math.min(...boxes.map((b) => b.y));
                    const maxX = Math.max(...boxes.map((b) => b.x + b.width));
                    const maxY = Math.max(...boxes.map((b) => b.y + b.height));
                    const inside =
                        point.x >= minX &&
                        point.x <= maxX &&
                        point.y >= minY &&
                        point.y <= maxY;
                    if (inside) {
                        commitSnapshot();
                        setDragging({ id: ids[0], start: point });
                        return;
                    }
                }
            }
            setSelectedIds(new Set());
            setSelectedId(null);
            marqueeStartRef.current = point;
            setMarqueeRect({ x: point.x, y: point.y, width: 0, height: 0 });
            setIsMarqueeSelecting(true);
            return;
        }
        if (tool === "text") {
            const id = addElement({
                type: "text",
                x: point.x,
                y: point.y,
                text: "双击编辑文本",
                fill: "#0f172a",
                fontSize: 16,
            });
            setSelectedIds(new Set([id]));
            setSelectedId(id);
            setTool("select");
            return;
        }
        const drawMode: "rect" | "ellipse" | "line" =
            tool === "rect" || tool === "ellipse" || tool === "line" ? tool : "rect";
        setDraft({
            mode: drawMode,
            start: point,
            current: point,
        });
    };

    const handleCanvasPointerMove = (event: React.PointerEvent) => {
        if (!draft) return;
        const point = canvasPoint(event);
        setDraft((prev) => (prev ? { ...prev, current: point } : null));
    };

    const handleCanvasPointerUp = () => {
        if (!draft) return;
        const { start, current, mode } = draft;
        const width = current.x - start.x;
        const height = current.y - start.y;
        const normalized = {
            x: width >= 0 ? start.x : start.x + width,
            y: height >= 0 ? start.y : start.y + height,
            width: Math.abs(width) || 2,
            height: Math.abs(height) || 2,
        };
        const tooSmall =
            (mode === "line" && Math.hypot(width, height) < 6) ||
            (mode !== "line" && normalized.width < 4 && normalized.height < 4);
        if (tooSmall) {
            setDraft(null);
            setTool("select");
            return;
        }
        if (mode === "rect") {
            addElement({
                type: "rect",
                x: normalized.x,
                y: normalized.y,
                width: normalized.width,
                height: normalized.height,
                fill: "#ffffff",
                stroke: "#0f172a",
                strokeWidth: 1.6,
            });
        } else if (mode === "ellipse") {
            addElement({
                type: "ellipse",
                cx: normalized.x + normalized.width / 2,
                cy: normalized.y + normalized.height / 2,
                rx: normalized.width / 2,
                ry: normalized.height / 2,
                fill: "#ffffff",
                stroke: "#0f172a",
                strokeWidth: 1.6,
            });
        } else if (mode === "line") {
            addElement({
                type: "line",
                x1: start.x,
                y1: start.y,
                x2: current.x,
                y2: current.y,
                stroke: "#0f172a",
                strokeWidth: 1.6,
            });
        }
        setDraft(null);
        setTool("select");
    };

    const handleElementPointerDown = (event: React.PointerEvent, element: SvgElement) => {
        if (element.locked) return;
        if (tool !== "select") return;
        event.stopPropagation();
        commitSnapshot();
        const point = canvasPoint(event);
        const alreadySelected = selectedIds.has(element.id);
        if (event.shiftKey || event.metaKey || event.ctrlKey) {
            const next = new Set(selectedIds);
            if (alreadySelected) {
                next.delete(element.id);
            } else {
                next.add(element.id);
            }
            setSelectedIds(next);
            setSelectedId(next.size === 1 ? element.id : null);
        } else {
            if (alreadySelected && selectedIds.size > 1) {
                // 保持多选集合不变
                setSelectedIds(new Set(selectedIds));
                setSelectedId(null);
            } else {
                setSelectedIds(new Set([element.id]));
                setSelectedId(element.id);
            }
        }
        setDragging({
            id: element.id,
            start: point,
        });
    };

    const selectedElement = useMemo(
        () => elements.find((item) => item.id === selectedId),
        [elements, selectedId]
    );

    const handlePropertyChange = <K extends keyof SvgElement>(key: K, value: SvgElement[K]) => {
        if (!selectedElement) return;
        updateElement(selectedElement.id, { [key]: value } as Partial<SvgElement>);
    };

    const handleStyleChange = (partial: Partial<SvgElement>) => {
        if (!selectedElement) return;
        updateElement(selectedElement.id, partial);
    };

    const handleExport = async () => {
        const svg = exportSvgMarkup();
        try {
            await navigator.clipboard.writeText(svg);
        } catch (error) {
            console.error("复制 SVG 失败", error);
        }
    };

    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        loadSvgMarkup(text);
        event.target.value = "";
    };

    const alignSelection = (direction: "left" | "centerX" | "right" | "top" | "centerY" | "bottom") => {
        const target = selectedElement;
        if (!target) return;
        const padding = 16;
        const docWidth = doc.width;
        const docHeight = doc.height;
        updateElement(target.id, (el) => {
            switch (el.type) {
                case "rect": {
                    const next = { ...el };
                    if (direction === "left") next.x = padding;
                    if (direction === "right") next.x = docWidth - padding - el.width;
                    if (direction === "centerX") next.x = (docWidth - el.width) / 2;
                    if (direction === "top") next.y = padding;
                    if (direction === "bottom") next.y = docHeight - padding - el.height;
                    if (direction === "centerY") next.y = (docHeight - el.height) / 2;
                    return next;
                }
                case "ellipse": {
                    const next = { ...el };
                    if (direction === "left") next.cx = padding + el.rx;
                    if (direction === "right") next.cx = docWidth - padding - el.rx;
                    if (direction === "centerX") next.cx = docWidth / 2;
                    if (direction === "top") next.cy = padding + el.ry;
                    if (direction === "bottom") next.cy = docHeight - padding - el.ry;
                    if (direction === "centerY") next.cy = docHeight / 2;
                    return next;
                }
                case "line": {
                    const dx = el.x2 - el.x1;
                    const dy = el.y2 - el.y1;
                    const next = { ...el };
                    if (direction === "left") {
                        next.x1 = padding;
                        next.x2 = padding + dx;
                    }
                    if (direction === "right") {
                        next.x1 = docWidth - padding - dx;
                        next.x2 = docWidth - padding;
                    }
                    if (direction === "centerX") {
                        const midX = docWidth / 2;
                        const halfDx = dx / 2;
                        next.x1 = midX - halfDx;
                        next.x2 = midX + halfDx;
                    }
                    if (direction === "top") {
                        next.y1 = padding;
                        next.y2 = padding + dy;
                    }
                    if (direction === "bottom") {
                        next.y1 = docHeight - padding - dy;
                        next.y2 = docHeight - padding;
                    }
                    if (direction === "centerY") {
                        const midY = docHeight / 2;
                        const halfDy = dy / 2;
                        next.y1 = midY - halfDy;
                        next.y2 = midY + halfDy;
                    }
                    return next;
                }
                case "text": {
                    const next = { ...el };
                    if (direction === "left") next.x = padding;
                    if (direction === "right") next.x = docWidth - padding;
                    if (direction === "centerX") next.x = docWidth / 2;
                    if (direction === "top") next.y = padding + (el.fontSize || 16);
                    if (direction === "bottom") next.y = docHeight - padding;
                    if (direction === "centerY") next.y = docHeight / 2;
                    return next;
                }
                case "path": {
                    const transform = { ...(el.transform || {}) };
                    if (direction === "left") transform.x = padding;
                    if (direction === "right") transform.x = docWidth - padding;
                    if (direction === "centerX") transform.x = docWidth / 2;
                    if (direction === "top") transform.y = padding;
                    if (direction === "bottom") transform.y = docHeight - padding;
                    if (direction === "centerY") transform.y = docHeight / 2;
                    return { ...el, transform };
                }
                default:
                    return el;
            }
        });
    };

    const toggleLock = (id: string, locked: boolean) => {
        updateElement(id, { locked });
        if (locked && selectedId === id) {
            setSelectedId(null);
        }
    };

    const toggleVisible = (id: string, visible: boolean) => {
        updateElement(id, { visible });
        if (!visible && selectedId === id) {
            setSelectedId(null);
        }
    };

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            const isMeta = event.metaKey || event.ctrlKey;
            if (isMeta && !event.shiftKey && event.key.toLowerCase() === "z") {
                event.preventDefault();
                undo();
                return;
            }
            if (isMeta && event.shiftKey && event.key.toLowerCase() === "z") {
                event.preventDefault();
                redo();
                return;
            }
            const currentSelection = selectedIds.size > 0 ? Array.from(selectedIds) : selectedId ? [selectedId] : [];
            if (currentSelection.length === 0) return;
            if (event.key === "Backspace" || event.key === "Delete") {
                event.preventDefault();
                removeMany(currentSelection);
            }
            if (isMeta && event.key.toLowerCase() === "d") {
                event.preventDefault();
                duplicateMany(currentSelection);
            }
            if (isMeta && event.key.toLowerCase() === "c") {
                event.preventDefault();
                duplicateMany(currentSelection);
            }
            if (isMeta && event.key.toLowerCase() === "x") {
                event.preventDefault();
                removeMany(currentSelection);
                return;
            }
            if (isMeta && event.key.toLowerCase() === "a") {
                event.preventDefault();
                const all = elements.filter((el) => el.visible !== false && el.locked !== true).map((el) => el.id);
                setSelectedIds(new Set(all));
                setSelectedId(all.length === 1 ? all[0] : null);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selectedId, selectedIds, removeMany, duplicateMany, undo, redo]);

    const draftShape = useMemo(() => {
        if (!draft) return null;
        const { start, current, mode } = draft;
        if (mode === "line") {
            return (
                <line
                    x1={start.x}
                    y1={start.y}
                    x2={current.x}
                    y2={current.y}
                    className="pointer-events-none"
                    stroke="#4f46e5"
                    strokeDasharray="4 2"
                    strokeWidth={1.4}
                />
            );
        }
        const width = current.x - start.x;
        const height = current.y - start.y;
        const normalized = {
            x: width >= 0 ? start.x : start.x + width,
            y: height >= 0 ? start.y : start.y + height,
            width: Math.abs(width),
            height: Math.abs(height),
        };
        if (mode === "rect") {
            return (
                <rect
                    x={normalized.x}
                    y={normalized.y}
                    width={normalized.width}
                    height={normalized.height}
                    className="pointer-events-none"
                    stroke="#4f46e5"
                    strokeDasharray="4 2"
                    strokeWidth={1.4}
                    fill="none"
                />
            );
        }
        if (mode === "ellipse") {
            return (
                <ellipse
                    cx={normalized.x + normalized.width / 2}
                    cy={normalized.y + normalized.height / 2}
                    rx={normalized.width / 2}
                    ry={normalized.height / 2}
                    className="pointer-events-none"
                    stroke="#4f46e5"
                    strokeDasharray="4 2"
                    strokeWidth={1.4}
                    fill="none"
                />
            );
        }
        return null;
    }, [draft]);

    return (
        <div className="flex h-full w-full gap-3">
            <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1">
                        {TOOL_CONFIG.map((item) => {
                            const Icon = item.icon;
                            const active = tool === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTool(item.id)}
                                    className={cn(
                                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition",
                                        active
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1">
                            <button
                                type="button"
                                className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                onClick={() => undo()}
                                title="撤销 (Cmd/Ctrl+Z)"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                onClick={() => redo()}
                                title="重做 (Cmd/Ctrl+Shift+Z)"
                            >
                                <RotateCw className="h-4 w-4" />
                            </button>
                            <div className="h-5 w-px bg-slate-200" />
                            <button
                                type="button"
                                onClick={() => setSnapEnabled((prev) => !prev)}
                                className={cn(
                                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition",
                                    snapEnabled
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-700 hover:bg-slate-100"
                                )}
                            >
                                <Grid className="h-4 w-4" />
                                吸附
                            </button>
                            <div className="h-5 w-px bg-slate-200" />
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                    onClick={() => alignSelection("left")}
                                    title="左对齐"
                                >
                                    <AlignStartHorizontal className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                    onClick={() => alignSelection("centerX")}
                                    title="水平居中"
                                >
                                    <AlignCenterHorizontal className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                    onClick={() => alignSelection("right")}
                                    title="右对齐"
                                >
                                    <AlignEndHorizontal className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                    onClick={() => alignSelection("top")}
                                    title="顶部对齐"
                                >
                                    <AlignStartVertical className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                    onClick={() => alignSelection("centerY")}
                                    title="垂直居中"
                                >
                                    <AlignCenterVertical className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                    onClick={() => alignSelection("bottom")}
                                    title="底部对齐"
                                >
                                    <ArrowDownToLine className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="gap-1"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4" />
                                导入 SVG
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={handleExport}
                            >
                                <Copy className="h-4 w-4" />
                                复制 SVG
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                className="gap-1"
                                onClick={() => clearSvg()}
                            >
                                <Eraser className="h-4 w-4" />
                                清空
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative flex-1 bg-slate-50">
                    <div className="absolute inset-0">
                        <GridPattern />
                    </div>
                    <svg
                        ref={svgRef}
                        className="relative z-10 h-full w-full"
                        width={doc.width}
                        height={doc.height}
                        viewBox={doc.viewBox || `0 0 ${doc.width} ${doc.height}`}
                        onPointerDown={handleCanvasPointerDown}
                        onPointerMove={handleCanvasPointerMove}
                        onPointerUp={handleCanvasPointerUp}
                    >
                        {defsMarkup && (
                            <defs dangerouslySetInnerHTML={{ __html: defsMarkup }} />
                        )}
                        {elements.map((element) => {
                            if (element.visible === false) return null;
                            const transform = transformStyle(element);
                            const commonProps = {
                                ref: (node: SVGGraphicsElement | null) => {
                                    elementRefs.current[element.id] = node;
                                },
                                onPointerDown: (event: React.PointerEvent) =>
                                    handleElementPointerDown(event, element),
                                transform,
                                className: cn(
                                    "cursor-default",
                                    (selectedIds.has(element.id) || selectedId === element.id) &&
                                        "outline-none ring-2 ring-offset-2 ring-blue-500/50"
                                ),
                            } as const;
                            switch (element.type) {
                                case "rect":
                                    return (
                                        <rect
                                            key={element.id}
                                            {...commonProps}
                                            x={element.x}
                                            y={element.y}
                                            width={element.width}
                                            height={element.height}
                                            rx={element.rx}
                                            ry={element.ry}
                                            fill={element.fill || "none"}
                                            stroke={element.stroke || "#0f172a"}
                                            strokeWidth={element.strokeWidth || 1.4}
                                            opacity={element.opacity}
                                        />
                                    );
                                case "ellipse":
                                    return (
                                        <ellipse
                                            key={element.id}
                                            {...commonProps}
                                            cx={element.cx}
                                            cy={element.cy}
                                            rx={element.rx}
                                            ry={element.ry}
                                            fill={element.fill || "none"}
                                            stroke={element.stroke || "#0f172a"}
                                            strokeWidth={element.strokeWidth || 1.4}
                                            opacity={element.opacity}
                                        />
                                    );
                                case "line":
                                    return (
                                        <line
                                            key={element.id}
                                            {...commonProps}
                                            x1={element.x1}
                                            y1={element.y1}
                                            x2={element.x2}
                                            y2={element.y2}
                                            stroke={element.stroke || "#0f172a"}
                                            strokeWidth={element.strokeWidth || 1.6}
                                            opacity={element.opacity}
                                        />
                                    );
                                case "path":
                                    return (
                                        <path
                                            key={element.id}
                                            {...commonProps}
                                            d={element.d}
                                            fill={element.fill || "none"}
                                            stroke={element.stroke || "#0f172a"}
                                            strokeWidth={element.strokeWidth || 1.4}
                                            opacity={element.opacity}
                                        />
                                    );
                                case "text":
                                    return (
                                        <text
                                            key={element.id}
                                            {...commonProps}
                                            x={element.x}
                                            y={element.y}
                                            fill={element.fill || "#0f172a"}
                                            fontSize={element.fontSize || 16}
                                            fontWeight={element.fontWeight}
                                            textAnchor={element.textAnchor || "start"}
                                        >
                                            {element.text}
                                        </text>
                                    );
                                default:
                                    return null;
                            }
                        })}

                        {draftShape}

                        {measuredBounds && (
                            <rect
                                x={measuredBounds.x - 4}
                                y={measuredBounds.y - 4}
                                width={measuredBounds.width + 8}
                                height={measuredBounds.height + 8}
                                fill="none"
                                stroke="#3b82f6"
                                strokeDasharray="6 4"
                                strokeWidth={1.4}
                                pointerEvents="none"
                            />
                        )}
                        {marqueeRect && isMarqueeSelecting && (
                            <rect
                                x={marqueeRect.x}
                                y={marqueeRect.y}
                                width={marqueeRect.width}
                                height={marqueeRect.height}
                                fill="rgba(59,130,246,0.08)"
                                stroke="#3b82f6"
                                strokeDasharray="4 2"
                                strokeWidth={1}
                                pointerEvents="none"
                            />
                        )}
                        {marqueeRect && isMarqueeSelecting && (
                            <rect
                                x={marqueeRect.x}
                                y={marqueeRect.y}
                                width={marqueeRect.width}
                                height={marqueeRect.height}
                                fill="rgba(59,130,246,0.08)"
                                stroke="#3b82f6"
                                strokeDasharray="4 2"
                                strokeWidth={1}
                                pointerEvents="none"
                            />
                        )}
                        {Array.from(selectedIds)
                            .map((id) => {
                                const el = elements.find((item) => item.id === id);
                                if (!el) return null;
                                const bounds = getBounds(el);
                                if (!bounds) return null;
                                return { id, bounds };
                            })
                            .filter(Boolean)
                            .map((item) => (
                                <rect
                                    key={item!.id}
                                    x={item!.bounds.x - 4}
                                    y={item!.bounds.y - 4}
                                    width={item!.bounds.width + 8}
                                    height={item!.bounds.height + 8}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeDasharray="4 2"
                                    strokeWidth={1.2}
                                    pointerEvents="none"
                                />
                            ))}
                        {measuredBounds && selectedElement && (
                            <ResizeHandles
                                bounds={measuredBounds}
                                onHandleDown={(handle, event) => {
                                    const bbox = measuredBounds;
                                    commitSnapshot();
                                    resizeOriginRef.current = {
                                        handle,
                                        start: canvasPoint(event),
                                        bbox,
                                        elementId: selectedElement.id,
                                        snapshot: selectedElement,
                                    };
                                    setActiveHandle(handle);
                                    event.stopPropagation();
                                    event.preventDefault();
                                }}
                                activeHandle={activeHandle}
                            />
                        )}
                    </svg>
                </div>
            </div>

            <div className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <div className="flex items-center justify-between pb-2">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">属性</p>
                        <p className="text-xs text-slate-500">
                            选择图形后调整样式
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setSelectedId(null)}
                        title="取消选择"
                    >
                        <MousePointer2 className="h-4 w-4" />
                    </Button>
                </div>
                {selectedElement ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => selectedElement && duplicateElement(selectedElement.id)}
                                className="gap-1"
                            >
                                复制
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => selectedElement && removeElement(selectedElement.id)}
                                className="gap-1"
                            >
                                删除
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="text-xs text-slate-600">填充</label>
                            <label className="text-xs text-slate-600">描边</label>
                            <Input
                                type="color"
                                value={selectedElement.fill || "#ffffff"}
                                onChange={(e) =>
                                    handleStyleChange({ fill: e.target.value })
                                }
                                className="h-9 px-2"
                            />
                            <Input
                                type="color"
                                value={selectedElement.stroke || "#0f172a"}
                                onChange={(e) =>
                                    handleStyleChange({ stroke: e.target.value })
                                }
                                className="h-9 px-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="text-xs text-slate-600">线宽</label>
                            <Input
                                type="number"
                                min={0}
                                step={0.2}
                                value={selectedElement.strokeWidth ?? 1.6}
                                onChange={(e) =>
                                    handleStyleChange({
                                        strokeWidth: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="col-span-1 h-9"
                            />
                            <label className="text-xs text-slate-600">不透明度</label>
                            <Input
                                type="number"
                                min={0}
                                max={1}
                                step={0.05}
                                value={selectedElement.opacity ?? 1}
                                onChange={(e) =>
                                    handleStyleChange({
                                        opacity: Math.min(
                                            1,
                                            Math.max(0, parseFloat(e.target.value) || 0)
                                        ),
                                    })
                                }
                                className="col-span-1 h-9"
                            />
                        </div>

                        {selectedElement.type === "text" && (
                            <div className="space-y-2">
                                <label className="text-xs text-slate-600">文本</label>
                                <Input
                                    value={(selectedElement as any).text ?? ""}
                                    onChange={(e) =>
                                        handlePropertyChange("text" as keyof SvgElement, e.target.value)
                                    }
                                    className="h-9"
                                />
                                <label className="text-xs text-slate-600">字号</label>
                                <Input
                                    type="number"
                                    min={8}
                                    max={96}
                                    value={selectedElement.fontSize ?? 16}
                                    onChange={(e) =>
                                        handlePropertyChange(
                                            "fontSize" as keyof SvgElement,
                                            parseFloat(e.target.value) || 16
                                        )
                                    }
                                    className="h-9"
                                />
                            </div>
                        )}

                        {selectedElement.type === "rect" && (
                            <div className="grid grid-cols-2 gap-2">
                                <label className="text-xs text-slate-600">圆角 rx</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={selectedElement.rx ?? 0}
                                    onChange={(e) =>
                                        handlePropertyChange(
                                            "rx" as any,
                                            Math.max(0, parseFloat(e.target.value) || 0) as any
                                        )
                                    }
                                    className="h-9"
                                />
                                <label className="text-xs text-slate-600">圆角 ry</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={selectedElement.ry ?? 0}
                                    onChange={(e) =>
                                        handlePropertyChange(
                                            "ry" as any,
                                            Math.max(0, parseFloat(e.target.value) || 0) as any
                                        )
                                    }
                                    className="h-9"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                        选择任意图形以编辑属性，或使用工具栏添加新的 SVG 元素。
                    </div>
                )}

                <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">图层</p>
                    <div className="max-h-48 overflow-auto space-y-1 pr-1">
                        {elements.length === 0 ? (
                            <p className="text-xs text-slate-500">暂无元素，使用工具栏添加。</p>
                        ) : (
                            [...elements].reverse().map((el) => (
                                <div
                                    key={el.id}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg border px-2 py-1 text-xs",
                                        selectedId === el.id
                                            ? "border-blue-200 bg-blue-50"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <button
                                        type="button"
                                        className="flex-1 text-left truncate"
                                        onClick={() => setSelectedId(el.id)}
                                        disabled={el.locked}
                                    >
                                        <span className="font-semibold text-slate-800">
                                            {el.type}
                                        </span>
                                        <span className="ml-1 text-slate-500">
                                            #{el.id.slice(0, 4)}
                                        </span>
                                        {el.locked && (
                                            <span className="ml-1 text-[10px] text-slate-500">
                                                (锁定)
                                            </span>
                                        )}
                                        {el.visible === false && (
                                            <span className="ml-1 text-[10px] text-slate-400">
                                                (隐藏)
                                            </span>
                                        )}
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                            onClick={() => toggleVisible(el.id, el.visible === false ? true : false)}
                                            title={el.visible === false ? "显示" : "隐藏"}
                                        >
                                            {el.visible === false ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                                            onClick={() => toggleLock(el.id, !(el.locked === true))}
                                            title={el.locked ? "解锁" : "锁定"}
                                        >
                                            {el.locked ? (
                                                <Unlock className="h-4 w-4" />
                                            ) : (
                                                <Lock className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1">历史</p>
                    {history.length === 0 ? (
                        <p className="text-xs text-slate-500">
                            暂无快照，AI 生成或导入时会自动记录。
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500">
                            已记录 {history.length} 版，使用对话历史可恢复。
                        </p>
                    )}
                </div>
            </div>

            <input
                type="file"
                accept="image/svg+xml,.svg"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImportFile}
            />
        </div>
    );
}

function GridPattern() {
    const size = 20;
    return (
        <svg className="h-full w-full" aria-hidden>
            <defs>
                <pattern
                    id="grid"
                    x="0"
                    y="0"
                    width={size}
                    height={size}
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d={`M ${size} 0 L 0 0 0 ${size}`}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="0.8"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    );
}

function ResizeHandles({
    bounds,
    onHandleDown,
    activeHandle,
}: {
    bounds: { x: number; y: number; width: number; height: number };
    onHandleDown: (handle: ResizeHandle, event: React.PointerEvent) => void;
    activeHandle: ResizeHandle | null;
}) {
    const { x, y, width, height } = bounds;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = 8;
    const handles: Array<{ handle: ResizeHandle; cx: number; cy: number }> = [
        { handle: "nw", cx: x, cy: y },
        { handle: "n", cx, cy: y },
        { handle: "ne", cx: x + width, cy: y },
        { handle: "w", cx: x, cy },
        { handle: "e", cx: x + width, cy },
        { handle: "sw", cx: x, cy: y + height },
        { handle: "s", cx, cy: y + height },
        { handle: "se", cx: x + width, cy: y + height },
    ];
    return (
        <>
            {handles.map((h) => (
                <rect
                    key={h.handle}
                    x={h.cx - size / 2}
                    y={h.cy - size / 2}
                    width={size}
                    height={size}
                    rx={2}
                    ry={2}
                    fill={activeHandle === h.handle ? "#2563eb" : "#ffffff"}
                    stroke="#2563eb"
                    strokeWidth={1.2}
                    className="cursor-pointer"
                    onPointerDown={(event) => onHandleDown(h.handle, event)}
                />
            ))}
        </>
    );
}
