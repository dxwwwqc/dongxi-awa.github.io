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

// ========== 全局变量 ==========
let waifuTipsData = null;
let userMemory = null;

// 使用不同的JSON文件
let currentModelIndex = 0;
const modelFiles = [
    { file: "index.json", name: "日常风格", message: "换上日常服装啦~ 感觉轻松自在！ 🌸" },
    { file: "index1.json", name: "特殊风格", message: "特别场合的装扮，是不是很漂亮？ ✨" },
    { file: "index2.json", name: "泳装风格", message: "泳装装扮，有些害羞呢~ 🎀" }
];

// ========== 用户记忆系统 ==========

// 初始化用户记忆
function initUserMemory() {
    console.log('初始化用户记忆...');
    
    userMemory = userMemory || {};
    
    const stored = localStorage.getItem('waifuUserMemory');
    
    console.log('stored:', stored);
    
    let isNewUser = false;
    
    if (stored && stored !== 'null' && stored !== 'undefined') {
        try {
            const parsed = JSON.parse(stored);
            console.log('解析的数据:', parsed);
            userMemory = { ...userMemory, ...parsed };
            
            if (!userMemory.visitCount || userMemory.visitCount === 0) {
                console.log('检测到新用户数据，重置用户记忆');
                resetUserMemory();
                isNewUser = true;
            } else {
                const currentTime = new Date().getTime();
                const lastSessionTime = sessionStorage.getItem('lastSessionTime');
                
                if (!lastSessionTime || (currentTime - parseInt(lastSessionTime)) > 30 * 60 * 1000) {
                    console.log('新会话，增加访问次数');
                    userMemory.visitCount++;
                    userMemory.lastVisitDate = new Date().toISOString();
                    sessionStorage.setItem('lastSessionTime', currentTime.toString());
                } else {
                    console.log('同一会话内，不增加访问次数');
                }
            }
            
            showPersonalizedWelcome();
            
        } catch (e) {
            console.error('用户记忆数据损坏，重新初始化', e);
            resetUserMemory();
            isNewUser = true;
        }
    } else {
        console.log('新用户，初始化用户记忆');
        resetUserMemory();
        isNewUser = true;
        sessionStorage.setItem('lastSessionTime', new Date().getTime().toString());
    }
    
    userMemory.currentSessionStart = new Date().getTime();
    saveUserMemory();
    
    console.log('最终 userMemory:', userMemory);
    
    console.log('立即检查成就...');
    checkAllAchievements();
    
    startSessionTimer();
}

// 重置用户记忆（新用户）
function resetUserMemory() {
    userMemory = {
        visitCount: 1,
        firstVisitDate: new Date().toISOString(),
        lastVisitDate: new Date().toISOString(),
        totalStayTime: 0,
        favoriteCostume: 0,
        preferredName: '',
        likedMessages: [],
        costumeChanges: 0,
        messagesReceived: 0,
        clicksCount: 0,
        currentSessionStart: new Date().getTime(),
        achievementsProgress: {},
        
        // 可实现的追踪字段
        triggeredEffects: [],
        successfulGestures: [],
        screenshotsTaken: 0,
        consecutiveVisits: 1
    };
    sessionStorage.setItem('lastSessionTime', new Date().getTime().toString());
}

// 保存用户记忆
function saveUserMemory() {
    localStorage.setItem('waifuUserMemory', JSON.stringify(userMemory));
}

// 个性化欢迎消息
function showPersonalizedWelcome() {
    if (!waifuTipsData || !waifuTipsData.waifu.memory_messages) {
        showMessage("欢迎光临！", 4000);
        return;
    }
    
    const memoryConfig = waifuTipsData.waifu.memory_messages;
    const visitCount = userMemory.visitCount;
    let welcomeMessage = '';
    
    if (visitCount === 1) {
        const messages = memoryConfig.first_visit;
        welcomeMessage = messages[Math.floor(Math.random() * messages.length)];
    } else if (visitCount <= 10) {
        const messages = memoryConfig.return_visits.few;
        const message = messages[Math.floor(Math.random() * messages.length)];
        welcomeMessage = message.replace('{count}', visitCount);
    } else {
        const messages = memoryConfig.return_visits.many;
        const message = messages[Math.floor(Math.random() * messages.length)];
        welcomeMessage = message.replace('{count}', visitCount);
    }
    
    showMessage(welcomeMessage, 6000, true);
}

// 会话时间追踪
function startSessionTimer() {
    setInterval(() => {
        userMemory.totalStayTime += 10;
        saveUserMemory();
        
        checkTimeBasedAchievements();
    }, 10000);
}

