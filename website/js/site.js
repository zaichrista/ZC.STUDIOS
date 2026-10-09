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
        if (en.isIntersecting) en.target.classList.add('in');
        else if (en.intersectionRect.height === 0 && document.documentElement.classList.contains('scenes')) en.target.classList.remove('in');
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


/* ---------- scenes: one gesture = one scene, same feel as the home page ----------
   Desktop with a mouse or trackpad only. Phones, reduced-motion and no-JS get normal scrolling.
   A scene taller than the screen scrolls inside itself first, then the next gesture moves on. */
(function () {
  var d = document, root = d.documentElement;
  var main = d.getElementById('main');
  if (!main || d.body.hasAttribute('data-plain')) return;
  var scenes = [].slice.call(main.children).filter(function (s) { return s.tagName === 'SECTION'; });
  if (scenes.length < 2) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var enabled = false;
  if (reduce || !fine) return;

  var rail = d.createElement('div'); rail.className = 'rail'; d.body.insertBefore(rail, d.body.firstChild);
  var idx = 0, busy = false, armed = true, lastWheel = 0;
  var vh = function () { return innerHeight; };
  var docH = function () { return Math.max(d.body.scrollHeight, root.scrollHeight); };
  var last = scenes.length - 1;
  // a scene runs from its own top to the next one's top; the last one runs to the bottom of the page, so the footer is reached by one more scroll
  var top = function (i) { return scenes[i].offsetTop; };
  var bottom = function (i) { return i === last ? docH() : scenes[i + 1].offsetTop; };
  var ease = function (t) { return t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  function paint() {
    var y = scrollY, probe = y + 30, under = scenes[0];
    scenes.forEach(function (s) { if (s.offsetTop <= probe) under = s; });
    rail.style.transform = 'scaleX(' + clamp(y / Math.max(1, docH() - vh()), 0, 1) + ')';
    rail.style.background = under.classList.contains('dark') ? '#F6F5F3' : '#0C0B09';
    if (!busy) { var k = scenes.indexOf(under); if (k > -1) idx = k; }
  }

  function go(i, toBottom) {
    i = clamp(i, 0, last);
    if (busy) return;
    var from = scrollY, to = toBottom ? Math.max(top(i), bottom(i) - vh()) : top(i);
    to = clamp(to, 0, Math.max(0, docH() - vh()));
    idx = i;
    if (from === to) return;
    busy = true;
    var t0 = performance.now(), dur = 1100;
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      scrollTo(0, from + (to - from) * ease(p));
      paint();
      if (p < 1) return requestAnimationFrame(step);
      setTimeout(function () { busy = false; paint(); }, 120);
    })(t0);
  }

  // move inside a tall scene, or hand over to the next / previous one at its edge
  function nudge(dy, isGesture) {
    var y = scrollY, t = top(idx), b = bottom(idx), v = vh();
    if (dy > 0) {
      if (y + v < b - 2) { var ny = Math.min(y + dy, b - v); scrollTo(0, ny); if (ny >= b - v - 2) armed = false; paint(); return; }
      if (isGesture && idx < last) go(idx + 1);
    } else {
      if (y > t + 2) { var py = Math.max(y + dy, t); scrollTo(0, py); if (py <= t + 2) armed = false; paint(); return; }
      if (isGesture && idx > 0) go(idx - 1, true);
    }
  }

  function on() {
    if (enabled) return; enabled = true;
    root.classList.add('scenes'); idx = 0; paint();
  }

  addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    e.preventDefault();
    var now = performance.now(), gap = now - lastWheel; lastWheel = now;
    if (gap > 90 && !busy) armed = true;
    if (busy || Math.abs(e.deltaY) < 1) return;
    var dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    var y = scrollY, t = top(idx), b = bottom(idx), v = vh();
    var inside = dy > 0 ? y + v < b - 2 : y > t + 2;
    if (inside) { nudge(dy, false); return; }       // free scrolling inside a tall scene
    if (!armed || Math.abs(dy) < 4) return;         // at an edge: only a fresh gesture moves on
    armed = false; nudge(dy, true);
  }, { passive: false });

  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (e.key === ' ' && /^(A|BUTTON|SUMMARY)$/.test(tag))) return;
    var k = e.key, step = 90;
    if (k === 'ArrowDown') { e.preventDefault(); nudge(step, true); }
    else if (k === 'ArrowUp') { e.preventDefault(); nudge(-step, true); }
    else if (k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); nudge(vh() * .85, true); }
    else if (k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); nudge(-vh() * .85, true); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(last, true); }
  });

  // anchor links to a section jump to its scene
  [].slice.call(d.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = d.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
      var s = scenes.filter(function (s) { return s === el || s.contains(el); })[0]; if (!s) return;
      e.preventDefault(); busy = false; go(scenes.indexOf(s));
    });
  });
  // keyboard focus: bring the focused element into view
  addEventListener('focusin', function (e) {
    if (!enabled || busy) return;
    var r = e.target.getBoundingClientRect();
    if (r.top < 0 || r.bottom > vh()) { scrollTo(0, scrollY + r.top - vh() / 3); paint(); }
  });
  addEventListener('resize', function () { scrollTo(0, top(idx)); paint(); });
  addEventListener('scroll', function () { if (!busy) paint(); }, { passive: true });

  on();
  scrollTo(0, 0); paint();
  var h = location.hash && d.getElementById(location.hash.slice(1));
  if (h) { var s = scenes.filter(function (s) { return s === h || s.contains(h); })[0]; if (s) scrollTo(0, top(scenes.indexOf(s))); paint(); }
})();
