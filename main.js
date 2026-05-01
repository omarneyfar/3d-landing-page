import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroScene, initContactScene, initIntroScene } from './src/three/scene.js';

gsap.registerPlugin(ScrollTrigger);

// ══════════════════════════════════════════════════════════
//  1. SMOOTH SCROLL
// ══════════════════════════════════════════════════════════
const lenis = new Lenis({ lerp: 0.07, smoothWheel: true, syncTouch: false });
lenis.on('scroll', ScrollTrigger.update);

// ══════════════════════════════════════════════════════════
//  2. THREE.JS SCENES
// ══════════════════════════════════════════════════════════
const renderIntro   = initIntroScene();
const renderHero    = initHeroScene();
const renderContact = initContactScene();

// ══════════════════════════════════════════════════════════
//  3. UNIFIED TICKER
// ══════════════════════════════════════════════════════════
let lastTime = 0;
gsap.ticker.add((time) => {
  const delta = time - lastTime;
  lastTime = time;
  lenis.raf(time * 1000);
  renderIntro(delta);
  renderHero(delta);
  renderContact(delta);
});
gsap.ticker.lagSmoothing(0);

// ══════════════════════════════════════════════════════════
//  4. SCROLL VELOCITY TRACKER
// ══════════════════════════════════════════════════════════
let scrollVelocity = 0;
lenis.on('scroll', (e) => { scrollVelocity = e.velocity; });

// ══════════════════════════════════════════════════════════
//  5. CUSTOM CURSOR (star + ring + glow)
// ══════════════════════════════════════════════════════════
const cursorStar = document.createElement('div');
const cursorRing = document.createElement('div');
const cursorGlow = document.createElement('div');
cursorStar.className = 'cursor-star';
cursorRing.className = 'cursor-ring';
cursorGlow.className = 'cursor-glow';
document.body.append(cursorStar, cursorRing, cursorGlow);

document.addEventListener('mousemove', (e) => {
  gsap.set(cursorStar, { x: e.clientX, y: e.clientY });
  gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power2.out' });
  gsap.to(cursorGlow, { x: e.clientX, y: e.clientY, duration: 0.9, ease: 'power2.out' });
});

gsap.set(cursorStar, { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
gsap.set(cursorRing, { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
gsap.set(cursorGlow, { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });

document.querySelectorAll('a, button, .service-card, .work-item, .stat-item, .intro-play').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursorRing, { scale: 2.5, borderColor: 'rgba(255,27,107,0.6)', duration: 0.3 });
    gsap.to(cursorStar, { scale: 1.5, rotation: 20, duration: 0.2 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursorRing, { scale: 1, borderColor: 'rgba(139,61,255,0.5)', duration: 0.3 });
    gsap.to(cursorStar, { scale: 1, rotation: 0, duration: 0.2 });
  });
});

// ══════════════════════════════════════════════════════════
//  6. ★ CINEMATIC INTRO — play button expands to reveal hero
// ══════════════════════════════════════════════════════════
const introTL = gsap.timeline({
  scrollTrigger: {
    trigger: '#intro',
    start: 'top top',
    end: '+=140%',
    scrub: 1.2,
    pin: true,
  }
});

const introPlay = document.getElementById('intro-play');
let introCompleted = false;
gsap.set('.intro-play', { transformOrigin: '50% 50%' });

const goToHero = () => {
  if (introCompleted) return;
  introCompleted = true;
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    lenis.scrollTo(heroSection, { offset: 0, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 3) });
  }
};

if (introPlay) {
  introPlay.addEventListener('click', () => {
    if (introCompleted) return;
    gsap.to('.intro-play', { scale: 45, duration: 1.2, ease: 'power3.in' });
    gsap.to(['.intro-ring--inner', '.intro-ring--mid', '.intro-ring--outer'], {
      scale: 35, opacity: 0, duration: 1.2, ease: 'power3.in',
    });
    gsap.delayedCall(0.95, goToHero);
  });
}

