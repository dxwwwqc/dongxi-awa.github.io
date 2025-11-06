// 全局配置 - 现在从 JSON 加载
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

// 初始化函数
async function initWaifu() {
    try {
        // 加载配置
        await loadConfig();
        
        // 初始化功能
        initMobileOptimization();
        initTouchFeedback();
        loadUserPreferences();
        addSeasonStyles();
        
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
        
    } catch (error) {
        console.error('看板娘初始化失败:', error);
        loadFallbackConfig();
    }
}

// 加载配置
async function loadConfig() {
    const response = await fetch(live2d_settings.tipsMessage || 'waifu-tips.json');
    waifuTipsData = await response.json();
    
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
        
        // 显示移动端特定消息
        const mobileMsg = getMessage('touch_messages.mobile_specific');
        if (mobileMsg) showMessage(mobileMsg, 4000);
    }
}

// 触摸反馈
function initTouchFeedback() {
    let touchTimer;
    let touchCount = 0;
    
    $('#live2d').on('touchstart', function(e) {
        touchTimer = setTimeout(() => {
            const message = getMessage('touch_messages.long_press');
            if (message) showMessage(message, 3000);
        }, 1000);
    });
    
    $('#live2d').on('touchend', function(e) {
        clearTimeout(touchTimer);
        touchCount++;
        
        if (touchCount === 2) {
            const message = getMessage('touch_messages.double_tap');
            if (message) showMessage(message, 3000);
            touchCount = 0;
        }
        
        setTimeout(() => { touchCount = 0; }, 300);
        updateStateOnInteraction('touch');
    });
}

// 用户偏好
function loadUserPreferences() {
    const saved = localStorage.getItem('waifuPreferences');
    if (saved) {
        const preferences = JSON.parse(saved);
        currentModelIndex = preferences.currentModelIndex || 0;
        
        const lastVisit = new Date(preferences.lastVisit);
        const daysSinceLastVisit = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastVisit > 7) {
            const message = getMessage('state_messages.return_after_long').replace('{days}', daysSinceLastVisit);
            showMessage(message, 5000);
        }
    }
}

function saveUserPreferences() {
    const preferences = {
        currentModelIndex: currentModelIndex,
        lastVisit: new Date().toISOString(),
        interactionHistory: waifuState.interactionCount,
        favoriteCostume: waifuState.currentCostume
    };
    localStorage.setItem('waifuPreferences', JSON.stringify(preferences));
}

// 消息系统
function getMessage(path, fallback = '') {
    if (!waifuTipsData) return fallback;
    
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
}

function showMessage(text, timeout, flag) {
    // 防抖处理
    if (Date.now() - lastMessageTime < 1000) return;
    lastMessageTime = Date.now();
    
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
    if (flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null) {
        if (live2d_settings.showF12Message) {
            console.log('[Message]', text.replace(/<[^<>]+>/g,''));
        }
        
        if (flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        
        hideMessage(timeout || 5000);
    }
}

function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity', 1);
    window.setTimeout(() => {
        sessionStorage.removeItem('waifu-text');
    }, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
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
        message = message.replace('{query}', searchQuery)
                        .replace('{title}', pageTitle)
                        .replace('{site}', searchQuery);
        showMessage(message, 5000, true);
    }
}

// 材质切换
function switchTextures() {
    if (!waifuTipsData?.settings?.modelFiles) return;
    
    const modelFiles = waifuTipsData.settings.modelFiles;
    currentModelIndex = (currentModelIndex + 1) % modelFiles.length;
    const model = modelFiles[currentModelIndex];
    
    // 切换提示
    const switchMessage = getMessage('waifu.load_rand_textures', '正在换装...');
    showMessage(switchMessage, 1000);
    
    setTimeout(() => {
        const modelPath = `${live2d_settings.modelAPI}${live2d_settings.modelId}/${model.file}?t=${Date.now()}`;
        loadlive2d('live2d', modelPath, 0);
        
        // 完成提示
        const costumeMessage = getMessage('waifu.change_costume_messages', '换装完成！');
        showMessage(costumeMessage, 3000, true);
        
        waifuState.currentCostume = model.name;
        saveUserPreferences();
    }, 500);
}

