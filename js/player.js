var panelShow = false,
	play_clickTimes = 1,
	getSongPageFromWeb = 1,
	getSongNumFromWeb = 18,
	songPlayNum = 0,
	musicCache, lastCacheNum = songPlayNum,
	lastCacheTime, lastsongid, lastPlayStatus = "stoping";

function adjustPlayerPosition(width) {
	$('#music_list').hide();
	$("#wrapmenu").hide();
	if (width < 500) {
		$('.wrap_music').stop().hide().css({
			'left': '0vw'
		}).css({
			'left': '-73vw'
		}).show();
	} else {
		$('.wrap_music').stop().hide().css({
			'left': '0vw'
		}).css({
			'left': '-439px'
		}).show();
	}
}

function getSongInfo(singerName, page, num) {
	songUrl = 'http://search.kuwo.cn/r.s?all=' + singerName + '&ft=music&itemset=web_2013&client=kt&pn=' + page + '&rn=' + num + '&rformat=json&encoding=utf8';
	$("#music_list_box").html("正在加载音乐......");
	$('#music_list').show();
	$.ajax({
		type: 'get',
		url: "/index.php/api/api/music",
		data: {
			url: songUrl
		},
		dataType: 'text',
		success: function (data) {
			while (data.match("'")) {
				data = data.replace("'", '"')
			}
			obj = $.parseJSON(data);
			if ((obj.abslist).length <= 0 || (obj.abslist) == null || (obj.abslist) == undefined) {
				tips("warn", "暂时没有相关歌曲，换个歌手的歌搜搜吧！")
			} else {
				document.querySelector('#audio_player').pause();
				$("#music_list_box").html("");
				localStorage.clear();
				createSongjson(obj.abslist);
				setSongTolist();
				hoverMusicListAndClickPlay();
			}
		},
		error: function () {
			tips('error', '读取歌曲列表失败.....');
			tips('error', '读取歌曲列表失败.....');
		}
	})
}

function createSongjson(objList) {
	for (i = 0; i < objList.length; i += 1) {
		saveSong(i, JSON.stringify(objList[i]))
	}
	setTimeout(function () {
		songPlayNum = 0;
		song = readSong(songPlayNum);
		setInfoToplayborad(song);
	}, 2000)
}

function saveSong(key, val) {
	localStorage.setItem(key, val)
}

function clearSong() {
	for (var i = 0; i < getSongNumFromWeb; i += 1) {
		localStorage.removeItem(i)
	}
}

function readSong(num) {
	if (num !== undefined && num !== null) {
		songPlayNum = num;
		if (songPlayNum >= getSongNumFromWeb) {
			songPlayNum = 0
		}
		var songJson = localStorage.getItem(songPlayNum)
	} else {
		songPlayNum += 1;
		if (songPlayNum > getSongNumFromWeb - 1) {
			songPlayNum = 0
		}
		var songJson = localStorage.getItem(songPlayNum)
	}
	return $.parseJSON(songJson)
}

function setInfoToplayborad(songObj) {
	var presongurl = 'http://antiserver.kuwo.cn/anti.s?type=convert_url&rid=' + (songObj.MUSICRID) + '&format=aac|mp3&response=url';
	$.ajax({
		type: 'get',
		url: "/index.php/api/api/music",
		data: {
			url: presongurl
		},
		dataType: 'text',
		success: function (data) {
			$("#audio_player").attr('src', data);
			$("#songName").html("歌曲名:" + songObj.SONGNAME);
			$("#artist").html("艺术家:" + songObj.ARTIST)
		},
		error: function () {
			tips('error', '读取歌曲失败.....');
		}
	})
}

function setSongTolist() {
	for (var i = 0; i < getSongNumFromWeb; i += 1) {
		var song = $.parseJSON(localStorage.getItem(i));
		var tp = '<li title=（"' + song.SONGNAME + '）--双击播放"><span>' + song.SONGNAME + '</span><span>' + song.ARTIST + '</span><span>' + song.ALBUM + '</span></li>';
		$('#music_list_box').append(tp)
	}
}

function search(keyword) {
	if (keyword.replace(" ", "") == "") {
		getSongInfo('轻音乐', getSongPageFromWeb, getSongNumFromWeb)
	} else {
		getSongInfo(keyword, getSongPageFromWeb, getSongNumFromWeb)
	}
}

function delitem(item) {
	localStorage.removeItem(item)
}

