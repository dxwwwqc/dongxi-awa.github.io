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

// 调试信息
console.log('Live2D 看板娘初始化开始...');
console.log('当前页面URL:', window.location.href);

// 后端接口 - 使用相对于根目录的路径
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
live2d_settings['homePageUrl']          = '/dongxi-awa.github.io/';  // 完整主页路径
live2d_settings['aboutPageUrl']         = 'https://www.fghrsh.net/post/123.html';   
live2d_settings['screenshotCaptureName']= 'live2d.png'; 

/****************************************************************************************************/

// 全局变量存储提示信息
let waifuTipsData = {};

// 材质配置 - 支持3套服装系列
const modelTexturesConfig = {
    "38": {
        // 三个服装系列
        textureSets: [
            [0, 1, 2, 3],  // 第一套服装系列 (00-03)
            [4, 5, 6],     // 第二套服装系列 (04-06)
            [7, 8, 9]      // 第三套服装系列 (07-09)
        ],
        textureNames: {
            0: "白色默认装",
            1: "蓝色清新装", 
            2: "粉色可爱装",
            3: "黑色神秘装",
            4: "校园制服A",
            5: "校园制服B", 
            6: "校园制服C",
            7: "节日礼服A",
            8: "节日礼服B",
            9: "节日礼服C"
        },
        setNames: {
            0: "日常服装系列",
            1: "校园制服系列", 
            2: "节日礼服系列"
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

// 材质切换函数 - 按系列切换
function switchTextures() {
    const modelId = live2d_settings.modelId;
    let currentTexturesId = live2d_settings.modelTexturesId || 0;
    
    if (modelTexturesConfig[modelId]) {
        const textureSets = modelTexturesConfig[modelId].textureSets;
        const textureNames = modelTexturesConfig[modelId].textureNames;
        const setNames = modelTexturesConfig[modelId].setNames;
        
        // 找到当前材质ID属于哪个系列
        let currentSetIndex = -1;
        let currentTextureIndexInSet = -1;
        
        for (let i = 0; i < textureSets.length; i++) {
            const indexInSet = textureSets[i].indexOf(currentTexturesId);
            if (indexInSet !== -1) {
                currentSetIndex = i;
                currentTextureIndexInSet = indexInSet;
                break;
            }
        }
        
        if (currentSetIndex === -1) {
            // 如果没找到，默认使用第一个系列的第一个材质
            currentSetIndex = 0;
            currentTextureIndexInSet = 0;
        }
        
        // 切换到下一个系列
        const nextSetIndex = (currentSetIndex + 1) % textureSets.length;
        const nextTextureSet = textureSets[nextSetIndex];
        
        // 在新系列中随机选择一个材质
        const randomIndex = Math.floor(Math.random() * nextTextureSet.length);
        const newTexturesId = nextTextureSet[randomIndex];
        
        // 加载新材质
        loadModel(modelId, newTexturesId);
        
        // 显示系列切换消息（从 waifu-tips.json 获取）
        const textureName = textureNames[newTexturesId];
        const setName = setNames[nextSetIndex];
        
        // 从提示数据中获取换装消息
        let changeMessage = `换上${textureName}啦~ (${setName})`;
        if (waifuTipsData && waifuTipsData.textures && waifuTipsData.textures[newTexturesId]) {
            const messages = waifuTipsData.textures[newTexturesId];
            changeMessage = Array.isArray(messages) ? messages[Math.floor(Math.random() * messages.length)] : messages;
        }
        
        showMessage(changeMessage, 3000, true);
        console.log(`切换到系列: ${setName}, 材质: ${textureName} (ID: ${newTexturesId})`);
        
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
                waifuTipsData = result; // 保存提示数据
                loadTipsMessage(result); 
            },
            error: function(xhr, status, error) {
                console.error('加载提示文件失败:', error);
                showMessage('提示文件加载失败，但模型仍可正常显示~', 3000);
                // 即使提示文件加载失败，也继续初始化模型
                loadModel(live2d_settings.modelId, live2d_settings.modelTexturesId);
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
    // 安全性检查：确保材质ID在有效范围内 (0-9)
    const safeTexturesId = Math.max(0, Math.min(modelTexturesId, 9));
    
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

    // 使用完整路径
    var modelPath = '/dongxi-awa.github.io/live2d/model/' + modelId + '/index.json';
    console.log('安全加载模型:', modelPath, '材质ID:', safeTexturesId);
    
    try {
        loadlive2d('live2d', modelPath, function() {
            if (live2d_settings.showF12Status) {
                console.log('[Status]','live2d','模型',modelId+'-'+safeTexturesId,'加载完成');
            }
            
            // 显示当前材质信息
            if (modelTexturesConfig[modelId]) {
                const textureName = modelTexturesConfig[modelId].textureNames[safeTexturesId];
                showMessage(`当前服装: ${textureName}`, 2000);
            }
        });
    } catch (error) {
        console.error('加载模型时出错:', error);
        showMessage('模型加载出现问题，请刷新页面重试~', 5000);
    }
}

function showHitokoto() {
    // 从 waifu-tips.json 获取一言
    let hitokotoText = '欢迎来到我的博客！';
    if (waifuTipsData && waifuTipsData.hitokoto) {
        const hitokotos = waifuTipsData.hitokoto;
        hitokotoText = Array.isArray(hitokotos) ? hitokotos[Math.floor(Math.random() * hitokotos.length)] : hitokotos;
    }
    showMessage(hitokotoText, 5000, true);
}

function loadTipsMessage(result) {
    // 完整的工具栏功能绑定
    $('.waifu-tool .fui-home').click(function (){
        window.location.href = '/dongxi-awa.github.io/';  // 完整主页路径
    });
    
    $('.waifu-tool .fui-chat').click(function (){
        showHitokoto();
    });
    
    $('.waifu-tool .fui-eye').click(function (){
        showMessage('🚫 当前只有一个模型，无法切换哦~', 3000);
    });
    
    $('.waifu-tool .fui-user').click(function (){
        // 材质切换功能
        if (modelTexturesConfig[live2d_settings.modelId] && modelTexturesConfig[live2d_settings.modelId].textureSets.length > 1) {
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
    
    // 交互功能 - 从 waifu-tips.json 获取消息
    $(document).on("click", "#live2d", function (){
        let clickText = '啊！别碰我！';
        if (waifuTipsData && waifuTipsData.click) {
            const clicks = waifuTipsData.click;
            clickText = Array.isArray(clicks) ? clicks[Math.floor(Math.random() * clicks.length)] : clicks;
        }
        showMessage(clickText, 3000, true);
    });

    $(document).on("mouseover", "#live2d", function (){
        let hoverText = '干嘛呢你，快把手拿开';
        if (waifuTipsData && waifuTipsData.mouseover) {
            const hovers = waifuTipsData.mouseover;
            hoverText = Array.isArray(hovers) ? hovers[Math.floor(Math.random() * hovers.length)] : hovers;
        }
        showMessage(hoverText, 2000);
    });

    // 加载模型
    loadModel(live2d_settings.modelId, live2d_settings.modelTexturesId);
}