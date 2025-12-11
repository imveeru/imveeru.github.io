import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders.js";

const config = {
    lerpFactor: 0.035,
    parallaxStrength: 0.1,
    distortionMultiplier: 10,
    glassStrength: 2.0,
    glassSmoothness: 0.0001,
    stripesFrequency: 35,
    edgePadding: 0.1,
};

// ==========================================
// SHARED UTILS
// ==========================================
const lerp = (start, end, factor) => start + (end - start) * factor;
const textureLoader = new THREE.TextureLoader();
const silhouetteTexture = textureLoader.load("./veera-silhouette.png");

// ==========================================
// DESKTOP MANAGER
// ==========================================
class DesktopManager {
    constructor() {
        this.container = document.querySelector(".hero-desktop");
        this.isActive = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.mesh = null;
        this.rafId = null;
        this.mouse = { x: 0.5, y: 0.5 };
        this.targetMouse = { x: 0.5, y: 0.5 };
    }

    init() {
        if (!this.container) return;
        this.isActive = true;

        // Scene Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Material Setup (Desktop-specific scale: 0.7)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uTextureSize: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uParallaxStrength: { value: config.parallaxStrength },
                uDistortionMultiplier: { value: config.distortionMultiplier },
                uGlassStrength: { value: config.glassStrength },
                ustripesFrequency: { value: config.stripesFrequency },
                uglassSmoothness: { value: config.glassSmoothness },
                uEdgePadding: { value: config.edgePadding },
                uSilhouette: { value: silhouetteTexture },
                uSilhouetteScale: { value: 0.7 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(this.mesh);

        window.addEventListener("mousemove", this.onMouseMove);
        this.animate();
    }

    onMouseMove = (e) => {
        if (!this.isActive) return;
        this.targetMouse.x = e.clientX / window.innerWidth;
        this.targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    }

    resize() {
        if (!this.isActive || !this.renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.material.uniforms.uResolution.value.set(width, height);
        this.material.uniforms.uTextureSize.value.set(width, height);
    }

    animate = () => {
        if (!this.isActive) return;
        this.rafId = requestAnimationFrame(this.animate);

        this.material.uniforms.uTime.value += 0.005;
        this.mouse.x = lerp(this.mouse.x, this.targetMouse.x, config.lerpFactor);
        this.mouse.y = lerp(this.mouse.y, this.targetMouse.y, config.lerpFactor);
        this.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);

        this.renderer.render(this.scene, this.camera);
    }

    initScroll() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.getAll().forEach(t => t.kill());

        const heroDesktop = document.querySelector('.hero-desktop');
        const nextSectionContent = document.querySelector('.next-section .content');
        if (!heroDesktop) return;

        // Clean previous props
        gsap.set(this.renderer.domElement, { clearProps: "all" });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero-desktop",
                start: "top top",
                end: "+=100%",
                pin: true,
                scrub: 1,
                snap: { snapTo: 1, duration: { min: 0.5, max: 1 }, ease: "power1.inOut" }
            }
        });

        // 1. Zoom Shader
        tl.to(this.mesh.scale, { x: 5, y: 5, ease: "none", duration: 1 }, 0);

        // 2. Refined Text Exit Animation
        const titleSpans = heroDesktop.querySelectorAll('.title-container span');
        const tagline = heroDesktop.querySelector('.hero-tagline');
        const textTop = heroDesktop.querySelector('.hero-text-top');

        if (titleSpans.length > 0) {
            tl.to(titleSpans, { y: -100, opacity: 0, stagger: 0.02, ease: "power2.in", duration: 0.6 }, 0);
        }
        if (tagline) {
            tl.to(tagline, { y: -50, opacity: 0, ease: "power2.in", duration: 0.5 }, 0.1);
        }
        if (textTop) {
            tl.to(textTop, { y: -50, opacity: 0, ease: "power2.in", duration: 0.5 }, 0.1);
        }

        // Fade out Canvas
        tl.to(this.renderer.domElement, { opacity: 0, ease: "none", duration: 0.4 }, 0.6);

        // 3. Reveal Next Section
        if (nextSectionContent) {
            tl.to(nextSectionContent, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 0.5);
        }
    }

    dispose() {
        this.isActive = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        window.removeEventListener("mousemove", this.onMouseMove);
        if (this.renderer && this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        if (this.material) this.material.dispose();
        if (this.renderer) this.renderer.dispose();
    }
}