// Play button scales up massively, rings expand, everything fades
introTL
  .to('.intro-play', {
    scale: 40, opacity: 0, duration: 1, ease: 'power2.in',
  })
  .to('.intro-ring--inner', { scale: 35, opacity: 0, duration: 1, ease: 'power2.in' }, 0)
  .to('.intro-ring--mid',   { scale: 30, opacity: 0, duration: 1, ease: 'power2.in' }, 0.05)
  .to('.intro-ring--outer', { scale: 25, opacity: 0, duration: 1, ease: 'power2.in' }, 0.1)
  .to('.intro-brand', { opacity: 0, y: -60, scale: 1.5, duration: 0.5 }, 0)
  .to('.intro-label', { opacity: 0, y: -30, duration: 0.3 }, 0)
  .to('.intro-lines span', { opacity: 0, scaleY: 2, stagger: 0.05, duration: 0.5 }, 0)
  .to('#intro-canvas', { opacity: 0, duration: 0.6 }, 0.3)
  .add(() => goToHero(), 0.92);

// Intro pulse animation on the play button
gsap.to('.intro-play', {
  scale: 1.08, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
});
gsap.to('.intro-ring--mid', {
  scale: 1.05, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1,
});

document.querySelectorAll('.hero-content, .section-header, .about-text, .contact-inner').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      x: x * 12,
      y: y * 8,
      rotateY: x * 4,
      rotateX: -y * 3,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' });
  });
});

// ══════════════════════════════════════════════════════════
//  7. NAVBAR — hide on scroll down, show on up
// ══════════════════════════════════════════════════════════
let lastScrollY = 0;
lenis.on('scroll', ({ scroll }) => {
  const nav = document.getElementById('navbar');
  // Hide navbar during intro
  if (scroll < window.innerHeight * 1.5) {
    gsap.to(nav, { yPercent: -100, duration: 0.3 });
    return;
  }
  if (scroll > lastScrollY && scroll > 120) {
    gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.inOut' });
  } else {
    gsap.to(nav, { yPercent: 0, duration: 0.35, ease: 'power2.out' });
    nav.classList.toggle('scrolled', scroll > 60);
  }
  lastScrollY = scroll;
});

