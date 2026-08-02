"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Globe, RefreshCw } from "lucide-react";

export function ProceduralPlanetGenerator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [seedString, setSeedString] = useState("Justin");
  const [activeSeed, setActiveSeed] = useState("Justin");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  // Quick string hash
  const hashString = (str: string) => {
     let hash = 0;
     for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
     }
     return hash;
  };

  const vertexShaderSrc = `
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    varying vec3 vPos;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    uniform float seed;
    
    // Simplex 3D Noise function (mocked here with sine waves for simplicity in raw WebGL without a library)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vPos = position;
      
      // Calculate noise based on position + seed
      float n = snoise(position * 2.0 + seed * 10.0) * 0.5 + 0.5;
      float n2 = snoise(position * 4.0 - seed * 5.0) * 0.5 + 0.5;
      float elevation = n * 0.2 + n2 * 0.1;
      
      vec3 displacedPos = position + (position * elevation);
      vPos = displacedPos; // pass to fragment for coloring

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
    }
  `;

  const fragmentShaderSrc = `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vPos;
    uniform float seed;
    
    // Simplex noise (same as vertex for consistent coloring if needed, or just use length)
    
    void main() {
      float dist = length(vPos);
      
      // Generate deterministic palette based on seed
      // Using sin functions of seed to create varying colors
      vec3 deepColor = vec3(abs(sin(seed)), abs(cos(seed*1.5)), abs(sin(seed*2.0)));
      vec3 midColor = vec3(abs(sin(seed*1.2)), abs(cos(seed*0.8)), abs(sin(seed*1.7)));
      vec3 highColor = vec3(1.0, 1.0, 1.0);

      // Normalize color ranges
      deepColor = mix(deepColor, vec3(0.0,0.0,0.2), 0.5);
      midColor = mix(midColor, vec3(0.5,0.5,0.0), 0.3);

      vec3 color;
      if (dist < 1.05) {
         color = deepColor; // ocean / lowlands
      } else if (dist < 1.15) {
         color = mix(deepColor, midColor, (dist - 1.05) * 10.0); // land
      } else {
         color = mix(midColor, highColor, (dist - 1.15) * 10.0); // mountains/snow
      }
      
      // Basic lighting (dot product with fake light)
      vec3 normal = normalize(vPos);
      vec3 light = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(normal, light), 0.2);
      
      gl_FragColor = vec4(color * diff, 1.0);
    }
  `;

  // We are going to cheat and use a 2D canvas simulation of 3D for raw React without Three.js to keep it simple, 
  // BUT the prompt asks for WebGL vertex displacement. We will write a tiny WebGL setup.

  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const gl = canvas.getContext("webgl");
     if (!gl) return;
     glRef.current = gl;

     // Compile shaders
     const compileShader = (type: number, src: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
           console.error(gl.getShaderInfoLog(shader));
           gl.deleteShader(shader);
           return null;
        }
        return shader;
     };

     const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSrc);
     const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
     if (!vs || !fs) return;

     const program = gl.createProgram();
     if (!program) return;
     gl.attachShader(program, vs);
     gl.attachShader(program, fs);
     gl.linkProgram(program);
     programRef.current = program;

     // Generate Sphere Geometry (IcoSphere approximation)
     const positions: number[] = [];
     const latBands = 30;
     const longBands = 30;
     const radius = 1.0;

     for (let latNumber = 0; latNumber <= latBands; latNumber++) {
        let theta = latNumber * Math.PI / latBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longBands; longNumber++) {
           let phi = longNumber * 2 * Math.PI / longBands;
           let sinPhi = Math.sin(phi);
           let cosPhi = Math.cos(phi);
           let x = cosPhi * sinTheta;
           let y = cosTheta;
           let z = sinPhi * sinTheta;
           positions.push(radius * x, radius * y, radius * z);
        }
     }

     const indices: number[] = [];
     for (let latNumber = 0; latNumber < latBands; latNumber++) {
        for (let longNumber = 0; longNumber < longBands; longNumber++) {
           let first = (latNumber * (longBands + 1)) + longNumber;
           let second = first + longBands + 1;
           indices.push(first, second, first + 1);
           indices.push(second, second + 1, first + 1);
        }
     }

     const vBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

     const iBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

     const positionLoc = gl.getAttribLocation(program, "position");

     gl.enable(gl.DEPTH_TEST);

     // Matrix math helpers (very basic)
     const createPerspective = (fov: number, aspect: number, near: number, far: number) => {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        return new Float32Array([
           f/aspect, 0, 0, 0,
           0, f, 0, 0,
           0, 0, (far+near)*nf, -1,
           0, 0, (2*far*near)*nf, 0
        ]);
     };

     const createIdentity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
     
     // Simple rotation
     const rotateY = (m: Float32Array, angle: number) => {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c*m[0]+s*m[2]; m[4] = c*m[4]+s*m[6]; m[8] = c*m[8]+s*m[10];
        m[2] = c*m[2]-s*mv0; m[6] = c*m[6]-s*mv4; m[10] = c*m[10]-s*mv8;
     };

     let time = 0;

     const render = () => {
        if (!glRef.current || !programRef.current || !canvasRef.current) return;
        const _gl = glRef.current;
        time += 0.01;

        _gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
        _gl.clearColor(0.0, 0.0, 0.0, 1.0);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        _gl.useProgram(programRef.current);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, vBuffer);
        _gl.vertexAttribPointer(positionLoc, 3, _gl.FLOAT, false, 0, 0);
        _gl.enableVertexAttribArray(positionLoc);

        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, iBuffer);

        const proj = createPerspective(Math.PI/4, canvasRef.current.width/canvasRef.current.height, 0.1, 100.0);
        const modelView = createIdentity();
        // Move back
        modelView[14] = -4.0;
        // Rotate
        rotateY(modelView, time);

        const pLoc = _gl.getUniformLocation(programRef.current, "projectionMatrix");
        const mLoc = _gl.getUniformLocation(programRef.current, "modelViewMatrix");
        const seedLoc = _gl.getUniformLocation(programRef.current, "seed");

        _gl.uniformMatrix4fv(pLoc, false, proj);
        _gl.uniformMatrix4fv(mLoc, false, modelView);
        
        // Pass deterministic seed based on string
        const hash = hashString(activeSeed) / 2147483647; // normalize -1 to 1
        _gl.uniform1f(seedLoc, hash);

        _gl.drawElements(_gl.TRIANGLES, indices.length, _gl.UNSIGNED_SHORT, 0);

        rafRef.current = requestAnimationFrame(render);
     };
     render();

     return () => {
        cancelAnimationFrame(rafRef.current);
     };
  }, [activeSeed]);

  const handleGenerate = (e: React.FormEvent) => {
     e.preventDefault();
     if (!seedString.trim() || isGenerating) return;

     setIsGenerating(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        setActiveSeed(seedString);
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);

        if (onComplete) setTimeout(onComplete, 5000);
     }, 1000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-black text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white/70">
            <Globe size={16} className="text-emerald-500" /> Procedural Planet Engine
         </h2>
      </div>

      <div className="flex-1 relative">
         <canvas 
            ref={canvasRef}
            width={800}
            height={800}
            className="w-full h-full object-cover touch-none"
         />
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center">
         <form onSubmit={handleGenerate} className="w-full max-w-sm relative">
            <input 
               type="text" 
               value={seedString}
               onChange={e => setSeedString(e.target.value)}
               disabled={isGenerating}
               placeholder="Type a name to generate a world..."
               className="w-full bg-black/80 backdrop-blur-md border border-white/20 rounded-xl py-4 px-6 text-white text-center focus:outline-none focus:border-emerald-500 shadow-2xl disabled:opacity-50"
            />
            <button 
               type="submit"
               disabled={!seedString.trim() || isGenerating}
               className="absolute right-2 top-2 bottom-2 w-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:bg-emerald-600/30"
            >
               {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Globe size={16} />}
            </button>
         </form>
      </div>

    </div>
  );
}
