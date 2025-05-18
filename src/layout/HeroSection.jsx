import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Define the content for each slide
const slides = [
  {
    id: 1,
    backgroundImage: 'url(https://www.nasdaq.com/sites/acquia.prod/files/styles/1370x700/public/gobankingrates/iStock-1417583870-2.jpg?1747554617822262737)', // Use correct path relative to public or import
    title: 'Quotra Investment',
    line1: 'EMBARK ON YOUR TRADING JOURNEY',
    line2: 'WITH A GLOBAL MARKET LEADER',
    buttons: [
      { text: 'Get Started', link: '/login', variant: 'btnpricolor' }, // Changed link to /login
      { text: 'Pricing', link: '/pricing', variant: 'btn-secondary' }, // Changed link to /pricing
    ],
  },
  {
    id: 2,
    backgroundImage: 'url(https://wallpapers.com/images/high/beautiful-representation-of-investment-h9o0tdbw0vfp181s.webp)', // Replace with your second image path
    title: 'Diverse Portfolio Options',
    line1: 'EXPLORE STOCKS, FOREX, AND FUTURES',
    line2: 'TAILORED TO YOUR INVESTMENT STYLE',
    buttons: [
      { text: 'Explore Markets', link: '/markets', variant: 'btn-success' }, // Example button
      { text: 'Learn More', link: '/about', variant: 'btn-outline-light' }, // Example button
    ],
  },
  
  {
    id: 3,
    backgroundImage: 'url(https://img.freepik.com/free-photo/panoramic-view-dubai-city-illuminated-neon-spectrum_23-2151305340.jpg?uid=R147793746&ga=GA1.1.411146356.1744773989&semt=ais_hybrid&w=740)', // Replace with your third image path
    title: 'Secure Your Future',
    line1: 'BUILD WEALTH WITH EXPERT GUIDANCE',
    line2: 'JOIN MILLIONS OF SATISFIED INVESTORS',
    buttons: [
      { text: 'Open Account', link: '/signup', variant: 'btn-warning' }, // Example button
      { text: 'Contact Us', link: '/contact', variant: 'btn-info' }, // Example button
    ],
  },
  // Add more slides as needed
];

const HeroSection = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    // Set up the interval timer
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
    // Apply background image dynamically and add class for transitions
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center herocont-slideshow"
      style={{ backgroundImage: currentSlide.backgroundImage }}
    >
      {/* Add a key to the inner div to force re-render on slide change for animations */}
      <div className="text-center hero-content" key={currentSlide.id}>
        {/* Use responsive display classes */}
        <h1 className="Levelo display-3 display-md-1">{currentSlide.title}</h1>
        <p className="lead">{currentSlide.line1}</p>
        <p>{currentSlide.line2}</p>
        {/* Map through the buttons for the current slide */}
        {currentSlide.buttons.map((button, index) => (
          <Link
            key={index}
            to={button.link}
            // Combine base btn classes with slide-specific variant
            className={`btn ${button.variant} btn-lg mx-1`} // Added mx-1 for spacing
          >
            {button.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
