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

// 对话系统变量
let conversationState = 'idle';
let currentTopic = '';
let userMood = 'neutral';

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

// 日期范围检测
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

// 显示节日消息和特效
function showSeasonMessage(season, year) {
    const texts = season.text;
    let text = texts[Math.floor(Math.random() * texts.length)];
    text = text.replace(/{year}/g, year);
    
    // 显示消息
    showMessage(text, 6000, true);
    
    // 应用特效
    if (season.effect) {
        applySeasonEffect(season.effect);
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
            // 处理日期范围
            const [start, end] = season.date.split('-');
            if (isDateInRange(month, day, start, end)) {
                showSeasonMessage(season, year);
                return;
            }
        } else if (season.date === currentDate) {
            // 处理具体日期
            showSeasonMessage(season, year);
            return;
        }
    }
}

// 应用节日特效
function applySeasonEffect(effect) {
    switch(effect) {
        case 'confetti':
            createConfettiEffect();
            break;
        case 'fireworks':
            createFireworksEffect();
            break;
        case 'hearts':
            createHeartsEffect();
            break;
        case 'snow':
            createSnowEffect();
            break;
        case 'bubbles':
            createBubblesEffect();
            break;
        case 'ghost':
            createGhostEffect();
            break;
        case 'countdown':
            createCountdownEffect();
            break;
    }
}

// 随机颜色生成
function getRandomColor() {
    const colors = ['#ff6b6b', '#fdcb6e', '#74b9ff', '#55efc4', '#a29bfe', '#ff7979', '#badc58', '#7ed6df'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 创建彩带特效
function createConfettiEffect() {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${getRandomColor()};
                top: -10px;
                left: ${Math.random() * 100}vw;
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
                z-index: 10000;
                pointer-events: none;
                border-radius: 1px;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 100);
    }
}

// 创建爱心特效
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

// 创建气泡特效
function createBubblesEffect() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.innerHTML = '🎈';
            bubble.style.cssText = `
                position: fixed;
                font-size: 20px;
                bottom: -50px;
                left: ${Math.random() * 100}vw;
                animation: bubbleRise ${Math.random() * 5 + 3}s ease-in forwards;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(bubble);
            
            setTimeout(() => bubble.remove(), 8000);
        }, i * 250);
    }
}

// 创建幽灵特效（万圣节）
function createGhostEffect() {
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const ghost = document.createElement('div');
            ghost.innerHTML = '👻';
            ghost.style.cssText = `
                position: fixed;
                font-size: 30px;
                top: ${Math.random() * 100}vh;
                left: -50px;
                animation: ghostFloat ${Math.random() * 8 + 5}s ease-in-out forwards;
                z-index: 10000;
                pointer-events: none;
                opacity: 0.7;
            `;
            document.body.appendChild(ghost);
            
            setTimeout(() => ghost.remove(), 13000);
        }, i * 600);
    }
}

// 创建倒计时特效（跨年）
function createCountdownEffect() {
    const countdowns = ['3', '2', '1', '🎉'];
    countdowns.forEach((text, index) => {
        setTimeout(() => {
            const countdown = document.createElement('div');
            countdown.innerHTML = text;
            countdown.style.cssText = `
                position: fixed;
                font-size: 60px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: countdownPop 0.5s ease-out forwards;
                z-index: 10001;
                pointer-events: none;
                font-weight: bold;
                color: #ff6b6b;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(countdown);
            
            setTimeout(() => {
                countdown.style.animation = 'countdownFade 0.5s ease-out forwards';
                setTimeout(() => countdown.remove(), 500);
            }, 800);
        }, index * 1000);
    });
}

// 创建烟花特效
function createFireworksEffect() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.innerHTML = '✨';
            firework.style.cssText = `
                position: fixed;
                font-size: 40px;
                top: ${20 + Math.random() * 60}vh;
                left: ${20 + Math.random() * 60}vw;
                animation: fireworkExplode 1.5s ease-out forwards;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
            `;
            document.body.appendChild(firework);
            
            setTimeout(() => firework.remove(), 1500);
        }, i * 300);
    }
}

// 创建雪花特效
function createSnowEffect() {
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const snow = document.createElement('div');
            snow.innerHTML = '❄';
            snow.style.cssText = `
                position: fixed;
                font-size: 18px;
                top: -30px;
                left: ${Math.random() * 100}vw;
                animation: snowFall ${Math.random() * 8 + 5}s linear forwards;
                z-index: 10000;
                pointer-events: none;
                opacity: 0.8;
            `;
            document.body.appendChild(snow);
            
            setTimeout(() => snow.remove(), 13000);
        }, i * 200);
    }
}

