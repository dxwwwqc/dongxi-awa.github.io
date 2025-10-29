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
let currentLive2DModel = null;

// 材质配置 - 按完整装扮切换（每个装扮对应一个材质ID）
const modelTexturesConfig = {
    "38": {
        // 每个材质ID代表一个完整的装扮
        textures: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],  // 所有可用的材质ID
        textureNames: {
            0: "日常装扮-白色款",    // 使用 00.png 的完整装扮
            1: "日常装扮-蓝色款",    // 使用 01.png 的完整装扮  
            2: "日常装扮-粉色款",    // 使用 02.png 的完整装扮
            3: "日常装扮-黑色款",    // 使用 03.png 的完整装扮
            4: "校园制服-款式A",     // 使用 04.png 的完整装扮
            5: "校园制服-款式B",     // 使用 05.png 的完整装扮
            6: "校园制服-款式C",     // 使用 06.png 的完整装扮
            7: "节日礼服-红色款",    // 使用 07.png 的完整装扮
            8: "节日礼服-蓝色款",    // 使用 08.png 的完整装扮
            9: "节日礼服-紫色款"     // 使用 09.png 的完整装扮
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

// 材质切换函数 - 直接修改模型纹理
function switchTextures() {
    const modelId = live2d_settings.modelId;
    let currentTexturesId = live2d_settings.modelTexturesId || 0;
    
    console.log('开始切换装扮，当前材质ID:', currentTexturesId);
    
    if (modelTexturesConfig[modelId]) {
        const textures = modelTexturesConfig[modelId].textures;
        const textureNames = modelTexturesConfig[modelId].textureNames;
        
        // 找到当前材质ID在列表中的位置
        const currentIndex = textures.indexOf(currentTexturesId);
        
        // 切换到下一个材质（循环）
        let nextIndex = (currentIndex + 1) % textures.length;
        const newTexturesId = textures[nextIndex];
        
        console.log('切换到新材质ID:', newTexturesId, '装扮名称:', textureNames[newTexturesId]);
        
        // 直接设置材质
        setTexture(newTexturesId);
        
        // 显示切换消息
        const textureName = textureNames[newTexturesId];
        
        // 从提示数据中获取换装消息
        let changeMessage = `换上${textureName}啦~`;
        if (waifuTipsData && waifuTipsData.textures && waifuTipsData.textures[newTexturesId]) {
            const messages = waifuTipsData.textures[newTexturesId];
            changeMessage = Array.isArray(messages) ? messages[Math.floor(Math.random() * messages.length)] : messages;
        }
        
        showMessage(changeMessage, 3000, true);
        console.log(`切换到装扮: ${textureName} (ID: ${newTexturesId})`);
        
    } else {
        showMessage('这个模型没有其他装扮呢~', 3000);
    }
}

// 直接设置材质的方法
function setTexture(textureId) {
    console.log('设置材质到 ID:', textureId);
    
    // 更新设置
    live2d_settings.modelTexturesId = textureId;
    
    if (live2d_settings.modelStorage) {
        localStorage.setItem('modelTexturesId', textureId);
    } else {
        sessionStorage.setItem('modelTexturesId', textureId);
    }
    
    // 如果模型已经加载，直接设置纹理
    if (currentLive2DModel && currentLive2DModel.setTexture) {
        try {
            console.log('使用 setTexture 方法直接设置材质');
            currentLive2DModel.setTexture(textureId);
            return true;
        } catch (e) {
            console.log('setTexture 方法失败:', e);
        }
    }
    
    // 如果无法直接设置纹理，重新加载模型
    console.log('重新加载模型以应用新材质');
    reloadModelWithTexture(textureId);
    return false;
}

// 重新加载模型并应用指定材质
function reloadModelWithTexture(textureId) {
    console.log('重新加载模型，应用材质ID:', textureId);
    
    // 更新设置
    live2d_settings.modelTexturesId = textureId;
    
    // 使用完整路径
    var modelPath = '/dongxi-awa.github.io/live2d/model/' + live2d_settings.modelId + '/index.json';
    
    // 添加时间戳避免缓存
    const timestamp = new Date().getTime();
    const modelPathWithCache = modelPath + '?t=' + timestamp;
    
    console.log('使用防缓存路径:', modelPathWithCache);
    
    // 清除之前的模型
    const live2dElement = document.getElementById('live2d');
    if (live2dElement) {
        while (live2dElement.firstChild) {
            live2dElement.removeChild(live2dElement.firstChild);
        }
    }
    
    // 重新加载模型
    try {
        loadlive2d('live2d', modelPathWithCache, function() {
            console.log('模型重新加载完成，材质ID:', textureId);
            // 更新当前模型引用
            updateCurrentModelReference();
        });
    } catch (error) {
        console.error('重新加载模型时出错:', error);
    }
}

// 更新当前模型引用
function updateCurrentModelReference() {
    // 尝试获取当前的 Live2D 模型实例
    setTimeout(function() {
        if (window.Live2DManager && window.Live2DManager.getInstance()) {
            try {
                const manager = window.Live2DManager.getInstance();
                currentLive2DModel = manager.getModel(0);
                console.log('更新模型引用:', currentLive2DModel ? '成功' : '失败');
            } catch (e) {
                console.log('获取模型实例失败:', e);
            }
        }
    }, 1000);
}

// 验证材质文件是否存在
function validateTextureFiles() {
    console.log('验证材质文件是否存在...');
    const textureFiles = ['00.png', '01.png', '02.png', '03.png', '04.png', '05.png', '06.png', '07.png', '08.png', '09.png'];
    
    textureFiles.forEach((file, index) => {
        const texturePath = `/dongxi-awa.github.io/live2d/model/38/textures.1024/${file}`;
        $.ajax({
            url: texturePath,
            type: 'HEAD',
            success: function() {
                console.log(`✅ 材质文件 ${file} 存在 (ID: ${index})`);
            },
            error: function() {
                console.warn(`❌ 材质文件 ${file} 不存在 (ID: ${index})`);
            }
        });
    });
}

// 初始化函数
function initModel(waifuPath, type) {
    console.log('初始化 Live2D 模型...');
    
    // 首先验证模型文件是否存在
    const modelPath = '/dongxi-awa.github.io/live2d/model/38/index.json';
    console.log('验证模型文件:', modelPath);
    
    $.ajax({
        url: modelPath,
        type: 'HEAD',
        success: function() {
            console.log('✅ 模型文件存在，继续初始化...');
            continueInitialization(waifuPath);
        },
        error: function() {
            console.error('❌ 模型文件不存在:', modelPath);
            showMessage('模型文件不存在，请检查文件路径', 5000);
            // 即使模型文件不存在，也继续初始化其他功能
            continueInitialization(waifuPath);
        }
    });
}

function continueInitialization(waifuPath) {
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
    
    // 强制显示工具栏和所有按钮
    $('.waifu-tool').show();
    $('.waifu-tool .fui-home').show();
    $('.waifu-tool .fui-chat').show();
    $('.waifu-tool .fui-eye').show();
    $('.waifu-tool .fui-user').show();
    $('.waifu-tool .fui-photo').show();
    $('.waifu-tool .fui-info-circle').show();
    $('.waifu-tool .fui-cross').show();
    
    console.log('工具栏状态:', $('.waifu-tool').is(':visible') ? '可见' : '隐藏');
    
    // 验证材质文件
    validateTextureFiles();
    
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
                loadInitialModel();
            }
        });
    }
}

