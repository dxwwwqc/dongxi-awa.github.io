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
live2d_settings['modelAPI']             = '/dongxi-awa.github.io/live2d/model/';   // 添加 /dongxi-awa.github.io
live2d_settings['tipsMessage']          = '/dongxi-awa.github.io/live2d/waifu-tips.json';  // 添加 /dongxi-awa.github.io       = '/live2d/waifu-tips.json';  // 完整路径
live2d_settings['hitokotoAPI']          = 'local';            // 使用本地一言

// 默认模型 - 使用你的模型
live2d_settings['modelId']              = 38;            // 你的模型 ID
live2d_settings['modelTexturesId']      = 0;             // 默认材质 ID

// 工具栏设置
live2d_settings['showToolMenu']         = true;         
live2d_settings['canCloseLive2d']       = true;         
live2d_settings['canSwitchModel']       = false;         // 禁用模型切换
live2d_settings['canSwitchTextures']    = false;         // 禁用材质切换
live2d_settings['canSwitchHitokoto']    = true;         
live2d_settings['canTakeScreenshot']    = true;         
live2d_settings['canTurnToHomePage']    = true;         
live2d_settings['canTurnToAboutPage']   = true;         

// 模型切换模式
live2d_settings['modelStorage']         = false;         // 禁用模型存储
live2d_settings['modelRandMode']        = 'switch';     
live2d_settings['modelTexturesRandMode']= 'rand';       

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
    if (live2d_settings.modelStorage) {
        localStorage.setItem('modelId', modelId);
        localStorage.setItem('modelTexturesId', modelTexturesId);
    } else {
        sessionStorage.setItem('modelId', modelId);
        sessionStorage.setItem('modelTexturesId', modelTexturesId);
    }

  var modelPath = '/dongxi-awa.github.io/live2d/model/' + modelId + '/index.json';
    console.log('加载模型:', modelPath);
    loadlive2d('live2d', modelPath, (live2d_settings.showF12Status ? console.log('[Status]','live2d','模型',modelId+'-'+modelTexturesId,'加载完成'):null));
}
// ... loadTipsMessage 函数保持不变

function showHitokoto() {
    // 使用本地句子替代 API 调用
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

// 在 loadTipsMessage 函数末尾，修改工具栏绑定：
function loadTipsMessage(result) {
    // ... 前面的代码保持不变
    
    // 修改工具栏绑定
    $('.waifu-tool .fui-chat').click(function (){showHitokoto()});
    // 注释掉需要 API 的功能
    // $('.waifu-tool .fui-eye').click(function (){loadOtherModel()});
    // $('.waifu-tool .fui-user').click(function (){loadRandTextures()});
}