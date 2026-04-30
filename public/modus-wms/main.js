/* ── Modus WMS — main.js ── */

gsap.registerPlugin(ScrollTrigger);

/* ─────────────── i18n ─────────────── */

function applyLang(lang) {
  const strings = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key] !== undefined) el.textContent = strings[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (strings[key] !== undefined) el.innerHTML = strings[key];
  });
  document.documentElement.lang = lang;

  ['btn-en', 'btn-hr', 'btn-en-footer', 'btn-hr-footer'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle('active', btn.id.includes(lang));
  });
}

function setLang(lang) {
  localStorage.setItem('mw-lang', lang);
  applyLang(lang);
}

function initLang() {
  const saved = localStorage.getItem('mw-lang');
  if (saved) { applyLang(saved); return; }
  const browser = (navigator.language || 'en').toLowerCase();
  applyLang(browser.startsWith('hr') ? 'hr' : 'en');
}

window.setLang = setLang;
initLang();

/* ─────────────── Nav scroll effect ─────────────── */

const nav = document.getElementById('mw-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─────────────── Reduced motion guard ─────────────── */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // Reveal all initially-hidden elements at their final state
  document.querySelectorAll(
    '.mw-pitch-bullet, .mw-step__num, .mw-step__title, .mw-step__body, ' +
    '.mw-source-tile, .mw-feature-tile, #new-order-row, #pick-card, #barcode-box'
  ).forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  // Prefill address lines
  document.getElementById('addr-line-1').textContent = 'Ante Starčevića 12';
  document.getElementById('addr-line-2').textContent = '44000 Sisak';
  document.getElementById('addr-line-3').textContent = 'Hrvatska';
  // Show pick card at final state
  const pickCard = document.getElementById('pick-card');
  if (pickCard) pickCard.classList.add('picked');
  // Source tiles — mark all active
  ['src-erp', 'src-webshop', 'src-custom'].forEach(id => {
    document.getElementById(id)?.classList.add('active');
  });
  // Step indicator dots
  const indicator = document.getElementById('mw-step-indicator');
  if (indicator) indicator.classList.add('visible');
} else {
  initAnimations();
}

/* ─────────────── Hero parallax specks ─────────────── */

