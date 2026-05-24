/* ── ARCA WMS — main.js ── */

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
  applyLang(browser.startsWith('en') ? 'en' : 'hr');
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
    '.mw-source-tile, .mw-feature-tile, #new-order-row, #pick-card, #barcode-box, ' +
    '#recv-barcode-box, #recv-putaway-card, #recv-wireless, #recv-printer-label, ' +
    '#recv-shelf-qr, #recv-shelf-surface, #recv-assign-card'
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
  const recvInd = document.getElementById('mw-recv-step-indicator');
  if (recvInd) recvInd.classList.add('visible');
  // Auto module — show final state
  document.querySelectorAll(
    '.mw-loc-item, #loc-detail, #auto-trigger-pane, #auto-code-editor, .mw-code-line, #auto-code-toast'
  ).forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  document.getElementById('cat-toggle-lot')?.classList.add('mw-cat-toggle--on');
  document.getElementById('cat-toggle-serial')?.classList.add('mw-cat-toggle--on');
  const catFieldNew = document.getElementById('cat-field-new');
  if (catFieldNew) { catFieldNew.style.opacity = '1'; catFieldNew.style.transform = 'none'; }
  // Tab clicks still need wiring (without ScrollTrigger active highlighting)
  document.querySelectorAll('.mw-modules-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('href').slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  });
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

/* ─────────────── Receiving step indicator dots ─────────────── */

const recvIndicator = document.getElementById('mw-recv-step-indicator');
const recvDots = recvIndicator ? Array.from(recvIndicator.querySelectorAll('.mw-step-dot')) : [];

function setActiveRecvDot(idx) {
  recvDots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

const recvStepEls = document.querySelectorAll('.mw-recv-step');
recvStepEls.forEach((step, i) => {
  ScrollTrigger.create({
    trigger: step,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => { setActiveRecvDot(i); recvIndicator?.classList.add('visible'); },
    onEnterBack: () => { setActiveRecvDot(i); recvIndicator?.classList.add('visible'); },
    onLeave: () => { if (i === recvStepEls.length - 1) recvIndicator?.classList.remove('visible'); },
    onLeaveBack: () => { if (i === 0) recvIndicator?.classList.remove('visible'); }
  });
});

window.scrollToRecvStep = function(idx) {
  recvStepEls[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ─────────────── Recv S1 — Scan inbound stock ─────────────── */

function initRecvStep1() {
  const step = document.getElementById('mw-recv-step-1');
  revealStepCopy(step);

  const barcodeBox = document.getElementById('recv-barcode-box');
  const putawayCard = document.getElementById('recv-putaway-card');

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Barcode box drifts in from right
      tl.fromTo(barcodeBox,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
      )
      // 2. Put-away card slides up
        .to(putawayCard, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, '+=0.4');
    },
    once: true
  });
}

/* ─────────────── Recv S2 — Print barcode label ─────────────── */

function initRecvStep2() {
  const step = document.getElementById('mw-recv-step-2');
  revealStepCopy(step);

  const printBtn = document.getElementById('recv-print-btn');
  const wireless = document.getElementById('recv-wireless');
  const printerLabel = document.getElementById('recv-printer-label');

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Pulse the print button
      tl.call(() => { printBtn.classList.add('pulse'); }, null, 0)

      // 2. After a beat, show wireless signal
        .to(wireless, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '+=0.8')

      // 3. Wireless arcs pulse
        .fromTo(wireless.querySelectorAll('path'),
          { strokeDasharray: '20', strokeDashoffset: '20' },
          { strokeDashoffset: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        )

      // 4. Label slides out of printer
        .to(printerLabel, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.5)'
        }, '+=0.2')

      // 5. Stop button pulse
        .call(() => { printBtn.classList.remove('pulse'); });
    },
    once: true
  });
}

/* ─────────────── Recv S3 — Scan shelf location ─────────────── */

function initRecvStep3() {
  const step = document.getElementById('mw-recv-step-3');
  revealStepCopy(step);

  const shelfQr = document.getElementById('recv-shelf-qr');
  const shelfSurface = document.getElementById('recv-shelf-surface');
  const assignCard = document.getElementById('recv-assign-card');

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Shelf surface fades in
      tl.to(shelfSurface, { opacity: 0.5, duration: 0.3, ease: 'power2.out' })

      // 2. QR code appears on shelf
        .to(shelfQr, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.1')

      // 3. Brief pause (scanning), then assign card slides up
        .to(assignCard, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, '+=0.8');
    },
    once: true
  });
}

