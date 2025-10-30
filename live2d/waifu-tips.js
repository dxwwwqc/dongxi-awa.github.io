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
    { file: "index1.json", name: "休闲风格", message: "休闲装扮，适合放松的时光~ 🎀" },
    { file: "index2.json", name: "特别风格", message: "特别场合的装扮，是不是很漂亮？ ✨" }
];

// 材质切换函数
function switchTextures() {
    currentModelIndex = (currentModelIndex + 1) % modelFiles.length;
    const model = modelFiles[currentModelIndex];
    
    console.log('切换到:', model.name, '文件:', model.file);
    showMessage('正在切换装扮...', 1000);
    
    setTimeout(() => {
        var modelPath = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/' + model.file + '?t=' + new Date().getTime();
        // 强制使用材质ID 0
        loadlive2d('live2d', modelPath, 0);
        showMessage(model.message, 3000, true);
    }, 500);
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
        loadTipsMessage(waifuPath);
    } else {
        $.ajax({
            cache: true,
            url: waifuPath == '' ? live2d_settings.tipsMessage : waifuPath,
            dataType: "json",
            success: function (result){ 
                loadTipsMessage(result); 
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
    var modelPath = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/index1.json';
    var modelPath = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/index2.json';
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

function showHitokoto() {
    const texts = [
        '欢迎来到我的博客！',
        '今天也要开心哦~',
        '代码写的很棒呢！',
        '这个看板娘可爱吗？',
        '记得常来看看哦！'
    ];
    const text = texts[Math.floor(Math.random() * texts.length)];
    showMessage(text, 5000, true);
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
        showMessage('📸 拍照留念！', 2000);
        if (window.Live2D) {
            window.Live2D.captureName = 'live2d.png';
            window.Live2D.captureFrame = true;
        }
    });
    
    $('.waifu-tool .fui-info-circle').click(function (){
        window.open('https://www.fghrsh.net/post/123.html');
    });
    
    $('.waifu-tool .fui-cross').click(function (){
        showMessage('再见啦~我们还会再见面的！', 1300);
        setTimeout(() => {
            $('.waifu').hide();
        }, 1300);
    });
    
    // 交互功能
    $(document).on("click", "#live2d", function (){
        const texts = [
            '啊！别碰我！', 
            '再摸我要生气了！', 
            '讨厌~',
            '是…是不小心碰到了吧'
        ];
        const text = texts[Math.floor(Math.random() * texts.length)];
        showMessage(text, 3000, true);
    });

    $(document).on("mouseover", "#live2d", function (){
        const texts = [
            '干嘛呢你，快把手拿开',
            '鼠…鼠标放错地方了！',
            '嘿嘿嘿~'
        ];
        const text = texts[Math.floor(Math.random() * texts.length)];
        showMessage(text, 2000);
    });
}