/**
 * SVG 渲染修复测试用例
 * 
 * 测试场景：
 * 1. Marker 定义在 defs 外部
 * 2. Transform 包含旋转中心点
 * 3. Circle 元素保留
 * 4. 嵌套的 Transform
 */

export const TEST_CASES = {
    // 测试 1: Marker 在文档末尾（defs 外）
    markerOutsideDefs: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="blueGreen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4A5FE8;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:1"/>
    </linearGradient>
  </defs>
  
  <path d="M 176 240 L 216 240" fill="none" stroke="#4A5FE8" stroke-width="3" marker-end="url(#arrow)"/>
  
  <!-- Marker 定义在末尾，不在 defs 内 -->
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#4A5FE8"/>
    </marker>
  </defs>
</svg>`,

    // 测试 2: Transform 包含旋转中心点 rotate(angle cx cy)
    transformWithRotationCenter: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <!-- 绕指定中心点 (684, 210) 旋转 -15 度 -->
  <rect x="664" y="180" width="40" height="60" rx="4" fill="#4ECDC4" transform="rotate(-15 684 210)"/>
  <rect x="670" y="186" width="28" height="40" rx="2" fill="#ffffff" transform="rotate(-15 684 206)"/>
  <circle cx="684" cy="228" r="3" fill="#4ECDC4" transform="rotate(-15 684 210)"/>
</svg>`,

    // 测试 3: Circle 元素应该保持为 circle，不转换为 ellipse
    circleElements: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <circle cx="116" cy="200" r="20" fill="#4ECDC4"/>
  <circle cx="116" cy="188" r="10" fill="#ffffff"/>
  <circle cx="108" cy="320" r="8" fill="#ffffff"/>
  <circle cx="124" cy="320" r="8" fill="#ffffff"/>
</svg>`,

    // 测试 4: 多个 marker 定义，部分在 defs 内，部分在外
    mixedMarkerLocations: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <marker id="arrow1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#4A5FE8"/>
    </marker>
  </defs>
  
  <path d="M 100 100 L 200 200" marker-end="url(#arrow1)"/>
  <path d="M 300 100 L 400 200" marker-end="url(#arrow2)"/>
  
  <marker id="arrow2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
    <path d="M0,0 L0,6 L9,3 z" fill="#FF0000"/>
  </marker>
</svg>`,

    // 测试 5: 复杂的 Transform 组合
    complexTransform: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <!-- translate + rotate + scale 组合 -->
  <rect x="100" y="100" width="50" height="80" 
        transform="translate(100 50) rotate(-15 125 140) scale(1.2)" 
        fill="#4ECDC4"/>
</svg>`,

    // 测试 6: 实际问题 SVG（您提供的架构图）
    actualProblemSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="blueGreen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4A5FE8;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:1"/>
    </linearGradient>
  </defs>
  
  <rect x="56" y="96" width="120" height="400" rx="8" fill="#f0f4f8"/>
  <circle cx="116" cy="200" r="20" fill="#4ECDC4"/>
  <circle cx="116" cy="188" r="10" fill="#ffffff"/>
  
  <rect x="664" y="180" width="40" height="60" rx="4" fill="#4ECDC4" transform="rotate(-15 684 210)"/>
  
  <path d="M 176 240 L 216 240" fill="none" stroke="#4A5FE8" stroke-width="3" marker-end="url(#arrow)"/>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#4A5FE8"/>
    </marker>
  </defs>
</svg>`,
};

/**
 * 预期结果：
 * 
 * 1. markerOutsideDefs: 
 *    - defs 应该包含 linearGradient 和 marker
 *    - 导出后 marker 定义应该在 path 使用之前
 * 
 * 2. transformWithRotationCenter:
 *    - 解析后 transform 应该包含 rotationCx 和 rotationCy
 *    - 导出后应该保持 rotate(-15 684 210) 格式
 * 
 * 3. circleElements:
 *    - 解析后应该有 4 个 CircleElement（type: "circle"）
 *    - 导出后应该是 <circle> 标签，不是 <ellipse>
 * 
 * 4. mixedMarkerLocations:
 *    - defs 应该同时包含 arrow1 和 arrow2
 * 
 * 5. complexTransform:
 *    - 应该正确解析所有 transform 部分
 *    - 可能需要保存完整的 transform 字符串
 * 
 * 6. actualProblemSvg:
 *    - 综合测试：marker、circle、transform 都应该正确处理
 */

export function validateSvgParsing(svgInput: string, parsedData: any) {
    const issues: string[] = [];
    
    // 检查 defs 是否包含所有必要的定义
    if (svgInput.includes('marker-end="url(#') || svgInput.includes('marker-start="url(#')) {
        const markerIds = [...svgInput.matchAll(/marker-(?:end|start)="url\(#([\w-]+)\)"/g)]
            .map(match => match[1]);
        
        markerIds.forEach(markerId => {
            if (!parsedData.defs?.includes(`id="${markerId}"`)) {
                issues.push(`Missing marker definition: ${markerId}`);
            }
        });
    }
    
    // 检查 circle 元素是否保留
    const circleCount = (svgInput.match(/<circle/g) || []).length;
    const parsedCircles = parsedData.elements.filter((el: any) => el.type === 'circle').length;
    if (circleCount !== parsedCircles) {
        issues.push(`Circle count mismatch: input=${circleCount}, parsed=${parsedCircles}`);
    }
    
    // 检查 transform 中心点
    const rotateWithCenter = svgInput.match(/rotate\((-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/);
    if (rotateWithCenter) {
        const hasRotationCenter = parsedData.elements.some((el: any) => 
            el.transform?.rotationCx !== undefined && el.transform?.rotationCy !== undefined
        );
        if (!hasRotationCenter) {
            issues.push('Transform rotation center points not preserved');
        }
    }
    
    return {
        valid: issues.length === 0,
        issues,
    };
}

/**
 * 使用示例：
 * 
 * import { TEST_CASES, validateSvgParsing } from './svg-rendering-test-cases';
 * 
 * // 在 SVG 编辑器中测试
 * const { loadSvgMarkup, exportSvgMarkup, elements, defsMarkup } = useSvgEditor();
 * 
 * // 加载测试用例
 * loadSvgMarkup(TEST_CASES.markerOutsideDefs);
 * 
 * // 验证解析结果
 * const validation = validateSvgParsing(TEST_CASES.markerOutsideDefs, {
 *     elements,
 *     defs: defsMarkup,
 * });
 * 
 * console.log('Validation:', validation);
 * 
 * // 导出并比较
 * const exported = exportSvgMarkup();
 * console.log('Exported SVG:', exported);
 */
