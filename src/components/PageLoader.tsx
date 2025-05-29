import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
// import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'; // DrawSVGPlugin is not needed for star animation

// No need to register DrawSVGPlugin anymore
// if (typeof window !== "undefined") {
//   gsap.registerPlugin(DrawSVGPlugin);
// }

interface PageLoaderProps {
  onComplete?: () => void;
}

const PageLoader: React.FC<PageLoaderProps> = ({ onComplete }) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(SVGPathElement | null)[]>([]);

  // SVG path for a simple 4-pointed star
  const starPath = "M 10 0 L 13 10 L 20 13 L 10 16 L 7 26 L 0 13 L 7 10 Z";
  const starColor = "#A07B5A"; // Bronze/gold tone
  const numStars = 10; // Increased number of stars to 10
  const svgSize = 160; // Increased SVG container size
  const starViewBoxSize = 20;

  useEffect(() => {
    const stars = starRefs.current.filter(Boolean) as SVGPathElement[];
    if (stars.length === 0 || !loaderRef.current) return;

    gsap.set(loaderRef.current, { opacity: 1 });

    // Set initial properties for stars with random scale and slightly scattered positions
    gsap.set(stars, {
        opacity: 0,
        scale: (i) => 0.5 + Math.random() * 0.7, // Random scale between 0.5 and 1.2
        x: () => Math.random() * (svgSize - starViewBoxSize), // Random initial X position within SVG bounds
        y: () => Math.random() * (svgSize - starViewBoxSize), // Random initial Y position within SVG bounds
        rotation: () => Math.random() * 360, // Random initial rotation
        transformOrigin: "50% 50%", // Scale/rotate around the center of each star
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
        gsap.killTweensOf(stars);
      },
      delay: 0.5,
    });

    // Animation for stars: fade in and float/pulse with scatter
    tl.to(stars, {
        opacity: 1,
        y: "+=10", // Float up/down slightly
        scale: "+=0.1", // Pulse scale by adding 0.1 to current scale and yoyoing back
        rotation: "+=360", // Continuous rotation
        duration: (i) => 2 + Math.random() * 2, // Randomize duration slightly
        ease: 'sine.inOut', // Smooth wave effect
        repeat: -1,
        yoyo: true,
        stagger: {
            each: 0.15,
            from: "random",
            ease: "sine.inOut",
            grid: "auto",
            amount: 1.5
        }
    })
    // Fade out the loader overlay
    .to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, "+=2");

    // Clean up GSAP animations on component unmount
    return () => {
      tl.kill();
    };

  }, [onComplete]);

  // --- Speckled Background Styling ---
  // Using a pseudo-element with radial gradients
  const speckledBackgroundStyle = {
    content: '' as const,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
    // Create a repeating radial gradient for dots
    backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 0)',
    backgroundSize: '20px 20px', // Adjust size for desired dot density
    opacity: 0.4, // Adjust opacity of the dots
    zIndex: 0, // Ensure it's behind the stars
  };

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 text-gray-800 overflow-hidden"
      style={{ position: 'fixed' }} // Ensure fixed positioning
    >
      {/* Speckled Background Layer */}
       {/* This div will have the speckled background via CSS */}
      <div className="absolute inset-0 z-0" style={speckledBackgroundStyle as React.CSSProperties} />

      {/* Star SVG Container */}
      {/* Center the SVG in the middle of the screen, above the speckled background */}
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        {/* Create stars and position them (initial positions will be random via GSAP) */}
        {Array.from({ length: numStars }).map((_, index) => (
           <path
            key={index}
            ref={el => starRefs.current[index] = el}
            d={starPath}
            fill={starColor}
            // Initial position will be set by GSAP, so no style translate needed here unless for a specific default
            // Keeping a default transformOrigin for safety
            style={{ transformOrigin: '50% 50%' }}
          />
        ))}
      </svg>
      {/* Removed Loading text */}
    </div>
  );
};

export default PageLoader;