(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var yearNodes = document.querySelectorAll("[data-year]");
        yearNodes.forEach(function (node) {
            node.textContent = new Date().getFullYear();
        });

        var menuToggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (menuToggle && menu) {
            menuToggle.addEventListener("click", function () {
                menu.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function play() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    play();
                });
            });

            if (slides.length > 1) {
                play();
            }
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
        var yearFilter = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInputs.map(function (input) {
                return input.value;
            }).join(" "));
            var year = yearFilter ? yearFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardYear = card.getAttribute("data-year") || "";
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var yearMatch = !year || cardYear === year;
                var show = keywordMatch && yearMatch;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });

        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilters);
        }
    });
})();
