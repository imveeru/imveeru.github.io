import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';

const config = {
  lerpFactor: 0.035,
  parallaxStrength: 0.1,
  distortionMultiplier: 10,
  glassStrength: 2.0,
  glassSmoothness: 0.0001,
  stripesFrequency: 35,
  edgePadding: 0.1,
};

// One scene serves both layouts.
export class HeroScene {
  constructor(container) {
    this.container = container;
    this.centerMouse = new THREE.Vector2(0.5, 0.5);
    this.mouse = this.centerMouse.clone();
    this.targetMouse = new THREE.Vector2(0.5, 0.5);
    this.visible = true;
    this.reducedMotion = false;
    this.disposed = false;
    this.rafId = null;
    this.lastTime = null;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  async init() {
    try {
      this.texture = await new THREE.TextureLoader().loadAsync(new URL('./veera-silhouette.png', import.meta.url).href);
      if (this.disposed) { this.texture.dispose(); return; }
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2() },
          uTextureSize: { value: new THREE.Vector2() },
          uMouse: { value: this.mouse },
          uParallaxStrength: { value: config.parallaxStrength },
          uDistortionMultiplier: { value: config.distortionMultiplier },
          uGlassStrength: { value: config.glassStrength },
          ustripesFrequency: { value: config.stripesFrequency },
          uglassSmoothness: { value: config.glassSmoothness },
          uEdgePadding: { value: config.edgePadding },
          uSilhouette: { value: this.texture },
          uSilhouetteScale: { value: 0.64 },
          uSilhouetteAspect: { value: this.texture.image.width / this.texture.image.height * 1.1 },
        },
        vertexShader, fragmentShader, transparent: true,
      });
      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
      this.scene.add(this.mesh);
      this.container.append(this.renderer.domElement);
      this.resize();
      this.container.classList.add('has-canvas');
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', this.updatePlayback);
      this.updatePlayback();
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  resize() {
    if (!this.material || this.disposed) return;
    const { width, height } = this.container.getBoundingClientRect();
    this.mobile = width <= 768;
    const canvasHeight = height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, canvasHeight, false);
    this.material.uniforms.uResolution.value.set(width, canvasHeight);
    this.material.uniforms.uTextureSize.value.set(width, canvasHeight);
    const aspect = this.material.uniforms.uSilhouetteAspect.value;
    this.material.uniforms.uSilhouetteScale.value = this.mobile ? Math.min(.66, width * .9 / (height * aspect)) : .64;
    this.render();
  }

  onPointerMove = (event) => {
    if (this.mobile || this.reducedMotion || event.pointerType === 'touch') return;
    const rect = this.container.getBoundingClientRect();
    this.targetMouse.set(event.clientX / rect.width, 1 - (event.clientY - rect.top) / rect.height);
  };

  render() {
    if (!this.disposed && this.material && !this.contextLost) this.renderer.render(this.scene, this.camera);
  }

  animate = (time) => {
    this.rafId = null;
    if (this.disposed || document.hidden || !this.visible || this.reducedMotion || this.contextLost) return;
    const delta = this.lastTime === null ? 1 / 60 : Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    // Keep the original 60 Hz speed on high-refresh screens.
    this.material.uniforms.uTime.value += delta * 0.3;
    this.mouse.lerp(this.mobile ? this.centerMouse : this.targetMouse, 1 - Math.pow(1 - config.lerpFactor, delta * 60));
    this.render();
    this.rafId = requestAnimationFrame(this.animate);
  };

  setVisible(visible) { if (this.visible === visible) return; this.visible = visible; this.updatePlayback(); }
  setReducedMotion(reduced) { this.reducedMotion = reduced; this.updatePlayback(); }

  updatePlayback = () => {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.lastTime = null;
    if (!this.disposed && this.material && !this.contextLost) {
      if (!document.hidden && this.visible && !this.reducedMotion) this.rafId = requestAnimationFrame(this.animate);
      else this.render();
    }
  };

  onContextLost = (event) => {
    event.preventDefault();
    this.contextLost = true;
    this.container.classList.remove('has-canvas');
    this.updatePlayback();
  };
  onContextRestored = () => {
    this.contextLost = false;
    this.container.classList.add('has-canvas');
    this.updatePlayback();
  };

  dispose() {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('visibilitychange', this.updatePlayback);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
    this.mesh?.geometry.dispose();
    this.material?.dispose();
    this.texture?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.container.classList.remove('has-canvas');
  }
}
