// 永久光标解决方案 - 自动注入
(function() {
    'use strict';
    
    function injectCursor() {
        // 检查是否已经注入
        if (document.getElementById('auto-cursor-permanent')) return;
        
        const style = document.createElement('style');
        style.id = 'auto-cursor-permanent';
        style.textContent = `
            /* 自动注入的光标样式 */
            body {
                cursor: url('/dongxi-awa.github.io/cursors/Normal.png'), auto !important;
            }
            a, button, .btn, [role="button"] {
                cursor: url('/dongxi-awa.github.io/cursors/Link.png'), pointer !important;
            }
            input, textarea, [contenteditable="true"] {
                cursor: url('/dongxi-awa.github.io/cursors/Text.png'), text !important;
            }
            code, pre {
                cursor: url('/dongxi-awa.github.io/cursors/Text.png'), text !important;
            }
            [title]:hover {
                cursor: url('/dongxi-awa.github.io/cursors/Help.png'), help !important;
            }
            [disabled], .disabled {
                cursor: url('/dongxi-awa.github.io/cursors/Unavailable.png'), not-allowed !important;
            }
            .loading {
                cursor: url('/dongxi-awa.github.io/cursors/Busy.png'), wait !important;
            }
            .alternate {
                cursor: url('/dongxi-awa.github.io/cursors/Alternate.png'), context-menu !important;
            }
            .precision {
                cursor: url('/dongxi-awa.github.io/cursors/Precision.png'), crosshair !important;
            }
            .move {
                cursor: url('/dongxi-awa.github.io/cursors/Move.png'), move !important;
            }
        `;
        document.head.appendChild(style);
        console.log('🔧 自动光标注入完成');
    }
    
    // 页面加载时立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCursor);
    } else {
        injectCursor();
    }
    
    // 监听动态内容变化（针对SPA或动态加载的内容）
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                injectCursor();
                break;
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();