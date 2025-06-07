import React from 'react';
// Removed Link import as it's not used in the new structure
// Removed PlanCardMini and PlanCardMain imports

const PlanSection = () => {
  // Removed the 'plans' state as the new structure is static for now.
  // If these plans need to be dynamic, you'll fetch them similar to PricingPage.jsx

  return (
    <section className="pricing-section"> {/* Use the class name you provided */}
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <div className="section-title text-center title-ex1">
              <h2>Some Pricing Plans</h2>
              <p>Get in on the action with some of the best Pricing Plans in the world</p>
            </div>
          </div>
        </div>
        {/* Pricing Table starts */}
        <div className="row">
          <div className="col-md-4">
            <div className="price-card">
              <h2>Startup</h2>
              <p>Reccomended for new users</p>
              <p className="price"><span>50</span>/ 2 Days</p>
              <ul className="pricing-offers">
                <li>20% Profits</li>
                <li>100% Refund Policy</li>
                <li>Trade Coverage</li>
                <li>Little trade time</li>
                <li>0 Hidden fees</li>
              </ul>
              {/* If this should navigate within your React app, consider using <Link> from react-router-dom */}
              {/* For now, keeping it as an <a> tag as per your HTML structure */}
            </div>
          </div>
          <div className="col-md-4">
            <div className="price-card featured"> {/* Added 'featured' class */}
              <h2>Enterpreneur</h2>
              <p>Most popular choice</p>
              <p className="price"><span>2,500</span>/ 14 Days</p>
              <ul className="pricing-offers">
                <li>65% Profits</li>
                <li>100% Refund Policy</li>
                <li>Trade Coverage</li>
                <li>100% more if you get two at once</li>
                <li>0 hidden fees</li>
              </ul>
            </div>
          </div>
          <div className="col-md-4">
            <div className="price-card">
              <h2>Business</h2>
              <p>For Startup Business or Establishments</p>
              <p className="price"><span>10,000</span>/ 30 Days</p>
              <ul className="pricing-offers">
                <li>200% Profits</li>
                <li>100% Refund Policy</li>
                <li>Trade Coverage</li>
                <li>Business insurance From Us</li>
                <li>24/7 Financial Advisors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PlanSection;
