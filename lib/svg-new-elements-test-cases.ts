/**
 * SVG 新元素支持测试用例
 * 
 * 测试场景：
 * 1. Group (<g>) 元素 - 嵌套、继承、批量操作
 * 2. Image (<image>) 元素 - 图片嵌入、href/xlink:href
 * 3. Use (<use>) 元素 - 引用、复用
 * 4. 综合场景 - Group + Image + Use 组合
 */

export const NEW_ELEMENT_TEST_CASES = {
    // ==================== Group Tests ====================
    
    // 测试 1: 简单 Group
    simpleGroup: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <g id="layer1" fill="red" stroke="black">
    <rect x="10" y="10" width="50" height="50"/>
    <circle cx="85" cy="35" r="20"/>
  </g>
</svg>`,

    // 测试 2: Group 带 Transform
    groupWithTransform: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <g id="translated" transform="translate(50 50)">
    <rect x="0" y="0" width="100" height="100" fill="blue"/>
    <text x="50" y="50" text-anchor="middle">Moved</text>
  </g>
</svg>`,

    // 测试 3: 嵌套 Group
    nestedGroups: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <g id="outer" transform="translate(100 100)" fill="green">
    <rect x="0" y="0" width="200" height="200"/>
    
    <g id="inner" transform="rotate(45)" fill="yellow">
      <circle cx="100" cy="100" r="50"/>
      
      <g id="deepest" transform="scale(0.5)">
        <rect x="80" y="80" width="40" height="40" fill="red"/>
      </g>
    </g>
  </g>
</svg>`,

    // 测试 4: Group 继承样式
    groupInheritance: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g id="styled" fill="purple" stroke="orange" stroke-width="3" opacity="0.7">
    <rect x="10" y="10" width="50" height="50"/>
    <circle cx="100" cy="35" r="20"/>
    <!-- 子元素会继承 fill, stroke, stroke-width, opacity -->
    <ellipse cx="170" cy="35" rx="30" ry="20"/>
  </g>
</svg>`,

    // ==================== Image Tests ====================

    // 测试 5: 基础 Image (href)
    basicImage: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <image href="photo.jpg" x="10" y="10" width="200" height="150"/>
</svg>`,

    // 测试 6: Image (xlink:href 旧版)
    imageLegacy: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image xlink:href="photo.jpg" x="10" y="10" width="200" height="150"/>
</svg>`,

    // 测试 7: Image with preserveAspectRatio
    imageAspectRatio: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400">
  <image href="photo.jpg" x="10" y="10" width="200" height="150" preserveAspectRatio="xMidYMid meet"/>
  <image href="photo2.jpg" x="220" y="10" width="150" height="150" preserveAspectRatio="xMidYMid slice"/>
  <image href="photo3.jpg" x="380" y="10" width="100" height="200" preserveAspectRatio="none"/>
</svg>`,

    // 测试 8: Image with Data URI
    imageDataUri: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." 
         x="10" y="10" width="50" height="50"/>
</svg>`,

    // 测试 9: Image with Transform
    imageTransform: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <image href="photo.jpg" x="100" y="100" width="200" height="150" 
         transform="rotate(-15 200 175)"/>
</svg>`,

    // ==================== Use Tests ====================

    // 测试 10: 简单 Use 引用
    simpleUse: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <defs>
    <circle id="dot" r="5" fill="red"/>
  </defs>
  
  <use href="#dot" x="10" y="10"/>
  <use href="#dot" x="30" y="30"/>
  <use href="#dot" x="50" y="50"/>
  <use href="#dot" x="70" y="70"/>
</svg>`,

    // 测试 11: Use 引用 Group
    useGroup: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <defs>
    <g id="flower">
      <circle r="20" fill="yellow"/>
      <circle cx="15" cy="0" r="5" fill="orange"/>
      <circle cx="-15" cy="0" r="5" fill="orange"/>
      <circle cx="0" cy="15" r="5" fill="orange"/>
      <circle cx="0" cy="-15" r="5" fill="orange"/>
    </g>
  </defs>
  
  <use href="#flower" x="50" y="50"/>
  <use href="#flower" x="150" y="50"/>
  <use href="#flower" x="250" y="50"/>
  <use href="#flower" x="100" y="150"/>
  <use href="#flower" x="200" y="150"/>
</svg>`,

    // 测试 12: Use with width/height
    useWithSize: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300">
  <defs>
    <symbol id="icon" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="blue"/>
      <circle cx="50" cy="50" r="30" fill="white"/>
    </symbol>
  </defs>
  
  <use href="#icon" x="10" y="10" width="50" height="50"/>
  <use href="#icon" x="70" y="10" width="100" height="100"/>
  <use href="#icon" x="180" y="10" width="150" height="75"/>
</svg>`,

    // 测试 13: Use 引用 Path
    usePath: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <defs>
    <path id="arrow" d="M0,0 L10,5 L0,10 L3,5 Z" fill="black"/>
  </defs>
  
  <line x1="10" y1="50" x2="200" y2="50" stroke="black" stroke-width="2"/>
  <use href="#arrow" x="200" y="45"/>
  
  <line x1="10" y1="100" x2="200" y2="150" stroke="black" stroke-width="2"/>
  <use href="#arrow" x="200" y="145" transform="rotate(26.57 200 150)"/>
</svg>`,

    // 测试 14: Use xlink:href (旧版)
    useLegacy: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <rect id="box" width="20" height="20" fill="green"/>
  </defs>
  
  <use xlink:href="#box" x="10" y="10"/>
  <use xlink:href="#box" x="40" y="40"/>
</svg>`,

    // ==================== Combined Tests ====================

    // 测试 15: Group + Image
    groupWithImage: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400">
  <g id="card" transform="translate(50 50)">
    <rect x="0" y="0" width="200" height="250" rx="8" fill="white" stroke="#ccc"/>
    <image href="photo.jpg" x="10" y="10" width="180" height="150"/>
    <text x="100" y="180" text-anchor="middle" font-size="16">Photo Title</text>
    <text x="100" y="200" text-anchor="middle" font-size="12" fill="#666">Description here</text>
  </g>
</svg>`,

    // 测试 16: Group + Use
    groupWithUse: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <defs>
    <circle id="dot" r="3" fill="red"/>
  </defs>
  
  <g id="constellation" transform="translate(100 100)">
    <use href="#dot" x="0" y="0"/>
    <use href="#dot" x="50" y="30"/>
    <use href="#dot" x="100" y="10"/>
    <use href="#dot" x="80" y="60"/>
    <line x1="0" y1="0" x2="50" y2="30" stroke="#ccc"/>
    <line x1="50" y1="30" x2="100" y2="10" stroke="#ccc"/>
    <line x1="50" y1="30" x2="80" y2="60" stroke="#ccc"/>
  </g>
</svg>`,

    // 测试 17: Image + Use
    imageWithUse: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
  <defs>
    <g id="frame">
      <rect width="220" height="170" fill="none" stroke="gold" stroke-width="10"/>
    </g>
  </defs>
  
  <image href="art1.jpg" x="20" y="20" width="200" height="150"/>
  <use href="#frame" x="10" y="10"/>
  
  <image href="art2.jpg" x="270" y="20" width="200" height="150"/>
  <use href="#frame" x="260" y="10"/>
  
  <image href="art3.jpg" x="520" y="20" width="200" height="150"/>
  <use href="#frame" x="510" y="10"/>
</svg>`,

    // 测试 18: 综合测试 - 复杂布局
    complexLayout: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <!-- 图标定义 -->
    <g id="icon-home">
      <path d="M10,20 L0,10 L5,10 L5,0 L15,0 L15,10 L20,10 Z" fill="currentColor"/>
    </g>
    
    <g id="icon-user">
      <circle cx="10" cy="7" r="5"/>
      <path d="M0,20 Q10,15 20,20" fill="currentColor"/>
    </g>
    
    <!-- 按钮模板 -->
    <g id="button">
      <rect width="100" height="40" rx="8" fill="#007bff"/>
      <text x="50" y="25" text-anchor="middle" fill="white" font-size="14">Button</text>
    </g>
  </defs>
  
  <!-- 顶部导航栏 -->
  <g id="navbar" transform="translate(0 0)">
    <rect width="800" height="60" fill="#333"/>
    <image href="logo.png" x="20" y="10" width="40" height="40"/>
    <text x="70" y="38" font-size="20" fill="white">My App</text>
    
    <g id="nav-icons" transform="translate(650 15)">
      <use href="#icon-home" x="0" y="0" width="30" height="30" fill="white"/>
      <use href="#icon-user" x="50" y="0" width="30" height="30" fill="white"/>
    </g>
  </g>
  
  <!-- 主内容区 -->
  <g id="content" transform="translate(50 100)">
    <!-- 卡片 1 -->
    <g id="card1">
      <rect width="200" height="250" rx="12" fill="white" stroke="#ddd"/>
      <image href="thumb1.jpg" x="10" y="10" width="180" height="150"/>
      <text x="100" y="180" text-anchor="middle" font-size="16">Product 1</text>
      <use href="#button" x="50" y="200"/>
    </g>
    
    <!-- 卡片 2 -->
    <g id="card2" transform="translate(250 0)">
      <rect width="200" height="250" rx="12" fill="white" stroke="#ddd"/>
      <image href="thumb2.jpg" x="10" y="10" width="180" height="150"/>
      <text x="100" y="180" text-anchor="middle" font-size="16">Product 2</text>
      <use href="#button" x="50" y="200"/>
    </g>
    
    <!-- 卡片 3 -->
    <g id="card3" transform="translate(500 0)">
      <rect width="200" height="250" rx="12" fill="white" stroke="#ddd"/>
      <image href="thumb3.jpg" x="10" y="10" width="180" height="150"/>
      <text x="100" y="180" text-anchor="middle" font-size="16">Product 3</text>
      <use href="#button" x="50" y="200"/>
    </g>
  </g>
  
  <!-- 底部信息 -->
  <g id="footer" transform="translate(0 540)">
    <rect width="800" height="60" fill="#f8f9fa"/>
    <text x="400" y="35" text-anchor="middle" fill="#666">© 2024 My App. All rights reserved.</text>
  </g>
</svg>`,

    // 测试 19: 实际问题 SVG（架构图） - 现在应该正确渲染
    actualArchitectureDiagram: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="blueGreen" x1="0%" y1="0%" x200%" y2="0%">
      <stop offset="0%" style="stop-color:#4A5FE8;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:1"/>
    </linearGradient>
    
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#4A5FE8"/>
    </marker>
    
    <!-- 可复用的人物图标 -->
    <g id="person-icon">
      <circle r="20" fill="#4ECDC4"/>
      <circle cy="-8" r="10" fill="#ffffff"/>
      <path d="M-20,8 Q0,-5 20,8 L20,20 L-20,20 Z" fill="#ffffff"/>
    </g>
    
    <!-- 可复用的手机图标 -->
    <g id="phone-icon">
      <rect x="-20" y="-30" width="40" height="60" rx="4" fill="#4ECDC4"/>
      <rect x="-14" y="-24" width="28" height="40" rx="2" fill="#ffffff"/>
      <circle cy="22" r="3" fill="#4ECDC4"/>
    </g>
  </defs>
  
  <!-- 左侧输入区 -->
  <g id="input-section">
    <rect x="56" y="96" width="120" height="400" rx="8" fill="#f0f4f8" stroke="#d0d8e0"/>
    <text x="116" y="120" text-anchor="middle" font-size="14" font-weight="600">输入源</text>
    
    <!-- 使用图标 -->
    <use href="#person-icon" x="116" y="200"/>
    <text x="116" y="240" text-anchor="middle" font-size="12">研发人员</text>
    
    <use href="#phone-icon" x="116" y="320"/>
    <text x="116" y="360" text-anchor="middle" font-size="12">CI/CD流水线</text>
  </g>
  
  <!-- 中间处理区 -->
  <g id="process-section" transform="translate(216 96)">
    <rect width="368" height="400" rx="8" fill="#f8fafb" stroke="#d0d8e0"/>
    <text x="184" y="24" text-anchor="middle" font-size="14" font-weight="600">通用发布中台</text>
    
    <rect x="16" y="40" width="336" height="80" rx="8" fill="url(#blueGreen)" opacity="0.9"/>
    <image href="dashboard.png" x="32" y="56" width="48" height="48"/>
    <text x="184" y="70" text-anchor="middle" fill="white" font-size="14">统一发布门户</text>
  </g>
  
  <!-- 右侧输出区 -->
  <g id="output-section">
    <rect x="624" y="96" width="120" height="400" rx="8" fill="#f0f4f8" stroke="#d0d8e0"/>
    <text x="684" y="120" text-anchor="middle" font-size="14" font-weight="600">输出目标</text>
    
    <use href="#phone-icon" x="684" y="200" transform="rotate(-15 684 200)"/>
    <text x="684" y="280" text-anchor="middle" font-size="11">APP包</text>
  </g>
  
  <!-- 连接箭头 -->
  <path d="M 176 240 L 216 240" stroke="#4A5FE8" stroke-width="3" marker-end="url(#arrow)"/>
  <path d="M 584 296 L 624 296" stroke="#4A5FE8" stroke-width="3" marker-end="url(#arrow)"/>
</svg>`,
};

/**
 * 验证函数
 */
export function validateNewElements(svgInput: string, parsedData: any) {
    const issues: string[] = [];
    
    // 1. 检查 Group 元素
    const inputGroupCount = (svgInput.match(/<g[\s>]/g) || []).length;
    const parsedGroupCount = parsedData.elements.filter((el: any) => el.type === 'g').length;
    
    if (inputGroupCount > 0 && parsedGroupCount === 0) {
        issues.push(`Group elements not parsed: expected ${inputGroupCount}, got 0`);
    }
    
    // 2. 检查 Group 子元素
    const groups = parsedData.elements.filter((el: any) => el.type === 'g');
    groups.forEach((group: any, index: number) => {
        if (!Array.isArray(group.children)) {
            issues.push(`Group #${index} missing children array`);
        } else if (group.children.length === 0) {
            issues.push(`Group #${index} has empty children (might be parsing issue)`);
        }
    });
    
    // 3. 检查 Image 元素
    const inputImageCount = (svgInput.match(/<image[\s>]/g) || []).length;
    const parsedImageCount = parsedData.elements.filter((el: any) => el.type === 'image').length;
    
    if (inputImageCount !== parsedImageCount) {
        issues.push(`Image count mismatch: input=${inputImageCount}, parsed=${parsedImageCount}`);
    }
    
    // 4. 检查 Image href 属性
    const images = parsedData.elements.filter((el: any) => el.type === 'image');
    images.forEach((img: any, index: number) => {
        if (!img.href) {
            issues.push(`Image #${index} missing href attribute`);
        }
    });
    
    // 5. 检查 Use 元素
    const inputUseCount = (svgInput.match(/<use[\s>]/g) || []).length;
    const parsedUseCount = parsedData.elements.filter((el: any) => el.type === 'use').length;
    
    if (inputUseCount !== parsedUseCount) {
        issues.push(`Use count mismatch: input=${inputUseCount}, parsed=${parsedUseCount}`);
    }
    
    // 6. 检查 Use href 格式
    const uses = parsedData.elements.filter((el: any) => el.type === 'use');
    uses.forEach((use: any, index: number) => {
        if (!use.href) {
            issues.push(`Use #${index} missing href attribute`);
        } else if (!use.href.startsWith('#')) {
            issues.push(`Use #${index} href should start with # (got: ${use.href})`);
        }
    });
    
    // 7. 检查 Transform 继承（Group）
    const groupsWithTransform = groups.filter((g: any) => g.transform);
    if (groupsWithTransform.length > 0) {
        // 简单验证：至少有 transform 对象
        groupsWithTransform.forEach((g: any, index: number) => {
            if (typeof g.transform !== 'object') {
                issues.push(`Group #${index} transform is not an object`);
            }
        });
    }
    
    return {
        valid: issues.length === 0,
        issues,
        stats: {
            groups: parsedGroupCount,
            images: parsedImageCount,
            uses: parsedUseCount,
        }
    };
}

