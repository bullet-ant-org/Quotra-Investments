// c:\Users\Bullet Ant\Desktop\CODING\quotra\src\layout\Dashboard\SupportPage.jsx
import React from 'react'; // Keep React import
// Make sure you have the necessary CSS for the 'main-timeline'
// and related classes loaded in your project for this to display correctly.
// import './SupportPage.css'; // Or your relevant CSS file

const secSection3 = () => {
  // The previous form and contact details content is replaced by the timeline

  return (
    <div className="container"> {/* Main container */}
      <div className="main-timeline"> {/* Timeline wrapper */}

        {/* start experience section */}
        <div className="timeline">
          <div className="icon"></div>
          <div className="date-content">
            <div className="date-outer">
              <span className="date">
                <span className="month">12 Years</span>
                <span className="year">2013</span>
              </span>
            </div>
          </div>
          <div className="timeline-content">
            <h5 className="title">Trader &amp; Stock Broker </h5> {/* Use &amp; for ampersand */}
            <p className="description">
              12 years working with the company, i have never felt so alive, having to work with such a good company and having people to believe in my is all that keeps me going.
            </p>
          </div>
        </div>
        {/* end experience section */}

        {/* start experience section */}
        <div className="timeline">
          <div className="icon"></div>
          <div className="date-content">
            <div className="date-outer">
              <span className="date">
                <span className="month">10 Years</span>
                <span className="year">2015</span>
              </span>
            </div>
          </div>
          <div className="timeline-content">
            <h5 className="title">Stocks Analyser</h5>
            <p className="description">
              With alot of experience in the field comes alot of knowledge and risk handling, and this helps one know exactly how to make trades to reduce the risks of failed investments
            </p>
          </div>
        </div>
        {/* end experience section */}

        {/* start experience section */}
        <div className="timeline">
          <div className="icon"></div>
          <div className="date-content">
            <div className="date-outer">
              <span className="date">
                <span className="month">5 Years</span>
                <span className="year">2020</span>
              </span>
            </div>
          </div>
          <div className="timeline-content">
            <h5 className="title">Ceo</h5>
            <p className="description">
              Having to manage such a big comany is something i never imagined will ever happen, but now its just one risk after the other
            </p>
          </div>
        </div>
        {/* end experience section */}

        {/* start experience section */}
        <div className="timeline">
          <div className="icon"></div>
          <div className="date-content">
            <div className="date-outer">
              <span className="date">
                <span className="month">2 Years</span>
                <span className="year">2023</span>
              </span>
            </div>
          </div>
          <div className="timeline-content">
            <h5 className="title">Trader</h5>
            <p className="description">
              Having to manage how peoples investment goes is a dream come through which i cant take for granted, im greatful for your trust
            </p>
          </div>
        </div>
        {/* end experience section */}

      </div> {/* End main-timeline */}
    </div> // End container
  );
}

export default secSection3;
