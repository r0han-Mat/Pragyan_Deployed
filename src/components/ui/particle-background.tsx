import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const particleCount = 120; // Increased density
    const connectionDistance = 140;
    const colors = ["#6366f1", "#10b981", "#3b82f6", "#f43f5e"]; // Added Rose for accent

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
          vx: (Math.random() - 0.5) * 0.8, // Slightly faster
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 2 + 1.5, // Slightly larger
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and Draw Particles
      particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse Interaction (Gentle Repulsion)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 250) { // Larger interaction radius
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (250 - distance) / 250;
            const repulsionStrength = 0.08; 
            p.vx += forceDirectionX * force * repulsionStrength;
            p.vy += forceDirectionY * force * repulsionStrength;
        }

        // Draw Dot with GLOW
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.shadowBlur = 15; // NEON GLOW
        ctx.shadowColor = colors[i % colors.length];
        ctx.globalAlpha = 0.8;
        ctx.fill();
        
        // Reset shadow for performance (lines don't need heavy glow)
        ctx.shadowBlur = 0;

        // Connect Lines
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = colors[i % colors.length]; // Inherit color
                ctx.globalAlpha = (1 - dist / connectionDistance) * 0.5; // Faded lines
                ctx.lineWidth = 0.8;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
      });
      
      // Reset Alpha
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => init();
    const handleMouseMove = (e: MouseEvent) => {
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
    <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base Gradient for Depth */}
        <div className="absolute inset-0 bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]" />
        {/* Canvas Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
};

export default ParticleBackground;
