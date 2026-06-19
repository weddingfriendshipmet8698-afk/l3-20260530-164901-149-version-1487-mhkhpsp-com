(function() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const regionFilter = document.querySelector('[data-region-filter]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const region = regionFilter ? regionFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';

    cards.forEach(function(card) {
      const text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre].join(' ').toLowerCase();
      const matchQuery = !query || text.indexOf(query) !== -1;
      const matchRegion = !region || (card.dataset.region || '').indexOf(region) !== -1;
      const matchYear = !year || (card.dataset.year || '').indexOf(year) !== -1;
      card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchYear));
    });
  }

  [filterInput, regionFilter, yearFilter].forEach(function(control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
}());