/* ─────────────── Audits step indicator dots ─────────────── */

const auditIndicator = document.getElementById('mw-audit-step-indicator');
const auditDots = auditIndicator ? Array.from(auditIndicator.querySelectorAll('.mw-step-dot')) : [];

function setActiveAuditDot(idx) {
  auditDots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

const auditStepEls = document.querySelectorAll('.mw-audit-step');
auditStepEls.forEach((step, i) => {
  ScrollTrigger.create({
    trigger: step,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => { setActiveAuditDot(i); auditIndicator?.classList.add('visible'); },
    onEnterBack: () => { setActiveAuditDot(i); auditIndicator?.classList.add('visible'); },
    onLeave: () => { if (i === auditStepEls.length - 1) auditIndicator?.classList.remove('visible'); },
    onLeaveBack: () => { if (i === 0) auditIndicator?.classList.remove('visible'); }
  });
});

window.scrollToAuditStep = function(idx) {
  auditStepEls[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ─────────────── Automations step indicator dots ─────────────── */

const autoIndicator = document.getElementById('mw-auto-step-indicator');
const autoDots = autoIndicator ? Array.from(autoIndicator.querySelectorAll('.mw-step-dot')) : [];

function setActiveAutoDot(idx) {
  autoDots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

const autoStepEls = document.querySelectorAll('.mw-auto-step');
autoStepEls.forEach((step, i) => {
  ScrollTrigger.create({
    trigger: step,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => { setActiveAutoDot(i); autoIndicator?.classList.add('visible'); },
    onEnterBack: () => { setActiveAutoDot(i); autoIndicator?.classList.add('visible'); },
    onLeave: () => { if (i === autoStepEls.length - 1) autoIndicator?.classList.remove('visible'); },
    onLeaveBack: () => { if (i === 0) autoIndicator?.classList.remove('visible'); }
  });
});

window.scrollToAutoStep = function(idx) {
  autoStepEls[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ─────────────── Audit S1 — Walk and scan ─────────────── */

function initAuditStep1() {
  const step = document.getElementById('mw-audit-step-1');
  if (!step) return;
  revealStepCopy(step);

  const barcodes = [
    document.getElementById('audit-bc-1'),
    document.getElementById('audit-bc-2'),
    document.getElementById('audit-bc-3'),
  ];
  const checks = barcodes.map(bc => bc?.querySelector('.mw-barcode-mini__check'));

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Three barcodes drift in stacked, staggered
      tl.fromTo(barcodes,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.15, ease: 'power2.out' }
      )
      // 2. Sequentially flip each green check (top → bottom)
        .to(checks, {
          opacity: 1,
          duration: 0.25,
          stagger: 0.35,
          ease: 'power2.out'
        }, '+=0.5');
    },
    once: true
  });
}

/* ─────────────── Audit S2 — Reconcile differences ─────────────── */

function initAuditStep2() {
  const step = document.getElementById('mw-audit-step-2');
  if (!step) return;
  revealStepCopy(step);

  const ringFill = step.querySelector('.mw-audit-progress__fill');
  const pctLabel = document.getElementById('audit-pct');
  const counts = step.querySelector('.mw-audit-counts');
  const rows = step.querySelectorAll('.mw-audit-row');
  const badges = step.querySelectorAll('.mw-audit-row__badge');

  // Initial states (counts + rows fade in via timeline)
  if (counts) gsap.set(counts, { opacity: 0, y: 8 });
  if (rows.length) gsap.set(rows, { y: 14 });

  const circumference = 301.59; // 2 * π * 48
  const targetPct = 84;
  const targetOffset = circumference * (1 - targetPct / 100);

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const pctObj = { v: 0 };
      const tl = gsap.timeline({ delay: 0.25 });

      // 1. Ring fills to 84%, percentage counts up in sync
      tl.to(ringFill, {
        strokeDashoffset: targetOffset,
        duration: 1.1,
        ease: 'power2.out'
      })
        .to(pctObj, {
          v: targetPct,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => { if (pctLabel) pctLabel.textContent = Math.round(pctObj.v) + '%'; }
        }, '<')
      // 2. Counts label fades up
        .to(counts, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
      // 3. Variance rows reveal with stagger
        .to(rows, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.12,
          ease: 'power2.out'
        }, '+=0.05')
      // 4. Pop the EXTRA badges (stagger so each one bounces)
        .to(badges, {
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'back.out(2.4)'
        }, '-=0.15');
    },
    once: true
  });
}