function initHeroParallax() {
  const specks = document.querySelectorAll('.mw-speck');
  specks.forEach((speck, i) => {
    const speed = 0.03 + i * 0.012;
    gsap.to(speck, {
      y: () => window.scrollY * speed * (i % 2 === 0 ? -1 : 1),
      ease: 'none',
      scrollTrigger: { trigger: '.mw-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });
}

/* ─────────────── Pitch bullets ─────────────── */

function initPitch() {
  gsap.from(['#pb1', '#pb2', '#pb3'], {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.mw-pitch__bullets', start: 'top 80%' }
  });
}

/* ─────────────── Step copy reveal (shared) ─────────────── */

function revealStepCopy(step) {
  const num   = step.querySelector('.mw-step__num');
  const title = step.querySelector('.mw-step__title');
  const body  = step.querySelector('.mw-step__body');
  const tl = gsap.timeline({
    scrollTrigger: { trigger: step, start: 'top 70%' }
  });
  tl.to(num,   { opacity: 1, duration: 0.4, ease: 'power2.out' })
    .to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to(body,  { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  return tl;
}

/* ─────────────── Step indicator dots ─────────────── */

const indicator = document.getElementById('mw-step-indicator');
const dots = Array.from(document.querySelectorAll('.mw-step-dot'));

function setActiveDot(idx) {
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

const stepEls = document.querySelectorAll('.mw-step');
stepEls.forEach((step, i) => {
  ScrollTrigger.create({
    trigger: step,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => { setActiveDot(i); indicator.classList.add('visible'); },
    onEnterBack: () => { setActiveDot(i); indicator.classList.add('visible'); },
    onLeaveBack: () => { if (i === 0) indicator.classList.remove('visible'); }
  });
});

window.scrollToStep = function(idx) {
  stepEls[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ─────────────── S3 — Order arrives ─────────────── */

function initStep1() {
  const step = document.getElementById('mw-step-1');
  revealStepCopy(step);

  const sources = ['#src-erp', '#src-webshop', '#src-custom'];

  // Tiles slide in
  gsap.to(sources, {
    opacity: 1,
    x: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: { trigger: step, start: 'top 65%' }
  });

  // Cycling active tile + packet animation
  const isDesktop = window.matchMedia('(min-width: 900px)').matches;

  let cycleIndex = 0;
  const srcIds = ['src-erp', 'src-webshop', 'src-custom'];

  function activateTile(idx) {
    srcIds.forEach((id, i) => {
      document.getElementById(id).classList.toggle('active', i === idx);
    });
  }

  // Packet along arc path
  const packet = document.getElementById('mw-packet');
  const arcPath = document.getElementById('mw-arc-path');

  function animatePacket(fromId, onArrive) {
    if (!isDesktop) { onArrive?.(); return; }

    const fromEl = document.getElementById(fromId);
    if (!fromEl || !arcPath) { onArrive?.(); return; }

    // Simple tween along a fixed horizontal path
    gsap.set(packet, { opacity: 1 });
    const motionTween = gsap.to({}, {
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: function() {
        const p = this.progress();
        const x = p * 70;
        const y = 200;
        gsap.set(packet, { x, y });
      },
      onComplete: () => {
        gsap.to(packet, { opacity: 0, duration: 0.2 });
        onArrive?.();
      }
    });
    return motionTween;
  }

  // Animate new order row sliding into the list
  function triggerNewOrder() {
    const newRow = document.getElementById('new-order-row');
    if (!newRow) return;
    gsap.to(newRow, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: 'back.out(1.2)'
    });
  }

  // Scroll-triggered cycle
  ScrollTrigger.create({
    trigger: step,
    start: 'top 50%',
    onEnter: () => {
      activateTile(0);
      animatePacket('src-erp', () => {
        setTimeout(() => {
          activateTile(1);
          animatePacket('src-webshop', () => {
            setTimeout(() => {
              activateTile(2);
              animatePacket('src-custom', () => {
                triggerNewOrder();
              });
            }, 400);
          });
        }, 600);
      });
    },
    once: true
  });
}

/* ─────────────── S4 — Scan & pick ─────────────── */

function initStep2() {
  const step = document.getElementById('mw-step-2');
  revealStepCopy(step);

  const barcodeBox  = document.getElementById('barcode-box');
  const pickCard    = document.getElementById('pick-card');
  const pickProgress = document.getElementById('pick-progress');
  const pickLabel   = document.getElementById('pick-label');
  const deviceCards = Array.from(document.querySelectorAll('.mw-device-card'));

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Pick card slides up
      tl.to(pickCard, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' })

      // 2. Barcode box drifts in from right
        .fromTo(barcodeBox,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
          '+=0.3'
        )

      // 3. Progress: 0 → 1/3 → 2/3 → 3/3
        .call(() => setPickProgress(1, 3), null, '+=0.6')
        .call(() => setPickProgress(2, 3), null, '+=0.7')
        .call(() => setPickProgress(3, 3), null, '+=0.7')

      // 4. Card goes green / "picked"
        .call(() => {
          pickCard.classList.add('picked');
          pickCard.querySelector('.mw-pick-card__next').textContent = '✓ SKENIRANO';
          pickCard.querySelector('.mw-pick-card__location').textContent = 'Zona A › Polica B-3';
          const itemEl = pickCard.querySelector('.mw-pick-card__item span:first-child');
          if (itemEl) itemEl.textContent = 'INOX-TRUSS-14mm';
        }, null, '+=0.4');

      // Device cards light up with stagger
      gsap.to(deviceCards, {
        opacity: 1,
        duration: 0,
        onComplete: () => {
          let di = 0;
          const deviceInterval = setInterval(() => {
            deviceCards.forEach(c => c.classList.remove('active'));
            if (di < deviceCards.length) {
              deviceCards[di].classList.add('active');
              di++;
            } else {
              clearInterval(deviceInterval);
              // leave all lit after cycle
              deviceCards.forEach(c => c.classList.add('active'));
            }
          }, 450);
        }
      });
    },
    once: true
  });

  function setPickProgress(current, total) {
    const pct = (current / total) * 100;
    pickProgress.style.width = pct + '%';
    pickLabel.textContent = current + ' / ' + total;
  }
}

/* ─────────────── S5 — Confirm & ship ─────────────── */

function initStep3() {
  const step = document.getElementById('mw-step-3');
  revealStepCopy(step);

  const lines = [
    { id: 'addr-line-1', text: 'Ante Starčevića 12' },
    { id: 'addr-line-2', text: '44000 Sisak' },
    { id: 'addr-line-3', text: 'Hrvatska' }
  ];
  const shipBtn = document.getElementById('ship-btn');
  const plane   = document.getElementById('mw-plane');

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      // Type-in address lines
      let delay = 0.4;
      lines.forEach(({ id, text }) => {
        typeIn(document.getElementById(id), text, delay);
        delay += 0.55;
      });

      // Pulse the ship button
      setTimeout(() => {
        shipBtn.classList.add('pulse');
      }, delay * 1000 + 200);

      // After a beat, fly the plane
      setTimeout(() => {
        shipBtn.classList.remove('pulse');
        const btnRect = shipBtn.getBoundingClientRect();
        gsap.set(plane, {
          opacity: 1,
          x: btnRect.left + btnRect.width / 2 - 20,
          y: btnRect.top + btnRect.height / 2 - 20
        });
        gsap.to(plane, {
          x: '+=260',
          y: '-=80',
          opacity: 0,
          duration: 0.9,
          ease: 'power2.in'
        });
      }, delay * 1000 + 1600);
    },
    once: true
  });
}

function typeIn(el, text, delayS) {
  if (!el) return;
  el.textContent = '';
  const chars = text.split('');
  let i = 0;
  const interval = 38;
  setTimeout(() => {
    const timer = setInterval(() => {
      el.textContent += chars[i++];
      if (i >= chars.length) clearInterval(timer);
    }, interval);
  }, delayS * 1000);
}

/* ─────────────── S6 — Stock ─────────────── */

function initStep4() {
  const step = document.getElementById('mw-step-4');
  revealStepCopy(step);

  const stockRows = step.querySelectorAll('.mw-stock-row');

  // Stagger fade rows in
  gsap.from(stockRows, {
    opacity: 0,
    y: 14,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: { trigger: step, start: 'top 60%' }
  });

  // Tick the qty counters
  ScrollTrigger.create({
    trigger: step,
    start: 'top 50%',
    onEnter: () => {
      tickCounter('stock-qty-truss', 50, 48, 400);
      tickCounter('stock-qty-bolt',  244, 234, 600);
      tickCounter('stock-qty-plate', 21, 17, 500);
    },
    once: true
  });
}

function tickCounter(id, from, to, durationMs) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const diff = to - from;
  function step(now) {
    const t = Math.min((now - start) / durationMs, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    el.textContent = Math.round(from + diff * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─────────────── Feature tiles ─────────────── */

function initFeatureTiles() {
  gsap.to('.mw-feature-tile', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.mw-more__grid', start: 'top 75%' }
  });
}

/* ─────────────── Boot ─────────────── */

function initAnimations() {
  initHeroParallax();
  initPitch();
  initStep1();
  initStep2();
  initStep3();
  initStep4();
  initFeatureTiles();
}
