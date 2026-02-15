import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- CONFIGURATION ---
    const particleCount = window.innerWidth < 768 ? 60 : 100; // Responsive count
    const connectionDistance = 160; // Max distance to draw line
    const mouseDistance = 200; // Radius for mouse interaction
    
    // "Medical AI" Palette: Cyan, Blue, Indigo, and a hint of Pulse Red
    const colors = [
      "rgba(34, 211, 238)", // Cyan-400
      "rgba(129, 140, 248)", // Indigo-400
      "rgba(56, 189, 248)", // Sky-400
      "rgba(248, 113, 113)", // Red-400 (Accents)
    ];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6, // Smooth slow drift
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2 + 1,     // Varied sizes for depth
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Enable additive color blending for "glowing" effect
      ctx.globalCompositeOperation = 'lighter';

      // 1. UPDATE & DRAW PARTICLES
      particles.forEach((p, i) => {
        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse Repulsion (Subtle push)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseDistance) {
           const forceDirectionX = dx / distance;
           const forceDirectionY = dy / distance;
           const force = (mouseDistance - distance) / mouseDistance;
           const repulsionStrength = 0.05; // Gentle push
           
           p.vx += forceDirectionX * force * repulsionStrength;
           p.vy += forceDirectionY * force * repulsionStrength;
        }

        // Draw Particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "DD"; // Hex + Alpha
        ctx.fill();

        // 2. CONNECT LINES
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distX = p.x - p2.x;
          const distY = p.y - p2.y;
          const dist = Math.sqrt(distX * distX + distY * distY);

          if (dist < connectionDistance) {
            ctx.beginPath();
            // Opacity based on distance (Fade out smoothly)
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.2})`; // Slate-400 with dynamic alpha
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // 3. CONNECT TO MOUSE (Interactive Feedback)
        if (distance < connectionDistance) {
            ctx.beginPath();
            const opacity = 1 - distance / connectionDistance;
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.4})`; // Cyan glow near mouse
            ctx.lineWidth = 1.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => init();
    const handleMouseMove = (e: MouseEvent) => {
      // Get relative position if canvas isn't full screen, though here it is fixed
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    init();
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#09090b]">
      
      {/* 1. Deep Space Gradient Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#09090b] to-[#000000] opacity-80" />
      
      {/* 2. Top-Left Light Source (Sun/Glare effect) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* 3. Bottom-Right Accent (Cyber feel) */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* 4. The Canvas Mesh */}
      <canvas ref={canvasRef} className="absolute inset-0 block opacity-60" />
      
      {/* 5. Vignette Overlay (Focuses attention to center) */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_#09090b_100%)] opacity-80" />
      
    </div>
  );
};

export default ParticleBackground;