// 初始加载模型
function loadInitialModel() {
    const modelId = live2d_settings.modelId;
    const modelTexturesId = live2d_settings.modelTexturesId;
    
    console.log('初始加载模型，ID:', modelId, '材质ID:', modelTexturesId);
    
    // 使用完整路径
    var modelPath = '/dongxi-awa.github.io/live2d/model/' + modelId + '/index.json';
    
    // 添加时间戳避免缓存
    const timestamp = new Date().getTime();
    const modelPathWithCache = modelPath + '?t=' + timestamp;
    
    console.log('初始模型路径:', modelPathWithCache);
    
    try {
        loadlive2d('live2d', modelPathWithCache, function() {
            console.log('初始模型加载完成');
            // 更新模型引用
            updateCurrentModelReference();
            
            // 显示欢迎消息
            setTimeout(function() {
                if (modelTexturesConfig[modelId]) {
                    const textureName = modelTexturesConfig[modelId].textureNames[modelTexturesId];
                    showMessage(`当前装扮: ${textureName}`, 2000);
                }
            }, 1000);
        });
    } catch (error) {
        console.error('初始模型加载失败:', error);
        showMessage('模型加载失败，请刷新页面重试~', 5000);
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
        console.log('点击换装按钮，当前模型ID:', live2d_settings.modelId);
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

    // 加载初始模型
    loadInitialModel();
}