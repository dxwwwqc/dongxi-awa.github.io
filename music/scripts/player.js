// 背景图片加载函数（唯一声明，无重复）
function changeImage(info) {
    if (!info) return;
    const defaultImg = 'images/default-bg.jpg';
    const imgPath = info.bgImage || defaultImg;
    const fullImgUrl = imgPath.startsWith('http') 
        ? imgPath 
        : `${MUSIC_BASE_URL}${imgPath}`;

    const img = new Image();
    img.src = fullImgUrl;
    img.onload = () => {
        document.getElementById('background').style.backgroundImage = `url('${fullImgUrl}')`;
    };
    img.onerror = () => {
        console.warn('背景图加载失败，使用默认图:', fullImgUrl);
        document.getElementById('background').style.backgroundImage = `url('${MUSIC_BASE_URL}${defaultImg}')`;
    };
}

// 缓存DOM元素
const elms = [
    'track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn',
    'settingBtn', 'playlistBtn', 'volumeBtn', 'progress', 'waveform', 'canvas',
    'loading', 'playlist', 'volume', 'barEmpty', 'barFull', 'sliderBtn',
    'animatedWaveform', 'chorusMode', 'randomPlay', 'setting', 'closePlaylist', 'loadingText'
];
elms.forEach(elm => {
    window[elm] = document.getElementById(elm);
});

// 全局变量（依赖HTML中声明的googleAPI和MUSIC_BASE_URL）
let jpGameTitles = [];
let jpSongTitles = [];
let songList = [];
let player = null;
let vudio = null;
let wavesurfer = null;
let chorusFlag = false;


/**
 * 播放器核心类
 */
class Player {
    constructor(playlist) {
        this.playlist = playlist;
        this.index = this.initIndex();
        this.initPlaylistUI();
        this.loadYouTubeAPI();
        this.adjustForMobile();
    }

    // 初始化播放索引
    initIndex() {
        const url = new URL(window.location.href);
        const parser = new URLSearchParams(url.search);
        const parserIndex = parseInt(parser.get('index'));
        if (!isNaN(parserIndex) && parserIndex >= 0 && parserIndex < this.playlist.length) {
            return parserIndex;
        }
        // 随机选择有效歌曲
        let index;
        do {
            index = Math.floor(Math.random() * this.playlist.length);
        } while (this.playlist[index].file == null);
        return index;
    }

    // 构建播放列表UI
    initPlaylistUI() {
        const pl = document.getElementById('playlist');
        let ul = null;
        let ulth = 1;

        this.playlist.forEach(song => {
            const li = document.createElement('li');
            li.className = 'pure-menu-item';

            if (song.file == null) {
                // 游戏标题行
                if (ul) pl.appendChild(ul);
                li.innerHTML = song.title;
                li.id = song.code;
                li.className += ' pure-menu-disabled playlist-title';
                jpGameTitles.push(song.title);

                ul = document.createElement('ul');
                ul.className = 'pure-menu-list';
                ulth++;
            } else {
                // 歌曲行
                const a = document.createElement('div');
                a.innerHTML = song.title;
                a.className = 'pure-menu-link playlist-item';
                a.id = song.file;
                a.onclick = () => this.skipTo(this.playlist.indexOf(song));
                li.appendChild(a);
                jpSongTitles.push(song.title);
            }
            if (ul) ul.appendChild(li);

            // 设置播放列表背景图
            if (song.file == null && ulth > 5) {
                const imgName = ('00' + (ulth - 1)).slice(-2) + '.jpg';
                ul.style.backgroundImage = `url('${MUSIC_BASE_URL}images/title/${imgName}')`;
            }
        });
        if (ul) pl.appendChild(ul);
    }

    // 加载YouTube API（使用全局googleAPI）
    loadYouTubeAPI() {
        gapi.client.setApiKey(googleAPI); // 直接使用全局变量，无重复声明
        gapi.client.load('youtube', 'v3');
    }

    // 移动端适配
    adjustForMobile() {
        if (this.isMobile()) {
            animatedWaveform.checked = false;
        }
    }

