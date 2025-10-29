window.live2d_settings = Array(); /*

    く__,.ヘヽ.　　　　/　,ー､ 〉
    　　　　　＼ ', !-─‐-i　/　/´
    　　　 　 ／｀ｰ'　　　 L/／｀ヽ､            Live2D 看板娘 参数设置
    　　 　 /　 ／,　 /|　 ,　 ,　　　 ',                                           Version 1.4.2
    　　　ｲ 　/ /-‐/　ｉ　L_ ﾊ ヽ!　 i                            Update 2018.11.12
    　　　 ﾚ ﾍ 7ｲ｀ﾄ　 ﾚ'ｧ-ﾄ､!ハ|　 |  
    　　　　 !,/7 '0'　　 ´0iソ| 　 |　　　
    　　　　 |.从"　　_　　 ,,,, / |./ 　 |             网页添加 Live2D 看板娘
    　　　　 ﾚ'| i＞.､,,__　_,.イ / 　.i 　|                    https://www.fghrsh.net/post/123.html
    　　　　　 ﾚ'| | / k_７_/ﾚ'ヽ,　ﾊ.　|           
    　　　　　　 | |/i 〈|/　 i　,.ﾍ |　i　|    Thanks
    　　　　　　.|/ /　ｉ： 　 ﾍ!　　＼　|          journey-ad / https://github.com/journey-ad/live2d_src
    　　　 　 　 kヽ>､ﾊ 　 _,.ﾍ､ 　 /､!            xiazeyu / https://github.com/xiazeyu/live2d-widget.js
    　　　　　　 !'〈//｀Ｔ´', ＼ ｀'7'ｰr'          Live2d Cubism SDK WebGL 2.1 Projrct & All model authors.
    　　　　　　 ﾚ'ヽL__|___i,___,ンﾚ|ノ
    　　　　　 　　　ﾄ-,/　|___./
    　　　　　 　　　'ｰ'　　!_,.:*********************************************************************************/



// 后端接口 - 修改为本地路径
live2d_settings['modelAPI']             = '/dongxi-awa.github.io/live2d/model/'; 
live2d_settings['tipsMessage']          = '/dongxi-awa.github.io/live2d/waifu-tips.json'; 
live2d_settings['hitokotoAPI']          = 'local'; 

// 默认模型 - 使用你的模型
live2d_settings['modelId']              = 38;            // 你的模型 ID
live2d_settings['modelTexturesId']      = 0;             // 默认材质 ID

// 工具栏设置
live2d_settings['showToolMenu']         = true;         
live2d_settings['canCloseLive2d']       = true;         
live2d_settings['canSwitchModel']       = false;         // 禁用模型切换
live2d_settings['canSwitchTextures']    = true;          // 启用材质切换
live2d_settings['canSwitchHitokoto']    = true;         
live2d_settings['canTakeScreenshot']    = true;         
live2d_settings['canTurnToHomePage']    = true;         
live2d_settings['canTurnToAboutPage']   = true;         

// 模型切换模式
live2d_settings['modelStorage']         = false;         // 禁用模型存储
live2d_settings['modelRandMode']        = 'switch';     
live2d_settings['modelTexturesRandMode']= 'switch';      // 顺序切换材质

// 提示消息选项
live2d_settings['showHitokoto']         = true;         
live2d_settings['showF12Status']        = true;         
live2d_settings['showF12Message']       = false;        
live2d_settings['showF12OpenMsg']       = true;         
live2d_settings['showCopyMessage']      = true;         
live2d_settings['showWelcomeMessage']   = true;         

//看板娘样式设置
live2d_settings['waifuSize']            = '280x250';    
live2d_settings['waifuTipsSize']        = '250x70';     
live2d_settings['waifuFontSize']        = '12px';       
live2d_settings['waifuToolFont']        = '14px';       
live2d_settings['waifuToolLine']        = '20px';       
live2d_settings['waifuToolTop']         = '0px'         
live2d_settings['waifuMinWidth']        = '768px';      
live2d_settings['waifuEdgeSide']        = 'left:0';     
live2d_settings['waifuDraggable']       = 'disable';    
live2d_settings['waifuDraggableRevert'] = true;         

// 其他杂项设置
live2d_settings['l2dVersion']           = '1.4.2';        
live2d_settings['l2dVerDate']           = '2018.11.12'; 
live2d_settings['homePageUrl']          = 'auto';       
live2d_settings['aboutPageUrl']         = 'https://www.fghrsh.net/post/123.html';   
live2d_settings['screenshotCaptureName']= 'live2d.png'; 

/****************************************************************************************************/