// ==========================================
// MOBILE MANAGER
// ==========================================
class MobileManager {
    constructor() {
        this.container = document.querySelector(".hero-mobile");
        this.isActive = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.mesh = null;
        this.rafId = null;
    }

    init() {
        if (!this.container) return;
        this.isActive = true;

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        // 65vh Height Logic to match CSS and prevent aspect ratio distortion
        const width = window.innerWidth;
        const height = window.innerHeight * 0.65;
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Material Setup (Mobile-specific scale: 0.8)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(width, height) },
                uTextureSize: { value: new THREE.Vector2(width, height) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uParallaxStrength: { value: config.parallaxStrength },
                uDistortionMultiplier: { value: config.distortionMultiplier },
                uGlassStrength: { value: config.glassStrength },
                ustripesFrequency: { value: config.stripesFrequency },
                uglassSmoothness: { value: config.glassSmoothness },
                uEdgePadding: { value: config.edgePadding },
                uSilhouette: { value: silhouetteTexture },
                uSilhouetteScale: { value: 0.75 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(this.mesh);
        this.animate();
    }

    resize() {
        if (!this.isActive || !this.renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight * 0.65;
        this.renderer.setSize(width, height);
        this.material.uniforms.uResolution.value.set(width, height);
        this.material.uniforms.uTextureSize.value.set(width, height);
    }

    animate = () => {
        if (!this.isActive) return;
        this.rafId = requestAnimationFrame(this.animate);
        this.material.uniforms.uTime.value += 0.005;
        this.renderer.render(this.scene, this.camera);
    }

    initScroll() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.getAll().forEach(t => t.kill());

        const heroMobile = document.querySelector('.hero-mobile');
        const nextSectionContent = document.querySelector('.next-section .content');
        if (!heroMobile) return;

        // Ensure visibility reset
        gsap.set(this.renderer.domElement, { clearProps: "all" });
        const mobileHeader = heroMobile.querySelector('.mobile-header');
        const mobileBody = heroMobile.querySelector('.mobile-body');
        const mobileBg = heroMobile.querySelector('.hero-mobile-bg');
        if (nextSectionContent) gsap.set(nextSectionContent, { opacity: 0, y: 20 });

        const mobileTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero-mobile",
                start: "top top",
                end: "+=100%",
                pin: true,
                scrub: 1,
                snap: { snapTo: 1, duration: { min: 0.3, max: 0.8 }, ease: "power1.inOut" }
            }
        });

        // 1. Zoom Shader
        mobileTl.to(this.mesh.scale, { x: 5, y: 5, ease: "none", duration: 1 }, 0);

        // 2. Fade Out Content
        const mobileElements = [mobileHeader, mobileBody].filter(el => el);
        if (mobileElements.length > 0) {
            mobileTl.to(mobileElements, { y: -50, opacity: 0, ease: "power2.in", duration: 0.5 }, 0);
        }

        // 3. Fade Out BG and Canvas
        mobileTl.to([this.renderer.domElement, mobileBg], { opacity: 0, ease: "none", duration: 0.5 }, 0.5);

        // 4. Reveal Next Section
        if (nextSectionContent) {
            mobileTl.to(nextSectionContent, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 0.5);
        }
    }

    dispose() {
        this.isActive = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.renderer && this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        if (this.material) this.material.dispose();
        if (this.renderer) this.renderer.dispose();
    }
}

// ==========================================
// CONTROLLER
// ==========================================
let activeManager = null;