// ══════════════════════════════════════════════════════════
//  8. HERO — entrance + parallax exit
// ══════════════════════════════════════════════════════════
const heroTL = gsap.timeline({
  scrollTrigger: { trigger: '#hero', start: 'top 80%', toggleActions: 'play none none none' },
});
heroTL
  .from('.hero-eyebrow', { opacity: 0, y: 25, duration: 0.7, ease: 'power3.out' })
  .from('.hero-title .line', {
    opacity: 0, y: 90, rotateX: 40, stagger: 0.13, duration: 1.1,
    ease: 'power4.out', transformPerspective: 600,
  }, '-=0.3')
  .from('.hero-sub', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' }, '-=0.4')
  .from('.hero-cta-group', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
  .from('.scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.2')
  .from('.hero-badge', { opacity: 0, scale: 0.7, stagger: 0.15, duration: 0.6, ease: 'back.out(2)' }, '-=0.4');

// Hero parallax exit
gsap.to('.hero-content', {
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  y: -150, opacity: 0,
});
gsap.to('#hero-canvas', {
  scrollTrigger: { trigger: '#hero', start: 'center top', end: 'bottom top', scrub: true },
  scale: 1.2, opacity: 0.2,
});

// ══════════════════════════════════════════════════════════
//  9. MARQUEE — velocity-driven skew
// ══════════════════════════════════════════════════════════
const marqueeTrack = document.querySelector('.marquee-track');
gsap.ticker.add(() => {
  if (marqueeTrack) {
    const skew = gsap.utils.clamp(-8, 8, scrollVelocity * 0.3);
    gsap.to(marqueeTrack, { skewX: skew, duration: 0.4, ease: 'power2.out' });
  }
});
gsap.from('#marquee-section', {
  scrollTrigger: { trigger: '#marquee-section', start: 'top 95%', end: 'bottom 10%', scrub: true },
  scaleX: 0.9, opacity: 0.3,
});

// ══════════════════════════════════════════════════════════
//  10. SERVICES — cinematic 3D entrance + mouse glow
// ══════════════════════════════════════════════════════════
gsap.from('#services .section-tag', {
  scrollTrigger: { trigger: '#services', start: 'top 80%' },
  opacity: 0, y: 30, letterSpacing: '0.5em', duration: 0.8, ease: 'power3.out',
});
gsap.from('#services .section-title', {
  scrollTrigger: { trigger: '#services', start: 'top 78%' },
  opacity: 0, y: 60, scale: 0.85, rotateX: 20, duration: 1.1, ease: 'power4.out', transformPerspective: 800,
});

gsap.from('.service-card', {
  scrollTrigger: { trigger: '#services .services-grid', start: 'top 75%' },
  opacity: 0, y: 120, z: -200, rotateX: 25, rotateY: -10,
  stagger: { amount: 0.6 }, duration: 1.1, ease: 'power4.out', transformPerspective: 1000,
});

// Scroll parallax per card
document.querySelectorAll('.service-card').forEach((card, i) => {
  gsap.to(card, {
    scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    y: (i % 2 === 0) ? -30 : -55, ease: 'none',
  });
});

// Mouse glow tracking inside each card
document.querySelectorAll('.service-card').forEach(card => {
  const glow = card.querySelector('.card-glow');
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    gsap.to(glow, {
      x: e.clientX - rect.left - rect.width,
      y: e.clientY - rect.top - rect.height,
      opacity: 1, duration: 0.4, ease: 'power2.out',
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(glow, { opacity: 0, duration: 0.4 });
  });
});

// ══════════════════════════════════════════════════════════
//  11. WORK — 3D clip-path reveals + parallax tilt on hover
// ══════════════════════════════════════════════════════════
gsap.from('#work .section-tag', {
  scrollTrigger: { trigger: '#work', start: 'top 80%' },
  opacity: 0, y: 30, duration: 0.7, ease: 'power3.out',
});
gsap.from('#work .section-title', {
  scrollTrigger: { trigger: '#work', start: 'top 78%' },
  opacity: 0, y: 50, scale: 0.9, rotateX: 12, duration: 1, ease: 'power4.out', transformPerspective: 800,
});

gsap.utils.toArray('.work-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: { trigger: item, start: 'top 85%' },
    opacity: 0, scale: 0.85, rotateY: i % 2 === 0 ? -10 : 10, y: 100,
    duration: 1.1, delay: i * 0.1, ease: 'power4.out', transformPerspective: 1200,
  });
});

// 3D tilt + parallax image shift on hover
document.querySelectorAll('.work-item').forEach(item => {
  const img = item.querySelector('.work-img');
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(item, { rotateY: x * 12, rotateX: -y * 8, duration: 0.5, ease: 'power2.out', transformPerspective: 1000 });
    if (img) gsap.to(img, { x: x * -25, y: y * -18, scale: 1.08, duration: 0.5, ease: 'power2.out' });
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(item, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.7, ease: 'power2.out' });
    if (img) gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' });
  });
});

// Work items scroll depth
document.querySelectorAll('.work-item').forEach((item, i) => {
  gsap.to(item, {
    scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
    y: i % 2 === 0 ? -20 : -40, ease: 'none',
  });
});

// ══════════════════════════════════════════════════════════
//  12. ABOUT — perspective text reveal + stat card tilt
// ══════════════════════════════════════════════════════════
gsap.from('#about .section-tag', {
  scrollTrigger: { trigger: '#about', start: 'top 80%' },
  opacity: 0, y: 30, duration: 0.7, ease: 'power3.out',
});
gsap.from('.about-title', {
  scrollTrigger: { trigger: '#about', start: 'top 72%' },
  opacity: 0, x: -80, rotateY: -18, duration: 1.2, ease: 'power4.out', transformPerspective: 600,
});
gsap.from('.about-body', {
  scrollTrigger: { trigger: '#about', start: 'top 65%' },
  opacity: 0, x: -50, duration: 0.9, ease: 'power3.out',
});
gsap.from('#about-cta', {
  scrollTrigger: { trigger: '#about', start: 'top 58%' },
  opacity: 0, y: 30, scale: 0.85, duration: 0.7, ease: 'back.out(2)',
});