/**
 * 使用示例
 */
/*
import { NEW_ELEMENT_TEST_CASES, validateNewElements } from '@/lib/svg-new-elements-test-cases';

// 测试 Group
loadSvgMarkup(NEW_ELEMENT_TEST_CASES.nestedGroups);
const validation = validateNewElements(NEW_ELEMENT_TEST_CASES.nestedGroups, {
    elements,
    defs: defsMarkup,
});

console.log('Validation:', validation);
// 输出：{ valid: true, issues: [], stats: { groups: 3, images: 0, uses: 0 } }

// 检查 Group 结构
const groups = elements.filter(el => el.type === 'g');
console.log('Groups:', groups.length); // 应该是 3 (outer, inner, deepest)
console.log('Outer children:', groups[0].children.length); // 应该有子元素
console.log('Inner group:', groups[0].children.find(c => c.type === 'g')); // 应该找到嵌套的 group

// 测试 Image
loadSvgMarkup(NEW_ELEMENT_TEST_CASES.imageAspectRatio);
const images = elements.filter(el => el.type === 'image');
console.log('Images:', images.length); // 应该是 3
console.log('Image 1 aspect ratio:', images[0].preserveAspectRatio); // "xMidYMid meet"

// 测试 Use
loadSvgMarkup(NEW_ELEMENT_TEST_CASES.useGroup);
const uses = elements.filter(el => el.type === 'use');
console.log('Uses:', uses.length); // 应该是 5
console.log('Use href:', uses[0].href); // "#flower"

// 测试复杂布局
loadSvgMarkup(NEW_ELEMENT_TEST_CASES.complexLayout);
console.log('Total elements:', elements.length);
console.log('Groups:', elements.filter(el => el.type === 'g').length);
console.log('Images:', elements.filter(el => el.type === 'image').length);
console.log('Uses:', elements.filter(el => el.type === 'use').length);
*/
