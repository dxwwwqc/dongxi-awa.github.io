// 全局配置
let live2d_settings = {};
let waifuTipsData = null;
let currentModelIndex = 0;

// 状态管理
const waifuState = {
    mood: 'happy',
    lastInteraction: Date.now(),
    interactionCount: 0,
    currentCostume: 'default',
    isSleeping: false
};

// 消息缓存
let messageCache = new Map();
let lastMessageTime = 0;

// 添加节日特效样式函数（修复缺失的函数）
function addSeasonStyles() {
    if (document.getElementById('season-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'season-styles';
    style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes heartFloat {
            to {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes bubbleRise {
            to {
                transform: translateY(-120vh) rotate(180deg);
                opacity: 0;
            }
        }
        
        @keyframes ghostFloat {
            0% {
                transform: translateX(0) translateY(0);
                opacity: 0.7;
            }
            50% {
                transform: translateX(100vw) translateY(-50vh);
                opacity: 1;
            }
            100% {
                transform: translateX(100vw) translateY(-100vh);
                opacity: 0;
            }
        }
        
        @keyframes countdownPop {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            70% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes countdownFade {
            to {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes fireworkExplode {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.5);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }
        
        @keyframes snowFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .confetti, .heart, .bubble, .ghost, .snow {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// 节日特效函数
function createConfettiEffect() {
    if (window.isMobile) {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createParticle('confetti'), i * 100);
        }
        return;
    }
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createParticle('confetti'), i * 100);
    }
}

function createHeartsEffect() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '💖';
            heart.style.cssText = `
                position: fixed;
                font-size: 24px;
                top: 100vh;
                left: ${Math.random() * 100}vw;
                animation: heartFloat ${Math.random() * 4 + 3}s ease-in forwards;
                z-index: 10000;
                pointer-events: none;
                opacity: 0.8;
            `;
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 7000);
        }, i * 200);
    }
}

