(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initFilters();
        initHero();
        initPlayer();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty]");
        if (!input && !typeSelect && !yearSelect) {
            return;
        }
        if (input && getQuery("q")) {
            input.value = getQuery("q");
        }
        var filter = function () {
            var q = input ? input.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (type && card.dataset.type !== type) {
                    ok = false;
                }
                if (year && card.dataset.year !== year) {
                    ok = false;
                }
                card.classList.toggle("hidden-card", !ok);
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        };
        [input, typeSelect, yearSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", filter);
                node.addEventListener("change", filter);
            }
        });
        filter();
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var bgs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-bg]"));
        var imgs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-img]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!bgs.length) {
            return;
        }
        var index = 0;
        var show = function (next) {
            index = (next + bgs.length) % bgs.length;
            bgs.forEach(function (item, i) {
                item.classList.toggle("is-active", i === index);
            });
            imgs.forEach(function (item, i) {
                item.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (item, i) {
                item.classList.toggle("is-active", i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play]");
        var stream = shell.getAttribute("data-stream");
        var loaded = false;
        var hlsInstance = null;
        var start = function () {
            if (!video || !stream) {
                return;
            }
            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                loaded = true;
            }
            shell.classList.add("is-playing");
            video.play().catch(function () {});
        };
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }
        shell.addEventListener("click", function (event) {
            if (event.target === video) {
                return;
            }
            start();
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
})();