function hoverMusicListAndClickPlay() {
	$("#music_list_box").children('li').hover(function () {
		if ($(this).index() != songPlayNum) {
			$(this).css({
				"background-color": "yellow",
				"color": "black"
			})
		}
	}, function () {
		if ($(this).index() != songPlayNum) {
			$(this).css({
				"background-color": "rgba(0,0,0,0.8)",
				"color": "white"
			})
		}
	});
	$("#music_list_box").children('li').dblclick(function (event) {
		var index = $(this).index();
		songPlayNum = index;
		var song = readSong(songPlayNum);
		setInfoToplayborad(song);
		setTimeout(function () {
			document.querySelector('#audio_player').play()
		}, 500)
	});
}
$(function () {
	lastCacheNum = localStorage.getItem("songNum");
	lastCacheTime = localStorage.getItem("recordTime");
	lastsongid = localStorage.getItem(lastCacheNum);
	lastPlayStatus = localStorage.getItem("status");
	if (lastsongid !== undefined && lastsongid !== null) {
		var song = readSong(lastCacheNum);
		setInfoToplayborad(song);
		setSongTolist();
		var player = document.querySelector('#audio_player');
		setTimeout(function () {
			player.currentTime = lastCacheTime;
			if (lastPlayStatus !== undefined && lastPlayStatus !== null && lastPlayStatus == "playing") {
				player.play()
			}
		}, 500)
	} else {
		console.log("还没缓存");
		search("轻音乐");
	}
	$('#music_list').hide();
	$('#music_list_btn').click(function () {
		$('#music_list').toggle();
		$(this).toggleClass('btn-danger')
	});
	$('audio').bind('play', function () {
		var arrli = $("#music_list_box").children('li');
		$(arrli).css({
			"background-color": "rgba(0,0,0,0.8)",
			"color": "white",
			"cursor": "pointer"
		});
		$(arrli[songPlayNum]).css({
			"background-color": "yellow",
			"color": "black"
		});
		$('#album_img').addClass('run');
		$('#playState').removeClass('glyphicon-play').addClass('glyphicon-pause');
		localStorage.setItem('status', "playing")
	});
	$('audio').bind('pause', function () {
		clearInterval(musicCache);
		$('#album_img').removeClass('run');
		$('#playState').removeClass('glyphicon-pause').addClass('glyphicon-play');
		localStorage.setItem('status', "stoping")
	});
	$('audio').bind("playing", function () {
		clearInterval(musicCache);
		musicCache = setInterval(function () {
			var time = document.getElementById('audio_player').currentTime;
			var song = songPlayNum;
			localStorage.setItem('recordTime', time);
			localStorage.setItem('songNum', song)
		}, 1000)
	});
	$('#playState').bind('click', function () {
		play_clickTimes += 1;
		var ply = document.querySelector('#audio_player');
		if (play_clickTimes % 2 == 0) {
			ply.play()
		} else {
			ply.pause()
		}
	});
	$('audio').bind('ended', function () {
		clearInterval(musicCache);
		$('#album_img').removeClass('run');
		$('#playState').removeClass('glyphicon-pause').addClass('glyphicon-play');
		localStorage.setItem('status', "stoping");
		var song = readSong();
		setInfoToplayborad(song);
		setTimeout(function () {
			document.querySelector('#audio_player').play()
		}, 500)
	});
	$("#music_next").click(function () {
		localStorage.setItem('status', "stoping");
		var index = (songPlayNum + 1) > getSongNumFromWeb ? 0 : (songPlayNum + 1);
		songPlayNum = index;
		var song = readSong(index);
		setInfoToplayborad(song);
			setTimeout(function () {
				document.querySelector('#audio_player').play()
			}, 500)
	});
	$("#music_pre").click(function () {
		localStorage.setItem('status', "stoping");
		var index = (songPlayNum - 1) < 0 ? getSongNumFromWeb : (songPlayNum - 1);
		songPlayNum = index;
		var song = readSong(index);
		setInfoToplayborad(song);
		setTimeout(function () {
			document.querySelector('#audio_player').play()
		}, 2500)
	});
	$("#search_btn").click(function () {
		var keyword = $("#searchkeyword").val();
		(keyword.replace(" ", "") == "") ? tips("error", "请输入歌手的名字！"): search(keyword);
	});
	hoverMusicListAndClickPlay();
	var screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
	adjustPlayerPosition(screenWidth);
	$(window).resize(function () {
		screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
		adjustPlayerPosition(screenWidth)
	});
	$('#btn_pullout_panel').click(function () {
		panelShow = !panelShow;
		if (screenWidth < 500) {
			if (panelShow) {
				$('.wrap_music').stop().animate({
					'left': '0px'
				}, 1500);
				$('#btn_pullout_panel i').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
				$("#wrapmenu").show();
			} else {
				$('#music_list').hide();
				$("#wrapmenu").hide();
				$('.wrap_music').stop().animate({
					'left': '-73vw'
				}, 1500);
				$('#btn_pullout_panel i').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right')
			}
		} else {
			if (panelShow) {
				$('.wrap_music').stop().animate({
					'left': '0px'
				}, 1500);
				$('#btn_pullout_panel i').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
				$("#wrapmenu").show();
			} else {
				$('#music_list').hide();
				$('.wrap_music').stop().animate({
					'left': '-439px'
				}, 1500);
				$('#btn_pullout_panel i').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
				$("#wrapmenu").hide();
			}
		}
	})
});