// 记录用户偏好
function recordUserPreference(type, value) {
    switch(type) {
        case 'costume':
            userMemory.favoriteCostume = value;
            userMemory.costumeChanges++;
            break;
        case 'message_like':
            if (!userMemory.likedMessages.includes(value)) {
                userMemory.likedMessages.push(value);
            }
            break;
        case 'name':
            userMemory.preferredName = value;
            break;
    }
    saveUserMemory();
}

// 记录服装切换
function recordCostumeChange() {
    userMemory.costumeChanges = (userMemory.costumeChanges || 0) + 1;
    saveUserMemory();
    checkAchievement('costume_lover');
}

// 记录截图次数
function recordScreenshot() {
    userMemory.screenshotsTaken = (userMemory.screenshotsTaken || 0) + 1;
    saveUserMemory();
    checkAchievement('screenshot_expert');
}

// 记录点击次数
function recordClick() {
    userMemory.clicksCount = (userMemory.clicksCount || 0) + 1;
    saveUserMemory();
    checkAchievement('click_master');
}

// 记录消息接收
function recordMessageReceived() {
    userMemory.messagesReceived = (userMemory.messagesReceived || 0) + 1;
    saveUserMemory();
    checkAchievement('message_collector');
}

// 页面关闭前保存数据
window.addEventListener('beforeunload', () => {
    if (userMemory.currentSessionStart) {
        const sessionTime = new Date().getTime() - userMemory.currentSessionStart;
        userMemory.totalStayTime += Math.round(sessionTime / 1000);
        saveUserMemory();
    }
});

// ========== 成就系统 ==========

// 二次元风格的成就系统 - 精简可实现版本
const achievements = {
    first_visit: {
        id: 'first_visit',
        name: '命运的相遇✨',
        description: '第一次访问网站',
        icon: '🎯',
        condition: (memory) => memory.visitCount >= 1,
        unlocked: false,
        firstUnlock: false
    },
    
    frequent_visitor: {
        id: 'frequent_visitor',
        name: '常客大人的光临🎀',
        description: '访问网站10次',
        icon: '🏆',
        condition: (memory) => memory.visitCount >= 10,
        unlocked: false,
        firstUnlock: false
    },
    
    costume_lover: {
        id: 'costume_lover',
        name: '换装达人desu！👗',
        description: '换装20次',
        icon: '👗',
        condition: (memory) => memory.costumeChanges >= 20,
        unlocked: false,
        firstUnlock: false
    },
    
    time_spender: {
        id: 'time_spender',
        name: '长久相伴的约定⏰',
        description: '累计停留1小时',
        icon: '⏰',
        condition: (memory) => memory.totalStayTime >= 3600,
        unlocked: false,
        firstUnlock: false
    },
    
    message_collector: {
        id: 'message_collector',
        name: '话语的收藏家💬',
        description: '收到50条不同的消息',
        icon: '💬',
        condition: (memory) => memory.messagesReceived >= 50,
        unlocked: false,
        firstUnlock: false
    },
    
    night_owl: {
        id: 'night_owl',
        name: '深夜的共犯者🌙',
        description: '在深夜时段访问',
        icon: '🌙',
        condition: (memory) => {
            const hour = new Date().getHours();
            return hour >= 23 || hour <= 5;
        },
        unlocked: false,
        firstUnlock: false
    },
    
    early_bird: {
        id: 'early_bird',
        name: '晨光中的问候🌅',
        description: '在早晨时段（5-9点）访问',
        icon: '🌅',
        condition: (memory) => {
            const hour = new Date().getHours();
            return hour >= 5 && hour <= 9;
        },
        unlocked: false,
        firstUnlock: false
    },
    
    click_master: {
        id: 'click_master',
        name: '戳戳乐大师👆',
        description: '点击看板娘50次',
        icon: '👆',
        condition: (memory) => memory.clicksCount >= 50,
        unlocked: false,
        firstUnlock: false
    },
    
    screenshot_expert: {
        id: 'screenshot_expert',
        name: '瞬间的收藏家📸',
        description: '拍摄10张截图',
        icon: '📸',
        condition: (memory) => memory.screenshotsTaken >= 10,
        unlocked: false,
        firstUnlock: false
    },
    
    heart_gesture: {
        id: 'heart_gesture',
        name: '爱心的传递者💖',
        description: '成功画出爱心手势',
        icon: '💖',
        condition: (memory) => (memory.successfulGestures || []).includes('heart'),
        unlocked: false,
        firstUnlock: false
    },
    
    season_explorer: {
        id: 'season_explorer',
        name: '四季轮回的旅人🎄',
        description: '触发3种不同的季节特效',
        icon: '🎄',
        condition: (memory) => {
            const triggeredEffects = memory.triggeredEffects || [];
            return triggeredEffects.length >= 3;
        },
        unlocked: false,
        firstUnlock: false
    },
    
    all_achievement_master: {
        id: 'all_achievement_master',
        name: '全成就制霸！🏆',
        description: '解锁所有成就',
        icon: '🏆',
        condition: (memory) => {
            const unlockedCount = Object.values(achievements).filter(a => 
                a.id !== 'all_achievement_master' && memory.achievementsProgress[a.id]
            ).length;
            return unlockedCount >= Object.keys(achievements).length - 1;
        },
        unlocked: false,
        firstUnlock: false
    }
};

