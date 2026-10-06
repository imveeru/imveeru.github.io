import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const root = document.documentElement;
const hero = document.querySelector('.hero');
const title = document.querySelector('.title-container');
const textTop = document.querySelector('.hero-text-top');
const tagline = document.querySelector('.hero-tagline');
const nextContent = document.querySelector('.next-section .content');
const preloader = document.querySelector('.preloader');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const layout = matchMedia('(max-width: 768px)');
let scene;
let scrollContext;
let intro;
let entrance;
let introFinished = false;

// Preserve one accessible heading while animating individual visible letters.
const letters = [...title.textContent].map(char => {
  const span = document.createElement('span');
  span.textContent = char;
  span.setAttribute('aria-hidden', 'true');
  return span;
});
title.replaceChildren(...letters);

function configureScroll() {
  scrollContext?.revert();
  scrollContext = null;
  root.classList.remove('scroll-enhanced');
  if (!scene || !introFinished || motion.matches) { scene?.setVisible(true); return; }
  scene.resize();
  root.classList.add('scroll-enhanced');
  scrollContext = gsap.context(() => {
    gsap.set(nextContent, { opacity: 0, y: 20 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: () => `+=${hero.offsetHeight}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: self => scene.setVisible(self.progress < 0.995),
        onRefresh: self => { scene.resize(); scene.setVisible(self.progress < 0.995); },
      },
    });
    tl.to(scene.mesh.scale, { x: 5, y: 5, duration: 1, ease: 'none' }, 0)
      .to(letters, { y: -100, opacity: 0, stagger: .02, duration: .6, ease: 'power2.in' }, 0)
      .to([tagline, textTop], { y: -50, opacity: 0, duration: .5, ease: 'power2.in' }, .1)
      .to(scene.renderer.domElement, { opacity: 0, duration: .4, ease: 'none' }, .6)
      .to(nextContent, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .5);
  });
  ScrollTrigger.refresh();
}

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  intro?.kill();
  root.classList.remove('intro-pending');
  gsap.set(preloader, { clearProps: 'all' });
  // Content remains visible by default if any dependency fails.
  if (!motion.matches) {
    entrance = gsap.timeline({ onComplete: configureScroll });
    entrance.fromTo(textTop, { y: 12, opacity: 0 }, { y: 0, opacity: .9, duration: .65, ease: 'power3.out' }, 0)
      .fromTo(letters, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, stagger: .018, ease: 'power3.out' }, .06)
      .fromTo(tagline, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .65, ease: 'power3.out' }, .16);
  } else configureScroll();
}

function playIntro() {
  if (motion.matches || !root.classList.contains('intro-pending')) { finishIntro(); return; }
  const text = document.querySelector('.preloader-text');
  const words = ['Desire', 'Design', 'Develop'];
  const italicIndices = [[1, 4], [1, 3], [1, 4]];
  const wordElements = words.map((word, wordIndex) => {
    const element = document.createElement('div');
    element.className = 'preloader-word';
    [...word].forEach((char, index) => {
      const mask = document.createElement('span');
      mask.className = 'letter-mask';
      const letter = document.createElement('span');
      letter.className = `preloader-letter${italicIndices[wordIndex].includes(index) ? ' serif-e' : ''}`;
      letter.textContent = char;
      mask.append(letter);
      element.append(mask);
    });
    const star = document.createElement('span');
    star.className = 'asterisk';
    star.textContent = '*';
    element.append(star);
    text.append(element);
    return element;
  });
  intro = gsap.timeline({ onComplete: finishIntro });
  wordElements.forEach((word, index) => {
    const start = index * 1.35;
    const chars = word.querySelectorAll('.preloader-letter');
    intro.set(word, { visibility: 'visible' }, start)
      .fromTo(chars, { yPercent: 110, opacity: 0, rotationX: -25 }, {
        yPercent: 0, opacity: 1, rotationX: 0, duration: .7, stagger: .025, ease: 'power3.out',
      }, start)
      .fromTo(word.querySelector('.asterisk'), { opacity: 0, scale: .85 }, {
        opacity: 1, scale: 1, duration: .55, ease: 'power2.out',
      }, start + .15);
    if (index < wordElements.length - 1) {
      intro.to(chars, { yPercent: -100, opacity: 0, duration: .35, stagger: .015, ease: 'power2.in' }, start + .95)
        .to(word.querySelector('.asterisk'), { opacity: 0, duration: .3 }, start + .95);
    }
  });
  intro.to('.bar', { scaleY: 1, duration: .65, stagger: .018, ease: 'power3.inOut' }, 3.85)
    .to(preloader, { opacity: 0, duration: .6, ease: 'power2.inOut' }, 4.5);
}

window.addEventListener('portfolio:intro-timeout', finishIntro, { once: true });
playIntro();

// Load the GPU effect separately so text and the intro do not wait for Three.js.
import('./scene.js').then(async ({ HeroScene }) => {
  const nextScene = new HeroScene(hero);
  nextScene.setReducedMotion(motion.matches);
  await nextScene.init();
  scene = nextScene;
  if (introFinished && (!entrance || !entrance.isActive())) configureScroll();
}).catch(error => {
  console.warn('The animated background is unavailable. The static design remains visible.', error);
});

let resizeFrame;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => { scene?.resize(); });
}, { passive: true });
layout.addEventListener('change', configureScroll);
motion.addEventListener('change', () => {
  entrance?.kill();
  gsap.set([letters, textTop, tagline], { clearProps: 'all' });
  scene?.setReducedMotion(motion.matches);
  finishIntro();
  configureScroll();
});
// Font swaps can change pinned layout dimensions.
document.fonts.ready.then(() => ScrollTrigger.refresh());
