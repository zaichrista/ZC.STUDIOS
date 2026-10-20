/* ZC Studios: tiny enhancements only. The site is fully readable without this file. */
(function () {
  var d = document;

  // gentle reveal on scroll (held until the loading screen has finished)
  var els = [].slice.call(d.querySelectorAll('.rv'));
  (window.zcWhenReady || function (f) { f(); })(function () {
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      els.forEach(function (e) { io.observe(e); });
    }
  });

  // fit the big wordmark edge to edge (home page only)
  var m = d.querySelector('.mark');
  function fit() {
    if (!m) return;
    var gut = parseFloat(getComputedStyle(m).left) || 0;
    var avail = d.documentElement.clientWidth - gut * 2;
    m.style.fontSize = '100px';
    var w = m.getBoundingClientRect().width;
    if (w > 0) m.style.fontSize = (100 * avail / w) + 'px';
  }
  if (m) {
    fit();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
  }
})();

// about page: headline and byline drift gently against the pointer
(function () {
  var t = document.querySelector('.a-think'), b = document.querySelector('.a-by'), bio = document.querySelector('.a-bio');
  if (!t || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches) return;
  var raf;
  document.addEventListener('pointermove', function (e) {
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      t.style.transform = 'translate(' + (x * -14) + 'px,' + (y * -10) + 'px)';
      b.style.translate = (x * 18) + 'px -50%';
      bio.style.translate = (x * 8) + 'px ' + (y * 6) + 'px';
    });
  });
})();
