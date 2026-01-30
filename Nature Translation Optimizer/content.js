/**
 * 学术阅读优化器 v1.1
 * 修复：扩展清理范围，移除翻译产生的 <sub> 和 <sup> 文本碎片
 */

function isContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

function applyOptimization(enabled, mode) {
    if (!isContextValid()) return;

    const isNature = window.location.hostname.includes('nature.com');
    const isTranslated = document.documentElement.classList.contains('translated-ltr') || 
                         document.documentElement.classList.contains('translated-rtl') ||
                         document.querySelector('font[style*="vertical-align: inherit"]');

    const targets = document.querySelectorAll('sup, sub, a[href*="#"], font');
    const citationRegex = /^[\[\]0-9,\s\-\–\—\u00a0]+$/;
    const hasChineseRegex = /[\u4e00-\u9fa5]/;

    if (!enabled || !isNature || !isTranslated) {
        targets.forEach(el => {
            el.style.cssText = "";
            const internalA = el.querySelector('a') || (el.tagName === 'A' ? el : null);
            if (internalA) internalA.style.cssText = "";
        });
        return; 
    }

    /**
     * 【v4.1 核心修复】：增强版源码碎片清洗
     * 修改点：将范围从 sup 扩大到 (sup|sub)，并处理不规范的碎片（如 /sub>）
     */
    const artifactRegex = /(<|<\/|&lt;|&lt;\/|&gt;|\/)?(sup|sub)(>|&gt;)?/gi;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (artifactRegex.test(node.nodeValue)) {
            // 将类似 "<sub>", "/sub>", "<sup>" 这种文本内容直接抹除
            node.nodeValue = node.nodeValue.replace(artifactRegex, '');
        }
    }

    targets.forEach(el => {
        const rawContent = el.innerText.trim();
        if (!rawContent) return;

        const isMiswrapped = hasChineseRegex.test(rawContent) || rawContent.length > 15;
        const isTrueCitation = citationRegex.test(rawContent);

        if (isMiswrapped) {
            // 公式下标保护逻辑保持不变
            const isSub = el.tagName === 'SUB';
            el.style.cssText = `
                display: inline !important; 
                font-size: ${isSub ? '0.75em' : 'inherit'} !important; 
                vertical-align: ${isSub ? 'sub' : 'baseline'} !important; 
                position: static !important;
                line-height: inherit !important;
            `;
        } else if (isTrueCitation) {
            if (mode === 'hide') {
                el.style.display = "none";
            } else {
                const citStyle = `
                    display: inline-block !important;
                    font-size: 0.82em !important; 
                    line-height: 1 !important;
                    vertical-align: baseline !important;
                    transform: translateY(-0.28em) !important; 
                    margin: 0 1px !important;
                    position: relative !important;
                    z-index: 10 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                `;
                el.style.cssText = citStyle;
                const internalA = el.querySelector('a') || (el.tagName === 'A' ? el : null);
                if (internalA) {
                    internalA.style.cssText = `color: #0066cc !important; text-decoration: none !important; pointer-events: auto !important; cursor: pointer !important; display: inline-block !important;`;
                }
            }
        }
    });
}

function safeLoad() {
    try {
        if (!isContextValid()) return;
        chrome.storage.sync.get(['enabled', 'mode'], (res) => {
            if (chrome.runtime?.lastError) return;
            applyOptimization(res.enabled, res.mode || 'clean');
        });
    } catch (e) { }
}

let timer = null;
const observer = new MutationObserver(() => {
    try {
        if (!isContextValid()) {
            observer.disconnect();
            return;
        }
        if (timer) clearTimeout(timer);
        timer = setTimeout(safeLoad, 200);
    } catch (e) { }
});

if (isContextValid()) {
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { childList: true, subtree: true });
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === "UPDATE") applyOptimization(msg.enabled, msg.mode);
        return true;
    });
    safeLoad();
}