// 初始化成就系统
function initAchievementSystem() {
    loadAchievementProgress();
    checkInitialAchievements();
}

// 加载成就进度
function loadAchievementProgress() {
    userMemory.achievementsProgress = userMemory.achievementsProgress || {};
    
    Object.keys(achievements).forEach(achievementId => {
        achievements[achievementId].unlocked = 
            userMemory.achievementsProgress[achievementId] || false;
    });
}

// 检查所有成就
function checkAllAchievements() {
    Object.keys(achievements).forEach(achievementId => {
        checkAchievement(achievementId);
    });
}

// 检查初始成就
function checkInitialAchievements() {
    console.log('检查初始成就，visitCount:', userMemory.visitCount);
    
    Object.keys(achievements).forEach(achievementId => {
        const achievement = achievements[achievementId];
        if (achievement.condition(userMemory) && !achievement.unlocked) {
            console.log('应该解锁成就:', achievement.name);
            checkAchievement(achievementId);
        }
    });
}

// 检查成就条件
function checkAchievement(achievementId) {
    const achievement = achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    if (achievement.condition(userMemory)) {
        unlockAchievement(achievementId);
    }
}

// 解锁成就
function unlockAchievement(achievementId) {
    const achievement = achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    achievement.firstUnlock = true;
    userMemory.achievementsProgress[achievementId] = true;
    saveUserMemory();
    
    if (achievement.firstUnlock) {
        showAchievementNotification(achievement);
        setTimeout(() => {
            achievement.firstUnlock = false;
        }, 100);
    }
}

