export const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

export const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uTextureSize;
      uniform vec2 uMouse;
      uniform float uParallaxStrength;
      uniform float uDistortionMultiplier;
      uniform float uGlassStrength;
      uniform float ustripesFrequency;
      uniform float uglassSmoothness;
      uniform float uEdgePadding;
      uniform float uSilhouetteScale;
      
      varying vec2 vUv;
      uniform sampler2D uSilhouette;
      
      // Pseudo-random noise
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      // Gradient function
      vec3 getGradient(vec2 uv) {
        float t = uTime * 2.0; // Increased speed (2x base speed)
        vec2 mouse = uMouse;
        
        // Fluid-like warping based on mouse
        float d = distance(uv, mouse);
        float warpStrength = 0.3 * (1.0 - smoothstep(0.0, 0.5, d));
        vec2 dir = normalize(uv - mouse);
        vec2 warpedUV = uv - dir * warpStrength * sin(t * 2.0);
        
        // Colors derived from uploaded image - Softened/Balanced
        // Reduced intensity of dark shade (Lighter/Softer Navy)
        vec3 colorBg = vec3(0.02, 0.15, 0.35); 
        // Mid-tone (Standard Royal Blue)
        vec3 colorMid = vec3(0.0, 0.35, 0.75);
        // Reduced intensity of light shade (Softer Cyan, not neon)
        vec3 colorLight = vec3(0.0, 0.45, 0.85);
        
        // Animate based on warped UVs
        float n1 = sin(warpedUV.x * 3.0 + t + mouse.x + cos(warpedUV.y * 2.0 + t + mouse.y));
        float n2 = cos(warpedUV.y * 4.0 + t + mouse.y + sin(warpedUV.x * 2.0 + mouse.x));
        
        // Background base
        vec3 color = colorBg;
        
        // Mix in Royal Blue
        color = mix(color, colorMid, smoothstep(0.2, 0.8, n1 * 0.5 + 0.5));
        
        // Mix in Bright Cyan
        float noisePatch = sin(warpedUV.x * 5.0 - t * 0.5) * cos(warpedUV.y * 5.0 + t * 0.5);
        color = mix(color, colorLight, smoothstep(0.4, 0.9, noisePatch * 0.5 + 0.5 + n2 * 0.3));
        
        // Soft glows
        float dist1 = length(warpedUV - vec2(0.5 + 0.3 * sin(t), 0.5 + 0.2 * cos(t * 0.7)));
        color += colorMid * 0.3 * (1.0 - smoothstep(0.0, 0.5, dist1));
        
        // Spotlight effect near mouse (stable on original UV)
        float spotlight = 1.0 - smoothstep(0.0, 0.4, d);
        
        // Cyan highlight near mouse (reduced intensity from 0.3 to 0.25)
        color += colorLight * 0.25 * spotlight;
        
        return color;
      }
      
      vec2 getCoverUV(vec2 uv, vec2 textureSize) {
        if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;
        
        vec2 s = uResolution / textureSize;
        float scale = max(s.x, s.y);
        
        vec2 scaledSize = textureSize * scale;
        vec2 offset = (uResolution - scaledSize) * 0.5;
        
        return (uv * uResolution - offset) / scaledSize;
      }
      
      float displacement(float x, float num_stripes, float strength) {
        float modulus = 1.0 / num_stripes;
        return mod(x, modulus) * strength;
      }
      
      float fractalGlass(float x) {
        float d = 0.0;
        for (int i = -5; i <= 5; i++) {
          d += displacement(x + float(i) * uglassSmoothness, ustripesFrequency, uGlassStrength);
        }
        d = d / 11.0;
        return x + d;
      }

      float smoothEdge(float x, float padding) {
        float edge = padding;
        if (x < edge) {
            return smoothstep(0.0, edge, x);
        } else if (x > 1.0 - edge) {
            return smoothstep(1.0, 1.0 - edge, x);
        }
        return 1.0;
      }

      void main() {
        vec2 uv = vUv;
        
        float originalX = uv.x;
        
        float edgeFactor = smoothEdge(originalX, uEdgePadding);
        
        float distortedX = fractalGlass(originalX);
        
        // Mix original and distorted x coordinate based on edge smoothness
        uv.x = mix(originalX, distortedX, edgeFactor);
        
        float distortionFactor = uv.x - originalX;
        
        float parallaxDirection = -sign(0.5 - uMouse.x);
        
        vec2 parallaxOffset = vec2(
          parallaxDirection * abs(uMouse.x - 0.5) * uParallaxStrength * (1.0 + abs(distortionFactor) * uDistortionMultiplier),
          0.0
        );
        
        parallaxOffset *= edgeFactor;
        
        uv += parallaxOffset;
        
        // 1. Base Gradient
        vec3 color = getGradient(uv);
        
        // --- Add Vignette (Before silhouette to blend it better, or after? Usually on top of gradient) ---
        // Circular vignette
        float dVignette = distance(uv, vec2(0.5));
        // Smooth falloff from center
        float vignette = 1.0 - smoothstep(0.4, 1.2, dVignette); 
        // Darken the color
        color *= (vignette * 1.1);


        // 2. Silhouette Image
        // Calculate silhouette UVs
        // Height set by uniform (0.7 desktop, 0.5 mobile)
        float silHeight = uSilhouetteScale;
        vec2 silUV = uv;
        
        // Maintain aspect ratio, but widen slightly (1.45x)
        float imgAspect = (695.0 / 1437.0) * 1.45; // Width / Height * Multiplier
        float screenAspect = uResolution.x / uResolution.y; // Width / Height
        
        // Map y from [0, silHeight] to [0, 1] for the silhouette texture
        silUV.y = uv.y / silHeight;
        
        // Calculate the width of the silhouette in UV space to maintain aspect ratio
        float widthUV = silHeight * imgAspect / screenAspect;
        
        // Center the silhouette horizontally
        silUV.x = (uv.x - 0.5) / widthUV + 0.5;
        
        // Check bounds
        if (silUV.y >= 0.0 && silUV.y <= 1.0 && silUV.x >= 0.0 && silUV.x <= 1.0) {
            vec4 silColor = texture2D(uSilhouette, silUV);
            
            // Linear Burn: Base + Blend - 1.0
            vec3 blendedColor = color + silColor.rgb - vec3(1.0);
            
            // Mix based on opacity (0.9) and texture alpha
            color = mix(color, blendedColor, silColor.a * 0.9);
        }
        
        // 3. Noise Texture (Top Layer)
        float noise = random(uv * uTime); 
        // Increased visibility (from 0.05 to 0.15)
        color += (noise - 0.5) * 0.1;
        
        gl_FragColor = vec4(color, 1.0);
      }
`;