// Stat cards 3D flip entrance
gsap.from('.stat-item', {
  scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' },
  opacity: 0, y: 90, rotateX: 35,
  stagger: 0.15, duration: 1, ease: 'power4.out', transformPerspective: 800,
});

// Stat cards tilt on hover
document.querySelectorAll('.stat-item').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 16, rotateX: -y * 16, scale: 1.06,
      boxShadow: '0 25px 60px rgba(139,61,255,0.25)',
      duration: 0.4, ease: 'power2.out', transformPerspective: 800,
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateY: 0, rotateX: 0, scale: 1,
      boxShadow: '0 0 0 rgba(0,0,0,0)',
      duration: 0.6, ease: 'power2.out',
    });
  });
});

// Counters
document.querySelectorAll('.counter').forEach(el => {
  const target = +el.dataset.target;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target, duration: 2.5, ease: 'power1.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onUpdate() { el.textContent = Math.round(obj.val); },
  });
});

// ══════════════════════════════════════════════════════════
//  13. CONTACT — cinematic scale entrance
// ══════════════════════════════════════════════════════════
gsap.from('#contact .section-tag', {
  scrollTrigger: { trigger: '#contact', start: 'top 78%' },
  opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
});
gsap.from('.contact-title', {
  scrollTrigger: { trigger: '#contact', start: 'top 75%' },
  opacity: 0, y: 80, scale: 0.8, rotateX: 25, duration: 1.3, ease: 'power4.out', transformPerspective: 800,
});
gsap.from('.contact-sub', {
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
});
gsap.from('.contact-email', {
  scrollTrigger: { trigger: '#contact', start: 'top 65%' },
  opacity: 0, y: 50, scale: 0.75, duration: 1.1, ease: 'power4.out',
});
gsap.from('.contact-links a', {
  scrollTrigger: { trigger: '#contact', start: 'top 58%' },
  opacity: 0, y: 25, rotateX: 25, stagger: 0.1, duration: 0.7, ease: 'power3.out', transformPerspective: 600,
});

// ══════════════════════════════════════════════════════════
//  14. TILT CARDS (services)
// ══════════════════════════════════════════════════════════
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 22, rotateX: -y * 22, scale: 1.05,
      duration: 0.4, ease: 'power2.out', transformPerspective: 900,
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.7, ease: 'power2.out' });
  });
});

// ══════════════════════════════════════════════════════════
//  15. MAGNETIC BUTTONS
// ══════════════════════════════════════════════════════════
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  });
});

// ══════════════════════════════════════════════════════════
//  16. SCROLL VELOCITY SKEW (subtle body tilt)
// ══════════════════════════════════════════════════════════
gsap.ticker.add(() => {
  const skew = gsap.utils.clamp(-2, 2, scrollVelocity * 0.1);
  gsap.to('body', { skewY: skew, duration: 0.3, ease: 'power2.out' });
});

// ══════════════════════════════════════════════════════════
//  17. GRADIENT DIVIDER LINES (scroll reveal)
// ══════════════════════════════════════════════════════════
document.querySelectorAll('#services, #work, #about, #contact').forEach(section => {
  const orb = document.createElement('div');
  orb.className = 'section-orb';
  section.prepend(orb);
});
gsap.utils.toArray('.section-orb').forEach(orb => {
  gsap.fromTo(orb, { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, scrollTrigger: { trigger: orb.parentElement, start: 'top 85%', end: 'top 50%', scrub: true } }
  );
});

// ══════════════════════════════════════════════════════════
//  18. FOOTER
// ══════════════════════════════════════════════════════════
gsap.from('#footer', {
  scrollTrigger: { trigger: '#footer', start: 'top 95%' },
  opacity: 0, y: 40, rotateX: 10, duration: 0.7, ease: 'power3.out', transformPerspective: 600,
});
