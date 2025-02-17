'use client';

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import { Particles } from "react-tsparticles";
import { cn } from '@/lib/utils';

interface BackgroundProps {
  className?: string;
}

export function Background({ className }: BackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Base gradient - dark green to black */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#041410] via-[#0A1F17] to-[#0C2419]" />
      
      {/* Organic light beams */}
      <div className="absolute inset-0">
        {/* Central beam */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-900/10 via-green-900/5 to-transparent blur-[100px] opacity-30" />
        
        {/* Offset beams */}
        <div className="absolute left-1/4 top-1/3 w-[600px] h-[600px] bg-gradient-radial from-green-900/10 via-emerald-900/5 to-transparent blur-[80px] opacity-20" />
        <div className="absolute right-1/4 bottom-1/3 w-[500px] h-[500px] bg-gradient-radial from-teal-900/10 via-green-900/5 to-transparent blur-[90px] opacity-15" />
      </div>

      {/* Particles */}
      <Particles
        className="absolute inset-0"
        init={particlesInit}
        options={{
          fullScreen: false,
          fpsLimit: 120,
          particles: {
            color: {
              value: ["#10B981", "#059669", "#047857"],
            },
            move: {
              enable: true,
              direction: "none",
              random: true,
              speed: { min: 0.3, max: 0.8 },
              straight: false,
              outModes: {
                default: "bounce",
                top: "bounce",
                bottom: "bounce",
                left: "bounce",
                right: "bounce",
              },
            },
            number: {
              value: 100,
              density: {
                enable: true,
                area: 800,
              },
            },
            opacity: {
              value: { min: 0.1, max: 0.5 },
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.1,
                sync: false,
              },
            },
            size: {
              value: { min: 0.5, max: 3 },
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.5,
                sync: false,
              },
            },
            life: {
              duration: {
                sync: false,
                value: 0,
              },
              count: 0,
            },
            zIndex: {
              value: { min: -1, max: 1 },
              opacityRate: 0.5,
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onHover: {
                enable: true,
                mode: ["grab", "bubble"],
              },
            },
            modes: {
              grab: {
                distance: 200,
                links: {
                  opacity: 0.2,
                },
              },
              bubble: {
                distance: 200,
                size: 4,
                duration: 0.3,
                opacity: 0.8,
              },
            },
          },
          background: {
            color: "transparent",
          },
          detectRetina: true,
        }}
      />

      {/* Animated light blooms */}
      <LightBloom 
        className="top-1/4 left-1/4 w-[600px] h-[600px]"
        color="green"
        delay={0}
      />
      
      <LightBloom 
        className="bottom-1/3 right-1/4 w-[500px] h-[500px]"
        color="emerald"
        delay={1}
      />
      
      <LightBloom 
        className="top-1/2 right-1/3 w-[400px] h-[400px]"
        color="green"
        delay={2}
      />

      {/* Organic texture overlay */}
      <div 
        className="absolute inset-0 mix-blend-soft-light opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle radial gradients for depth */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-radial from-emerald-950/10 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-radial from-green-950/10 via-transparent to-transparent opacity-40" />
      </div>

      {/* Darker vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
    </div>
  );
}

interface LightBloomProps {
  className?: string;
  color: 'green' | 'emerald';
  delay?: number;
}

function LightBloom({ className, color, delay = 0 }: LightBloomProps) {
  const baseAnimation = {
    scale: [1, 1.15, 1],
    opacity: [0.15, 0.2, 0.15],
    filter: ["blur(80px)", "blur(100px)", "blur(80px)"],
  };

  const gradientMap = {
    green: "from-green-900/15 via-emerald-900/8 to-transparent",
    emerald: "from-emerald-900/15 via-green-900/8 to-transparent",
  };

  return (
    <motion.div
      animate={baseAnimation}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={cn(
        "absolute rounded-full bg-gradient-radial",
        gradientMap[color],
        className
      )}
    />
  );
}
