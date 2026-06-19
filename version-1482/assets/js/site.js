(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        var next = function () {
            if (slides.length > 0) {
                activate((current + 1) % slides.length);
            }
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(next, 5000);
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                activate(index);
                restart();
            });
        });

        restart();
    }

    var normalize = function (value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    };

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    var filters = Array.prototype.slice.call(document.querySelectorAll(".site-filter"));

    var applyFilter = function () {
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(" "));
        var selected = filters.length > 0 ? filters[0].value : "";
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-title"));
            var type = card.getAttribute("data-type") || "";
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesType = !selected || type.indexOf(selected) !== -1;
            card.classList.toggle("is-hidden-card", !(matchesQuery && matchesType));
        });
    };

    searchInputs.forEach(function (input) {
        input.addEventListener("input", applyFilter);
    });

    filters.forEach(function (select) {
        select.addEventListener("change", applyFilter);
    });
})();