    // 检测移动端
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 播放歌曲
    play(index = this.index, isNewSong = false) {
        // 卸载上一首歌曲
        if (this.playlist[this.index].howl && this.index !== index) {
            this.playlist[this.index].howl.unload();
            delete this.playlist[this.index].howl;
        }
        this.index = index;

        // 跳过无效歌曲
        const data = this.playlist[index];
        if (data.file == null) {
            this.skip('next');
            return;
        }

        // 更新URL参数
        const url = new URL(window.location.href);
        const parser = new URLSearchParams(url.search);
        parser.set('index', index);
        history.pushState(null, '', '?' + parser.toString());

        // 加载并播放音频
        let sound = data.howl;
        if (!sound) {
            const musicUrl = data.file.startsWith('http') 
                ? data.file 
                : MUSIC_BASE_URL + encodeURIComponent(data.file);
            console.log('加载音频:', musicUrl);

            sound = data.howl = new Howl({
                src: [musicUrl],
                html5: true,
                format: ['mp3'],
                volume: 0.8,
                onload: () => {
                    loading.style.display = 'none';
                },
                onloaderror: (id, error) => {
                    console.error('音频加载失败:', error);
                    loading.style.display = 'none';
                    setTimeout(() => this.skip('next'), 1000);
                },
                onplay: () => {
                    if (chorusMode.checked && data.chorusStartTime) {
                        sound.seek(data.chorusStartTime - 1);
                        sound.fade(0, 1, 1000);
                    }
                    duration.innerHTML = this.formatTime(Math.round(sound.duration()));
                    requestAnimationFrame(this.step.bind(this));
                    this.updateButtonState(true);
                },
                onend: () => this.skip('next')
            });

            this.initWaveform(sound);
            this.updateSeriesInfo(index);
            changeImage(data.info); // 调用唯一的changeImage
        }

        sound.play();
        this.updateTitle(index);
        this.updateVideoState(isNewSong);
    }

    // 初始化波形图
    initWaveform(sound) {
        const width = waveform.clientWidth;
        const height = (window.innerHeight || screen.height) * 0.2;
        waveform.style.bottom = (height * 0.1 + 90) + 'px';

        if (animatedWaveform.checked) {
            canvas.style.display = 'block';
            waveform.style.opacity = 0.5;
            if (wavesurfer) wavesurfer.destroy();
            vudio = new Vudio(sound._sounds[0]._node, canvas, {
                effect: 'waveform',
                accuracy: width < 550 ? 32 : 64,
                width, height,
                waveform: {
                    maxHeight: height * 0.9,
                    minHeight: 1,
                    spacing: 4,
                    color: ['#ffffff', '#e0e0e0', '#c9c9c9'],
                    shadowBlur: 1,
                    shadowColor: '#939393'
                }
            });
            vudio.dance();
        } else {
            canvas.style.display = 'none';
            waveform.style.opacity = 1;
            if (wavesurfer) wavesurfer.destroy();
            wavesurfer = WaveSurfer.create({
                container: '#waveform',
                backend: 'MediaElement',
                barWidth: 3,
                cursorColor: '#b556ff',
                progressColor: '#bf6dff',
                waveColor: '#e0e0e0',
                responsive: true
            });
            wavesurfer.load(sound._sounds[0]._node);
            wavesurfer.on('ready', () => wavesurfer.play());
        }
        waveform.style.cursor = 'pointer';
    }

    // 暂停播放
    pause() {
        const sound = this.playlist[this.index].howl;
        if (sound) sound.pause();
        if (window.videoPlayer?.playing) window.videoPlayer.pause();
        this.updateButtonState(false);
    }

    // 切换歌曲（上一首/下一首）
    skip(direction) {
        const currentSound = this.playlist[this.index].howl;
        if (direction === 'prev' && currentSound && currentSound.seek() <= 3) {
            currentSound.seek(0);
            return;
        }

        let index;
        if (randomPlay.checked) {
            do {
                index = Math.floor(Math.random() * this.playlist.length);
            } while (this.playlist[index].file == null);
        } else {
            index = direction === 'prev' ? this.index - 1 : this.index + 1;
            if (index < 0) index = this.playlist.length - 1;
            if (index >= this.playlist.length) index = 0;
            while (this.playlist[index].file == null) {
                index = direction === 'prev' ? index - 1 : index + 1;
                if (index < 0) index = this.playlist.length - 1;
                if (index >= this.playlist.length) index = 0;
            }
        }
        this.skipTo(index);
    }

