function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var hls = null;
    var attached = false;

    if (!video || !source) {
        return;
    }

    var attachSource = function () {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            attached = true;
            return;
        }

        video.src = source;
        attached = true;
    };

    var playVideo = function () {
        attachSource();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var started = video.play();
        if (started && typeof started.catch === "function") {
            started.catch(function () {});
        }
    };

    attachSource();

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
