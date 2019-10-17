/**
 * 工具方法封装：
 * @method bindEvent  绑定事件(ele, event, eventHandler)
 * @method getEle 获取元素方法 (ele, isList = false)
 * @method transToBase64  将图片转换为 base64 (imgUrl, ext, imgW, imgH, callback)
 * @method  storage LocalStorage 存取封装
 * @method attr 获取节点属性（ele, key）
 */
var util = {
  //@ 1
  bindEvent: function(ele, event, eventHandler){
    if(ele.addEventListener){
      ele.addEventListener(event, eventHandler, true);
    }else if(ele.attachEvent){
      ele.attachEvent('on'+event, eventHandler);
    }else{
      ele['on'+event] = eventHandler;
    }
  },
  //@ 2
  getEle: (function(obj){
    return function(ele, isList){
      return isList ? obj.querySelectorAll(ele) : obj.querySelector(ele);
    }
  })(window.document),
  //@ 3
  transToBase64: function(imgUrl,ext,imgW, imgH, callback){
    var canvas = document.createElement("canvas");   //创建canvas DOM元素
    var ctx = canvas.getContext("2d");
    var img = new Image;
        img.crossOrigin = 'Anonymous';
        img.src = imgUrl;
    img.onload = function () {
        canvas.width = imgW; //指定画板的宽度,自定义
        canvas.height = imgH; //指定画板的高度,自定义
        ctx.drawImage(img, 0, 0, imgW, imgH); //参数可自定义
        var dataURL = canvas.toDataURL("image/" + ext);
        callback.call(this, dataURL); //回掉函数获取Base64编码
        canvas = null;
    };
  },
  //@ 4
  storage: {
    sets: function(key, val){ 
      localStorage.setItem(key, val); 
    },
    gets: function(key){ 
      return localStorage.getItem(key);
    },
    isExist: function(key){ 
      return !!localStorage.getItem(key); 
    },
    deletes: function(key){ 
      localStorage.removeItem(key); 
    },
    clear: function(){ 
      localStorage.clear(); 
    }
  },
  //@4
  attr: function(ele, key){ return ele.getAttribute(key); }

};

//组件配置
var mcConf = {
  bgUrl:"https://picsum.photos/1700/900/?random&"+Math.random(),
  audioVol:0,
  playInterval:null,
  //音乐播放器相关配置
  playCard:{
    cardBox : util.getEle('.cardBox'),
    backSide : util.getEle('.back-side'),
    frontSide : util.getEle('.front-side'),
    cardDetail : util.getEle('.cardDetail')
  },
  dom:{
    //播放器
    audio:util.getEle("audio"), //播放器
    playTime: util.getEle(".playTime"), //当前播放时间
    totalTime: util.getEle(".totalTime"), //歌曲时间长度
    curPoint: util.getEle(".curPoint"), //进度刻度
    palyPercent: util.getEle("#playPercent"), //进度条
    progressBarOffsetLeft: util.getEle("#playPercent").offsetLeft, //进度条左边距离
    sb : util.getEle(".soundBar"), //音量条
    sbCur : util.getEle(".curSoundPoint"), //音量条控制点
    volumBarOffsetLeft: util.getEle("#volumPercent").offsetLeft, //进度条左边距离
    listBtn:util.getEle(".list-btn"),//list-serach-button
    mcSearchBox:util.getEle(".mc_search_box"),//搜索列表页面
    closeMcSearchBox:util.getEle(".mc_search_box .closeBtn"),
    //歌曲
    song:{
      songName: util.getEle(".songName"), //歌曲名
      artist: util.getEle(".artist"), //歌手
      album: util.getEle(".album"), // 专辑
      poster: util.getEle(".songPoster img"), //专辑海报
      lyrics: util.getEle(".lyrics"),
      isDragLyrics: false,
    }
  } ,
}

/**
 * @param {String} url 图片链接 
 * @param {String} pt 需要设置背景的元素Node 节点对象
 */
function setBgImage(url, pt){
  console.log(url)
  var bgurl = util.storage.gets("bgurl");
  var bgTime = util.storage.gets("bgTime");
  var setStorage = function(){
    util.transToBase64(url, "jpg", 1700, 900, function(base64){
      util.storage.sets('bgurl' , base64);
      localStorage.setItem("bgTime",new Date().getTime());
      pt.style.cssText = "background-image:url("+url+");";
    });
  }
  if(bgurl && bgTime){
    var curTime = new Date().getTime();
    if((curTime - (+bgTime)) < (10*60*1000)){
      url = bgurl;
      pt.style.cssText = "background-image:url("+url+");";
      return;
    }
  }
  setStorage();
}