// 显示成就通知
function showAchievementNotification(achievement) {
    if (!waifuTipsData || !waifuTipsData.waifu.achievement_messages) return;
    
    const unlockMessages = waifuTipsData.waifu.achievement_messages.unlock;
    const unlockMessage = unlockMessages[Math.floor(Math.random() * unlockMessages.length)];
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20%;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10002;
        animation: achievementSlideIn 0.5s ease-out;
        max-width: 300px;
        border-left: 4px solid gold;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 5px;">${achievement.icon}</div>
        <div style="font-weight: bold; margin-bottom: 5px;">${unlockMessage}</div>
        <div style="font-size: 14px;">${achievement.name}</div>
        <div style="font-size: 12px; opacity: 0.9;">${achievement.description}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'achievementSlideOut 0.5s ease-in forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// 检查基于时间的成就
function checkTimeBasedAchievements() {
    checkAchievement('time_spender');
    
    const hour = new Date().getHours();
    if (hour >= 23 || hour <= 5) {
        checkAchievement('night_owl');
    }
}

// 显示成就列表
function showAchievementsList() {
    if (!waifuTipsData || !waifuTipsData.waifu.achievement_messages) {
        showMessage("成就系统暂不可用", 4000);
        return;
    }
    
    const achievementConfig = waifuTipsData.waifu.achievement_messages;
    const unlocked = Object.values(achievements).filter(a => a.unlocked);
    const locked = Object.values(achievements).filter(a => !a.unlocked);
    
    console.log('已解锁成就:', unlocked.length);
    console.log('未解锁成就:', locked.length);
    
    let message = '';
    
    if (unlocked.length > 0) {
        message += `<div style="text-align: center; margin-bottom: 4px; font-size: 11px; font-weight: bold;">${achievementConfig.list_header}</div>`;
        message += `<div style="margin-bottom: 3px; font-size: 10px;">已解锁 ${unlocked.length}/${Object.keys(achievements).length}</div>`;
        
        unlocked.forEach(achievement => {
            message += `<div style="display: inline-block; margin: 0 3px 2px 0; font-size: 9px;">${achievement.icon}${achievement.name}</div>`;
        });
    } else {
        message += `<div style="text-align: center; margin-bottom: 4px; font-size: 11px; font-weight: bold;">${achievementConfig.list_header}</div>`;
        message += `<div style="font-size: 10px;">还没有解锁任何成就</div>`;
    }
    
    if (locked.length > 0 && unlocked.length > 0) {
        message += `<div style="margin-top: 3px; font-size: 9px; color: #666;">还有 ${locked.length} 个成就待解锁</div>`;
    }
    
    console.log('成就列表消息:', message);
    showMessage(message, 7000);
}

// ========== 现有功能保持不变 ==========

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
    
    recordCostumeChange();
    
    const switchMessage = getRandomTextureMessage();
    showMessage(switchMessage, 1000);
    
    setTimeout(() => {
        var modelPath = 'https://dxwwwqc.github.io/dongxi-awa.github.io/live2d/model/38/' + model.file + '?t=' + new Date().getTime();
        loadlive2d('live2d', modelPath, 0);
        
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

// 记录特效触发
function recordEffectTrigger(effectType) {
    if (!userMemory.triggeredEffects) {
        userMemory.triggeredEffects = [];
    }
    if (!userMemory.triggeredEffects.includes(effectType)) {
        userMemory.triggeredEffects.push(effectType);
        saveUserMemory();
    }
    checkAchievement('season_explorer');
}

// 记录手势成功
function recordSuccessfulGesture(gestureType) {
    if (!userMemory.successfulGestures) {
        userMemory.successfulGestures = [];
    }
    if (!userMemory.successfulGestures.includes(gestureType)) {
        userMemory.successfulGestures.push(gestureType);
        saveUserMemory();
    }
    checkAchievement('gesture_master');
}

// 显示节日消息和特效
function showSeasonMessage(season, year) {
    const texts = season.text;
    let text = texts[Math.floor(Math.random() * texts.length)];
    text = text.replace(/{year}/g, year);
    
    showMessage(text, 6000, true);
    
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

// 应用节日特效
function applySeasonEffect(effect) {
    recordEffectTrigger(effect);
    
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
    `;
    document.head.appendChild(style);
}

// 添加成就系统CSS
function addAchievementStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes achievementSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes achievementSlideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .achievement-notification {
            font-family: inherit;
        }
        
        .fui-star::before {
            content: "\\e600";
            font-family: 'Flat-UI-Icons' !important;
            font-style: normal;
            font-weight: normal;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
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

// 1. 鼠标手势交互
function initMouseGestures() {
    let mousePath = [];
    let lastPoint = null;
    let isDrawing = false;
    
    document.addEventListener('mousedown', function(e) {
        isDrawing = true;
        mousePath = [];
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDrawing) return;
        
        const point = {x: e.clientX, y: e.clientY, time: Date.now()};
        
        if (lastPoint) {
            const distance = Math.sqrt(
                Math.pow(point.x - lastPoint.x, 2) + 
                Math.pow(point.y - lastPoint.y, 2)
            );
            
            if (distance > 8) {
                mousePath.push(point);
                
                if (mousePath.length > 80) {
                    mousePath.shift();
                }
            }
        } else {
            mousePath.push(point);
        }
        
        lastPoint = point;
    });
    
    document.addEventListener('mouseup', function(e) {
        if (isDrawing && mousePath.length > 15) {
            analyzeMouseGesture(mousePath);
        }
        isDrawing = false;
        mousePath = [];
        lastPoint = null;
    });
}

function analyzeMouseGesture(path) {
    if (path.length < 20) return;
    
    if (!waifuTipsData || !waifuTipsData.waifu.mouse_gestures) return;
    
    const gestures = waifuTipsData.waifu.mouse_gestures;
    
    if (isHeartGesture(path)) {
        const text = gestures.heart[Math.floor(Math.random() * gestures.heart.length)];
        showMessage(text, 3000);
        createHeartsEffect();
        recordSuccessfulGesture('heart');
        return;
    }
}

function isHeartGesture(path) {
    if (path.length < 40) return false;
    
    let totalLength = 0;
    for (let i = 1; i < path.length; i++) {
        totalLength += Math.sqrt(
            Math.pow(path[i].x - path[i-1].x, 2) + 
            Math.pow(path[i].y - path[i-1].y, 2)
        );
    }
    
    if (totalLength < 300) return false;
    
    const xs = path.map(p => p.x);
    const ys = path.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    if (Math.abs(width - height) > Math.min(width, height) * 0.5) return false;
    
    const midIndex = Math.floor(path.length / 2);
    const leftPeak = Math.min(...path.slice(0, midIndex).map(p => p.y));
    const rightPeak = Math.min(...path.slice(midIndex).map(p => p.y));
    
    const bottomPoints = path.filter(p => p.y > minY + height * 0.7);
    if (bottomPoints.length < 5) return false;
    
    const bottomCenterX = bottomPoints.reduce((sum, p) => sum + p.x, 0) / bottomPoints.length;
    const expectedCenterX = minX + width / 2;
    
    return Math.abs(bottomCenterX - expectedCenterX) < width * 0.3;
}

// 2. 智能感知交互
function initSmartInteraction() {
    let userActive = true;
    let inactiveTimer;
    
    function resetInactiveTimer() {
        userActive = true;
        clearTimeout(inactiveTimer);
        inactiveTimer = setTimeout(() => {
            userActive = false;
            showInactiveMessage();
        }, 300000);
    }
    
    function showInactiveMessage() {
        if (!waifuTipsData || !waifuTipsData.waifu.inactive_messages) return;
        
        const messages = waifuTipsData.waifu.inactive_messages;
        const text = messages[Math.floor(Math.random() * messages.length)];
        showMessage(text, 4000);
    }
    
    ['mousemove', 'click', 'keydown', 'scroll'].forEach(event => {
        document.addEventListener(event, resetInactiveTimer, { passive: true });
    });
    
    resetInactiveTimer();
}

// 3. 滚动感知交互
function initScrollInteraction() {
    let scrollTimer = null;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if ((window.innerHeight + scrollTop) >= document.documentElement.scrollHeight - 100) {
                showScrollBottomMessage();
            }
        }, 100);
    }, { passive: true });
}

function showScrollBottomMessage() {
    if (!waifuTipsData || !waifuTipsData.waifu.scroll_bottom_messages) return;
    
    const messages = waifuTipsData.waifu.scroll_bottom_messages;
    const text = messages[Math.floor(Math.random() * messages.length)];
    showMessage(text, 4000);
}

// initModel 函数
function initModel(waifuPath, type) {
    console.log('初始化 Live2D 模型...');
    
    addSeasonStyles();
    addAchievementStyles();
    
    initUserMemory();
    
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
    
    if (typeof(waifuPath) == "object") {
        waifuTipsData = waifuPath;
        loadTipsMessage(waifuPath);
        
        initConsoleDetection();
        initCopyDetection();
        initMouseoverTips();
        
        initMouseGestures();
        initSmartInteraction();
        initScrollInteraction();
        
        initAchievementSystem();
        
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
                
                initMouseGestures();
                initSmartInteraction();
                initScrollInteraction();
                
                initAchievementSystem();
                
                setTimeout(() => {
                    showWelcomeMessage();
                    setTimeout(showSeasonGreeting, 7000);
                    setTimeout(showTimeGreeting, 14000);
                    setTimeout(showReferrerMessage, 21000);
                }, 1000);
            }
        });
    }
    
    if (!live2d_settings.showToolMenu) $('.waifu-tool').hide();
    if (!live2d_settings.canCloseLive2d) $('.waifu-tool .fui-cross').hide();
    if (!live2d_settings.canSwitchModel) $('.waifu-tool .fui-eye').hide();
    if (!live2d_settings.canSwitchTextures) $('.waifu-tool .fui-user').hide();
    if (!live2d_settings.canSwitchHitokoto) $('.waifu-tool .fui-chat').hide();
    if (!live2d_settings.canTakeScreenshot) $('.waifu-tool .fui-photo').hide();
    if (!live2d_settings.canTurnToHomePage) $('.waifu-tool .fui-home').hide();
    if (!live2d_settings.canTurnToAboutPage) $('.waifu-tool .fui-info-circle').hide();

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
        
        if (!text.includes('成就解锁') && !text.includes('成就达成')) {
            recordMessageReceived();
        }
        
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
        recordScreenshot();
        if (window.Live2D) {
            window.Live2D.captureName = 'live2d.png';
            window.Live2D.captureFrame = true;
        }
    });
    
    $('.waifu-tool .fui-info-circle').click(function (){
        window.open('https://www.fghrsh.net/post/123.html');
    });
    
    $('.waifu-tool').append(`
        <span class="fui-star achievement-btn" title="成就系统"></span>
    `);
    
    $('.waifu-tool .fui-star').click(function (){
        showAchievementsList();
    });
    
    $('.waifu-tool .fui-cross').click(function (){
        const hiddenMsg = result.waifu.hidden_message[0];
        showMessage(hiddenMsg, 1300);
        setTimeout(() => {
            $('.waifu').hide();
        }, 1300);
    });
    
    if (userMemory) {
        userMemory.messagesReceived = (userMemory.messagesReceived || 0) + 1;
        saveUserMemory();
    }
    
    $(document).on("click", "#live2d", function (){
        recordClick();
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