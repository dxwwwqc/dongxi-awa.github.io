window.live2d_settings = Array(); 

// 基础配置
live2d_settings['modelAPI'] = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/'; 
live2d_settings['tipsMessage'] = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/waifu-tips.json'; 
live2d_settings['hitokotoAPI'] = 'local'; 
live2d_settings['modelId'] = 38;            
live2d_settings['modelTexturesId'] = 0;             
live2d_settings['showToolMenu'] = true;         
live2d_settings['canCloseLive2d'] = true;         
live2d_settings['canSwitchModel'] = false;         
live2d_settings['canSwitchTextures'] = true;          
live2d_settings['canSwitchHitokoto'] = true;         
live2d_settings['canTakeScreenshot'] = true;         
live2d_settings['canTurnToHomePage'] = true;         
live2d_settings['canTurnToAboutPage'] = true;         
live2d_settings['modelStorage'] = false;         
live2d_settings['modelRandMode'] = 'switch';     
live2d_settings['modelTexturesRandMode'] = 'switch';      
live2d_settings['showHitokoto'] = true;         
live2d_settings['showF12Status'] = true;         
live2d_settings['waifuSize'] = '280x250';    
live2d_settings['waifuTipsSize'] = '250x70';     
live2d_settings['waifuFontSize'] = '12px';       
live2d_settings['waifuToolFont'] = '14px';       
live2d_settings['waifuToolLine'] = '20px';       
live2d_settings['waifuToolTop'] = '0px';         
live2d_settings['waifuMinWidth'] = '768px';      
live2d_settings['waifuEdgeSide'] = 'left:0';     
live2d_settings['waifuDraggable'] = 'disable';    
live2d_settings['waifuDraggableRevert'] = true;         
live2d_settings['l2dVersion'] = '1.4.2';        
live2d_settings['l2dVerDate'] = '2018.11.12'; 
live2d_settings['homePageUrl'] = 'https://dxwwwqc.github.io/dongxi-awa.github.io/';       
live2d_settings['aboutPageUrl'] = 'https://www.fghrsh.net/post/123.html';   
live2d_settings['screenshotCaptureName'] = 'live2d.png'; 

// 使用不同的JSON文件
let currentModelIndex = 0;
const modelFiles = [
    { file: "index.json", name: "日常风格", message: "换上日常服装啦~ 感觉轻松自在！ 🌸" },
    { file: "index1.json", name: "特殊风格", message: "特别场合的装扮，是不是很漂亮？ ✨" },
    { file: "index2.json", name: "泳装风格", message: "泳装装扮，有些害羞呢~ 🎀" }
];

// 全局变量存储 JSON 数据
let waifuTipsData = null;

// 使用 load_rand_textures 消息 - 换装开始提示
function getRandomTextureMessage() {
    if (!waifuTipsData || !waifuTipsData.waifu.load_rand_textures) {
        return "正在换装...";
    }
    const messages = waifuTipsData.waifu.load_rand_textures;
    return messages[Math.floor(Math.random() * messages.length)];
}

// 使用 change_costume_messages 消息 - 换装完成反馈
function getRandomCostumeMessage() {
    if (!waifuTipsData || !waifuTipsData.waifu.change_costume_messages) {
        return "换装完成！";
    }
    const messages = waifuTipsData.waifu.change_costume_messages;
    return messages[Math.floor(Math.random() * messages.length)];
}

// 显示模型信息
function showModelMessage(modelId) {
    if (!waifuTipsData || !waifuTipsData.waifu.model_message) return;
    
    const modelMessages = waifuTipsData.waifu.model_message;
    if (modelMessages[modelId]) {
        showMessage(modelMessages[modelId][0], 4000, true);
    }
}

// 欢迎消息函数 - 从 JSON 读取
function showWelcomeMessage() {
    if (!waifuTipsData || !waifuTipsData.waifu.welcome_messages) {
        const defaultMessages = ["欢迎来到我的博客！"];
        const text = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
        showMessage(text, 6000, true);
        return;
    }
    
    const messages = waifuTipsData.waifu.welcome_messages;
    const text = messages[Math.floor(Math.random() * messages.length)];
    showMessage(text, 6000, true);
}

// 一言函数 - 从 JSON 读取
function showHitokoto() {
    if (!waifuTipsData || !waifuTipsData.waifu.hitokoto_messages) {
        const defaultMessages = ["欢迎来到我的博客！"];
        const text = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
        showMessage(text, 5000, true);
        return;
    }
    
    const messages = waifuTipsData.waifu.hitokoto_messages;
    const text = messages[Math.floor(Math.random() * messages.length)];
    showMessage(text, 5000, true);
}

