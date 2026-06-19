(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilterAndSort() {
    var list = qs('[data-filter-list]');

    if (!list) {
      return;
    }

    var input = qs('[data-filter-input]');
    var select = qs('[data-sort-select]');
    var counter = qs('[data-result-counter]');
    var originalItems = qsa('.filter-item', list);

    function updateCounter(visibleCount) {
      if (counter) {
        counter.textContent = '共 ' + visibleCount + ' 部影片';
      }
    }

    function sortItems(items) {
      var mode = select ? select.value : 'default';
      var sorted = items.slice();

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }

      if (mode === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      }

      if (mode === 'hot-desc') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
        });
      }

      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
        });
      }

      if (mode === 'default') {
        sorted = originalItems.slice();
      }

      sorted.forEach(function (item) {
        list.appendChild(item);
      });
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var visibleCount = 0;
      var items = qsa('.filter-item', list);

      items.forEach(function (item) {
        var haystack = normalize(item.dataset.search + ' ' + item.dataset.title + ' ' + item.textContent);
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        item.classList.toggle('is-hidden-by-filter', !visible);

        if (visible) {
          visibleCount += 1;
        }
      });

      updateCounter(visibleCount);
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input.hasAttribute('data-query-input')) {
        input.value = query;
      }

      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', function () {
        sortItems(qsa('.filter-item', list));
        apply();
      });
    }

    sortItems(originalItems);
    apply();
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);

        if (input && !input.value.trim()) {
          event.preventDefault();
          input.focus();
        }
      });
    });
  }

  function setupPlayer() {
    var player = qs('[data-video-url]');

    if (!player) {
      return;
    }

    var video = qs('video', player);
    var button = qs('[data-play-button]', player);
    var source = player.getAttribute('data-video-url');

    if (!video || !button || !source) {
      return;
    }

    function start() {
      button.classList.add('is-hidden');

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            video.setAttribute('data-error', '视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', start);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupFilterAndSort();
    setupPlayer();
  });
})();
