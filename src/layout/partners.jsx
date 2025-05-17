// src/layout/PartnerSlider.jsx
import React from 'react';

// Sample data for partner logos
// Replace these with the actual paths to your partner logos
// Ensure logos have transparent backgrounds if possible for best results
const partnerLogos = [
  { id: 1, src: 'https://www.citypng.com/public/uploads/preview/google-logo-with-black-shadow-701751694791466unejofhsxq.png', alt: 'Partner 1 Logo' },
  { id: 2, src: 'https://logos-world.net/wp-content/uploads/2021/04/Robinhood-Logo.png', alt: 'Partner 2 Logo' },
  { id: 3, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2022/11/HSBC-Singapore-1024x432.png', alt: 'Partner 3 Logo' },
  { id: 4, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2022/12/Standard-Chartered-1024x432.jpg', alt: 'Partner 4 Logo' },
  { id: 5, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2023/12/citibank-private-banking-1024x432.jpg', alt: 'Partner 5 Logo' },
  { id: 6, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2023/12/JP-Morgan-1024x432.jpg', alt: 'Partner 6 Logo' },
  { id: 7, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2023/12/credit-suisse-1024x432.jpg', alt: 'Partner 7 Logo' },
  { id: 8, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2022/12/OCBC-1024x432.jpg', alt: 'Partner 8 Logo' },
  { id: 9, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2022/11/DBS-Bank-1024x432.png', alt: 'Partner 9 Logo' },
  { id: 10, src: 'https://www.rafflescredit.com.sg/wp-content/uploads/2022/12/UOB-1024x432.jpg', alt: 'Partner 10 Logo' },
  { id: 11, src: 'https://www.logo.wine/a/logo/PayPal/PayPal-Logo.wine.svg', alt: 'Partner 11 Logo' },
  { id: 12, src: 'https://www.logo.wine/a/logo/Amazon_Pay/Amazon_Pay-Logo.wine.svg', alt: 'Partner 12 Logo' },
  { id: 13, src: 'https://www.logo.wine/a/logo/PlayStation/PlayStation-Logo.wine.svg', alt: 'Partner 13 Logo' },
  { id: 14, src: 'https://www.logo.wine/a/logo/Samsung_Electronics/Samsung_Electronics-Logo.wine.svg', alt: 'Partner 14 Logo' },
  { id: 15, src: 'https://www.logo.wine/a/logo/Coca-Cola/Coca-Cola-Logo.wine.svg', alt: 'Partner 15 Logo' },
];

const PartnerSlider = () => {
  // Duplicate the logos for a seamless loop
  const doubledLogos = [...partnerLogos, ...partnerLogos];

  return (
    // Section with transparent background
    <section className="partner-section py-4" style={{ background: 'transparent' }}>
      <div className="container-fluid">
         {/* Optional Title */}
         <h5 className="text-center text-muted mb-4">Our Partners</h5>
        <div className="partner-slider-container"> {/* Clips the content */}
          <div className="partner-slider-track"> {/* This div moves */}
            {doubledLogos.map((logo, index) => (
              <div key={`${logo.id}-${index}`} className="partner-logo-item">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="partner-logo-img" // Class for styling the image
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerSlider;
