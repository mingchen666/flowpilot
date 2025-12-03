const XML_DECLARATION = /<\?xml.*?\?>/g;
const SVG_TAG = /<svg[\s>]/i;
const SVG_DIMENSION = /<svg[^>]*?(width|height)\s*=\s*["']([^"']+)["'][^>]*?/gi;
const SVG_VIEWBOX = /viewBox\s*=\s*["']\s*([0-9.+-]+)\s+[0-9.+-]+\s+([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s*["']/i;
const SVG_EVENT_HANDLER = /\son[a-z]+\s*=/i;
const SVG_SCRIPT = /<script[\s>]/i;
const SVG_JAVASCRIPT_URI = /(href|xlink:href)\s*=\s*["']\s*javascript:/i;
const DEFAULT_CANVAS = { width: 800, height: 600 };
const MAX_SVG_VIEWPORT = { width: 760, height: 560 };
const MIN_SVG_SIZE = { width: 120, height: 80 };

/**
 * Convert an inline SVG markup string to a data URL that can be rendered with an <img /> tag.
 * Using an image element makes it easier to size with object-fit rules inside constrained containers.
 */
export function svgToDataUrl(svg?: string | null): string | null {
    if (!svg) {
        return null;
    }
    const trimmed = svg.trim();
    if (!trimmed) {
        return null;
    }
    const cleaned = trimmed.replace(XML_DECLARATION, "").trim();
    try {
        const encoded = encodeURIComponent(cleaned)
            .replace(/'/g, "%27")
            .replace(/"/g, "%22");
        return `data:image/svg+xml;charset=utf-8,${encoded}`;
    } catch {
        return null;
    }
}

function stripUnits(value: string): number | null {
    if (!value) return null;
    const numeric = parseFloat(value.replace(/px/i, "").trim());
    return Number.isFinite(numeric) ? numeric : null;
}

function inferSvgDimensions(svg: string): { width: number; height: number } | null {
    const dimensions: Partial<{ width: number; height: number }> = {};
    let match: RegExpExecArray | null;

    while ((match = SVG_DIMENSION.exec(svg)) !== null) {
        const [, key, raw] = match;
        const parsed = stripUnits(raw);
        if (parsed && parsed > 0) {
            dimensions[key as "width" | "height"] = parsed;
        }
    }

    if (dimensions.width && dimensions.height) {
        return { width: dimensions.width, height: dimensions.height };
    }

    const viewBoxMatch = svg.match(SVG_VIEWBOX);
    if (viewBoxMatch) {
        const width = parseFloat(viewBoxMatch[3]);
        const height = parseFloat(viewBoxMatch[4]);
        if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
            return { width, height };
        }
    }

    return null;
}

function assertSafeSvg(svg: string) {
    if (!SVG_TAG.test(svg)) {
        throw new Error("SVG 内容缺少 <svg> 根节点，无法渲染到画布。");
    }
    if (SVG_SCRIPT.test(svg) || SVG_EVENT_HANDLER.test(svg) || SVG_JAVASCRIPT_URI.test(svg)) {
        throw new Error("检测到潜在的脚本或事件处理器，出于安全原因拒绝加载该 SVG。");
    }
}

/**
 * Normalize inline SVG markup and convert to a draw.io-compatible <root> block containing an image cell.
 * This allows SVG artwork to be rendered on the existing draw.io canvas without losing editability of layout.
 */
export function buildSvgRootXml(svg: string): {
    rootXml: string;
    dataUrl: string;
    dimensions: { width: number; height: number };
} {
    if (!svg || typeof svg !== "string") {
        throw new Error("SVG 内容不能为空。");
    }

    const cleaned = svg.replace(XML_DECLARATION, "").trim();
    assertSafeSvg(cleaned);

    const dataUrl = svgToDataUrl(cleaned);
    if (!dataUrl) {
        throw new Error("SVG 内容无法编码为数据 URL。");
    }
    // 避免 style 中的分号破坏解析，使用纯 encodeURIComponent 形式的 data URI
    const styleImageUrl = `data:image/svg+xml,${encodeURIComponent(cleaned)}`;

    const inferred = inferSvgDimensions(cleaned) ?? {
        width: DEFAULT_CANVAS.width * 0.8,
        height: DEFAULT_CANVAS.height * 0.6,
    };

    const scale = Math.min(
        1,
        MAX_SVG_VIEWPORT.width / inferred.width,
        MAX_SVG_VIEWPORT.height / inferred.height
    );
    const width = Math.max(
        MIN_SVG_SIZE.width,
        Math.round(inferred.width * scale)
    );
    const height = Math.max(
        MIN_SVG_SIZE.height,
        Math.round(inferred.height * scale)
    );

    const x = Math.max(20, Math.round((DEFAULT_CANVAS.width - width) / 2));
    const y = Math.max(20, Math.round((DEFAULT_CANVAS.height - height) / 2));

    const style =
        `shape=image;imageAspect=1;aspect=fixed;verticalAlign=middle;` +
        `verticalLabelPosition=bottom;strokeColor=none;fillColor=none;` +
        `labelBackgroundColor=none;pointerEvents=1;image=${styleImageUrl};`;

    const rootXml = `<root><mxCell id="0"/><mxCell id="1" parent="0"/>` +
        `<mxCell id="2" value="" style="${style}" vertex="1" parent="1">` +
        `<mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />` +
        `</mxCell></root>`;

    return {
        rootXml,
        dataUrl,
        dimensions: { width, height },
    };
}

/**
 * Repair a potentially incomplete SVG string for streaming rendering.
 * It removes incomplete tags at the end and ensures the root <svg> is closed.
 */
export function repairSvg(svg: string): string {
    if (!svg) return "";
    let fixed = svg;

    // 1. If it doesn't contain <svg tag at all yet, return as is (likely too early)
    if (!/<svg[\s>]/i.test(fixed)) {
        return fixed;
    }

    // 2. If it already ends with </svg>, assume it's complete (or close enough)
    if (/<\/svg>\s*$/i.test(fixed)) {
        return fixed;
    }

    // 3. Intelligent repair for incomplete tags
    // Instead of just chopping off the last '<', we try to close it properly
    
    // Check if we are inside a tag definition (e.g., <rect x="10" y=...)
    const lastOpen = fixed.lastIndexOf('<');
    const lastClose = fixed.lastIndexOf('>');
    
    if (lastOpen > lastClose) {
        // We have an unclosed tag like "... <rect x='10"
        const unclosedTag = fixed.substring(lastOpen);
        
        // Check if we are inside an attribute value (odd number of quotes)
        const doubleQuotes = (unclosedTag.match(/"/g) || []).length;
        const singleQuotes = (unclosedTag.match(/'/g) || []).length;
        
        let needsQuote = false;
        if (doubleQuotes % 2 !== 0) {
            fixed += '"';
            needsQuote = true;
        } else if (singleQuotes % 2 !== 0) {
            fixed += "'";
            needsQuote = true;
        }
        
        // If we just closed a quote, or if we weren't in a quote but in a tag...
        // We should try to close the tag.
        // If the last char is already '/', just add '>'
        if (fixed.trim().endsWith('/')) {
             fixed += ">";
        } else {
             // Simple heuristic: just add " />" to self-close it safely.
             fixed += " />";
        }
    } else {
        // We are likely in text content or between tags.
        // Check if we are inside a text node that needs closing? 
        // Hard to tell without a parser.
        // But if we are simply "between tags", we can just append </svg>.
    }

    // 4. Close the SVG root
    if (!/<\/svg>\s*$/i.test(fixed)) {
        fixed += "</svg>";
    }
    
    return fixed;
}
