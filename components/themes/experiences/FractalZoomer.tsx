"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { ZoomIn, Eye } from "lucide-react";

export function FractalZoomer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // WebGL State
  const [zoom, setZoom] = useState(1.0);
  const [offsetX, setOffsetX] = useState(-0.5);
  const [offsetY, setOffsetY] = useState(0.0);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);

  const vertexShaderSrc = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSrc = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_offset;
    uniform float u_zoom;
    
    void main() {
      vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
      
      // Scale and offset
      vec2 c = uv * u_zoom + u_offset;
      vec2 z = vec2(0.0);
      
      float iter = 0.0;
      const float max_iter = 100.0;
      
      for(float i = 0.0; i < 100.0; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if(length(z) > 2.0) break;
        iter++;
      }
      
      if(iter == max_iter) {
         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
         float color = iter / max_iter;
         // Generate some pretty colors based on iteration
         gl_FragColor = vec4(color * 0.5, color * 0.2 + 0.1, color * 0.8 + 0.2, 1.0);
      }
    }
  `;

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
     
     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
     }
     
     programRef.current = program;

     // Set up a full-screen quad
     const buffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,  1.0, -1.0,  -1.0,  1.0,
        -1.0,  1.0,  1.0, -1.0,   1.0,  1.0
     ]), gl.STATIC_DRAW);

     const positionLoc = gl.getAttribLocation(program, "position");
     gl.enableVertexAttribArray(positionLoc);
     gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  }, []);

  useEffect(() => {
     const render = () => {
        const gl = glRef.current;
        const program = programRef.current;
        const canvas = canvasRef.current;
        if (!gl || !program || !canvas) return;

        // Resize
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(program);

        const resLoc = gl.getUniformLocation(program, "u_resolution");
        const offsetLoc = gl.getUniformLocation(program, "u_offset");
        const zoomLoc = gl.getUniformLocation(program, "u_zoom");

        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.uniform2f(offsetLoc, offsetX, offsetY);
        gl.uniform1f(zoomLoc, zoom);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        rafRef.current = requestAnimationFrame(render);
     };
     render();

     return () => cancelAnimationFrame(rafRef.current);
  }, [zoom, offsetX, offsetY]);

  const handleWheel = (e: React.WheelEvent) => {
     // Zoom in towards center
     const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
     setZoom(prev => prev * zoomFactor);
  };

  const [isDragging, setIsDragging] = useState(false);
  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDragging) return;
     // Pan logic
     setOffsetX(prev => prev - (e.movementX * zoom * 0.002));
     setOffsetY(prev => prev + (e.movementY * zoom * 0.002));
  };

  // Auto zoom demo
  useEffect(() => {
     let interval: any;
     if (mode !== "editor-preview") {
        interval = setInterval(() => {
           setZoom(z => z * 0.99); // Slow auto zoom
           setOffsetX(x => x - 0.0005);
        }, 16);
     }
     return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-black text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
         <h2 className="text-xl font-black uppercase tracking-widest drop-shadow-md text-white flex items-center gap-2">
            <Eye size={24} /> Mandelbrot Shader
         </h2>
         <p className="text-xs text-white/70 mt-1 uppercase font-mono tracking-widest drop-shadow">
            Real-Time WebGL Fractal
         </p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex justify-between items-end">
         <div className="bg-black/50 backdrop-blur px-4 py-2 rounded border border-white/20 text-[10px] font-mono text-white/70 uppercase tracking-widest">
            Zoom: {(1/zoom).toFixed(2)}x
         </div>
         <div className="bg-black/50 backdrop-blur px-4 py-2 rounded border border-white/20 text-[10px] font-mono text-white/70 uppercase tracking-widest flex items-center gap-2">
            <ZoomIn size={12} /> Drag to Pan • Scroll to Zoom
         </div>
      </div>

      <canvas 
         ref={canvasRef}
         className="absolute inset-0 w-full h-full object-cover touch-none cursor-grab active:cursor-grabbing"
         onWheel={handleWheel}
         onPointerDown={handlePointerDown}
         onPointerUp={handlePointerUp}
         onPointerLeave={handlePointerUp}
         onPointerMove={handlePointerMove}
      />

    </div>
  );
}
