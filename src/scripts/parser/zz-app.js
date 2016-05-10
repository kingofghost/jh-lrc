var audio = document.getElementById("mp3");
var span = document.getElementById("w");
var wrap = document.getElementById("wrap");
var img = document.getElementById("alImg");
var songMsg = document.getElementById("songMsg");
var scrollLrc = document.getElementById("scrollLrc");
var playMode = document.getElementById("playMode");
var playTime = document.getElementById("playTime");
var msgBox = document.getElementById("message");

/* draw button on playMode
 * require ctx
 * Note: this currently only work on one size
*/
var drawBtn = (function() {
    var DrawOnCanvas = function(canvas){
        this.ctx = canvas.getContext('2d');
             ctx.fillStyle = "rgba(200,200,200,.8)";
        this.draw = function(type) {
            switch (type) {
                case 'pause':
                    // draw pause button
                    ctx.clearRect(0,0,80,80);
                    ctx.fillRect(0,0,30,80);
                    ctx.fillRect(50,0,30,80);
                    break;
                case 'play':
                    ctx.clearRect(0,0,80,80);
                    ctx.beginPath();
                    ctx.moveTo(10,0);
                    ctx.lineTo(80,40);
                    ctx.lineTo(10,80);
                    ctx.closePath();
                    ctx.fill();
                    break;
                default:
                    // do nothing
            }
        };

        return this;
    };

    return new DrawOnCanvas(playMode);
})();


var updatePercent = function() {
    var audioLoading = function(tag) {
        if (tag && tag.nodeName === 'AUDIO') {
            return Math.floor(tag.buffered.end(0) / tag.duration * 100);
        }
        return Math.floor(audio.buffered.end(0) / audio.duration * 100);
    };

    msgBox.innerHTML = "加载中：" + audioLoading() + "/100";

    if (audioLoading() <= 100) {
        var set = setTimeout(updatePercent, 100);
    }
    if (audioLoading() === 100) {
        msgBox.parentNode.display = "none";
    }

};

function startPlay() {
    audio.src = "./music/OneRepublic - Good Life.mp3";
    var state = false;
    var playandpause = function() {
		if (audio.paused) {
			audio.play();
            img.classList.add('round'); // go round
			drawBtn.draw('pause');
		}
		else{
			audio.pause();
            img.classList.remove('round'); // go round
			drawBtn.draw('play');
		}
	};
    img.addEventListener("click", playandpause, false);

    // initialize
    drawBtn(ctx, 'play');

function addScrollLrc() {
    var lrc = loadedLRClist[0];
    var timeline = lrc.timeStamps;

    for (var line = 0; line < timeline.length; line++) {
        var t = lrc[timeline[line]][0];
        var li = document.createElement("li");
        li.className = "line";
        li.dataset.line = t;
        li.innerHTML = lrc.lrc[t];
        scrollLrc.appendChild(li);
    }
}

var ONCE = true;

audio.addEventListener("canplay", function() {
    updatePercent();
    if (audio.paused) {
        audio.play();
        drawBtn(ctx, 'pause');
    }
}, false);

audio.addEventListener("ended",function() {
    drawBtn(ctx, 'play');
}, false);

audio.addEventListener("timeupdate", function() {

	var lrc = loadedLRClist[0];
	var timeline = lrc.timeStamps;
	var lrcList = lrc.lrc;
	var OFFSET = 0.5;
	var curTime = audio.currentTime + OFFSET;
	var offsetTop = "";
	var originTop = 30;

	if (ONCE) {
		wrap.style.backgroundImage = "url('" + location.href + "OneRepublic.jpg')";
		var ti = document.createElement("span");
		ti.id = "title";
		ti.innerHTML = lrc.ar + " - " + lrc.ti;
		songMsg.appendChild(ti);
		songMsg.appendChild(document.createElement("br"));
		var al = document.createElement("span");
		al.id = "album";
		al.innerHTML = lrc.al;
		songMsg.appendChild(al);
		offsetTop = scrollLrc.offsetTop;


		scrollLrc.style.top = originTop + "px";
		addScrollLrc();
		ONCE = false;
	}

	var timeS = {};
	timeS.n = parseInt(audio.currentTime);
	timeS.s = timeS.n % 60;
	timeS.m = parseInt(timeS.n / 60);

	playTime.innerHTML = ("00" + timeS.m).substr(-2) + ":" + ("00" + timeS.s).substr(-2);

	for (var i=0; i<timeline.length; i++) {
		if (curTime <= timeline[i]) {
			var arrLrcList = lrc[timeline[i-1]];
			var aChild = scrollLrc.childNodes;
			if (i - 2 >= 0) {
				aChild[i - 1].className = "line focus";
				aChild[i - 2].className = "line";
				scrollLrc.style.top = originTop -(aChild[i - 1].offsetTop) + "px";
			} else {
				aChild[i - 1].className = "line focus";
				scrollLrc.style.top = originTop -(aChild[i - 1].offsetTop) + "px";
			}

			var strLrcTMP = "";
			// 加载多行歌词
			for (var j=0; j < arrLrcList.length; j++) {
				strLrcTMP += lrcList[arrLrcList[j]];

			}
			//console.log(strLrcTMP);
			//span.innerHTML = strLrcTMP;

			return strLrcTMP;
		}
	}
}, false);
}