    // 跳转到指定索引
    skipTo(index) {
        if (this.playlist[this.index].howl) {
            this.playlist[this.index].howl.stop();
        }
        progress.style.width = '0%';
        this.play(index, true);
    }

    // 调节音量
    volume(val) {
        Howler.volume(val);
        const barWidth = (val * 90) / 100;
        barFull.style.width = (barWidth * 100) + '%';
        sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    }

    // 进度跳转
    seek(per) {
        const sound = this.playlist[this.index].howl;
        if (sound) sound.seek(sound.duration() * per);
    }

    // 实时更新进度
    step() {
        const sound = this.playlist[this.index].howl;
        if (!sound || !sound.playing()) return;

        const seek = sound.seek() || 0;
        timer.innerHTML = this.formatTime(Math.round(seek));
        const progressNow = seek / sound.duration() || 0;
        progress.style.width = (progressNow * 100) + '%';

        if (!chorusFlag && chorusMode.checked && this.playlist[this.index].chorusEndTime && seek >= this.playlist[this.index].chorusEndTime) {
            chorusFlag = true;
            sound.fade(1, 0, 2000);
            setTimeout(() => {
                this.skip('next');
                chorusFlag = false;
            }, 2000);
        } else {
            requestAnimationFrame(this.step.bind(this));
        }
    }

    // 更新按钮状态
    updateButtonState(isPlaying) {
        playBtn.style.display = isPlaying ? 'none' : 'block';
        pauseBtn.style.display = isPlaying ? 'block' : 'none';
    }

    // 更新系列信息
    updateSeriesInfo(index) {
        let indexTemp = index - 1;
        while (this.playlist[indexTemp] && this.playlist[indexTemp].file != null) {
            indexTemp--;
        }
        document.getElementById('series').innerHTML = this.playlist[indexTemp]?.title || '';
    }

    // 更新歌曲标题
    updateTitle(index) {
        const data = this.playlist[index];
        if (!window.lang || window.lang === 'jp') {
            track.innerHTML = data.title;
        } else {
            getTranslatedSong(data.file, window.lang).then(song => {
                track.innerHTML = song || data.title;
            });
        }
    }

    // 更新视频状态
    updateVideoState(isNewSong) {
        if (window.videoPlayer?.stopped || isNewSong) {
            window.mvInfo = this.playlist[this.index].info;
            window.mvStage = 0;
        } else if (window.videoPlayer?.paused) {
            window.videoPlayer.play();
        }
    }

