import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

// Define the content for each slide
const slides = [
  {
    id: 1,
    title: 'Quotra Investment',
    line1: 'EMBARK ON YOUR TRADING JOURNEY',
    line2: 'WITH A GLOBAL MARKET LEADER',
    buttons: [
      { text: 'Get Started', link: '/login', variant: 'btn-light' }, // Changed link to /login
      { text: 'Pricing', link: '#pricing', variant: 'btn-secondary' }, // Changed link to /pricing
    ],
  },
  {
    id: 2,
    title: 'Diverse Portfolio Options',
    line1: 'EXPLORE STOCKS, FOREX, AND FUTURES',
    line2: 'TAILORED TO YOUR INVESTMENT STYLE',
    buttons: [ // Example button
      { text: 'Learn More', link: '/about', variant: 'btn-outline-light' }, // Example button
    ],
  },
  
  {
    id: 3,
    title: 'Secure Your Future',
    line1: 'BUILD WEALTH WITH EXPERT GUIDANCE',
    line2: 'JOIN MILLIONS OF SATISFIED INVESTORS',
    buttons: [
      { text: 'Open Account', link: '/login', variant: 'btn-outline-light' }, // Example button
      { text: 'Services', link: '/services', variant: 'btn-secondary' }, // Example button
    ],
  },
  // Add more slides as needed
];

const SlideShow = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5000ms (5 seconds)

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this effect runs only once on mount

  const currentSlide = slides[currentSlideIndex];

  return (
    <div
      className="text-center hero-content text-white"
      style={{ zIndex: 1 }}
      key={currentSlide.id}
    >
      <h1 className="Levelo display-3 display-md-1">{currentSlide.title}</h1>
      <p className="lead">{currentSlide.line1}</p>
      <p>{currentSlide.line2}</p>
      {currentSlide.buttons.map((button, index) => (
        <Link
          key={index}
          to={button.link}
          className={`btn ${button.variant} btn-lg mx-1`}
        >
          {button.text}
        </Link>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log("Particles container loaded", container);
  };
  const particlesOptions = useMemo(() => ({
    fullScreen: {
      enable: false,
    },
    background: {
      color: {
        value: "#0b0f13ff", // A dark, professional background
      },
    },
    fpsLimit: 90,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 20,
        },
        value: 150,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  }), []);

  if (!init) {
    return null; // or a loading spinner
  }

  return (
    <div
      className="container-fluid position-relative d-flex flex-column align-items-center justify-content-center herocont-slideshow"
      style={{ minHeight: '80vh' }}
    >
      {/*
        This style block is the key fix. It targets the container div that
        tsparticles creates (using the id="tsparticles") and forces it to
        fill its parent.
      */}
      <style>
        {`
          #tsparticles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={particlesOptions} />
      <SlideShow />
    </div>
  );
};

export default HeroSection;