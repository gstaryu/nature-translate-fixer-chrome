/**
 * 学术阅读优化器 v1.0
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

    // 清洗源码碎片
    const artifactRegex = /(<|<\/|&lt;|&lt;\/)sup(>|&gt;)/gi;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (artifactRegex.test(node.nodeValue)) {
            node.nodeValue = node.nodeValue.replace(artifactRegex, '');
        }
    }

    targets.forEach(el => {
        const rawContent = el.innerText.trim();
        if (!rawContent) return;
        const isMiswrapped = hasChineseRegex.test(rawContent) || rawContent.length > 15;
        const isTrueCitation = citationRegex.test(rawContent);

        if (isMiswrapped) {
            el.style.cssText = "display:inline !important; font-size:inherit !important; vertical-align:baseline !important; position:static !important;";
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

// 封装 Storage 获取，增加极端容错
function safeLoad() {
    try {
        if (!isContextValid()) return;
        chrome.storage.sync.get(['enabled', 'mode'], (res) => {
            if (chrome.runtime?.lastError) return;
            applyOptimization(res.enabled, res.mode || 'clean');
        });
    } catch (e) { /* 环境已彻底销毁，保持静默 */ }
}

let timer = null;
const observer = new MutationObserver(() => {
    // 【修复核心】：防止在失效瞬间操作 timer
    try {
        if (!isContextValid()) {
            observer.disconnect();
            return;
        }
        if (timer) clearTimeout(timer);
        timer = setTimeout(safeLoad, 200);
    } catch (e) { /* 拦截任何失效报错 */ }
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