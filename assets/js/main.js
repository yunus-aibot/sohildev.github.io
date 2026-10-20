/* =========================================================
   Sohil Mansuri — Portfolio
   main.js : UI interactions
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     PRELOADER
     ========================================================= */
  const preloader = $('#preloader');
  const pBar     = $('#preloaderBar');
  const pStatus  = $('#preloaderStatus');

  const STAGES = [
    'Initializing 3D engine',
    'Compiling shaders',
    'Loading geometry',
    'Wiring interactions',
    'Ready'
  ];

  function runPreloader(done) {
    if (!preloader) { done(); return; }
    let pct = 0, stage = 0;

    const tick = () => {
      pct += Math.random() * 13 + 4;
      if (pct >= 100) pct = 100;
      if (pBar) pBar.style.width = pct + '%';

      const s = Math.min(STAGES.length - 1, Math.floor(pct / 21));
      if (s !== stage && pStatus) { stage = s; pStatus.textContent = STAGES[s]; }

      if (pct >= 100) {
        setTimeout(() => {
          preloader.classList.add('is-done');
          document.body.classList.remove('is-locked');
          document.body.style.removeProperty('overflow');
          setTimeout(() => { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 800);
          done();
        }, 260);
        return;
      }
      setTimeout(tick, 130 + Math.random() * 120);
    };

    document.body.classList.add('is-locked');
    document.body.style.overflow = 'hidden';
    setTimeout(tick, 220);
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  function initCursor() {
    if (reduced) return;
    const cur = $('#cursor');
    if (!cur) return;
    const dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur);
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      if (!cur.classList.contains('is-live')) cur.classList.add('is-live');
    }, { passive:true });
    window.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    window.addEventListener('pointerup',   () => cur.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => cur.classList.remove('is-live'));
    document.addEventListener('mouseenter', () => cur.classList.add('is-live'));

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hoverSel = 'a, button, [data-cursor="hover"], .tag-list li, .skill-card, .work-card, .clink';
    document.addEventListener('pointerover', e => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      if (t.dataset.cursor === 'view') cur.classList.add('is-view');
      else cur.classList.add('is-hover');
    });
    document.addEventListener('pointerout', e => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      if (t.dataset.cursor === 'view') cur.classList.remove('is-view');
      else cur.classList.remove('is-hover');
    });
  }

  /* =========================================================
     HEADER + SCROLL PROGRESS + ACTIVE NAV
     ========================================================= */
  function initHeader() {
    const header = $('#header');
    const bar    = $('#scrollProgress');
    const nav    = $('#nav');
    const toggle = $('#navToggle');
    const links  = $$('.nav__link');
    const secs   = ['home','about','skills','experience','projects','contact']
                    .map(id => document.getElementById(id)).filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-stuck', y > 40);

      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

      // active section
      const mid = y + window.innerHeight * 0.4;
      let current = secs[0];
      for (const s of secs) {
        if (s.offsetTop <= mid) current = s;
      }
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current.id));

      // to-top
      const top = $('#toTop');
      if (top) top.classList.toggle('is-visible', y > 700);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { onScroll(); ticking = false; });
    }, { passive:true });
    onScroll();

    if (toggle && nav) {
      const scrim = $('#navScrim');
      const setMenu = open => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
        if (scrim) scrim.classList.toggle('is-open', open);
        const use = $('use', toggle);
        if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
      };
      toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
      nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
      if (scrim) scrim.addEventListener('click', () => setMenu(false));
      window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    }

    // smooth scroll
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    const topBtn = $('#toTop');
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top:0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }
  }

  /* =========================================================
     REVEAL ON SCROLL
     ========================================================= */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(i => i.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
  }

  /* =========================================================
     COUNTERS
     ========================================================= */
  function initCounters() {
    const els = $$('.count');
    if (!els.length) return;
    const run = el => {
      const to = parseFloat(el.dataset.to || '0');
      const dur = 1500;
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased) + (to > 10 ? '+' : '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  }

  /* =========================================================
     TYPING EFFECT
     ========================================================= */
  function initTyping() {
    const el = $('#typed');
    if (!el) return;
    const roles = [
      'Senior Full Stack Engineer',
      'Software Analyst',
      'Tech Lead',
      'MERN / MEAN Stack Developer',
      'Cloud & AI Integration Engineer'
    ];
    if (reduced) { el.textContent = roles[0]; return; }

    let r = 0, i = 0, deleting = false;
    const type = () => {
      const word = roles[r];
      el.textContent = word.slice(0, i);
      let wait = deleting ? 45 : 85;
      if (!deleting && i === word.length) {
        deleting = true; wait = 1900;
      } else if (deleting && i === 0) {
        deleting = false; r = (r + 1) % roles.length; wait = 320;
      } else {
        i += deleting ? -1 : 1;
      }
      setTimeout(type, wait);
    };
    type();
  }

  /* =========================================================
     3D TILT CARDS
     ========================================================= */
  function initTilt() {
    if (reduced) return;
    $$('[data-tilt]').forEach(el => {
      let raf = null;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rx = (0.5 - py) * 9;
          const ry = (px - 0.5) * 11;
          el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
          el.style.setProperty('--mx', (px * 100) + '%');
          el.style.setProperty('--my', (py * 100) + '%');
        });
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* =========================================================
     MAGNETIC BUTTONS
     ========================================================= */
  function initMagnetic() {
    if (reduced || !window.matchMedia('(hover:hover)').matches) return;
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* =========================================================
     CONTACT FORM
     ========================================================= */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const note = $('#formNote');

    const fields = [
      { el:$('#name'),    test:v => v.trim().length >= 2 },
      { el:$('#email'),   test:v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
      { el:$('#message'), test:v => v.trim().length >= 10 }
    ];

    fields.forEach(f => {
      if (!f.el) return;
      f.el.addEventListener('blur', () => {
        const ok = f.test(f.el.value);
        f.el.closest('.field').classList.toggle('has-error', !ok && f.el.value !== '');
      });
      f.el.addEventListener('input', () => {
        f.el.closest('.field').classList.remove('has-error');
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      fields.forEach(f => {
        if (!f.el) return;
        const ok = f.test(f.el.value);
        f.el.closest('.field').classList.toggle('has-error', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        if (note) { note.textContent = 'Please fix the highlighted fields.'; note.className = 'form__note err'; }
        return;
      }

      const name    = $('#name').value.trim();
      const email   = $('#email').value.trim();
      const subject = ($('#subject') && $('#subject').value.trim()) || 'Project enquiry';
      const message = $('#message').value.trim();

      const body = `${message}\n\n—\nFrom: ${name}\nEmail: ${email}`;
      const href = `mailto:lislife462@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.querySelector('span') : null;
      if (label) label.textContent = 'Opening your mail app…';
      if (btn) btn.disabled = true;

      window.location.href = href;

      setTimeout(() => {
        if (label) label.textContent = 'Send message';
        if (btn) btn.disabled = false;
        if (note) {
          note.textContent = 'Your mail app should be open — if not, email me directly at lislife462@gmail.com.';
          note.className = 'form__note ok';
        }
        form.reset();
      }, 1200);
    });
  }

  /* =========================================================
     MARQUEE — duplicate content for a seamless loop
     ========================================================= */
  function initMarquee() {
    const track = $('.marquee__track');
    if (!track) return;
    const kids = Array.from(track.children);
    if (!kids.length) return;
    kids.forEach(k => track.appendChild(k.cloneNode(true)));
  }

  /* =========================================================
     MISC
     ========================================================= */
  function initMisc() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    // subtle parallax on hero portrait chips
    if (!reduced) {
      window.addEventListener('pointermove', e => {
        const nx = (e.clientX / window.innerWidth - 0.5);
        const ny = (e.clientY / window.innerHeight - 0.5);
        const glow = $('.hero__glow');
        if (glow) glow.style.transform = `translate(${nx * -40}px, ${ny * -30}px)`;
      }, { passive:true });
    }
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    initCursor();
    initHeader();
    initReveal();
    initCounters();
    initTyping();
    initTilt();
    initMagnetic();
    initForm();
    initMarquee();
    initMisc();

    runPreloader(() => {
      if (window.__threeReady) { try { window.__threeReady(); } catch (e) {} }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