/* ─────────────── Auto S1 — Configure warehouse ─────────────── */

function initAutoStep1() {
  const step = document.getElementById('mw-auto-step-1');
  if (!step) return;
  revealStepCopy(step);

  const col1Items = step.querySelectorAll('#loc-col-1 .mw-loc-item');
  const col2Items = step.querySelectorAll('#loc-col-2 .mw-loc-item');
  const col3Items = step.querySelectorAll('#loc-col-3 .mw-loc-item');
  const detail = step.querySelector('#loc-detail');

  // Set initial offset for animation (before ScrollTrigger registers)
  gsap.set([...col1Items, ...col2Items, ...col3Items], { x: 12 });
  if (detail) gsap.set(detail, { y: 16 });

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.2 });

      // 1. Col 1 items fade in
      tl.to(col1Items, { opacity: 1, x: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' })

      // 2. Col 2 zones cascade in
        .to(col2Items, { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }, '+=0.15')

      // 3. Col 3 shelves cascade in
        .to(col3Items, { opacity: 1, x: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out' }, '+=0.1')

      // 4. Detail panel slides up
        .to(detail, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.3)' }, '+=0.1');
    },
    once: true
  });
}

/* ─────────────── Auto S2 — Configure catalog ─────────────── */

function initAutoStep2() {
  const step = document.getElementById('mw-auto-step-2');
  if (!step) return;
  revealStepCopy(step);

  const toggleLot = document.getElementById('cat-toggle-lot');
  const toggleSerial = document.getElementById('cat-toggle-serial');
  const chipDate = document.getElementById('cat-chip-date');
  const fieldNew = document.getElementById('cat-field-new');

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.4 });

      // 1. Lot toggle flips on
      tl.call(() => toggleLot?.classList.add('mw-cat-toggle--on'))

      // 2. Serial toggle flips on shortly after
        .call(() => toggleSerial?.classList.add('mw-cat-toggle--on'), null, '+=0.45')

      // 3. Date chip briefly flashes (already styled with --flash class, just pulse it)
        .to(chipDate, { scale: 1.08, duration: 0.15, ease: 'power2.out' }, '+=0.35')
        .to(chipDate, { scale: 1, duration: 0.15, ease: 'power2.in' })

      // 4. New field row slides in from above
        .to(fieldNew, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }, '+=0.1');
    },
    once: true
  });
}

/* ─────────────── Auto S3 — Automations editor ─────────────── */

function initAutoStep3() {
  const step = document.getElementById('mw-auto-step-3');
  if (!step) return;
  revealStepCopy(step);

  const triggerPane = document.getElementById('auto-trigger-pane');
  const codeEditor = document.getElementById('auto-code-editor');
  const codeLines = step.querySelectorAll('.mw-code-line');
  const toast = document.getElementById('auto-code-toast');

  let triggered = false;

  ScrollTrigger.create({
    trigger: step,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Trigger pane fades in
      tl.to(triggerPane, { opacity: 1, duration: 0.5, ease: 'power2.out' })

      // 2. Code editor fades in
        .to(codeEditor, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '+=0.1')

      // 3. Code lines appear in stagger (typewriter feel)
        .to(codeLines, {
          opacity: 1,
          duration: 0.2,
          stagger: 0.1,
          ease: 'power2.out'
        }, '+=0.2')

      // 4. Success toast slides up
        .to(toast, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }, '+=0.4');
    },
    once: true
  });
}

/* ─────────────── Module tabs ─────────────── */

function initModuleTabs() {
  const tabs = Array.from(document.querySelectorAll('.mw-modules-tab'));
  const modules = Array.from(document.querySelectorAll('.mw-module'));
  if (!tabs.length || !modules.length) return;

  function setActiveTab(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.module === name));
  }

  // Smooth-scroll on click, accounting for sticky nav + tabs height
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      const offset = 60 + 50; // nav + tabs bar
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Highlight active tab as scroll passes each module
  modules.forEach(mod => {
    ScrollTrigger.create({
      trigger: mod,
      start: 'top 35%',
      end: 'bottom 35%',
      onEnter: () => setActiveTab(mod.dataset.module),
      onEnterBack: () => setActiveTab(mod.dataset.module),
    });
  });
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
  initRecvStep1();
  initRecvStep2();
  initRecvStep3();
  initAuditStep1();
  initAuditStep2();
  initAutoStep1();
  initAutoStep2();
  initAutoStep3();
  initModuleTabs();
  initFeatureTiles();
}
