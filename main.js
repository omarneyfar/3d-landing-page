import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroScene, initContactScene } from './src/three/scene.js';

gsap.registerPlugin(ScrollTrigger);

// ── 1. SMOOTH SCROLL (Lenis) ──────────────────────────────
const lenis = new Lenis({
  lerp: 0.08,
  smoothWheel: true,
  syncTouch: false,
});
lenis.on('scroll', ScrollTrigger.update);

// ── 2. THREE.JS SCENES ───────────────────────────────────
const renderHero    = initHeroScene();
const renderContact = initContactScene();

// ── 3. UNIFIED TICKER (critical: single RAF) ─────────────
let lastTime = 0;
gsap.ticker.add((time) => {
  const delta = time - lastTime;
  lastTime = time;
  lenis.raf(time * 1000);
  renderHero(delta);
  renderContact(delta);
});
gsap.ticker.lagSmoothing(0);

// ── 4. CURSOR GLOW ────────────────────────────────────────
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', (e) => {
  gsap.to(cursorGlow, {
    x: e.clientX, y: e.clientY,
    duration: 0.8, ease: 'power2.out',
  });
});

// ── 5. HERO ENTRANCE ANIMATION ────────────────────────────
const heroTL = gsap.timeline({ delay: 0.4 });
heroTL
  .from('.hero-eyebrow', { opacity: 0, y: 25, duration: 0.7, ease: 'power3.out' })
  .from('.hero-title .line', {
    opacity: 0, y: 90, stagger: 0.13, duration: 1,
    ease: 'power4.out',
  }, '-=0.3')
  .from('.hero-sub', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' }, '-=0.4')
  .from('.hero-cta-group', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
  .from('.scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.2')
  .from('.hero-badge', {
    opacity: 0, scale: 0.7, stagger: 0.15, duration: 0.6, ease: 'back.out(2)',
  }, '-=0.4');

// ── 6. NAVBAR SCROLL BEHAVIOR ─────────────────────────────
let lastScrollY = 0;
lenis.on('scroll', ({ scroll }) => {
  const nav = document.getElementById('navbar');
  if (scroll > lastScrollY && scroll > 120) {
    gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.inOut' });
  } else {
    gsap.to(nav, { yPercent: 0, duration: 0.35, ease: 'power2.out' });
    nav.classList.toggle('scrolled', scroll > 60);
  }
  lastScrollY = scroll;
});

// ── 7. MARQUEE — pause on hover (handled in CSS) ──────────

// ── 8. SERVICES SCROLL REVEAL ─────────────────────────────
gsap.from('.service-card', {
  scrollTrigger: {
    trigger: '#services',
    start: 'top 75%',
  },
  opacity: 0,
  y: 80,
  rotateX: 12,
  stagger: { amount: 0.5, from: 'start' },
  duration: 0.9,
  ease: 'power4.out',
});

// ── 9. WORK ITEMS — clip-path reveal ─────────────────────
gsap.utils.toArray('.work-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: { trigger: item, start: 'top 80%' },
    opacity: 0,
    y: 50,
    duration: 0.9,
    delay: i * 0.1,
    ease: 'power3.out',
  });
});

// ── 10. ABOUT TEXT ────────────────────────────────────────
gsap.from('.about-title', {
  scrollTrigger: { trigger: '#about', start: 'top 70%' },
  opacity: 0, x: -70, duration: 1, ease: 'power4.out',
});
gsap.from('.about-body', {
  scrollTrigger: { trigger: '#about', start: 'top 65%' },
  opacity: 0, x: -50, duration: 0.9, ease: 'power3.out',
});
gsap.from('#about-cta', {
  scrollTrigger: { trigger: '#about', start: 'top 60%' },
  opacity: 0, y: 20, duration: 0.7, ease: 'power3.out',
});

// ── 11. STAT CARDS ────────────────────────────────────────
gsap.from('.stat-item', {
  scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' },
  opacity: 0, y: 40, stagger: 0.12, duration: 0.7, ease: 'power3.out',
});

// ── 12. COUNTERS ──────────────────────────────────────────
document.querySelectorAll('.counter').forEach(el => {
  const target = +el.dataset.target;
  const obj    = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 2.5,
    ease: 'power1.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onUpdate() { el.textContent = Math.round(obj.val); },
  });
});

// ── 13. SECTION TAGS + TITLES ─────────────────────────────
gsap.utils.toArray('.section-tag, .section-title, .contact-title, .contact-sub').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%' },
    opacity: 0, y: 35, duration: 0.8, ease: 'power3.out',
  });
});

// ── 14. CONTACT EMAIL REVEAL ──────────────────────────────
gsap.from('.contact-email', {
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  opacity: 0, y: 40, duration: 1, ease: 'power4.out',
});
gsap.from('.contact-links a', {
  scrollTrigger: { trigger: '#contact', start: 'top 60%' },
  opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: 'power3.out',
});

// ── 15. 3D CARD TILT ─────────────────────────────────────
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 16,
      rotateX: -y * 16,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power2.out' });
  });
});

// ── 16. MAGNETIC BUTTONS ─────────────────────────────────
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x    = e.clientX - rect.left - rect.width  / 2;
    const y    = e.clientY - rect.top  - rect.height / 2;
    gsap.to(btn, { x: x * 0.32, y: y * 0.32, duration: 0.4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── 17. WORK ITEM HOVER SCALE ────────────────────────────
document.querySelectorAll('.work-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    gsap.to(item, { scale: 1.02, duration: 0.4, ease: 'power2.out' });
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(item, { scale: 1, duration: 0.4, ease: 'power2.out' });
  });
});

// ── 18. FOOTER ENTRANCE ──────────────────────────────────
gsap.from('#footer', {
  scrollTrigger: { trigger: '#footer', start: 'top 95%' },
  opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
});