// 材质切换函数
function switchTextures() {
    currentModelIndex = (currentModelIndex + 1) % modelFiles.length;
    const model = modelFiles[currentModelIndex];
    
    console.log('切换到:', model.name, '文件:', model.file);
    
    // 使用 load_rand_textures 作为切换提示
    const switchMessage = getRandomTextureMessage();
    showMessage(switchMessage, 1000);
    
    setTimeout(() => {
        var modelPath = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/' + model.file + '?t=' + new Date().getTime();
        loadlive2d('live2d', modelPath, 0);
        
        // 使用 change_costume_messages 作为换装完成后的反馈
        const costumeMessage = getRandomCostumeMessage();
        showMessage(costumeMessage, 3000, true);
    }, 500);
}

// 时间问候函数
function showTimeGreeting() {
    if (!waifuTipsData || !waifuTipsData.waifu.hour_tips) return;
    
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
    
    const tips = waifuTipsData.waifu.hour_tips[timeKey];
    if (tips && tips.length > 0) {
        const text = tips[Math.floor(Math.random() * tips.length)];
        showMessage(text, 5000, true);
    }
}

// 节日问候函数
function showSeasonGreeting() {
    if (!waifuTipsData || !waifuTipsData.seasons) return;
    
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDate = month + '/' + day;
    const year = now.getFullYear();
    
    for (const season of waifuTipsData.seasons) {
        if (season.date.includes('-')) {
            const [start, end] = season.date.split('-');
            const startMonth = parseInt(start.split('/')[0]);
            const startDay = parseInt(start.split('/')[1]);
            const endMonth = parseInt(end.split('/')[0]);
            const endDay = parseInt(end.split('/')[1]);
            
            if ((month === startMonth && day >= startDay) || 
                (month === endMonth && day <= endDay) ||
                (month > startMonth && month < endMonth)) {
                const text = season.text[0].replace('{year}', year);
                showMessage(text, 6000, true);
                return;
            }
        } else if (season.date === currentDate) {
            const text = season.text[0].replace('{year}', year);
            showMessage(text, 6000, true);
            return;
        }
    }
}

// 来源检测函数
function showReferrerMessage() {
    if (!waifuTipsData || !waifuTipsData.waifu.referrer_message) return;
    
    const referrer = document.referrer;
    let messageType = 'none';
    let searchQuery = '';
    
    if (!referrer) {
        messageType = 'none';
    } else if (referrer.includes('localhost') || referrer.includes('127.0.0.1')) {
        messageType = 'localhost';
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
        const knownSites = waifuTipsData.waifu.referrer_hostname;
        if (knownSites && knownSites[hostname]) {
            searchQuery = knownSites[hostname][0];
        } else {
            searchQuery = hostname;
        }
    }
    
    const messageTemplate = waifuTipsData.waifu.referrer_message[messageType];
    if (messageTemplate) {
        let message = messageTemplate.join('');
        message = message.replace('{text}', searchQuery);
        showMessage(message, 5000, true);
    }
}

// 控制台打开检测
function initConsoleDetection() {
    if (!waifuTipsData || !waifuTipsData.waifu.console_open_msg) return;
    
    const consoleMessages = waifuTipsData.waifu.console_open_msg;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            const text = consoleMessages[Math.floor(Math.random() * consoleMessages.length)];
            showMessage(text, 4000);
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'I' && e.ctrlKey && e.shiftKey) {
            const text = consoleMessages[Math.floor(Math.random() * consoleMessages.length)];
            showMessage(text, 4000);
        }
    });
}

// 复制检测函数
function initCopyDetection() {
    if (!waifuTipsData || !waifuTipsData.waifu.copy_message) return;
    
    document.addEventListener('copy', function() {
        const copyMessages = waifuTipsData.waifu.copy_message;
        const text = copyMessages[Math.floor(Math.random() * copyMessages.length)];
        showMessage(text, 3000);
    });
}

