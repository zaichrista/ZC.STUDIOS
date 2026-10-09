/* ZC Studios: tiny enhancements only. The site is fully readable without this file. */
(function () {
  var d = document;

  // gentle reveal on scroll
  var els = [].slice.call(d.querySelectorAll('.rv'));
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