/*播放器翻面handler*/
function playerTurnAroundHandler(e){
  e = window.event || e;
  var target = e.srcElement || e.target;
  var turnType = util.attr(target, "type"),
  showStyle = "visibility:visible",
  hideStyle = "visibility:hidden",
  toBackTurnStyle = "transition: all 1.5s ease;transform: rotateY(180deg);",
  toFrontTurnStyle = "transition: all 1.5s ease;transform: rotateY(0deg);";
  if(turnType == "lyrics"){
    mcConf.playCard.cardBox.style.cssText = toBackTurnStyle;
    setTimeout(function(){
      mcConf.playCard.frontSide.style.cssText = hideStyle;
      mcConf.playCard.backSide.style.cssText = showStyle;
      mcConf.dom.sb.style.cssText = "visibility: hidden";
    },480)
  }else if(turnType == "song"){
    mcConf.playCard.cardBox.style.cssText = toFrontTurnStyle;
    setTimeout(function(){
      mcConf.playCard.backSide.style.cssText = hideStyle;
      mcConf.playCard.frontSide.style.cssText = showStyle;
      mcConf.dom.sb.style.cssText = "";
    },480)
  }
}

/* 播放更新进度条 */
function updateProgressBar(percent){
  var wholeWidth = parseInt(window.getComputedStyle(mcConf.dom.palyPercent).width);
  if(!!mcConf.dom.curPoint.style.cssText.match(/left:.*px;/img)){
    mcConf.dom.curPoint.style.cssText = mcConf.dom.curPoint.style.cssText.replace(/left:.*px;/img, "left:"+( mcConf.dom.progressBarOffsetLeft+ wholeWidth * (percent || mcConf.dom.palyPercent.value/100))+"px;");
  }else{
    mcConf.dom.curPoint.style.cssText += "left:"+( mcConf.dom.progressBarOffsetLeft + wholeWidth * (percent || mcConf.dom.palyPercent.value/100))+"px;";
  }
}
/* 更新音量进度条 */
function updateVolProgressBar(percent){
  console.log(percent)
  var wholeWidth = parseInt(window.getComputedStyle(mcConf.dom.sb).width);
  mcConf.dom.sbCur.style.cssText = "left:"+(wholeWidth * percent -10)+"px;";
  util.getEle(".ctr-btn .vol-wrap .volmBarBg").style.cssText="width:"+(percent*wholeWidth)+"px";
}

/* 转换分钟秒数 */
function formatMS(second){
  second = Math.floor(+second);
  var min = Math.floor(second/60);
  var sec = second - min*60;
      min = min < 10 ?"0"+min:min;
      sec = sec < 10 ?"0"+sec:sec;
  return {min:min, sec:sec};
}
/*播放、暂停音乐*/
function playPauseMusic(){
  var dom = mcConf.dom;
  if(!dom.audio.paused){
    dom.audio.pause();
  }else{
    dom.audio.play();
  }
}
/* 更新音乐源 */
function setMusicSrc(src){
  mcConf.dom.audio.src = src;
}
/* 滑动歌词 */
function slideLyrics(){
  var tTop;
  //监听鼠标按下事件
  util.bindEvent(mcConf.playCard.backSide,'mousedown', function(e) {
        mcConf.dom.song.isDragLyrics = true; //激活拖拽状态
        tTop = e.clientY;
  });

  //监听鼠标放开事件
  util.bindEvent(mcConf.playCard.backSide,'mouseup', function(e) {
    mcConf.dom.song.isDragLyrics = false;
  });

  //监听鼠标移动事件
  util.bindEvent(mcConf.playCard.backSide,'mousemove', function(e) {
    if (mcConf.dom.song.isDragLyrics) {
      var  moveY =e.clientY-tTop;
      moveY > 0 ? -moveY : moveY;
      clearTimeout(t);
      var t = setTimeout(function(){
        mcConf.dom.song.lyrics.style.top = moveY + 'px';
      },30);
    }
  });
}

/* 音乐暂停，播放，停止时的相关状态动作 */
function ppsAct(){
  var dom = mcConf.dom;
  var playIcon = util.getEle(".play-btn i");
  var signalMusilBox = util.getEle("#toggleRunMusicSignal");
  if(!dom.audio.paused){
    dom.song.poster.style.cssText = "animation-play-state:running";
    dom.curPoint.style.cssText += "animation-play-state:running";
    playIcon.classList.remove("fa-play");
    playIcon.classList.add("fa-pause");
    signalMusilBox.innerHTML="<style>.cardBox .songPoster .fa-music{animation-play-state:running!important;}</style>"
    mcConf.playInterval = setInterval(function(){
      updateProgressBar();
      dom.palyPercent.value = (+dom.audio.currentTime/+dom.audio.seekable.end(0))*100;
      var curTime = dom.audio.currentTime;
      curTime = formatMS(curTime);
      dom.playTime.innerHTML = curTime.min+":"+curTime.sec;
    },1000);
  }else{
    dom.song.poster.style.cssText = "animation-play-state:paused";
    dom.curPoint.style.cssText = dom.curPoint.style.cssText.replace("animation-play-state:running","");
    signalMusilBox.innerHTML="";
    playIcon.classList.add("fa-play");
    playIcon.classList.remove("fa-pause");
    clearInterval(mcConf.playInterval);
  }
}