// 添加 CSS 动画样式
function addSeasonStyles() {
    const style = document.createElement('style');
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
        
        /* 对话选项样式 */
        .conversation-options {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .conversation-btn {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 15px;
            padding: 5px 10px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.3s;
            color: #333;
        }
        
        .conversation-btn:hover {
            background: #f0f0f0;
            transform: scale(1.05);
        }
        
        .quiz-options {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .quiz-option {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 15px;
            padding: 5px 10px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.3s;
            color: #333;
        }
        
        .quiz-option:hover {
            background: #f0f0f0;
            transform: scale(1.05);
        }
        
        .quiz-option.correct {
            background: #d4edda;
            border-color: #c3e6cb;
        }
        
        .quiz-option.incorrect {
            background: #f8d7da;
            border-color: #f5c6cb;
        }
        
        .waifu-conversation {
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
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

// ========== 新增的交互功能 ==========

// 开始对话
function startConversation() {
    if (!waifuTipsData || !waifuTipsData.waifu.conversation_topics) return;
    
    const topics = Object.keys(waifuTipsData.waifu.conversation_topics);
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    currentTopic = randomTopic;
    
    const topicData = waifuTipsData.waifu.conversation_topics[randomTopic];
    const questions = topicData.questions;
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    showMessage(question, 6000, true);
    conversationState = 'waiting_response';
    
    // 显示选项按钮
    setTimeout(() => {
        showConversationOptions(randomTopic);
    }, 1000);
}

// 显示对话选项
function showConversationOptions(topic) {
    const topicData = waifuTipsData.waifu.conversation_topics[topic];
    const responses = Object.keys(topicData.responses);
    
    let optionsHTML = '<div class="conversation-options">';
    optionsHTML += '<div style="font-size:10px; margin-bottom:5px; color:#666;">选择回答：</div>';
    
    responses.forEach(response => {
        optionsHTML += `<button class="conversation-btn" onclick="handleResponse('${response}')">${response}</button>`;
    });
    
    optionsHTML += '<button class="conversation-btn" onclick="endConversation()" style="margin-top:5px; background:#ff6b6b; color:white;">结束对话</button></div>';
    
    // 临时显示选项
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = optionsHTML;
    tempDiv.className = 'waifu-conversation';
    document.querySelector('.waifu-tips').appendChild(tempDiv);
    
    setTimeout(() => {
        if (tempDiv.parentNode && conversationState === 'waiting_response') {
            tempDiv.parentNode.removeChild(tempDiv);
            showMessage("没有选择吗？那下次再聊吧~", 3000);
            conversationState = 'idle';
        }
    }, 10000);
}

// 处理用户响应
function handleResponse(responseType) {
    if (conversationState === 'waiting_response' && currentTopic) {
        const topicData = waifuTipsData.waifu.conversation_topics[currentTopic];
        const responses = topicData.responses[responseType];
        
        if (responses) {
            const response = responses[Math.floor(Math.random() * responses.length)];
            showMessage(response, 4000, true);
            
            // 清理选项
            const options = document.querySelector('.waifu-conversation');
            if (options) options.remove();
            
            conversationState = 'idle';
            
            // 30% 几率继续对话
            setTimeout(() => {
                if (Math.random() < 0.3) {
                    setTimeout(startConversation, 2000);
                }
            }, 4000);
        }
    }
}

// 结束对话
function endConversation() {
    const options = document.querySelector('.waifu-conversation');
    if (options) options.remove();
    
    showMessage("聊天很开心呢！下次再聊吧~", 3000);
    conversationState = 'idle';
}

// 开始问答游戏
function startQuiz() {
    if (!waifuTipsData || !waifuTipsData.waifu.quiz_questions) return;
    
    const questions = waifuTipsData.waifu.quiz_questions;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    let quizHTML = `<div style="margin-bottom:5px;">${randomQuestion.question}</div>`;
    quizHTML += '<div class="quiz-options">';
    
    randomQuestion.options.forEach((option, index) => {
        quizHTML += `<button class="quiz-option" onclick="checkAnswer(${index}, ${randomQuestion.answer})">${option}</button>`;
    });
    
    quizHTML += '</div>';
    quizHTML += `<div style="font-size:10px; color:#666; margin-top:5px;">${randomQuestion.hint}</div>`;
    
    showMessage(quizHTML, 15000, false);
}

// 检查答案
function checkAnswer(selectedIndex, correctIndex) {
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach((option, index) => {
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            option.classList.add('incorrect');
        }
        option.disabled = true;
    });
    
    if (selectedIndex === correctIndex) {
        setTimeout(() => {
            showMessage("回答正确！你真了解我呢~ 🎉", 3000, true);
        }, 1000);
    } else {
        setTimeout(() => {
            showMessage("答错了呢~ 不过没关系！", 3000, true);
        }, 1000);
    }
}

// 讲述故事
function tellStory() {
    if (!waifuTipsData || !waifuTipsData.waifu.story_messages) return;
    
    const stories = waifuTipsData.waifu.story_messages;
    const story = stories[Math.floor(Math.random() * stories.length)];
    
    showMessage(story, 6000, true);
}

// 初始化双击事件
function initDoubleClick() {
    let lastClick = 0;
    $('#live2d').on('click', function() {
        const now = new Date().getTime();
        if (now - lastClick < 300) { // 300ms 内算作双击
            // 从多种交互中随机选择
            const interactions = [startConversation, startQuiz, tellStory];
            const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
            randomInteraction();
        }
        lastClick = now;
    });
}

// 根据心情调整回复
function adjustMood(interactionType) {
    const moodChanges = {
        'positive': 0.1,
        'negative': -0.1,
        'neutral': 0
    };
    
    // 简单的情绪系统（可以扩展）
    if (userMood === 'neutral') {
        userMood = Math.random() < 0.5 ? 'happy' : 'shy';
    }
}

// initModel 函数
function initModel(waifuPath, type) {
    console.log('初始化 Live2D 模型...');
    
    // 添加节日特效样式
    addSeasonStyles();
    
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
        initDoubleClick();
        
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
                initDoubleClick();
                
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
        // 随机选择互动方式
        const interactions = [showHitokoto, startConversation, startQuiz, tellStory];
        const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
        randomInteraction();
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
    
    // 双击事件
    $(document).on("dblclick", "#live2d", function (){
        const dblclickItems = result.dblclick || [];
        const dblclickItem = dblclickItems.find(item => item.selector === '.waifu #live2d');
        if (dblclickItem && dblclickItem.text) {
            const text = dblclickItem.text[Math.floor(Math.random() * dblclickItem.text.length)];
            showMessage(text, 4000, true);
            
            // 双击后随机触发一个交互
            setTimeout(() => {
                const interactions = [startConversation, startQuiz, tellStory];
                const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
                randomInteraction();
            }, 1000);
        }
    });
}