(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- split text ---- */
  const mark = $('#mark');
  mark.innerHTML = [...'ZC Studios'].map((c, i) =>
    c === ' ' ? ' ' : `<span style="--i:${i}">${c}</span>`).join('');
  const tag = $('#tag');
  tag.innerHTML = tag.textContent.split(' ').map((w, i) => `<span class="w"><i style="--i:${i}">${w}</i></span>`).join(' ');
  $('#cases').innerHTML = [...'cases'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');
  const bio = $('#bio');
  bio.innerHTML = bio.textContent.split(' ').map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
  const line = $('#line');
  [...line.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) f.append(' ');
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; f.append(s); }
      });
      n.replaceWith(f);
    }
  });
  const words = $$('.w', line), bigW = $('.w.big', line), bigIdx = words.indexOf(bigW);

  /* ---- hero wordmark: full-bleed width, stretched tall like the artboard ---- */
  function fitMark() {
    mark.style.fontSize = '100px';
    mark.style.setProperty('--sy', 1);
    const fs = innerWidth / mark.scrollWidth * 100;
    mark.style.fontSize = fs + 'px';
    // artboard stretch is 1.9x; cap it so the ink stays under 45.5% of the screen height
    // and the wordmark can never climb into the pill or tagline on short/wide windows
    const sy = clamp(.455 * innerHeight / (.72 * fs), 1, 1.9);
    mark.style.setProperty('--sy', sy);

    // "Let's talk" sits centred in the gap between the tagline and the top of the wordmark
    // (offset-based, so it is correct even when measured while scrolled to another scene)
    const pill = $('#hero .pill'), tagBottom = tag.offsetTop + tag.offsetHeight, inkTop = innerHeight - .72 * fs * sy;
    pill.style.top = Math.max(tagBottom, (tagBottom + inkTop) / 2 - pill.offsetHeight / 2) + 'px';
  }

  /* ---- scenes: one gesture = one scene ---- */
  const tracks = { hero: $('#hero'), big: $('#big'), what: $('#what'), work: $('#work'), about: $('#about'), talk: $('#talk') };
  const order = ['hero', 'big', 'what', 'work', 'about', 'talk'];
  const scenes = order.map(k => tracks[k]);
  const rail = $('#rail');
  const casesEl = $('#cases'), navEl = $('.nav');
  const anim = { big: 0, work: 0 };         // time-driven scene animations (0 → 1)
  const tw = {};                            // running tweens for the above
  let idx = 0, busy = false, scrolling = false, running = false;

  const ease = {
    inOut: t => t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
    sine:  t => -(Math.cos(Math.PI * t) - 1) / 2,
    out:   t => 1 - Math.pow(1 - t, 3),
  };

  function draw() {
    const vh = innerHeight, mobile = innerWidth <= 720, y = scrollY;
    // nav + progress rail take the opposite colour of whichever scene sits under them
    const under = scenes.findLast(t => t.offsetTop <= y + 30) || scenes[0], navCol = under.classList.contains('dark') ? 'var(--paper)' : 'var(--ink)';
    navEl.style.color = navCol; rail.style.background = navCol;
    rail.style.transform = `scaleX(${y / (scenes[5].offsetTop || 1)})`;

    // hero: wordmark rises and tagline drifts as you leave
    const h = clamp(y / vh);
    mark.style.setProperty('--mark-y', (h * -18) + '%');
    tag.style.transform = `translateY(${h * -6}vh)`;
    tag.style.opacity = 1 - h * 1.2;

    // big line: each word fades up in turn, then "big" swells and settles back
    const lit = anim.big * 1.5 * words.length;
    words.forEach((w, i) => { w.style.opacity = reduce ? 1 : (.12 + .88 * clamp(lit - i)).toFixed(3); });
    const t0 = (bigIdx + 1) / (1.5 * words.length);   // the moment "big" turns fully black
    const q = clamp((anim.big - t0) / (1 - t0));
    const s = reduce ? 1 : 1 + ((mobile ? .5 : 1.35) * Math.sin(Math.PI * q));
    bigW.style.setProperty('--m', ((s - 1) * bigW.offsetWidth / 2).toFixed(2) + 'px');
    bigW.style.transform = s === 1 ? '' : `scale(${s.toFixed(4)})`;

    // cases: slow push-in once you've landed, never wider than the screen
    const sMax = Math.min(1.5, .9 * innerWidth / (casesEl.offsetWidth || 1));
    casesEl.style.setProperty('--s', (1 + (sMax - 1) * anim.work).toFixed(4));
  }

  function render(now) {
    let active = scrolling;
    for (const k in tw) {
      const t = tw[k], p = clamp((now - t.t0 - t.delay) / t.dur);
      anim[k] = t.from + (t.to - t.from) * t.ease(reduce ? 1 : p);
      if (p >= 1 || reduce) { anim[k] = t.to; delete tw[k]; } else active = true;
    }
    draw();
    if (active) requestAnimationFrame(render); else running = false;
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(render); } };
  const play = (k, from, to, dur, delay, e) => { anim[k] = from; tw[k] = { from, to, dur, delay, ease: e, t0: performance.now() }; kick(); };

  /* what each scene does when you land on it */
  function enter(i) {
    if (order[i] !== 'work') closeCase();
    if (order[i] === 'big') play('big', 0, 1, 3000, 500, ease.sine);
    if (order[i] === 'work') play('work', 0, 1, 6000, 700, ease.out);
  }

  const setNav = i => $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === order[i]));
  const TOP = i => scenes[i].offsetTop;

  function go(i, instant) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    if (busy && !instant) return;
    const from = scrollY, to = TOP(i), moved = i !== idx;
    idx = i; setNav(i);
    if (moved) enter(i);
    if (instant || reduce || from === to) { scrollTo(0, to); kick(); return; }
    busy = scrolling = true;
    const dur = 1100, t0 = performance.now();
    (function step(now) {
      const p = clamp((now - t0) / dur);
      scrollTo(0, from + (to - from) * ease.inOut(p));
      if (p < 1) return requestAnimationFrame(step);
      scrolling = false; setTimeout(() => { busy = false; }, 120);
      kick();
    })(t0);
    kick();
  }

  /* input: wheel / trackpad */
  let lastWheel = 0, armed = true;
  addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey) return;                                   // pinch-zoom
    const now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    if (gap > 90 && !busy) armed = true;                     // a pause (after landing) means a new gesture
    if (busy || !armed || Math.abs(e.deltaY) < 4) return;    // ignore the tail of the last one
    armed = false;
    go(idx + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  /* input: touch swipe */
  let ty = null;
  addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  addEventListener('touchend', e => {
    if (ty == null) return;
    const dy = ty - e.changedTouches[0].clientY; ty = null;
    if (Math.abs(dy) > 45) go(idx + (dy > 0 ? 1 : -1));
  }, { passive: true });

  /* input: keyboard */
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowDown', 'PageDown'].includes(k) || (k === ' ' && !e.shiftKey)) { e.preventDefault(); go(idx + 1); }
    else if (['ArrowUp', 'PageUp'].includes(k) || (k === ' ' && e.shiftKey)) { e.preventDefault(); go(idx - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(scenes.length - 1); }
  });

  /* nav links and pills jump to their scene */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const i = order.indexOf(a.getAttribute('href').slice(1));
    if (i < 0) return;
    e.preventDefault();
    if (i === idx) return;
    busy = false; go(i);
  }));

  addEventListener('resize', () => { fitMark(); go(idx, true); });

  /* scene entrances: replay every time you land */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.intersectionRatio >= .35) e.target.classList.add('in');
    else if (e.intersectionRatio === 0) e.target.classList.remove('in');
  }), { threshold: [0, .35] });
  ['what', 'work', 'about', 'talk'].forEach(k => io.observe(tracks[k]));

  /* ---- magnetic pills / links ---- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('[data-magnet]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  /* ---- cases: float around the headline, click to open the write-up ---- */
  // case-study copy lives in data/cases.json (edit it there)
  let CASES = {};
  fetch('data/cases.json').then(r => r.json()).then(d => { CASES = d; }).catch(() => {});
  const work = tracks.work, copy = $('#copy'), cards = $$('#work .case');
  function openCase(k) {
    const c = CASES[k];
    if (!c) return;
    cards.forEach(el => el.classList.toggle('sel', el.dataset.case === k));
    copy.innerHTML = `<h3>${c.name}</h3><p class="kind">${c.kind}</p><dl>${c.rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl><button class="close" type="button">← back</button>`;
    $('.close', copy).addEventListener('click', closeCase);
    work.dataset.sel = k;
    work.classList.add('open');
  }
  function closeCase() { work.classList.remove('open'); cards.forEach(el => el.classList.remove('sel')); }
  cards.forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    if (el.classList.contains('sel')) return;
    openCase(el.dataset.case);
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });
  // same magnetic hover as the pills (not on the big, open card)
  if (!reduce && matchMedia('(hover:hover)').matches) {
    cards.forEach(el => {
      const m = $('.mag', el);
      el.addEventListener('pointermove', e => {
        if (el.classList.contains('sel')) return;
        const r = el.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => m.style.transform = '');
    });
  }

  /* ---- go ---- */
  const start = () => { fitMark(); idx = Math.round(scrollY / innerHeight); setNav(idx); go(idx, true); draw(); requestAnimationFrame(() => document.body.classList.add("loaded")); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  // if the kit is slow, don't hold the page hostage
  setTimeout(() => { if (!document.body.classList.contains('loaded')) start(); }, 2500);
  document.fonts && document.fonts.load('800 100px "sets-grotesk-l"').then(() => { fitMark(); draw(); });
})();