/**
 * 方法调用入口
 */
window.onload = function(){
  var musicIndex = 1;
  var musicList = [
    "music/愿我能.aac",
    "music/真的爱你.aac"
  ];

  setBgImage(mcConf.bgUrl, util.getEle(".musicBox"));
  setMusicSrc(musicList[musicIndex])
  updateVolProgressBar(0.5);

  //卡片切换事件绑定
  util.bindEvent(util.getEle("#toggleSong"),"click", playerTurnAroundHandler);
  util.bindEvent(util.getEle("#toggleLyrics"),"click", playerTurnAroundHandler);
  util.getEle("#toggleSong").click();
  //当可以播放，进行的处理
  util.bindEvent(mcConf.dom.audio,"canplay",function(){
    var endTime = formatMS(mcConf.dom.audio.seekable.end(0));
    mcConf.dom.totalTime.innerHTML = endTime.min+":"+endTime.sec;
    //音乐播放，暂停调用
    util.bindEvent(util.getEle(".play-btn"),"click",playPauseMusic);
    //音量调节显示
    util.bindEvent(util.getEle(".vol-wrap .fa-volume-up"),"click",function(){
      if(!mcConf.dom.audio.muted){
        mcConf.audioVol = mcConf.dom.audio.volume;
      }
      mcConf.dom.audio.volume = mcConf.dom.audio.muted ?mcConf.audioVol : 0;
      mcConf.dom.audio.muted= !mcConf.dom.audio.muted;
      util.getEle(".soundBtn").classList.add(mcConf.dom.audio.muted ? "fa-volume-off":"fa-volume-up");
      util.getEle(".soundBtn").classList.remove(mcConf.dom.audio.muted ? "fa-volume-up":"fa-volume-off");
    });
  });
  //播放暂停事件
  util.bindEvent(mcConf.dom.audio,"play",ppsAct);
  util.bindEvent(mcConf.dom.audio,"pause",ppsAct);
  util.bindEvent(mcConf.dom.audio,"ended",function(){
    mcConf.dom.playTime.innerHTML="00:00";
    mcConf.dom.palyPercent.value=0;
    updateProgressBar();
  });
  //点击进度条切换进度
  util.bindEvent(mcConf.dom.palyPercent, "click",function(e){
    clearInterval(mcConf.playInterval);
     e = e || window.event;
     var left  = e.target.offsetLeft;
     var ptLeft = mcConf.playCard.cardBox.offsetLeft;

     var audio = mcConf.dom.audio;
     var wholeWidth = parseInt(window.getComputedStyle(mcConf.dom.palyPercent).width);
     var songLen = audio.seekable.end(0);
     var percent = (e.pageX-left-ptLeft) / wholeWidth;
     var playLen = percent * songLen;
     audio.currentTime = playLen;
     mcConf.dom.palyPercent.value = percent*100;
     updateProgressBar();
     audio.pause();
    audio.play();
  });
  //点击音乐进度条
  util.bindEvent(mcConf.dom.sb, "click", function(e){
    e = e || window.event;
    var audio = mcConf.dom.audio;

    var left  = mcConf.dom.sb.offsetLeft;
    var volBtnLeft = parseInt(util.getEle(".vol-wrap").offsetLeft);
    var ptLeft = parseInt(mcConf.playCard.cardBox.offsetLeft);

    var wholeWidth = parseInt(window.getComputedStyle(mcConf.dom.sb).width);
    var percent = (e.pageX-left-ptLeft-volBtnLeft) / wholeWidth;
    audio.volume = percent;
    updateVolProgressBar(percent);

  })

  //点击搜索按钮
  util.bindEvent(mcConf.dom.listBtn,'click',function(){
      mcConf.dom.mcSearchBox.style.cssText="top:0px";
  });
  util.bindEvent(mcConf.dom.closeMcSearchBox,'click',function(){
      mcConf.dom.mcSearchBox.style.cssText="";
  });
  //下一首
  util.bindEvent(util.getEle(".next-btn"),"click", function(){
    mcConf.dom.audio.pause();
    setMusicSrc(musicList[musicIndex+1 > musicList.length-1 ? (function(){return musicIndex=0;})() : ++musicIndex]);
    setTimeout(function () {
      mcConf.dom.audio.play();
		}, 500)
  });
  //上一首
  util.bindEvent(util.getEle(".prev-btn"),"click", function(){
    mcConf.dom.audio.pause();
    setMusicSrc(musicList[musicIndex-1 < 0 ? (function(){return musicIndex=musicList.length-1;})() : --musicIndex]);
    setTimeout(function () {
      mcConf.dom.audio.play();
		}, 500)
  });
  //window resize
  util.bindEvent(window,'resize',function(){
    mcConf.dom.progressBarOffsetLeft = util.getEle("#playPercent").offsetLeft;
  })


  /* 滑动歌词 */
  slideLyrics();
}