// 状态管理
function updateWaifuBehavior() {
    const now = Date.now();
    const idleTime = now - waifuState.lastInteraction;
    
    if (idleTime > 15 * 60 * 1000 && !waifuState.isSleeping) {
        waifuState.isSleeping = true;
        const message = getMessage('state_messages.sleep');
        showMessage(message, 0);
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
            const message = getMessage('waifu.console_open_msg');
            if (message) showMessage(message, 4000);
        }
    });
}

function initCopyDetection() {
    document.addEventListener('copy', function() {
        const message = getMessage('waifu.copy_message');
        if (message) showMessage(message, 3000);
    });
}

function initMouseoverTips() {
    if (!waifuTipsData?.mouseover) return;
    
    waifuTipsData.mouseover.forEach(item => {
        $(document).on("mouseover", item.selector, function (){
            const texts = item.text;
            if (texts && texts.length > 0) {
                let text = texts[Math.floor(Math.random() * texts.length)];
                if (this.textContent) {
                    text = text.replace('{text}', this.textContent.trim());
                }
                showMessage(text, 2000);
            }
        });
    });
}

function initVisibilityDetection() {
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && waifuState.isSleeping) {
            waifuState.isSleeping = false;
            const message = getMessage('state_messages.wake_up');
            showMessage(message, 3000);
        }
    });
}

// 样式应用
function applyStyles() {
    if (!live2d_settings.waifuSize) return;
    
    const size = live2d_settings.waifuSize.split('x');
    const tipsSize = live2d_settings.waifuTipsSize.split('x');
    const edgeSide = live2d_settings.waifuEdgeSide.split(':');
    
    $("#live2d").attr("width", size[0]).attr("height", size[1]);
    $(".waifu-tips").width(tipsSize[0]).height(tipsSize[1]);
    $(".waifu-tips").css({
        "top": live2d_settings.waifuToolTop,
        "font-size": live2d_settings.waifuFontSize
    });
    
    if (edgeSide[0] == 'left') {
        $(".waifu").css("left", edgeSide[1] + 'px');
    } else if (edgeSide[0] == 'right') {
        $(".waifu").css("right", edgeSide[1] + 'px');
    }
}

// 工具栏事件
function initToolbarEvents() {
    $('.waifu-tool .fui-home').click(() => {
        window.location.href = live2d_settings.homePageUrl;
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
        const message = getMessage('waifu.screenshot_message');
        showMessage(message, 2000);
        if (window.Live2D) {
            window.Live2D.captureName = live2d_settings.screenshotCaptureName;
            window.Live2D.captureFrame = true;
        }
    });
    
    $('.waifu-tool .fui-info-circle').click(() => {
        window.open(live2d_settings.aboutPageUrl);
    });
    
    $('.waifu-tool .fui-cross').click(() => {
        const message = getMessage('waifu.hidden_message');
        showMessage(message, 1300);
        setTimeout(() => $('.waifu').hide(), 1300);
    });
    
    // 点击交互
    $(document).on("click", "#live2d", function (){
        const clickItem = waifuTipsData?.click?.find(item => item.selector === '.waifu #live2d');
        if (clickItem?.text) {
            const text = clickItem.text[Math.floor(Math.random() * clickItem.text.length)];
            showMessage(text, 3000, true);
        }
        updateStateOnInteraction('click');
    });
}

// 加载默认模型
function loadDefaultModel() {
    const modelPath = `${live2d_settings.modelAPI}${live2d_settings.modelId}/index.json`;
    loadlive2d('live2d', modelPath);
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
    // 保留原始设置以保持兼容性
    window.live2d_settings = window.live2d_settings || {
        modelAPI: 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/',
        tipsMessage: 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/waifu-tips.json'
    };
    
    live2d_settings = { ...live2d_settings, ...window.live2d_settings };
    initWaifu();
});

// 保持原始函数以维持兼容性
function initModel(waifuPath, type) {
    console.warn('initModel 已弃用，请使用 initWaifu');
    initWaifu();
}