// 初始化鼠标悬停提示
function initMouseoverTips() {
    if (!waifuTipsData || !waifuTipsData.mouseover) return;
    
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

// initModel 函数
function initModel(waifuPath, type) {
    console.log('初始化 Live2D 模型...');
    
    // 样式设置
    live2d_settings.waifuSize = live2d_settings.waifuSize.split('x');
    live2d_settings.waifuTipsSize = live2d_settings.waifuTipsSize.split('x');
    live2d_settings.waifuEdgeSide = live2d_settings.waifuEdgeSide.split(':');
    
    $("#live2d").attr("width", live2d_settings.waifuSize[0]);
    $("#live2d").attr("height", live2d_settings.waifuSize[1]);
    $(".waifu-tips").width(live2d_settings.waifuTipsSize[0]);
    $(".waifu-tips").height(live2d_settings.waifuTipsSize[1]);
    $(".waifu-tips").css("top", live2d_settings.waifuToolTop);
    $(".waifu-tips").css("font-size", live2d_settings.waifuFontSize);
    $(".waifu-tool").css("font-size", live2d_settings.waifuToolFont);
    $(".waifu-tool span").css("line-height", live2d_settings.waifuToolLine);
    
    if (live2d_settings.waifuEdgeSide[0] == 'left') {
        $(".waifu").css("left", live2d_settings.waifuEdgeSide[1]+'px');
    } else if (live2d_settings.waifuEdgeSide[0] == 'right') {
        $(".waifu").css("right", live2d_settings.waifuEdgeSide[1]+'px');
    }
    
    // 加载提示配置
    if (typeof(waifuPath) == "object") {
        waifuTipsData = waifuPath;
        loadTipsMessage(waifuPath);
        
        initConsoleDetection();
        initCopyDetection();
        initMouseoverTips();
        
        setTimeout(() => {
            showWelcomeMessage();
            setTimeout(showSeasonGreeting, 7000);
            setTimeout(showTimeGreeting, 14000);
            setTimeout(showReferrerMessage, 21000);
        }, 1000);
    } else {
        $.ajax({
            cache: true,
            url: waifuPath == '' ? live2d_settings.tipsMessage : waifuPath,
            dataType: "json",
            success: function (result){ 
                waifuTipsData = result;
                loadTipsMessage(result);
                
                initConsoleDetection();
                initCopyDetection();
                initMouseoverTips();
                
                setTimeout(() => {
                    showWelcomeMessage();
                    setTimeout(showSeasonGreeting, 7000);
                    setTimeout(showTimeGreeting, 14000);
                    setTimeout(showReferrerMessage, 21000);
                }, 1000);
            }
        });
    }
    
    // 隐藏不需要的工具栏按钮
    if (!live2d_settings.showToolMenu) $('.waifu-tool').hide();
    if (!live2d_settings.canCloseLive2d) $('.waifu-tool .fui-cross').hide();
    if (!live2d_settings.canSwitchModel) $('.waifu-tool .fui-eye').hide();
    if (!live2d_settings.canSwitchTextures) $('.waifu-tool .fui-user').hide();
    if (!live2d_settings.canSwitchHitokoto) $('.waifu-tool .fui-chat').hide();
    if (!live2d_settings.canTakeScreenshot) $('.waifu-tool .fui-photo').hide();
    if (!live2d_settings.canTurnToHomePage) $('.waifu-tool .fui-home').hide();
    if (!live2d_settings.canTurnToAboutPage) $('.waifu-tool .fui-info-circle').hide();

    // 加载默认模型
    var modelPath = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/index.json';
    loadlive2d('live2d', modelPath);
}

// ========== 必需的工具函数 ==========

String.prototype.render = function(context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return this.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) { return word.replace('\\', ''); }
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;
        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
};

function showMessage(text, timeout, flag) {
    if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        if (live2d_settings.showF12Message) console.log('[Message]', text.replace(/<[^<>]+>/g,''));
        
        if(flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === undefined) timeout = 5000;
    window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

// 必需的 loadTipsMessage 函数
function loadTipsMessage(result) {
    $('.waifu-tool .fui-home').click(function (){
        window.location.href = 'https://dxwwwqc.github.io/dongxi-awa.github.io/';
    });
    
    $('.waifu-tool .fui-chat').click(function (){
        showHitokoto();
    });
    
    $('.waifu-tool .fui-eye').click(function (){
        showMessage('🚫 当前只有一个模型，无法切换哦~', 3000);
    });
    
    $('.waifu-tool .fui-user').click(function (){
        switchTextures();
    });
    
    $('.waifu-tool .fui-photo').click(function (){
        const screenshotMsg = result.waifu.screenshot_message[0];
        showMessage(screenshotMsg, 2000);
        if (window.Live2D) {
            window.Live2D.captureName = 'live2d.png';
            window.Live2D.captureFrame = true;
        }
    });
    
    $('.waifu-tool .fui-info-circle').click(function (){
        window.open('https://www.fghrsh.net/post/123.html');
    });
    
    $('.waifu-tool .fui-cross').click(function (){
        const hiddenMsg = result.waifu.hidden_message[0];
        showMessage(hiddenMsg, 1300);
        setTimeout(() => {
            $('.waifu').hide();
        }, 1300);
    });
    
    // 交互功能 - 从 JSON 读取台词
    $(document).on("click", "#live2d", function (){
        const clickItem = result.click.find(item => item.selector === '.waifu #live2d');
        if (clickItem && clickItem.text) {
            const text = clickItem.text[Math.floor(Math.random() * clickItem.text.length)];
            showMessage(text, 3000, true);
        }
    });

    $(document).on("mouseover", "#live2d", function (){
        const mouseoverItem = result.mouseover.find(item => item.selector === '.waifu #live2d');
        if (mouseoverItem && mouseoverItem.text) {
            const text = mouseoverItem.text[Math.floor(Math.random() * mouseoverItem.text.length)];
            showMessage(text, 2000);
        }
    });
}