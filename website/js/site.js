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

/* Enquiry form: posts to a Google Apps Script web app that appends a row to a Google Sheet.
   Set ENDPOINT (see google-sheet-form/README.md). Until it is set, the form falls back to opening an email. */
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxhOoga5SFeJAe2VOA0OH-aTdtAnT5lmhfGKIU4wnrjQETEGqD4zWZIHzb0b8X81A2VqQ/exec';
  var f = document.getElementById('enquiry');
  if (!f) return;
  var status = f.querySelector('.enq-status'), btn = f.querySelector('button');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var data = new FormData(f);
    if (data.get('company')) return; // honeypot
    if (!ENDPOINT) {
      var body = ['Name: ', 'Email: ', 'Venue: ', 'Website: ', 'Service: ', ''].map(function (l, i) {
        return i < 5 ? l + data.get(['name', 'email', 'venue', 'website', 'service'][i]) : '';
      }).join('\n') + '\n' + data.get('message');
      location.href = 'mailto:zairachristastudios@gmail.com?subject=' + encodeURIComponent('Enquiry: ' + data.get('service')) + '&body=' + encodeURIComponent(body);
      return;
    }
    btn.disabled = true; status.textContent = 'Sending…';
    fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error();
        f.reset(); status.textContent = 'Thank you. We will reply personally.';
      })
      .catch(function () { status.textContent = 'Something went wrong. Please email zairachristastudios@gmail.com instead.'; })
      .then(function () { btn.disabled = false; });
  });
})();
