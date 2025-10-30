<footer id="footer">
    <div id="footer-wrap">
        <div>
            &copy;
            <%= theme.footer.since %> - <%= date(Date.now(), "YYYY") %> <%= config.title %>
            <span id="footer-icon">
                <i class="fa-solid fa-font-awesome fa-fw"></i>
            </span>
            &commat;<%= config.author %>
        </div>
        <div>
            Based on the <a href="https://hexo.io">Hexo Engine</a> &amp;
            <a href="https://github.com/theme-particlex/hexo-theme-particlex">ParticleX Theme</a>
        </div>
        <% if (theme.footer.ICP.enable) { %>
        <div>
            备案号：
            <% if (theme.footer.ICP.link) { %>
            <a href="<%- url_for(theme.footer.ICP.link) %>"><%= theme.footer.ICP.code %></a>
            <% } else { %>
            <%= theme.footer.ICP.code %>
            <% } %>
        </div>
        <% } %>
    </div>
</footer>

<!-- 先加载 jQuery (只加载一次) -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>

<!-- 看板娘样式 -->
<link rel="stylesheet" href="<%- url_for('/live2d/waifu.css') %>">

<!-- 看板娘容器 -->
<div class="waifu" id="waifu-container" style="position: fixed; bottom: 0px; left: 20px; z-index: 998;">
    <div class="waifu-tips"></div>
    <canvas id="live2d" class="live2d" width="280" height="250"></canvas>
    <div class="waifu-tool">
        <span class="fui-home"></span>
        <span class="fui-chat"></span>
        <span class="fui-eye"></span>
        <span class="fui-user"></span>
        <span class="fui-photo"></span>
        <span class="fui-info-circle"></span>
        <span class="fui-cross"></span>
    </div>
</div>

<!-- 正确的脚本加载顺序 -->
<script src="<%- url_for('/live2d/live2d.js') %>"></script>
<script src="<%- url_for('/live2d/waifu-tips.js') %>"></script>

<script type="text/javascript">
// 增强的 Live2D 初始化函数
function initializeLive2D() {
    console.log('开始初始化 Live2D...');
    console.log('环境检测 - jQuery:', typeof $, 'initModel:', typeof initModel, 'loadlive2d:', typeof loadlive2d);
    
    // 检查依赖是否加载完成
    if (typeof $ === 'undefined') {
        console.log('等待 jQuery 加载...');
        setTimeout(initializeLive2D, 100);
        return;
    }
    
    if (typeof initModel === 'undefined' && typeof loadlive2d === 'undefined') {
        console.log('等待 Live2D 组件加载...');
        setTimeout(initializeLive2D, 100);
        return;
    }

    try {
        // 方法1：直接加载模型（跳过 waifu-tips.json）
        if (typeof loadlive2d === 'function') {
            console.log('直接加载 Live2D 模型...');
            
            // 尝试多种可能的路径
            const possiblePaths = [
                '/live2d/model/38/index.json',
                '/dongxi-awa.github.io/live2d/model/38/index.json',
                './live2d/model/38/index.json',
                'live2d/model/38/index.json'
            ];
            
            // 测试哪个路径有效
            testAndLoadModel(possiblePaths, 0);
        }
        
    } catch (error) {
        console.error('Live2D 初始化失败:', error);
    }
}

// 测试并加载模型的函数
function testAndLoadModel(paths, index) {
    if (index >= paths.length) {
        console.error('所有模型路径都失败了');
        return;
    }
    
    const currentPath = paths[index];
    console.log(`尝试路径 ${index + 1}/${paths.length}:`, currentPath);
    
    // 测试路径是否存在
    fetch(currentPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                console.log('路径有效:', currentPath);
                // 加载模型
                loadlive2d('live2d', currentPath, function() {
                    console.log('Live2D 模型加载完成!');
                    // 显示欢迎消息
                    if (typeof showMessage === 'function') {
                        showMessage('欢迎光临！', 3000);
                    }
                });
            } else {
                console.log('路径无效:', currentPath);
                // 尝试下一个路径
                testAndLoadModel(paths, index + 1);
            }
        })
        .catch(error => {
            console.log('路径请求失败:', currentPath, error);
            // 尝试下一个路径
            testAndLoadModel(paths, index + 1);
        });
}

// 多种初始化触发方式
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，准备初始化 Live2D');
    setTimeout(initializeLive2D, 500);
});

// 最终检查：如果页面加载完成后仍未初始化，强制重试
window.addEventListener('load', function() {
    console.log('页面完全加载完成');
    
    // 5秒后检查看板娘是否成功加载
    setTimeout(function() {
        const canvas = document.getElementById('live2d');
        const waifuContainer = document.getElementById('waifu-container');
        
        if (!canvas || canvas.width === 0) {
            console.log('检测到看板娘未正确加载，使用最终备用方案...');
            // 最终备用：直接尝试加载，不检查路径
            if (typeof loadlive2d === 'function') {
                loadlive2d('live2d', '/live2d/model/38/index.json');
            }
        } else {
            console.log('看板娘已成功加载');
        }
    }, 5000);
});
</script>

<!-- Sakana Widget 石蒜模拟器 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sakana-widget@2.7.1/lib/sakana.min.css">
<div id="sakana-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 999; width: 120px; height: 180px; cursor: move;"></div>
<script src="https://cdn.jsdelivr.net/npm/sakana-widget@2.7.1/lib/sakana.min.js"></script>
<script>
// Sakana Widget 初始化
function initSakanaWidget() {
    if (window.SakanaWidget) {
        const widget = new SakanaWidget().mount('#sakana-widget');
        const container = document.getElementById('sakana-widget');
        
        let isDragging = false;
        let startX, startY;
        let offsetX, offsetY;

        container.addEventListener('mousedown', function(e) {
            isDragging = true;
            const rect = container.getBoundingClientRect();
            startX = rect.left;
            startY = rect.top;
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
            container.style.transition = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            const maxX = window.innerWidth - container.offsetWidth;
            const maxY = window.innerHeight - container.offsetHeight;
            const safeX = Math.max(0, Math.min(newX, maxX));
            const safeY = Math.max(0, Math.min(newY, maxY));
            container.style.left = `${safeX}px`;
            container.style.top = `${safeY}px`;
            container.style.bottom = 'auto';
            container.style.right = 'auto';
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                container.style.transition = '';
                widget.applyForce(0.3, 0.1);
            }
        });
        
        console.log('Sakana Widget 初始化成功');
    } else {
        console.log('等待 Sakana Widget 加载...');
        setTimeout(initSakanaWidget, 100);
    }
}

// 初始化 Sakana Widget
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initSakanaWidget, 1000);
});
</script>