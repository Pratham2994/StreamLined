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

  useEffect(() => {
    // Initialize tsParticles engine
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
    // Delay the rendering of particles so that the container's dimensions are set
    const timer = setTimeout(() => {
      setShowParticles(true);
      // Optionally dispatch a resize event if needed
      window.dispatchEvent(new Event('resize'));
    }, 15); // Adjust delay as needed (100-300ms)
    return () => clearTimeout(timer);
  }, []);

  const particlesLoaded = (container) => {
    console.log('tsParticles container loaded', container);
  };

  return showParticles ? (
    <Particles id="tsparticles" loaded={particlesLoaded} options={particlesOptions} />
  ) : null;
};

export default React.memo(ParticlesBackground);
