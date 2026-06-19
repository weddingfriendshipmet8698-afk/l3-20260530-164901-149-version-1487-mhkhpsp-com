(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", nav.classList.contains("is-open"));
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (slides.length === 0) {
            return;
        }
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var dotsWrap = document.querySelector("[data-hero-dots]");
        var index = 0;
        var timer = null;
        var dots = [];

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (dotsWrap) {
            dots = slides.map(function (_, current) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换到第" + (current + 1) + "部");
                dot.addEventListener("click", function () {
                    show(current);
                    start();
                });
                dotsWrap.appendChild(dot);
                return dot;
            });
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (cards.length === 0) {
            return;
        }
        var searchInput = document.querySelector("[data-search]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var empty = document.querySelector("[data-empty-result]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.category,
                    card.dataset.tags
                ].join(" "));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && normalize(card.dataset.year) !== year) {
                    matched = false;
                }
                if (type && normalize(card.dataset.type) !== type) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayer() {
        var video = document.querySelector(".movie-player");
        if (!video) {
            return;
        }
        var overlay = document.querySelector(".player-overlay");
        var playUrl = video.getAttribute("data-play-url");
        var attached = false;

        function attachStream() {
            if (attached || !playUrl) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(playUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = playUrl;
            }
            attached = true;
        }

        function play() {
            attachStream();
            video.setAttribute("controls", "controls");
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var request = video.play();
            if (request && request.catch) {
                request.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                play();
            }
        });
    }

    onReady(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
