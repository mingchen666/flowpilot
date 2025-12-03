"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import { ComparisonHistoryEntry } from "@/types/comparison";

interface MessageItemProps {
    message: UIMessage;
    isUser: boolean;
    isExpanded: boolean;
    isCopied: boolean;
    fullMessageText: string;
    displayableContentParts: any[];
    fallbackText: string;
    hasBubbleContent: boolean;
    toolParts: any[];
    anchoredEntries: ComparisonHistoryEntry[];
    renderToolPart: (part: any, metadata?: any) => React.ReactNode;
    renderComparisonEntry: (entry: ComparisonHistoryEntry, keyBase: string) => React.ReactNode;
    onCopyMessage: (messageId: string, text: string) => void;
    onToggleExpanded: (messageId: string) => void;
    onMessageRevert?: (payload: { messageId: string; text: string }) => void;
}

export const MessageItem = memo(({
    message,
    isUser,
    isExpanded,
    isCopied,
    fullMessageText,
    displayableContentParts,
    fallbackText,
    hasBubbleContent,
    toolParts,
    anchoredEntries,
    renderToolPart,
    renderComparisonEntry,
    onCopyMessage,
    onToggleExpanded,
    onMessageRevert,
}: MessageItemProps) => {
    const shouldCollapse = fullMessageText.length > 500;

    return (
        <div className="mb-5 flex flex-col gap-2">
            {hasBubbleContent && (
                <div
                    className={cn(
                        "flex w-full",
                        isUser ? "justify-end" : "justify-start"
                    )}
                >
                    <div className="relative max-w-[min(520px,80%)] group">
                        <div
                            className={cn(
                                "rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                                "whitespace-pre-wrap break-words",
                                isUser
                                    ? "bg-slate-900 text-white"
                                    : "border border-slate-200/60 bg-white text-slate-900",
                                !isExpanded && shouldCollapse && "max-h-[200px] overflow-hidden relative"
                            )}
                        >
                            {displayableContentParts.map((part: any, index: number) => {
                                switch (part.type) {
                                    case "text":
                                        const textToShow =
                                            part.displayText ?? part.text ?? "";
                                        return (
                                            <div key={index} className="mb-1 last:mb-0">
                                                {textToShow}
                                            </div>
                                        );
                                    case "file":
                                        return (
                                            <div key={index} className="mt-3">
                                                <Image
                                                    src={part.url}
                                                    width={240}
                                                    height={240}
                                                    alt={`file-${index}`}
                                                    className="rounded-xl border object-contain"
                                                />
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                            {!displayableContentParts.length && fallbackText && (
                                <div>{fallbackText}</div>
                            )}
                            {!isExpanded && shouldCollapse && (
                                <div
                                    className={cn(
                                        "absolute bottom-0 left-0 right-0 h-20 pointer-events-none",
                                        isUser
                                            ? "bg-gradient-to-t from-slate-900 to-transparent"
                                            : "bg-gradient-to-t from-white to-transparent"
                                    )}
                                />
                            )}
                        </div>

                        <div className={cn(
                            "flex items-center gap-1.5 mt-1.5",
                            isUser ? "justify-end" : "justify-start"
                        )}>
                            <button
                                type="button"
                                onClick={() => onCopyMessage(message.id, fullMessageText)}
                                className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                                    isUser
                                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                                    isCopied && "text-emerald-600"
                                )}
                                title="复制消息"
                            >
                                {isCopied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>已复制</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>复制</span>
                                    </>
                                )}
                            </button>

                            {shouldCollapse && (
                                <button
                                    type="button"
                                    onClick={() => onToggleExpanded(message.id)}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                                        isUser
                                            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                    )}
                                >
                                    {isExpanded ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                            <span>收起</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            <span>展开</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {isUser && onMessageRevert && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onMessageRevert({
                                            messageId: message.id,
                                            text: fullMessageText,
                                        })
                                    }
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                                        isUser
                                            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                    )}
                                    title="回滚到此处"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 3h4v4m-9 9l9-9m-9 0h4"
                                        />
                                    </svg>
                                    <span>Revert</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {toolParts.map((part: any) => (
                <div
                    key={part.toolCallId}
                    className={cn(
                        "flex w-full",
                        isUser ? "justify-end" : "justify-start"
                    )}
                >
                    {renderToolPart(part, message.metadata)}
                </div>
            ))}
            {anchoredEntries.length > 0 && (
                <div className="mt-2 flex flex-col gap-3">
                    {anchoredEntries.map((entry, index) =>
                        renderComparisonEntry(entry, `comparison-anchored-${entry.requestId}-${index}`)
                    )}
                </div>
            )}
        </div>
    );
});

MessageItem.displayName = "MessageItem";