// 材质配置 - 模型38有4个材质 (0-3)
const modelTexturesConfig = {
    "38": {
        textures: [0, 1, 2, 3],  // 可用的材质ID
        textureNames: {
            0: "白色默认装",
            1: "蓝色清新装", 
            2: "粉色可爱装",
            3: "黑色神秘装"
        },
        messages: {
            0: "换回白色默认服装啦~ ✨",
            1: "穿上蓝色清新服装，感觉好凉爽！ 💙",
            2: "粉色衣服好可爱呢~ 💖",
            3: "黑色神秘风格，酷酷的！ 🖤"
        }
    }
};

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

var re = /x/;
console.log(re);

function empty(obj) {return typeof obj=="undefined"||obj==null||obj==""?true:false}
function getRandText(text) {return Array.isArray(text) ? text[Math.floor(Math.random() * text.length + 1)-1] : text}

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

// 材质切换函数
function switchTextures() {
    const modelId = live2d_settings.modelId;
    let currentTexturesId = live2d_settings.modelTexturesId || 0;
    
    // 确保当前材质ID在有效范围内 (0-3)
    currentTexturesId = Math.max(0, Math.min(currentTexturesId, 3));
    
    if (modelTexturesConfig[modelId]) {
        const textures = modelTexturesConfig[modelId].textures;
        const textureNames = modelTexturesConfig[modelId].textureNames;
        const messages = modelTexturesConfig[modelId].messages;
        
        // 找到当前材质ID在列表中的位置
        const currentIndex = textures.indexOf(currentTexturesId);
        let nextIndex = (currentIndex + 1) % textures.length;
        const newTexturesId = textures[nextIndex];
        
        // 加载新材质
        loadModel(modelId, newTexturesId);
        
        // 显示消息
        const message = messages[newTexturesId];
        showMessage(message, 3000, true);
        
        console.log(`切换到材质: ${textureNames[newTexturesId]} (ID: ${newTexturesId})`);
    } else {
        showMessage('这个模型没有其他材质呢~', 3000);
    }
}

// 在配置部分后面添加 initModel 函数
function initModel(waifuPath, type) {
    console.log('初始化 Live2D 模型...');
    
    /* 加载看板娘样式 */
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

    // 加载模型
    var modelId = live2d_settings.modelId;
    var modelTexturesId = live2d_settings.modelTexturesId;
    loadModel(modelId, modelTexturesId);
}

function loadModel(modelId, modelTexturesId=0) {
    // 安全性检查：确保材质ID在0-3范围内
    const safeTexturesId = Math.max(0, Math.min(modelTexturesId, 3));
    
    if (live2d_settings.modelStorage) {
        localStorage.setItem('modelId', modelId);
        localStorage.setItem('modelTexturesId', safeTexturesId);
    } else {
        sessionStorage.setItem('modelId', modelId);
        sessionStorage.setItem('modelTexturesId', safeTexturesId);
    }

    // 更新当前设置
    live2d_settings.modelId = modelId;
    live2d_settings.modelTexturesId = safeTexturesId;

    var modelPath = '/dongxi-awa.github.io/live2d/model/' + modelId + '/index.json';
    console.log('安全加载模型:', modelPath, '材质ID:', safeTexturesId);
    loadlive2d('live2d', modelPath, (live2d_settings.showF12Status ? console.log('[Status]','live2d','模型',modelId+'-'+safeTexturesId,'加载完成'):null));
}

function showHitokoto() {
    const texts = [
        '欢迎来到我的博客！',
        '今天也要开心哦~',
        '代码写的很棒呢！',
        '这个看板娘可爱吗？',
        '记得常来看看哦！',
        '嘿嘿，被我发现你在偷看~',
        '今天的学习任务完成了吗？',
        '要好好照顾自己哦！'
    ];
    const text = texts[Math.floor(Math.random() * texts.length)];
    showMessage(text, 5000, true);
}

function loadTipsMessage(result) {
    // 完整的工具栏功能绑定
    $('.waifu-tool .fui-home').click(function (){
        window.location.href = '/dongxi-awa.github.io/';
    });
    
    $('.waifu-tool .fui-chat').click(function (){
        showHitokoto();
    });
    
    $('.waifu-tool .fui-eye').click(function (){
        showMessage('🚫 当前只有一个模型，无法切换哦~', 3000);
    });
    
    $('.waifu-tool .fui-user').click(function (){
        // 材质切换功能
        if (modelTexturesConfig[live2d_settings.modelId] && modelTexturesConfig[live2d_settings.modelId].textures.length > 1) {
            switchTextures();
        } else {
            showMessage('👗 当前只有一套衣服呢', 3000);
        }
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
            '是…是不小心碰到了吧',
            '萝莉控是什么呀',
            '你看到我的小熊了吗',
            '嘿嘿，被发现了~'
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