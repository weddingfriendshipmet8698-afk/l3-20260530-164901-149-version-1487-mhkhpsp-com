(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  const filterBoxes = Array.from(document.querySelectorAll("[data-filter-box]"));
  filterBoxes.forEach(function (box) {
    const scope = box.closest("section") || document;
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const input = box.querySelector("[data-filter-input]");
    const year = box.querySelector("[data-filter-year]");
    const type = box.querySelector("[data-filter-type]");
    const empty = scope.querySelector("[data-empty-state]");

    const valueOf = function (node) {
      return node ? node.value.trim().toLowerCase() : "";
    };

    const apply = function () {
      const query = valueOf(input);
      const selectedYear = valueOf(year);
      const selectedType = valueOf(type);
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchYear = !selectedYear || String(card.getAttribute("data-year")) === selectedYear;
        const matchType = !selectedType || String(card.getAttribute("data-type")).toLowerCase() === selectedType;
        const shouldShow = matchQuery && matchYear && matchType;

        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });

  window.startMoviePlayer = function (source) {
    const video = document.querySelector(".movie-video");
    const overlay = document.querySelector(".player-overlay");
    const message = document.querySelector("[data-player-message]");
    let mounted = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    const setMessage = function (text) {
      if (message) {
        message.textContent = text || "";
      }
    };

    const hideOverlay = function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    };

    const play = function () {
      hideOverlay();
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.setAttribute("controls", "controls");
        });
      }
    };

    const mount = function () {
      if (mounted) {
        play();
        return;
      }

      mounted = true;
      setMessage("");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", play, { once: true });
        video.load();
        play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, play);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("视频暂时无法播放");
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
        return;
      }

      setMessage("视频暂时无法播放");
    };

    if (overlay) {
      overlay.addEventListener("click", mount);
    }

    video.addEventListener("click", function () {
      if (!mounted || video.paused) {
        mount();
      }
    });

    video.addEventListener("play", hideOverlay);
  };
})();