    // 格式化时间
    formatTime(secs) {
        const minutes = Math.floor(secs / 60) || 0;
        const seconds = (secs - minutes * 60) || 0;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // 切换播放列表显示
    togglePlaylist() {
        const display = playlist.style.display === 'block' ? 'none' : 'block';
        setTimeout(() => {
            playlist.style.display = display;
        }, display === 'block' ? 0 : 500);
        playlist.className = `pure-menu pure-menu-scrollable ${display === 'block' ? 'fadein' : 'fadeout'}`;
    }

    // 切换音量面板
    toggleVolume() {
        const display = volume.style.display === 'block' ? 'none' : 'block';
        setTimeout(() => {
            volume.style.display = display;
        }, display === 'block' ? 0 : 500);
        volume.className = `fade${display === 'block' ? 'in' : 'out'}`;
    }

    // 切换设置面板
    toggleSetting() {
        const display = setting.style.display === 'block' ? 'none' : 'block';
        setTimeout(() => {
            setting.style.display = display;
        }, display === 'block' ? 0 : 500);
        setting.className = `pure-menu fade${display === 'block' ? 'in' : 'out'}`;
    }
}


// 窗口大小调整事件
function handleResize() {
    if (!player) return;
    const width = waveform.clientWidth;
    const height = (window.innerHeight || screen.height) * 0.2;
    waveform.style.bottom = (height * 0.1 + 90) + 'px';
    canvas.width = width;
    canvas.height = height;

    const sound = player.playlist[player.index].howl;
    if (sound) {
        const vol = sound.volume();
        const barWidth = vol * 0.9;
        sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
        if (vudio) {
            vudio.width = width;
            vudio.height = height;
            vudio.setOption({ accuracy: width < 550 ? 32 : 64 });
        }
    }
}
window.addEventListener('resize', handleResize);


// 音量滑块拖动事件
function handleVolumeDrag(event) {
    if (window.sliderDown && player) {
        const x = event.clientX || (event.touches && event.touches[0].clientX);
        if (!x) return;
        const startX = window.innerWidth * 0.05;
        const layerX = x - startX;
        const per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
        player.volume(per);
    }
}
volume.addEventListener('mousemove', handleVolumeDrag);
volume.addEventListener('touchmove', handleVolumeDrag);


// 图片预加载
function preloadImages() {
    for (let i = 6; i <= 20; i++) {
        const img = new Image();
        const imgName = ('00' + i).slice(-2) + '.jpg';
        img.src = `${MUSIC_BASE_URL}images/title/${imgName}`;
        img.onerror = () => console.warn('图片不存在:', img.src);
    }
}
preloadImages();


// 从Firebase加载数据并初始化播放器
Promise.race([
    firebase.database().ref('games').once('value'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('网络超时')), 8000))
])
.then(gamesSnapshot => {
    console.log('Firebase数据加载成功');
    const gameObj = gamesSnapshot.val();

    if (!gameObj || !Array.isArray(gameObj)) {
        throw new Error('未找到有效音乐数据');
    }

    gameObj.forEach(game => {
        if (!game || !game.name || !game.songs) return;

        songList.push({
            title: game.name,
            file: null,
            code: game.path?.replace('/audio/', '').replace('.', '') || `game-${Date.now()}`
        });

        game.songs.forEach(song => {
            if (!song || !song.path) return;

            let songTitle = song.name?.split(".")[1] || song.name || '未知歌曲';
            if (songTitle === ' U') songTitle = ' U.N.オーエンは彼女なのか？';
            
            songList.push({
                title: songTitle,
                file: song.path,
                howl: null,
                info: song,
                chorusStartTime: song.chorus_start_time,
                chorusEndTime: song.chorus_end_time
            });
        });
    });

    if (songList.length === 0) {
        throw new Error('未解析到任何歌曲数据');
    }

    player = new Player(songList);
    handleResize();
    loadingText.style.display = 'none';
    ['playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'settingBtn', 'volumeBtn'].forEach(btn => {
        window[btn].style.display = 'block';
    });
    player.play();
    bindEvents();
})
.catch(err => {
    console.error('初始化失败:', err.stack);
    loadingText.innerHTML = `加载失败: ${err.message}<br><button onclick="window.location.reload()">刷新</button>`;
    loadingText.style.color = '#ff4444';
});


// 事件绑定
function bindEvents() {
    playBtn.addEventListener('click', () => player.play());
    pauseBtn.addEventListener('click', () => player.pause());
    prevBtn.addEventListener('click', () => player.skip('prev'));
    nextBtn.addEventListener('click', () => player.skip('next'));

    waveform.addEventListener('click', e => {
        player.seek(e.clientX / window.innerWidth);
    });

    playlistBtn.addEventListener('click', () => player.togglePlaylist());
    playlist.addEventListener('click', () => player.togglePlaylist());
    closePlaylist.addEventListener('click', () => player.togglePlaylist());

    volumeBtn.addEventListener('click', () => player.toggleVolume());
    volume.addEventListener('click', () => player.toggleVolume());
    barEmpty.addEventListener('click', e => {
        const per = e.layerX / parseFloat(barEmpty.scrollWidth);
        player.volume(per);
    });

    sliderBtn.addEventListener('mousedown', () => window.sliderDown = true);
    sliderBtn.addEventListener('touchstart', () => window.sliderDown = true);
    volume.addEventListener('mouseup', () => window.sliderDown = false);
    volume.addEventListener('touchend', () => window.sliderDown = false);

    animatedWaveform.addEventListener('change', () => {
        if (player.playlist[player.index].howl) {
            player.play(player.index, true);
        }
    });
}


// 多语言切换
function langChanged() {
    const langSelect = document.getElementById('langSelect');
    if (!langSelect || !player) return;
    window.lang = langSelect.value;
    player.updateTitle(player.index);
}