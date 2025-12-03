"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronUp,
    Figma,
    LayoutDashboard,
    Sparkles,
    Workflow,
    Bot,
    CheckCircle2,
    XCircle,
    Plus,
    Minimize2,
    Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowPilotBriefState, BRIEF_MODE_OPTIONS, INTENT_OPTIONS, TONE_OPTIONS, FOCUS_OPTIONS, DIAGRAM_TYPE_OPTIONS, BriefFocusId, BriefDiagramTypeId } from "./flowpilot-brief";
import type { ModelEndpointConfig, RuntimeModelOption } from "@/types/model-config";

interface FlowPilotBriefCollapsibleProps {
    state: FlowPilotBriefState;
    onChange: (state: Partial<FlowPilotBriefState>) => void;
    disabled?: boolean;
    badges?: string[];
    modelEndpoints?: ModelEndpointConfig[];
    modelOptions?: RuntimeModelOption[];
    selectedModelKey?: string;
    onSelectModel?: (modelKey: string) => void;
    onManageModels?: () => void;
}

export function FlowPilotBriefCollapsible({
    state,
    onChange,
    disabled = false,
    badges = [],
    modelEndpoints = [],
    modelOptions = [],
    selectedModelKey,
    onSelectModel,
    onManageModels,
}: FlowPilotBriefCollapsibleProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllDiagramTypes, setShowAllDiagramTypes] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 200 });
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

    const mode = state.mode ?? "guided";
    const isFreeMode = mode === "free";

    const handleFocusToggle = (focusId: BriefFocusId) => {
        const exists = state.focus.includes(focusId);
        const next = exists
            ? state.focus.filter((id) => id !== focusId)
            : [...state.focus, focusId];
        onChange({ focus: next });
    };

    const handleDiagramTypeToggle = (diagramTypeId: BriefDiagramTypeId) => {
        const exists = state.diagramTypes.includes(diagramTypeId);
        const next = exists
            ? state.diagramTypes.filter((id) => id !== diagramTypeId)
            : [...state.diagramTypes, diagramTypeId];
        onChange({ diagramTypes: next });
    };

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return;
            const deltaX = e.clientX - dragRef.current.startX;
            const deltaY = e.clientY - dragRef.current.startY;
            setPosition({
                x: Math.max(0, Math.min(window.innerWidth - 400, dragRef.current.startPosX + deltaX)),
                y: Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPosY + deltaY)),
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragRef.current = null;
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    const selectedModel = selectedModelKey ? modelOptions.find(m => m.key === selectedModelKey) : null;
    const hasModels = modelOptions.length > 0;

    const getModelStatusIcon = (model: RuntimeModelOption) => {
        const endpoint = modelEndpoints.find(ep => ep.id === model.endpointId);
        if (endpoint?.baseUrl && endpoint?.apiKey) {
            return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
        }
        return <XCircle className="h-3 w-3 text-red-500" />;
    };

    const autoOption = DIAGRAM_TYPE_OPTIONS.find(opt => opt.id === "auto");
    const specificOptions = DIAGRAM_TYPE_OPTIONS.filter(opt => opt.id !== "auto");

    return (
        <div
            className={cn(
                "fixed z-50 transition-all duration-300",
                isDragging && "cursor-grabbing"
            )}
            style={{
                left: position.x + 'px',
                top: position.y + 'px',
                width: isExpanded ? '420px' : '360px',
            }}
        >
            <div
                className={cn(
                    "rounded-3xl transition-all duration-500 ease-out",
                    "bg-white/70 backdrop-blur-2xl backdrop-saturate-150",
                    "border border-white/20",
                    "shadow-2xl shadow-black/10",
                    "ring-1 ring-black/5",
                    isExpanded ? "max-h-[80vh] overflow-y-auto" : "max-h-24"
                )}
                style={{
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
            >
                <div
                    className={cn(
                        "flex items-center justify-between p-4 cursor-grab active:cursor-grabbing",
                        !isExpanded && "rounded-3xl"
                    )}
                    onMouseDown={handleMouseDown}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-md opacity-50"></div>
                            <Sparkles className="h-5 w-5 text-amber-500 relative z-10" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">FlowPilot Brief</h3>
                            <p className="text-xs text-slate-500">
                                {isExpanded ? "点击收起" : badges.length > 0 ? badges.slice(0, 2).join(" · ") : "点击展开配置"}
                            </p>
                        </div>
                    </div>
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="h-8 w-8 p-0 rounded-full bg-slate-100/80 hover:bg-slate-200/80 transition-all"
                    >
                        {isExpanded ? (
                            <Minimize2 className="h-4 w-4 text-slate-700" />
                        ) : (
                            <Maximize2 className="h-4 w-4 text-slate-700" />
                        )}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                        <section>
                            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                出图模式
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {BRIEF_MODE_OPTIONS.map((option) => {
                                    const isActive = mode === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled={disabled}
                                            className={cn(
                                                "relative rounded-2xl px-3 py-2.5 text-left transition-all duration-200",
                                                "backdrop-blur-sm",
                                                isActive
                                                    ? "bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/20"
                                                    : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200/50"
                                            )}
                                            onClick={() => onChange({ mode: option.id })}
                                        >
                                            <p className="text-sm font-semibold">{option.title}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {!isFreeMode && (
                            <>
                                <section>
                                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                        任务模式
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {INTENT_OPTIONS.map((option) => {
                                            const isActive = state.intent === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    disabled={disabled}
                                                    className={cn(
                                                        "relative rounded-xl px-2 py-2 text-center transition-all duration-200",
                                                        isActive
                                                            ? "bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/30"
                                                            : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200/50"
                                                    )}
                                                    onClick={() => onChange({ intent: option.id })}
                                                >
                                                    <p className="text-xs font-medium">{option.title}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                                        <Figma className="h-3.5 w-3.5" />
                                        视觉风格
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TONE_OPTIONS.map((option) => {
                                            const isActive = state.tone === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    disabled={disabled}
                                                    className={cn(
                                                        "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                                                        isActive
                                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30"
                                                            : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200/50"
                                                    )}
                                                    onClick={() => onChange({ tone: option.id })}
                                                >
                                                    {option.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        设计重点
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {FOCUS_OPTIONS.map((option) => {
                                            const isActive = state.focus.includes(option.id);
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    disabled={disabled}
                                                    className={cn(
                                                        "relative rounded-xl px-2 py-2 text-center transition-all duration-200",
                                                        isActive
                                                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                                                            : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200/50"
                                                    )}
                                                    onClick={() => handleFocusToggle(option.id)}
                                                >
                                                    <p className="text-xs font-medium">{option.title}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                                        <Workflow className="h-3.5 w-3.5" />
                                        图表类型
                                    </div>

                                    {autoOption && (
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            className={cn(
                                                "w-full rounded-2xl px-3 py-2.5 text-left mb-2 transition-all duration-200",
                                                state.diagramTypes.includes(autoOption.id)
                                                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                                                    : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200/50"
                                            )}
                                            onClick={() => handleDiagramTypeToggle(autoOption.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold">{autoOption.title}</p>
                                                        <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                            推荐
                                                        </span>
                                                    </div>
                                                </div>
                                                <Sparkles className="h-4 w-4 opacity-80" />
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowAllDiagramTypes(!showAllDiagramTypes)}
                                        className="w-full rounded-xl bg-white/40 hover:bg-white/60 border border-dashed border-slate-300/50 px-3 py-2 text-xs font-medium text-slate-600 transition flex items-center justify-center gap-1"
                                    >
                                        {showAllDiagramTypes ? (
                                            <>
                                                <ChevronUp className="h-3 w-3" />
                                                收起具体类型
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3 w-3" />
                                                显示具体类型 ({specificOptions.length}个)
                                            </>
                                        )}
                                    </button>

                                    {showAllDiagramTypes && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {specificOptions.map((option) => {
                                                const isActive = state.diagramTypes.includes(option.id);
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        disabled={disabled}
                                                        className={cn(
                                                            "rounded-xl px-2 py-2 text-center transition-all duration-200",
                                                            isActive
                                                                ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30"
                                                                : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200/50"
                                                        )}
                                                        onClick={() => handleDiagramTypeToggle(option.id)}
                                                    >
                                                        <p className="text-xs font-medium">{option.title}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        <section>
                            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                                <Bot className="h-3.5 w-3.5" />
                                AI 模型
                            </div>
                            {!hasModels ? (
                                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-3 text-center">
                                    <p className="text-xs font-medium text-amber-900 mb-2">
                                        尚未配置模型接口
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={onManageModels}
                                        disabled={disabled}
                                        className="gap-1 text-xs h-7 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                    >
                                        <Plus className="h-3 w-3" />
                                        立即配置
                                    </Button>
                                </div>
                            ) : selectedModel ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                                        {getModelStatusIcon(selectedModel)}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-slate-900 truncate">
                                                {selectedModel.label || selectedModel.modelId}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {selectedModel.endpointName}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={onManageModels}
                                        disabled={disabled}
                                        className="w-full text-xs h-7 bg-white/60 hover:bg-white/80 border-slate-200/50"
                                    >
                                        管理模型
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={onManageModels}
                                    disabled={disabled}
                                    className="w-full gap-1 text-xs h-7 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                >
                                    选择模型
                                </Button>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
