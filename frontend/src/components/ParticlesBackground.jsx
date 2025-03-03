import React, { useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const particlesOptions = {
  fullScreen: { enable: false },
  background: { 
    color: "#f5f5f5"  // Light grey background for better text readability
  },
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
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      console.log('tsParticles engine initialized', engine);
      await loadSlim(engine);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log('tsParticles container loaded', container);
  };

  return (
    <Particles
      id="tsparticles"
      loaded={particlesLoaded}
      options={particlesOptions}
    />
  );
};

export default ParticlesBackground;