function initCanvas() {
    const isDesktop = window.innerWidth > 768;
    if (activeManager) {
        if ((isDesktop && activeManager instanceof DesktopManager) ||
            (!isDesktop && activeManager instanceof MobileManager)) {
            activeManager.resize();
            return;
        }
        activeManager.dispose();
        activeManager = null;
    }
    activeManager = isDesktop ? new DesktopManager() : new MobileManager();
    activeManager.init();

    // If switching modes dynamically after load, re-bind scroll logic
    // But usually preloader handles the first bind. 
    // If preloader is done, we might need to auto-call scroll init.
    // Check if preloader is hidden? Or just simply re-init scroll if desired.
    // For now, let's assume resize keeps scroll context via ScrollTrigger.refresh() mostly, 
    // but switching Managers requires re-binding.
    if (document.querySelector('.preloader').style.display === 'none') {
        startScrollAnimations();
    }
}

function startScrollAnimations() {
    if (activeManager) activeManager.initScroll();
}

window.addEventListener("resize", () => {
    initCanvas();
});

// Initial Start
initCanvas();


// ==========================================
// TYPOGRAPHY & PRELOADER
// ==========================================
// Target Desktop Title specifically for splitting
const titleContainer = document.querySelector('.hero-desktop .title-container');
const heroTextTop = document.querySelector('.hero-desktop .hero-text-top');
const heroTagline = document.querySelector('.hero-desktop .hero-tagline');

if (titleContainer) {
    const currentText = titleContainer.innerText;
    titleContainer.innerHTML = '';
    currentText.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        span.style.opacity = '0';
        span.style.transform = 'translateY(50px)';
        span.style.display = 'inline-block';
        titleContainer.appendChild(span);
    });
}

window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            const textElement = document.querySelector('.preloader-text');
            const preloader = document.querySelector('.preloader');
            const bars = document.querySelectorAll('.bar');

            if (!textElement || !preloader) return;

            const words = [
                "D<span class='serif-e'>e</span>si<span class='serif-e'>r</span>e<sup class='asterisk'>*</sup>",
                "D<span class='serif-e'>e</span>s<span class='serif-e'>i</span>gn<sup class='asterisk'>*</sup>",
                "D<span class='serif-e'>e</span>ve<span class='serif-e'>l</span>op<sup class='asterisk'>*</sup>"
            ];

            const textTl = gsap.timeline();
            words.forEach((word) => {
                textTl.to(textElement, { duration: 0, onComplete: () => { textElement.innerHTML = word; gsap.set(textElement, { y: 30, opacity: 0 }); } })
                    .to(textElement, { duration: 0.5, y: 0, opacity: 1, ease: "power2.out" })
                    .to(textElement, { duration: 0.4 })
                    .to(textElement, { duration: 0.4, y: -30, opacity: 0, ease: "power2.in" });
            });

            tl.add(textTl).to(bars, { duration: 0.5, scaleY: 1, stagger: 0.05, ease: "power2.inOut" })
                .to(preloader, {
                    duration: 0.5, opacity: 0,
                    onComplete: () => {
                        preloader.style.display = 'none';
                        if (typeof gsap !== 'undefined') {
                            const entranceTl = gsap.timeline();
                            if (heroTextTop) entranceTl.to(heroTextTop, { y: 0, opacity: 0.9, duration: 1, ease: "power3.out" }, 0);
                            if (titleContainer) {
                                const charSpans = titleContainer.querySelectorAll('span');
                                if (charSpans.length > 0) entranceTl.to(charSpans, { y: 0, opacity: 1, duration: 1, stagger: 0.05, ease: "power4.out" }, 0.2);
                            }
                            if (heroTagline) {
                                entranceTl.to(heroTagline, {
                                    y: 0, opacity: 1, duration: 1, ease: "power3.out",
                                    onComplete: () => {
                                        // Start Scroll Logic via Active Manager
                                        startScrollAnimations();
                                    }
                                }, 0.5);
                            } else {
                                startScrollAnimations();
                            }
                        }
                    }
                });
        } else {
            document.querySelector('.preloader').style.display = 'none';
        }
    }, 100);
});
