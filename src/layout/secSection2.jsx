// src/layout/HeadlineSlider.jsx
import React, { useState, useEffect } from 'react';
import { GNEWS_API_KEY } from '../utils/api'; // Import the API key

// Fallback image if an article doesn't have one
const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400x250/0d6efd/FFFFFF?text=News+Headline';
const MAX_HEADLINES_TO_FETCH = 70;
const CACHE_DURATION_HOURS = 2;
const CACHE_KEY = 'gnewsCache';

const secSection2 = () => {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndCacheHeadlines = async () => {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { timestamp, articles } = JSON.parse(cachedData);
        const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (ageInHours < CACHE_DURATION_HOURS) {
          console.log("Using cached news data.");
          setHeadlines(articles);
          setLoading(false);
          return;
        } else {
          console.log("Cache expired, fetching new data.");
        }
      }

      try {
        // Fetch top headlines. You can customize with `country`, `category`, `q` (keywords) etc.
        // GNews API: lang=en for English, max=${MAX_HEADLINES_TO_FETCH}
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?token=${GNEWS_API_KEY}&lang=en&max=${MAX_HEADLINES_TO_FETCH}&topic=business`
          // You can change topic=business to other topics like 'world', 'nation', 'technology', 'entertainment', 'sports', 'science', 'health'
          // Or use `q=keyword` for specific searches.
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors ? errorData.errors.join(', ') : `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const formattedArticles = data.articles.map(article => ({
          id: article.url, // GNews provides a URL which is good for a unique ID
          text: article.title,
          image: article.image || FALLBACK_IMAGE_URL, // Use GNews image or fallback
          link: article.url,
        })).filter(article => article.image !== FALLBACK_IMAGE_URL || article.image); // Prefer articles with actual images

        setHeadlines(formattedArticles);

        // Cache the new data
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          articles: formattedArticles,
        }));

      } catch (e) {
        console.error("Failed to fetch headlines:", e);
        setError(e.message || "Failed to load headlines. Please try again later.");
        // Optionally, if fetching fails, try to load stale cache if available
        if (cachedData) {
            const { articles } = JSON.parse(cachedData);
            setHeadlines(articles);
            console.warn("API fetch failed, using stale cache.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndCacheHeadlines();
  }, []);

  // Duplicate the data for a seamless loop effect
  const doubledHeadlines = headlines.length > 0 ? [...headlines, ...headlines] : [];

  if (loading && headlines.length === 0) { // Show loading only on initial load without cache
    return (
      <section className="headline-section py-4">
        <div className="container-fluid text-center">
          <h4 className="mb-4">Loading Latest Headlines...</h4>
          {/* You can add a spinner here */}
        </div>
      </section>
    );
  }

  if (error && headlines.length === 0) { // Show error only if there's no data (not even stale cache)
    return (
      <section className="headline-section py-4">
        <div className="container-fluid text-center text-danger">
          <h4 className="mb-4">Error Loading Headlines</h4>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (headlines.length === 0 && !loading) {
    return (
      <section className="headline-section py-4">
        <div className="container-fluid text-center">
          <h4 className="mb-4">No Headlines Available At The Moment.</h4>
        </div>
      </section>
    );
  }

  return (
    <section className="headline-section py-4"> {/* Section wrapper */}
      <div className="container-fluid">
        <h4 className="text-center mb-4">Latest Headlines</h4> {/* Optional title */}
        <div className="headline-slider-container"> {/* Clips the content */}
          <div className="headline-slider-track pt-3"> {/* This div moves */}
            {doubledHeadlines.map((headline, index) => (
              <div
                key={`${headline.id}-${index}`} // Use the unique ID from the article
                className="headline-item"
                style={{ backgroundImage: `url(${headline.image})` }}
              >
                <div className="headline-text">
                  <a href={headline.link} target="_blank" rel="noopener noreferrer" style={{color: 'white', textDecoration: 'none'}}>
                    {headline.text}
                  </a>
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
