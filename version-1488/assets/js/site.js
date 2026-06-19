(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-arrow.prev');
    var next = hero.querySelector('.hero-arrow.next');
    var index = 0;
    var show = function (nextIndex) {
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
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));
  if (lists.length) {
    var queryInput = document.querySelector('.local-filter');
    var yearSelect = document.querySelector('.year-filter');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (queryInput && initial) {
      queryInput.value = initial;
    }
    var applyFilter = function () {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var y = yearSelect ? yearSelect.value : '';
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.children).forEach(function (item) {
          var haystack = [item.getAttribute('data-title'), item.getAttribute('data-tags'), item.getAttribute('data-region'), item.getAttribute('data-year')].join(' ').toLowerCase();
          var okQuery = !q || haystack.indexOf(q) !== -1;
          var okYear = !y || item.getAttribute('data-year') === y;
          item.classList.toggle('is-hidden-card', !(okQuery && okYear));
        });
      });
    };
    if (queryInput) {
      queryInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var video = box.querySelector('video[data-stream]');
    var button = box.querySelector('.player-start');
    var cover = box.querySelector('.player-cover');
    var hlsInstance = null;
    var ready = false;
    var attach = function () {
      if (!video || ready) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('controls', 'controls');
      ready = true;
    };
    var play = function () {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
