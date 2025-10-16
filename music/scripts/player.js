// 音乐文件基础 URL（确保结尾带斜杠）
const MUSIC_BASE_URL = 'https://dxwwwqc.github.io/music-assets/';

// 缓存DOM元素
var elms = ['track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'settingBtn', 'playlistBtn', 'volumeBtn', 'progress', 'waveform', 'canvas', 'loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn', 'animatedWaveform', 'chorusMode', 'randomPlay', 'setting'];
elms.forEach(function (elm) {
  window[elm] = document.getElementById(elm);
});

// 日语标题缓存
let jpGameTitles = [];
let jpSongTitles = [];
let googleAPI = "YOUR_GOOGLE_API_KEY"; // 替换为实际API密钥

/**
 * 播放器类
 * @param {Array} playlist 播放列表数据
 */
var Player = function (playlist) {
  this.playlist = playlist;

  // URL参数解析
  var url = new URL(window.location.href);
  var parser = new URLSearchParams(url.search);
  var parserIndex = parseInt(parser.get('index'));
  if (!isNaN(parserIndex) && parserIndex < playlist.length && parserIndex >= 0) {
    this.index = parserIndex;
  } else {
    // 随机选择有效歌曲
    do {
      this.index = Math.floor(Math.random() * playlist.length);
    } while (playlist[this.index].file == null);
  }

  // 显示初始歌曲信息
  track.innerHTML = playlist[this.index].title;
  var indexTemp = this.index - 1;
  while (this.playlist[indexTemp] && this.playlist[indexTemp].file != null) {
    --indexTemp;
  }
  document.getElementById('series').innerHTML = this.playlist[indexTemp]?.title || '';
  changeImage(playlist[this.index].info);

  // 构建播放列表
  var ul = null;
  var ulth = 1;
  var pl = document.getElementById('playlist');
  playlist.forEach(function (song) {
    var li = document.createElement('li');
    li.className = 'pure-menu-item';
    if (song.file == null) {
      // 游戏标题行
      if (ul != null) {
        pl.appendChild(ul); // 先添加到DOM再设置背景图
      }
      li.innerHTML = song.title;
      jpGameTitles.push(song.title);
      li.id = song.code;
      li.className += ' pure-menu-disabled playlist-title';
      ul = document.createElement('ul');
      ul.className = 'pure-menu-list';
      ulth++; // 先自增，确保序号正确
    } else {
      // 歌曲行
      var a = document.createElement('div');
      a.innerHTML = song.title;
      jpSongTitles.push(song.title);
      a.className = 'pure-menu-link playlist-item';
      a.id = `${song.file}`;
      a.onclick = function () {
        player.skipTo(playlist.indexOf(song));
      };
      li.appendChild(a);
    }
    if (ul) ul.appendChild(li);
    // 修复：ul添加到DOM后再设置背景图（ulth > 5时）
    if (ulth > 5 && song.file == null) {
      ul.style.backgroundImage = `url('${MUSIC_BASE_URL}images/title/${('00' + (ulth - 1)).slice(-2)}.jpg')`;
    }
  });
  if (ul) pl.appendChild(ul); // 添加最后一个ul

  // 加载YouTube API
  gapi.client.setApiKey(googleAPI);
  gapi.client.load('youtube', 'v3');

  // 移动端默认关闭动态波形
  if (mobilecheck()) {
    animatedWaveform.checked = false;
  }
};

Player.prototype = {
  lang: 'jp',

  /**
   * 播放歌曲
   * @param {Number} index 歌曲索引
   * @param {Boolean} isNewSong 是否新歌曲
   */
  play: function (index, isNewSong) {
    var self = this;
    index = typeof index === 'number' ? index : self.index;

    // 卸载上一首歌曲
    if (self.playlist[self.index].howl && self.index !== index) {
      self.playlist[self.index].howl.unload();
      delete self.playlist[self.index].howl;
    }
    self.index = index;

    // 跳过无效歌曲
    var data = self.playlist[index];
    if (data.file == null) {
      self.skip('next');
      return;
    }

    // 更新URL参数
    var url = new URL(window.location.href);
    var parser = new URLSearchParams(url.search);
    parser.set('index', index);
    history.pushState(null, '', '?' + parser.toString());

    // 加载音频
    let sound;
    if (data.howl) {
      sound = data.howl;
    } else {
      // 音频路径拼接（确保正确性）
      var musicUrl = data.file.startsWith('http') ? data.file : MUSIC_BASE_URL + data.file;
      console.log('加载音频:', musicUrl); // 调试日志

      sound = data.howl = new Howl({
        src: [musicUrl],
        html5: true,
        onplay: function () {
          // 副歌模式处理
          if (chorusMode.checked && self.playlist[self.index].chorusStartTime) {
            data.howl.seek(self.playlist[self.index].chorusStartTime - 1);
            data.howl.fade(0.0, 1.0, 1000);
          }

          // 显示时长
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));
          requestAnimationFrame(self.step.bind(self));
          pauseBtn.style.display = 'block';
          playBtn.style.display = 'none';
        },
        onload: function () {
          loading.style.display = 'none';
        },
        onend: function () {
          self.skip('next');
        },
        onloaderror: function (id, error) {
          console.error('音频加载失败:', error, '路径:', musicUrl);
          loading.style.display = 'none';
        },
        onplayerror: function (id, error) {
          console.error('音频播放失败:', error);
        }
      });

      // 波形图初始化
      var width = waveform.clientWidth;
      var height = (window.innerHeight > 0) ? window.innerHeight * 0.2 : screen.height * 0.2;
      waveform.style.bottom = (height * 0.1 + 90) + 'px';
      
      if (animatedWaveform.checked) {
        var accuracy = (width < 400) ? 16 : (width < 550) ? 32 : (width < 950) ? 64 : 128;
        canvas.style.display = 'block';
        waveform.style.opacity = 0.5;
        if (wavesurfer) wavesurfer.destroy();
        vudio = new Vudio(sound._sounds[0]._node, canvas, {
          effect: 'waveform',
          accuracy: accuracy,
          width: width,
          height: height,
          waveform: {
            maxHeight: height / 10 * 9,
            minHeight: 1,
            spacing: 4,
            color: ['#ffffff', '#e0e0e0', ' #c9c9c9'],
            shadowBlur: 1,
            shadowColor: '#939393',
            fadeSide: false,
            prettify: false,
            horizontalAlign: 'center',
            verticalAlign: 'bottom'
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
          cursorWidth: 1,
          progressColor: '#bf6dff',
          waveColor: '#e0e0e0',
          responsive: true
        });
        wavesurfer.load(sound._sounds[0]._node);
        wavesurfer.on('ready', function () {
          wavesurfer.play();
        });
      }
      waveform.style.cursor = 'pointer';

      // 更新系列信息
      var indexTemp = index - 1;
      while (self.playlist[indexTemp] && self.playlist[indexTemp].file != null) {
        --indexTemp;
      }
      document.getElementById('series').innerHTML = self.playlist[indexTemp]?.title || '';
    }

    // 播放音频
    sound.play();
    this.updateTitle(index);

    // 视频播放逻辑
    if (window.videoPlayer?.stopped || isNewSong) {
      window.mvInfo = data.info;
      window.mvStage = 0;
    } else if (window.videoPlayer?.paused) {
      window.videoPlayer.play();
    }

    // 更新按钮状态
    if (sound.state() === 'loaded') {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    } else {
      loading.style.display = 'block';
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
    }
  },

  /**
   * 暂停播放
   */
  pause: function () {
    var self = this;
    var sound = self.playlist[self.index].howl;
    if (sound) sound.pause();
    if (window.videoPlayer?.playing) window.videoPlayer.pause();
    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
  },

  /**
   * 切换歌曲
   * @param {String} direction 方向：'next' 或 'prev'
   */
  skip: function (direction) {
    var self = this;
    var index = 0;
    var currentSound = self.playlist[self.index].howl;

    if (direction === 'prev' && currentSound && currentSound.seek() <= 3) {
      currentSound.seek(0);
      return;
    }

    // 随机播放逻辑
    if (randomPlay.checked) {
      do {
        index = Math.floor(Math.random() * self.playlist.length);
      } while (self.playlist[index].file == null); // 确保是有效歌曲
    } else {
      // 顺序播放
      if (direction === 'prev') {
        index = self.index - 1;
        if (index < 0) index = self.playlist.length - 1;
      } else {
        index = self.index + 1;
        if (index >= self.playlist.length) index = 0;
      }
      // 跳过无效歌曲
      while (self.playlist[index]?.file == null) {
        index = direction === 'prev' ? index - 1 : index + 1;
        if (index < 0) index = self.playlist.length - 1;
        if (index >= self.playlist.length) index = 0;
      }
    }
    self.skipTo(index);
  },

  /**
   * 跳转到指定索引歌曲
   * @param {Number} index 歌曲索引
   */
  skipTo: function (index) {
    var self = this;
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }
    progress.style.width = '0%';
    window.progressNow = 0;
    self.play(index, true);
  },

  /**
   * 调节音量
   * @param {Number} val 音量值（0-1）
   */
  volume: function (val) {
    Howler.volume(val);
    var barWidth = (val * 90) / 100;
    barFull.style.width = (barWidth * 100) + '%';
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
  },

  /**
   * 进度跳转
   * @param {Number} per 进度百分比
   */
  seek: function (per) {
    var sound = this.playlist[this.index].howl;
    if (sound) sound.seek(sound.duration() * per);
  },

  /**
   * 实时更新进度
   */
  step: function () {
    var self = this;
    var sound = self.playlist[self.index].howl;
    if (!sound) return;

    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    window.progressNow = (seek / sound.duration()) || 0;
    progress.style.width = (window.progressNow * 100) + '%';

    // 副歌模式自动切歌
    if (!window.chorusFlag && chorusMode.checked && self.playlist[self.index].chorusEndTime && seek >= self.playlist[self.index].chorusEndTime) {
      window.chorusFlag = true;
      sound.fade(1.0, 0.0, 2000);
      setTimeout(function () {
        self.skip('next');
        window.chorusFlag = false;
      }, 2000);
    } else {
      if (sound.playing()) requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
   * 切换播放列表显示
   */
  togglePlaylist: function () {
    var display = playlist.style.display === 'block' ? 'none' : 'block';
    setTimeout(() => {
      playlist.style.display = display;
    }, display === 'block' ? 0 : 500);
    playlist.className = display === 'block' ? 'pure-menu pure-menu-scrollable fadein' : 'pure-menu pure-menu-scrollable fadeout';
  },

  /**
   * 切换音量面板
   */
  toggleVolume: function () {
    var display = volume.style.display === 'block' ? 'none' : 'block';
    setTimeout(() => {
      volume.style.display = display;
    }, display === 'block' ? 0 : 500);
    volume.className = display === 'block' ? 'fadein' : 'fadeout';
  },

  /**
   * 切换设置面板
   */
  toggleSetting: function () {
    var display = setting.style.display === 'block' ? 'none' : 'block';
    setTimeout(() => {
      setting.style.display = display;
    }, display === 'block' ? 0 : 500);
    setting.className = display === 'block' ? 'pure-menu fadein' : 'pure-menu fadeout';
  },

  /**
   * 格式化时间（秒 -> M:SS）
   * @param {Number} secs 秒数
   * @return {String} 格式化后的时间
   */
  formatTime: function (secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  },

  /**
   * 更新歌曲标题（多语言支持）
   */
  updateTitle: function () {
    var data = this.playlist[this.index];
    if (!window.lang || window.lang === 'jp') {
      track.innerHTML = data.title;
    } else {
      getTranslatedSong(data.file, window.lang).then((song) => {
        track.innerHTML = song || data.title;
      });
    }
  }
};

// 全局变量
var songList = [];
var player;
var vudio;
var wavesurfer;
var chorusFlag = false;

// 窗口大小调整事件
var resize = function () {
  var width = waveform.clientWidth;
  var height = (window.innerHeight > 0) ? window.innerHeight * 0.2 : screen.height * 0.2;
  waveform.style.bottom = (height * 0.1 + 90) + 'px';
  canvas.width = width;
  canvas.height = height;

  // 更新音量滑块位置
  var sound = player?.playlist[player.index].howl;
  if (sound) {
    var vol = sound.volume();
    var barWidth = (vol * 0.9);
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    if (vudio) {
      vudio.width = width;
      vudio.height = height;
      var accuracy = (width < 550) ? 32 : (width < 1000) ? 64 : 128;
      vudio.setOption({
        accuracy: accuracy,
        waveform: { maxHeight: height / 10 * 9 }
      });
    }
  }
};
window.addEventListener('resize', resize);

// 音量滑块拖动事件
var move = function (event) {
  if (window.sliderDown) {
    var x = event.clientX || (event.touches && event.touches[0].clientX);
    if (!x) return;
    var startX = window.innerWidth * 0.05;
    var layerX = x - startX;
    var per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
    player.volume(per);
  }
};
volume.addEventListener('mousemove', move);
volume.addEventListener('touchmove', move);

// 从Firebase加载数据
let gameObj;
firebase.database().ref('games').once('value').then(function (games) {
  gameObj = games.val();
  if (!gameObj) {
    console.error('未从Firebase加载到游戏数据');
    return;
  }

  gameObj.forEach(game => {
    // 添加游戏标题行
    songList.push({
      title: game.name,
      file: null,
      code: game.path.replace('/audio/', '').replace('.', '')
    });

    // 添加歌曲
    game.songs.forEach(song => {
      let songTitle = song.name.split(".")[1] || song.name;
      if (songTitle === ' U') songTitle = ' U.N.オーエンは彼女なのか？';
      
      songList.push({
        title: songTitle,
        file: song.path, // 路径由MUSIC_BASE_URL拼接
        howl: null,
        info: song,
        chorusStartTime: song.chorus_start_time,
        chorusEndTime: song.chorus_end_time
      });
    });
  });

  // 初始化播放器
  player = new Player(songList);
  resize();
}).catch(err => {
  console.error('Firebase数据加载失败:', err);
});

// 绑定控制事件
playBtn.addEventListener('click', () => player.play());
pauseBtn.addEventListener('click', () => player.pause());
prevBtn.addEventListener('click', () => player.skip('prev'));
nextBtn.addEventListener('click', () => player.skip('next'));

waveform.addEventListener('click', function (event) {
  if (player) player.seek(event.clientX / window.innerWidth);
});

playlistBtn.addEventListener('click', () => player.togglePlaylist());
playlist.addEventListener('click', () => player.togglePlaylist());
closePlaylist.addEventListener('click', () => player.togglePlaylist());

volumeBtn.addEventListener('click', () => player.toggleVolume());
volume.addEventListener('click', () => player.toggleVolume());

settingBtn.addEventListener('click', () => player.toggleSetting());

// 音量滑块点击事件
barEmpty.addEventListener('click', function (event) {
  var per = event.layerX / parseFloat(barEmpty.scrollWidth);
  player.volume(per);
});

// 滑块拖动状态
sliderBtn.addEventListener('mousedown', () => window.sliderDown = true);
sliderBtn.addEventListener('touchstart', () => window.sliderDown = true);
volume.addEventListener('mouseup', () => window.sliderDown = false);
volume.addEventListener('touchend', () => window.sliderDown = false);

// 动态波形图切换事件
animatedWaveform.addEventListener('change', function () {
  if (player && player.playlist[player.index].howl) {
    player.play(player.index, true); // 重新加载以应用波形图设置
  }
});

// 图片预加载
function imagePreload(url) {
  const img = new Image();
  img.src = url;
  img.onload = () => console.log('预加载图片成功:', url);
  img.onerror = () => console.error('预加载图片失败:', url);
}
for (var i = 6; i < 27; i++) {
  imagePreload(MUSIC_BASE_URL + 'images/title/' + ('00' + i).slice(-2) + '.jpg');
}

// 补充缺失的changeImage函数（设置背景图片）
function changeImage(info) {
  if (!info) return;
  // 根据实际数据结构调整图片路径（示例）
  const defaultImg = 'images/default-bg.jpg';
  const imgPath = info.bgImage || defaultImg;
  const fullImgUrl = MUSIC_BASE_URL + imgPath;
  document.getElementById('background').style.backgroundImage = `url('${fullImgUrl}')`;
}

// 移动端检测函数（依赖utility.js，若缺失需补充）
function mobilecheck() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 多语言切换函数（假设langSelect存在）
function langChanged() {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;
  window.lang = langSelect.value;
  if (player) player.updateTitle();

  // 更新播放列表歌曲名
  const divs = document.getElementsByClassName('playlist-item');
  for (let i = 0; i < divs.length; i++) {
    const div = divs[i];
    if (window.lang === 'jp') {
      div.innerText = jpSongTitles[i] || div.innerText;
    } else {
      getTranslatedSong(div.id, window.lang).then((song) => {
        if (song) div.innerText = song;
      });
    }
  }

  // 更新游戏标题翻译
  firebase.database().ref('i18n-titles').once('value').then(function (i18n) {
    const gameTitles = document.getElementsByClassName('playlist-title');
    const translatedTitles = i18n.val()?.[window.lang] || {};
    if (window.lang === 'jp') {
      for (let i = 0; i < gameTitles.length; i++) {
        gameTitles[i].innerText = jpGameTitles[i] || gameTitles[i].innerText;
      }
    } else {
      for (let i = 0; i < gameTitles.length; i++) {
        const game = gameTitles[i];
        game.innerText = translatedTitles[game.id] || game.innerText;
      }
    }
  });
}