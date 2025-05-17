// src/layout/HeadlineSlider.jsx
import React from 'react';


// Sample data for headlines and background images
// In a real app, you'd fetch this data
const headlinesData = [
  { id: 1, text: 'Breaking News: Market Hits Record Highs', image: 'https://static.standard.co.uk/s3fs-public/thumbnails/image/2018/02/02/12/bitcoin0202ac.jpg?crop=8:5,smart&quality=75&auto=webp&width=1000' },
  { id: 2, text: 'Tech Giant Unveils New Gadget', image: 'https://static.standard.co.uk/2024/07/02/8/03/ArcticFit-LED-Running-Vest.jpg?crop=8:5,smart&quality=75&auto=webp&width=1000' },
  { id: 3, text: 'Global Summit Addresses Climate Change', image: 'https://static.standard.co.uk/2025/02/09/19/c05fd182b0f5829d9d8082599f0e49b2Y29udGVudHNlYXJjaGFwaSwxNzM5MjEzNjU1-2.78920527.jpg?crop=8:5,smart&quality=75&auto=webp&width=1000' },
  { id: 4, text: 'Sports Update: Local Team Wins Championship', image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/sport-news-design-template-f27c1fabf4244e6adb535e0d9e8382ac_screen.jpg?ts=1610638130' },
  { id: 5, text: 'Arts & Culture: New Exhibition Opens Downtown', image: 'https://www.roanokeva.gov/Areas/CivicSend/Assets/Uploads/3036/sf801ccd9805b40548d243815a35a7d1a_small_optimized.jpg' },
  { id: 6, text: 'Weather Alert: Storm Approaching Region', image: 'https://www.shutterstock.com/shutterstock/videos/1084338925/thumb/5.jpg?ip=x480' },
  { id: 7, text: 'Business Buzz: Startup Secures Major Funding', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp80mRA8xxHcK9h0fCIzHwnmw-5VSS05a0ug&s' },
  // Add more headlines up to 15 or as needed
  { id: 8, text: 'Headline 8', image: 'https://www.shutterstock.com/image-vector/crypto-currency-news-golden-bitcoin-260nw-773520289.jpg' },
  { id: 9, text: 'Headline 9', image: 'https://img.freepik.com/free-psd/cryptocurrency-concept-template_23-2151598729.jpg' },
  { id: 10, text: 'Headline 10', image: 'https://www.shutterstock.com/image-illustration/smartphone-bitcoin-symbol-onscreen-among-600nw-703957714.jpg' },
  { id: 11, text: 'Headline 11', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF4joYMOU-sK_WMSZ1yRuQfmtWlIgzE-qz7w&s' },
  { id: 12, text: 'Headline 12', image: 'https://ffnews.com/wp-content/uploads/2023/06/Macro-Hedge-Fund-LHG-Capital-Closes-First-Single-Investor-Fund-at-US150-Million.jpg' },
  { id: 13, text: 'Headline 13', image: 'https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ipwLo1i3qIN4/v3/-1x-1.jpg' },
  { id: 14, text: 'Headline 14', image: 'https://i.ytimg.com/vi/EcnlIlBNiRQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA6cGgtJGo1JsALh6jmMDrDe90xCw' },
  { id: 15, text: 'Headline 15', image: 'https://images.cars.com/cldstatic/wp-content/uploads/Lede_Image_What_Are_the_Best_2025_Hybrids_for_the_Money.jpg' },
];

const secSection2 = () => {
  // Duplicate the data for a seamless loop effect
  const doubledHeadlines = [...headlinesData, ...headlinesData];

  return (
    <section className="headline-section py-4"> {/* Section wrapper */}
      <div className="container-fluid">
        <h4 className="text-center mb-4">Latest Headlines</h4> {/* Optional title */}
        <div className="headline-slider-container"> {/* Clips the content */}
          <div className="headline-slider-track pt-3"> {/* This div moves */}
            {doubledHeadlines.map((headline, index) => (
              <div
                key={`${headline.id}-${index}`} // Unique key for duplicated items
                className="headline-item"
                style={{ backgroundImage: `url(${headline.image})` }}
              >
                <div className="headline-text">
                  {headline.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default secSection2;