function createParticle(type) {
    const particle = document.createElement('div');
    const colors = ['#ff6b6b', '#fdcb6e', '#74b9ff', '#55efc4', '#a29bfe'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.className = type;
    particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${color};
        top: -10px;
        left: ${Math.random() * 100}vw;
        animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        z-index: 10000;
        pointer-events: none;
        border-radius: 1px;
    `;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 5000);
}

// 节日问候函数
function showSeasonGreeting() {
    if (!waifuTipsData?.seasons) return;
    
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDate = month + '/' + day;
    const year = now.getFullYear();
    
    for (const season of waifuTipsData.seasons) {
        if (season.date.includes('-')) {
            const [start, end] = season.date.split('-');
            if (isDateInRange(month, day, start, end)) {
                showSeasonMessage(season, year);
                return;
            }
        } else if (season.date === currentDate) {
            showSeasonMessage(season, year);
            return;
        }
    }
}

function isDateInRange(month, day, start, end) {
    const startMonth = parseInt(start.split('/')[0]);
    const startDay = parseInt(start.split('/')[1]);
    const endMonth = parseInt(end.split('/')[0]);
    const endDay = parseInt(end.split('/')[1]);
    
    const currentDate = parseInt(month + day);
    const startDate = parseInt(startMonth.toString().padStart(2, '0') + startDay.toString().padStart(2, '0'));
    const endDate = parseInt(endMonth.toString().padStart(2, '0') + endDay.toString().padStart(2, '0'));
    
    return currentDate >= startDate && currentDate <= endDate;
}

function showSeasonMessage(season, year) {
    const texts = season.text;
    let text = texts[Math.floor(Math.random() * texts.length)];
    text = text.replace(/{year}/g, year);
    
    showMessage(text, 6000, true);
    
    if (season.effect) {
        applySeasonEffect(season.effect);
    }
}

function applySeasonEffect(effect) {
    if (window.isMobile) return; // 移动端禁用特效
    
    switch(effect) {
        case 'confetti':
            createConfettiEffect();
            break;
        case 'hearts':
            createHeartsEffect();
            break;
        // 可以添加其他特效...
    }
}

// 初始化函数
async function initWaifu() {
    try {
        console.log('开始初始化看板娘...');
        
        // 加载配置
        await loadConfig();
        
        // 初始化功能
        initMobileOptimization();
        initTouchFeedback();
        loadUserPreferences();
        addSeasonStyles(); // 现在这个函数已定义
        
        // 设置样式
        applyStyles();
        
        // 初始化事件监听
        initConsoleDetection();
        initCopyDetection();
        initMouseoverTips();
        initToolbarEvents();
        
        // 加载模型
        loadDefaultModel();
        
        // 显示欢迎消息序列
        showWelcomeSequence();
        
        // 启动状态更新
        setInterval(updateWaifuBehavior, 60000);
        
        // 页面可见性检测
        initVisibilityDetection();
        
        console.log('看板娘初始化完成');
        
    } catch (error) {
        console.error('看板娘初始化失败:', error);
        loadFallbackConfig();
        
        // 即使失败也显示基本功能
        addSeasonStyles();
        applyBasicStyles();
        initBasicEvents();
        loadDefaultModel();
        showBasicWelcome();
    }
}

// 加载配置
async function loadConfig() {
    const configUrl = live2d_settings.tipsMessage || '/live2d/waifu-tips.json';
    console.log('加载配置:', configUrl);
    
    const response = await fetch(configUrl);
    if (!response.ok) {
        throw new Error(`配置加载失败: ${response.status}`);
    }
    
    waifuTipsData = await response.json();
    console.log('配置加载成功', waifuTipsData);
    
    // 合并设置
    live2d_settings = { ...live2d_settings, ...waifuTipsData.settings };
}

// 移动端优化
function initMobileOptimization() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        live2d_settings.waifuSize = '200x180';
        live2d_settings.waifuTipsSize = '220x60';
        live2d_settings.waifuFontSize = '11px';
        live2d_settings.waifuDraggable = 'disable';
        window.isMobile = true;
    }
}

// 触摸反馈
function initTouchFeedback() {
    let touchTimer;
    let touchCount = 0;
    
    $('#live2d').on('touchstart', function(e) {
        touchTimer = setTimeout(() => {
            showMessage("一直按着我不放是想干嘛呀~", 3000);
        }, 1000);
    });
    
    $('#live2d').on('touchend', function(e) {
        clearTimeout(touchTimer);
        touchCount++;
        
        if (touchCount === 2) {
            showMessage("双击喜欢！谢谢你~", 3000);
            touchCount = 0;
        }
        
        setTimeout(() => { touchCount = 0; }, 300);
        updateStateOnInteraction('touch');
    });
}

// 用户偏好
function loadUserPreferences() {
    try {
        const saved = localStorage.getItem('waifuPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            currentModelIndex = preferences.currentModelIndex || 0;
            
            const lastVisit = new Date(preferences.lastVisit);
            const daysSinceLastVisit = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastVisit > 7) {
                showMessage(`好久不见！已经${daysSinceLastVisit}天没看到你了~`, 5000);
            }
        }
    } catch (e) {
        console.warn('用户偏好加载失败:', e);
    }
}

function saveUserPreferences() {
    try {
        const preferences = {
            currentModelIndex: currentModelIndex,
            lastVisit: new Date().toISOString(),
            interactionHistory: waifuState.interactionCount,
            favoriteCostume: waifuState.currentCostume
        };
        localStorage.setItem('waifuPreferences', JSON.stringify(preferences));
    } catch (e) {
        console.warn('用户偏好保存失败:', e);
    }
}

// 消息系统
function getMessage(path, fallback = '') {
    if (!waifuTipsData) return fallback;
    
    try {
        const keys = path.split('.');
        let value = waifuTipsData;
        
        for (const key of keys) {
            value = value[key];
            if (value === undefined) return fallback;
        }
        
        if (Array.isArray(value)) {
            return value[Math.floor(Math.random() * value.length)];
        }
        
        return value || fallback;
    } catch (e) {
        return fallback;
    }
}

function showMessage(text, timeout, flag) {
    // 防抖处理
    if (Date.now() - lastMessageTime < 1000) return;
    lastMessageTime = Date.now();
    
    try {
        // 缓存处理
        const cacheKey = Array.isArray(text) ? text.join('|') : text;
        if (messageCache.has(cacheKey)) {
            text = messageCache.get(cacheKey);
        } else {
            if (Array.isArray(text)) {
                text = text[Math.floor(Math.random() * text.length)];
            }
            messageCache.set(cacheKey, text);
        }
        
        // 显示消息
        if (flag || !sessionStorage.getItem('waifu-text')) {
            if (live2d_settings.showF12Message !== false) {
                console.log('[Message]', text.replace(/<[^<>]+>/g,''));
            }
            
            if (flag) sessionStorage.setItem('waifu-text', text);
            
            $('.waifu-tips').stop();
            $('.waifu-tips').html(text).fadeTo(200, 1);
            
            hideMessage(timeout || 5000);
        }
    } catch (e) {
        console.warn('消息显示失败:', e);
    }
}

function hideMessage(timeout) {
    try {
        $('.waifu-tips').stop().css('opacity', 1);
        window.setTimeout(() => {
            sessionStorage.removeItem('waifu-text');
        }, timeout);
        $('.waifu-tips').delay(timeout).fadeTo(200, 0);
    } catch (e) {
        console.warn('消息隐藏失败:', e);
    }
}

// 欢迎消息序列
function showWelcomeSequence() {
    setTimeout(() => {
        showWelcomeMessage();
        setTimeout(showSeasonGreeting, 7000);
        setTimeout(showTimeGreeting, 14000);
        setTimeout(showReferrerMessage, 21000);
    }, 1000);
}

function showWelcomeMessage() {
    const message = getMessage('waifu.welcome_messages', '欢迎来到我的博客！');
    showMessage(message, 6000, true);
}

function showHitokoto() {
    const message = getMessage('waifu.hitokoto_messages', '今天也要开心哦~');
    showMessage(message, 5000, true);
}

// 时间问候
function showTimeGreeting() {
    const hour = new Date().getHours();
    let timeKey = 'default';
    
    if (hour >= 5 && hour < 7) timeKey = 't5-7';
    else if (hour >= 7 && hour < 11) timeKey = 't7-11';
    else if (hour >= 11 && hour < 14) timeKey = 't11-14';
    else if (hour >= 14 && hour < 17) timeKey = 't14-17';
    else if (hour >= 17 && hour < 19) timeKey = 't17-19';
    else if (hour >= 19 && hour < 21) timeKey = 't19-21';
    else if (hour >= 21 && hour < 23) timeKey = 't21-23';
    else if (hour >= 23 || hour < 5) timeKey = 't23-5';
    
    const message = getMessage(`waifu.hour_tips.${timeKey}`);
    if (message) showMessage(message, 5000, true);
}

// 来源检测
function showReferrerMessage() {
    try {
        const referrer = document.referrer;
        let messageType = 'none';
        let searchQuery = '';
        let pageTitle = document.title.replace(' - 小冬栖的博客', '');
        
        if (!referrer) {
            messageType = 'none';
        } else if (referrer.includes('baidu.com')) {
            messageType = 'baidu';
            const match = referrer.match(/[?&]wd=([^&]*)/) || referrer.match(/[?&]word=([^&]*)/);
            if (match) searchQuery = decodeURIComponent(match[1]);
        } else if (referrer.includes('so.com')) {
            messageType = 'so';
            const match = referrer.match(/[?&]q=([^&]*)/);
            if (match) searchQuery = decodeURIComponent(match[1]);
        } else if (referrer.includes('google.com')) {
            messageType = 'google';
            const match = referrer.match(/[?&]q=([^&]*)/);
            if (match) searchQuery = decodeURIComponent(match[1]);
        } else {
            messageType = 'default';
            const hostname = new URL(referrer).hostname;
            const knownSites = getMessage('waifu.referrer_hostname', {});
            searchQuery = knownSites[hostname] || hostname;
        }
        
        let message = getMessage(`waifu.referrer_message.${messageType}`);
        if (message) {
            message = message.replace(/{query}/g, searchQuery)
                            .replace(/{title}/g, pageTitle)
                            .replace(/{site}/g, searchQuery);
            showMessage(message, 5000, true);
        }
    } catch (e) {
        console.warn('来源检测失败:', e);
    }
}

// 材质切换
function switchTextures() {
    try {
        const modelFiles = [
            { file: "index.json", name: "日常风格", message: "换上日常服装啦~ 感觉轻松自在！ 🌸" },
            { file: "index1.json", name: "特殊风格", message: "特别场合的装扮，是不是很漂亮？ ✨" },
            { file: "index2.json", name: "泳装风格", message: "泳装装扮，有些害羞呢~ 🎀" }
        ];
        
        currentModelIndex = (currentModelIndex + 1) % modelFiles.length;
        const model = modelFiles[currentModelIndex];
        
        // 切换提示
        showMessage("正在换装...", 1000);
        
        setTimeout(() => {
            const modelPath = `https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/${model.file}?t=${Date.now()}`;
            loadlive2d('live2d', modelPath, 0);
            
            // 完成提示
            showMessage(model.message, 3000, true);
            
            waifuState.currentCostume = model.name;
            saveUserPreferences();
        }, 500);
    } catch (e) {
        console.warn('换装失败:', e);
        showMessage('换装出错了~', 3000);
    }
}

// 状态管理
function updateWaifuBehavior() {
    const now = Date.now();
    const idleTime = now - waifuState.lastInteraction;
    
    if (idleTime > 15 * 60 * 1000 && !waifuState.isSleeping) {
        waifuState.isSleeping = true;
        showMessage("Zzz... 有点困了呢...", 0);
    }
}

function updateStateOnInteraction(type) {
    waifuState.lastInteraction = Date.now();
    waifuState.interactionCount++;
    waifuState.isSleeping = false;
    
    if (type === 'click' || type === 'touch') {
        waifuState.mood = ['happy', 'shy'][Math.floor(Math.random() * 2)];
    }
    
    saveUserPreferences();
}

// 事件监听
function initConsoleDetection() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.key === 'I' && e.ctrlKey && e.shiftKey)) {
            showMessage("哈哈，你打开了控制台，是想要看看我的秘密吗？", 4000);
        }
    });
}

function initCopyDetection() {
    document.addEventListener('copy', function() {
        showMessage("你都复制了些什么呀，转载要记得加上出处哦", 3000);
    });
}

function initMouseoverTips() {
    // 基本悬停提示
    const basicHover = [
        { selector: ".fui-home", text: ["点击前往首页"] },
        { selector: ".fui-chat", text: ["和我聊天吧~"] },
        { selector: ".fui-user", text: ["喜欢换装 Play 吗？"] },
        { selector: "#live2d", text: ["干嘛呢你，快把手拿开", "鼠…鼠标放错地方了！"] }
    ];
    
    basicHover.forEach(item => {
        $(document).on("mouseover", item.selector, function (){
            const text = item.text[Math.floor(Math.random() * item.text.length)];
            showMessage(text, 2000);
        });
    });
}

function initVisibilityDetection() {
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && waifuState.isSleeping) {
            waifuState.isSleeping = false;
            showMessage("啊，你回来啦！", 3000);
        }
    });
}

// 样式应用
function applyStyles() {
    try {
        if (!live2d_settings.waifuSize) return;
        
        const size = live2d_settings.waifuSize.split('x');
        const tipsSize = live2d_settings.waifuTipsSize.split('x');
        
        $("#live2d").attr("width", size[0]).attr("height", size[1]);
        $(".waifu-tips").width(tipsSize[0]).height(tipsSize[1]);
        
        if (live2d_settings.waifuFontSize) {
            $(".waifu-tips").css("font-size", live2d_settings.waifuFontSize);
        }
    } catch (e) {
        console.warn('样式应用失败:', e);
    }
}

function applyBasicStyles() {
    // 基本样式保障
    $("#live2d").attr("width", 280).attr("height", 250);
    $(".waifu-tips").width(250).height(70);
}

// 工具栏事件
function initToolbarEvents() {
    $('.waifu-tool .fui-home').click(() => {
        window.location.href = live2d_settings.homePageUrl || 'https://dxwwwqc.github.io/dongxi-awa.github.io/';
    });
    
    $('.waifu-tool .fui-chat').click(() => {
        showHitokoto();
    });
    
    $('.waifu-tool .fui-eye').click(() => {
        showMessage('🚫 当前只有一个模型，无法切换哦~', 3000);
    });
    
    $('.waifu-tool .fui-user').click(() => {
        switchTextures();
    });
    
    $('.waifu-tool .fui-photo').click(() => {
        showMessage("照好了嘛，是不是很可爱呢？", 2000);
        if (window.Live2D) {
            window.Live2D.captureName = 'live2d.png';
            window.Live2D.captureFrame = true;
        }
    });
    
    $('.waifu-tool .fui-info-circle').click(() => {
        window.open(live2d_settings.aboutPageUrl || 'https://www.fghrsh.net/post/123.html');
    });
    
    $('.waifu-tool .fui-cross').click(() => {
        showMessage("我们还能再见面的吧…", 1300);
        setTimeout(() => $('.waifu').hide(), 1300);
    });
    
    // 点击交互
    $(document).on("click", "#live2d", function (){
        const messages = [
            "是…是不小心碰到了吧",
            "萝莉控是什么呀", 
            "杂鱼",
            "再摸的话我可要报警了！⌇●﹏●⌇",
            "110吗，这里有个变态一直在摸我(ó﹏ò｡)"
        ];
        const text = messages[Math.floor(Math.random() * messages.length)];
        showMessage(text, 3000, true);
        updateStateOnInteraction('click');
    });
}

function initBasicEvents() {
    // 基本事件保障
    $(document).on("click", "#live2d", function (){
        showMessage("你好呀~", 3000, true);
    });
}

// 加载默认模型
function loadDefaultModel() {
    try {
        const modelPath = `https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/index.json`;
        console.log('加载模型:', modelPath);
        loadlive2d('live2d', modelPath);
    } catch (e) {
        console.error('模型加载失败:', e);
    }
}

function showBasicWelcome() {
    setTimeout(() => {
        showMessage("欢迎来到小冬栖的博客！🎉", 6000, true);
    }, 1000);
}

// 备用配置
function loadFallbackConfig() {
    console.warn('使用备用配置');
    live2d_settings = {
        modelAPI: 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/',
        homePageUrl: 'https://dxwwwqc.github.io/dongxi-awa.github.io/',
        aboutPageUrl: 'https://www.fghrsh.net/post/123.html',
        waifuSize: '280x250',
        waifuTipsSize: '250x70'
    };
}

// 启动
$(document).ready(function() {
    console.log('DOM 准备就绪，初始化看板娘');
    
    // 设置默认配置
    live2d_settings = {
        modelAPI: 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/',
        tipsMessage: '/dongxi-awa.github.io/live2d/waifu-tips.json',
        homePageUrl: 'https://dxwwwqc.github.io/dongxi-awa.github.io/',
        aboutPageUrl: 'https://www.fghrsh.net/post/123.html',
        showF12Message: true
    };
    
    // 合并全局设置
    if (window.live2d_settings) {
        live2d_settings = { ...live2d_settings, ...window.live2d_settings };
    }
    
    // 初始化
    setTimeout(() => {
        initWaifu();
    }, 1000);
});

// 兼容性函数
function initModel(waifuPath, type) {
    console.log('使用 initModel 初始化');
    initWaifu();
}