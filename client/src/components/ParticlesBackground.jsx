import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { memo } from 'react';


const particlesOptions = {
  fullScreen: { enable: false },
  background: { color: "#f5f5f5" },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: true, mode: 'repulse' },
      resize: true
    },
    modes: {
      grab: { distance: 200, links: { opacity: 1 } },
      repulse: { distance: 200, duration: 0.4 }
    },
  },
  particles: {
    color: { value: '#555' },
    links: { color: '#555', distance: 150, enable: true, opacity: 0.5, width: 1 },
    move: { enable: true, speed: 2, outModes: { default: 'bounce' } },
    number: { value: 75, density: { enable: true, area: 600 } },
    opacity: { value: 0.7 },
    shape: { type: 'circle' },
    size: { value: 3, random: true },
  },
  detectRetina: true,
};

const ParticlesBackground = () => {
  const [showParticles, setShowParticles] = useState(false);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Initialize tsParticles engine
      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }
    
    // Delay the rendering of particles so that the container's dimensions are set
    const timer = setTimeout(() => {
      setShowParticles(true);
    }, 100); // Slightly longer delay to ensure proper initialization
    
    return () => clearTimeout(timer);
  }, []);

  // Removed console.log to prevent excessive logging
  const particlesLoaded = () => {};

  return showParticles ? (
    <Particles 
      id="tsparticles" 
      loaded={particlesLoaded} 
      options={particlesOptions}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  ) : null;
};

// Use memo to prevent unnecessary re-renders
export default memo(ParticlesBackground);
