
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    var queryInput = document.querySelector(".card-filter");
    var yearSelect = document.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var runFilter = function () {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var matchText = !query || text.indexOf(query) !== -1;
        var matchYear = !year || card.dataset.year === year;
        card.classList.toggle("hidden-card", !(matchText && matchYear));
      });
    };
    if (queryInput) {
      queryInput.addEventListener("input", runFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", runFilter);
    }

    var backTop = document.querySelector(".back-top");
    if (backTop) {
      var watchScroll = function () {
        backTop.classList.toggle("show", window.scrollY > 420);
      };
      window.addEventListener("scroll", watchScroll);
      watchScroll();
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();

function initMoviePlayer(videoId, layerId, sourceUrl) {
  var video = document.getElementById(videoId);
  var layer = document.getElementById(layerId);
  var started = false;

  if (!video || !layer || !sourceUrl) {
    return;
  }

  function start() {
    layer.classList.add("is-hidden");

    if (started) {
      video.play();
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      return;
    }

    video.src = sourceUrl;
    video.play();
  }

  layer.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
