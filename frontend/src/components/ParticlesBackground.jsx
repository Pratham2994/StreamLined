// ParticlesBackground.jsx
import React, { useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const particlesOptions = {
  fullScreen: { enable: false },
  background: { 
    image: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22400%22%20height%3D%22400%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23ffffff%3Bstop-opacity%3A1%22/%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23f7f7f7%3Bstop-opacity%3A1%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grad)%22/%3E%3C/svg%3E"
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
    // Use initParticlesEngine to load the slim plugin once
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
