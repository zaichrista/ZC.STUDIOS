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

  /* ---- page chrome: nav + progress rail take the opposite colour of whichever section sits under them ---- */
  const sections = $$('main > section');
  const rail = $('#rail'), navEl = $('.nav');
  const anim = { big: 0 };                  // time-driven animation of the big line (0 → 1)
  const tw = {};                            // running tweens for the above
  let running = false;

  const ease = { sine: t => -(Math.cos(Math.PI * t) - 1) / 2 };

  function draw() {
    const vh = innerHeight, mobile = innerWidth <= 720, y = scrollY;
    const under = sections.findLast(t => t.offsetTop <= y + 30) || sections[0];
    const navCol = under.classList.contains('dark') ? 'var(--paper)' : 'var(--ink)';
    navEl.style.color = navCol; rail.style.background = navCol;
    // transparent over the hero; a solid bar in the colour of the section beneath it everywhere else, so it never collides with content
    navEl.style.background = under === sections[0] ? 'transparent' : (under.classList.contains('dark') ? 'var(--ink)' : 'var(--paper)');
    rail.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - vh || 1))})`;
    $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === under.id));

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
  }

  function render(now) {
    let active = false;
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

  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { fitMark(); draw(); });

  /* the big line plays each time you land on it; every later section fades up once */
  new IntersectionObserver(es => es.forEach(e => {
    if (e.intersectionRatio >= .5) play('big', 0, 1, 3000, 500, ease.sine);
  }), { threshold: [.5] }).observe($('#big'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.hm').forEach(s => io.observe(s));

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

  /* ---- smooth jump to in-page sections ---- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.offsetTop, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---- go ---- */
  const start = () => { fitMark(); draw(); requestAnimationFrame(() => document.body.classList.add("loaded")); };
  // the loading screen (inline in <head>) releases the intro animation once fonts have loaded
  (window.zcWhenReady || (f => f()))(start);
  document.fonts && document.fonts.load('800 100px "sets-grotesk-l"').then(() => { fitMark(); draw(); });
})();
