// src/layout/schemes.jsx
import React from 'react';

// Note: Ensure you have the necessary CSS classes defined (e.g., section-title, service-wrapper, text-custom, shadow, etc.)
// Also, make sure you have a library or CSS that provides the 'mdi' icons (like Material Design Icons).

const Schemes = () => { // Renamed component to start with uppercase letter
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="section-title text-center mb-4 pb-2">
            <h4 className="title mb-4">Our Features</h4>
            <p className="text-muted para-desc mx-auto mb-0">
              Features in our website, Services we offer and new and improved methods of making your time with us worthwile
            </p>
          </div>
        </div>{/*end col*/}
      </div>{/*end row*/}

      <div className="row">
        {/* Feature 1 */}
        <div className="col-lg-4 col-md-6 col-12 mt-4 pt-2">
          <div className="card service-wrapper rounded border-0 shadow p-4">
            <div className="icon text-center text-custom h1 shadow rounded bg-white">
              {/* SVG Icon 1 */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <rect width="20" height="15" x="2" y="3" className="uim-tertiary" rx="3"></rect>
                  <path className="uim-primary" d="M16,21H8a.99992.99992,0,0,1-.832-1.55469l4-6a1.03785,1.03785,0,0,1,1.66406,0l4,6A.99992.99992,0,0,1,16,21Z"></path>
                </svg>
              </span>
            </div>
            <div className="content mt-4">
              <h5 className="title text-custom">Multi-device Support</h5>
              <p className="text-primary mt-3 mb-0">
                We have tailored our website to accept multiple devices, on Pc, Tablet and mobile
              </p>
              <div className="mt-3">
                {/* Replaced javascript:void(0) with '#' */}
                <a href="#" className="text-custom">Read More <i className="mdi mdi-chevron-right"></i></a>
              </div>
            </div>
            <div className="big-icon h1 text-custom">
              {/* SVG Icon 1 (Repeated) */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <rect width="20" height="15" x="2" y="3" className="uim-tertiary" rx="3"></rect>
                  <path className="uim-primary" d="M16,21H8a.99992.99992,0,0,1-.832-1.55469l4-6a1.03785,1.03785,0,0,1,1.66406,0l4,6A.99992.99992,0,0,1,16,21Z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>{/*end col*/}

        {/* Feature 2 */}
        <div className="col-lg-4 col-md-6 col-12 mt-4 pt-2">
          <div className="card service-wrapper rounded border-0 shadow p-4">
            <div className="icon text-center text-custom h1 shadow rounded bg-white">
              {/* SVG Icon 2 */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" width="1em">
                  <path className="uim-quaternary" d="M15,2c-3.3772,0.00142-6.27155,2.41462-6.88025,5.73651c2.90693-1.59074,6.553-0.52375,8.14374,2.38317c0.98206,1.79462,0.98206,3.96594,0,5.76057c3.8013-0.69634,6.31837-4.3424,5.62202-8.14369C21.27662,4.41261,18.37925,1.99872,15,2z"></path>
                  <circle cx="7" cy="17" r="5" className="uim-primary"></circle>
                  <path className="uim-tertiary" d="M11,7c-3.08339,0.00031-5.66461,2.33759-5.97,5.40582c2.5358-1.08949,5.47469,0.08297,6.56418,2.61877c0.54113,1.25947,0.54113,2.68593,0,3.94541c3.29729-0.32786,5.7045-3.26663,5.37664-6.56392C16.66569,9.33735,14.08386,6.99972,11,7z"></path>
                </svg>
              </span>
            </div>
            <div className="content mt-4">
              <h5 className="title text-custom">100% Return Policy</h5>
              <p className="text-primary mt-3 mb-0">
                With Quotra Investments, your money is fully secure and any losses will be fully covered by our company
              </p>
              <div className="mt-3">
                <a href="#" className="text-custom">Read More <i className="mdi mdi-chevron-right"></i></a>
              </div>
            </div>
            <div className="big-icon h1 text-custom">
              {/* SVG Icon 2 (Repeated) */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" width="1em">
                  <path className="uim-quaternary" d="M15,2c-3.3772,0.00142-6.27155,2.41462-6.88025,5.73651c2.90693-1.59074,6.553-0.52375,8.14374,2.38317c0.98206,1.79462,0.98206,3.96594,0,5.76057c3.8013-0.69634,6.31837-4.3424,5.62202-8.14369C21.27662,4.41261,18.37925,1.99872,15,2z"></path>
                  <circle cx="7" cy="17" r="5" className="uim-primary"></circle>
                  <path className="uim-tertiary" d="M11,7c-3.08339,0.00031-5.66461,2.33759-5.97,5.40582c2.5358-1.08949,5.47469,0.08297,6.56418,2.61877c0.54113,1.25947,0.54113,2.68593,0,3.94541c3.29729-0.32786,5.7045-3.26663,5.37664-6.56392C16.66569,9.33735,14.08386,6.99972,11,7z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>{/*end col*/}

        {/* Feature 3 */}
        <div className="col-lg-4 col-md-6 col-12 mt-4 pt-2">
          <div className="card service-wrapper rounded border-0 shadow p-4">
            <div className="icon text-center text-custom h1 shadow rounded bg-white">
              {/* SVG Icon 3 */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-quaternary" d="M6,23H2a.99974.99974,0,0,1-1-1V16a.99974.99974,0,0,1,1-1H6a.99974.99974,0,0,1,1,1v6A.99974.99974,0,0,1,6,23Z"></path>
                  <path className="uim-tertiary" d="M14,23H10a.99974.99974,0,0,1-1-1V10a.99974.99974,0,0,1,1-1h4a.99974.99974,0,0,1,1,1V22A.99974.99974,0,0,1,14,23Z"></path>
                  <path className="uim-primary" d="M22,23H18a.99974.99974,0,0,1-1-1V2a.99974.99974,0,0,1,1-1h4a.99974.99974,0,0,1,1,1V22A.99974.99974,0,0,1,22,23Z"></path>
                </svg>
              </span>
            </div>
            <div className="content mt-4">
              <h5 className="title text-custom">High Investments rates</h5>
              <p className="text-primary mt-3 mb-0">
                With us you get the best deals on your investments and the best investments in the industry
              </p>
              <div className="mt-3">
                <a href="#" className="text-custom">Read More <i className="mdi mdi-chevron-right"></i></a>
              </div>
            </div>
            <div className="big-icon h1 text-custom">
              {/* SVG Icon 3 (Repeated) */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-quaternary" d="M6,23H2a.99974.99974,0,0,1-1-1V16a.99974.99974,0,0,1,1-1H6a.99974.99974,0,0,1,1,1v6A.99974.99974,0,0,1,6,23Z"></path>
                  <path className="uim-tertiary" d="M14,23H10a.99974.99974,0,0,1-1-1V10a.99974.99974,0,0,1,1-1h4a.99974.99974,0,0,1,1,1V22A.99974.99974,0,0,1,14,23Z"></path>
                  <path className="uim-primary" d="M22,23H18a.99974.99974,0,0,1-1-1V2a.99974.99974,0,0,1,1-1h4a.99974.99974,0,0,1,1,1V22A.99974.99974,0,0,1,22,23Z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>{/*end col*/}

        {/* Feature 4 */}
        <div className="col-lg-4 col-md-6 col-12 mt-4 pt-2">
          <div className="card service-wrapper rounded border-0 shadow p-4">
            <div className="icon text-center text-custom h1 shadow rounded bg-white">
              {/* SVG Icon 4 */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-tertiary" d="M20 11a.99018.99018 0 0 1-.71-.29 1.16044 1.16044 0 0 1-.21-.33008.94107.94107 0 0 1 0-.75976A1.02883 1.02883 0 0 1 19.29 9.29a1.04667 1.04667 0 0 1 1.41992 0 1.14718 1.14718 0 0 1 .21.33008.94107.94107 0 0 1 0 .75976 1.16044 1.16044 0 0 1-.21.33008A.99349.99349 0 0 1 20 11zM19 6.5a1.0032 1.0032 0 0 1 1-1h0a1.0032 1.0032 0 0 1 1 1h0a1.0032 1.0032 0 0 1-1 1h0A1.0032 1.0032 0 0 1 19 6.5zM20 4a.98979.98979 0 0 1-.91992-1.37988A1.02883 1.02883 0 0 1 19.29 2.29a1.04669 1.04669 0 0 1 1.41992 0 1.02883 1.02883 0 0 1 .21.33008A.98919.98919 0 0 1 20.71 3.71a1.16044 1.16044 0 0 1-.33008.21A.9994.9994 0 0 1 20 4zM7.03027 6.24023a.99364.99364 0 0 1 .7295-1.21h0a.9907.9907 0 0 1 1.21.7295h0a.99891.99891 0 0 1-.7295 1.21h0A.96451.96451 0 0 1 8 7H8A.99122.99122 0 0 1 7.03027 6.24023zm4-1a.99364.99364 0 0 1 .7295-1.21h0a.9907.9907 0 0 1 1.21.7295h0a.99891.99891 0 0 1-.7295 1.21h0A.96451.96451 0 0 1 12 6h0A1.00294 1.00294 0 0 1 11.03027 5.24023zm4-1a.99816.99816 0 0 1 .7295-1.21h0a1.00272 1.00272 0 0 1 1.21.7295h0a.99891.99891 0 0 1-.7295 1.21h0A.96451.96451 0 0 1 16 5h0A.99122.99122 0 0 1 15.03027 4.24023zM4 8A.99042.99042 0 0 1 3 7a.83154.83154 0 0 1 .08008-.37988A1.02883 1.02883 0 0 1 3.29 6.29 1.04669 1.04669 0 0 1 4.71 6.29a1.02883 1.02883 0 0 1 .21.33008A.99013.99013 0 0 1 4 8zM4 11a.99018.99018 0 0 1-.71-.29 1.16044 1.16044 0 0 1-.21-.33008.94107.94107 0 0 1 0-.75976A1.14718 1.14718 0 0 1 3.29 9.29 1.04667 1.04667 0 0 1 4.71 9.29a1.14718 1.14718 0 0 1 .21.33008.94107.94107 0 0 1 0 .75976 1.16044 1.16044 0 0 1-.21.33008A.99349.99349 0 0 1 4 11zM15 10a1.0032 1.0032 0 0 1 1-1h0a1.0032 1.0032 0 0 1 1 1h0a1.0032 1.0032 0 0 1-1 1h0A1.0032 1.0032 0 0 1 15 10zm-4 0a1.0032 1.0032 0 0 1 1-1h0a1.0032 1.0032 0 0 1 1 1h0a1.0032 1.0032 0 0 1-1 1h0A1.0032 1.0032 0 0 1 11 10zM7 10A1.0032 1.0032 0 0 1 8 9H8a1.0032 1.0032 0 0 1 1 1H9a1.0032 1.0032 0 0 1-1 1H8A1.0032 1.0032 0 0 1 7 10z"></path>
                  <polygon className="uim-primary" points="20 14 20 21 4 17 4 14 20 14"></polygon>
                  <path className="uim-primary" d="M20,22a.97427.97427,0,0,1-.24219-.03027l-16-4A.99961.99961,0,0,1,3,17V14a.99943.99943,0,0,1,1-1H20a.99943.99943,0,0,1,1,1v7a1.0005,1.0005,0,0,1-1,1ZM5,16.21875l14,3.5V15H5Z"></path>
                </svg>
              </span>
            </div>
            <div className="content mt-4">
              <h5 className="title text-custom">Modern Workflow</h5>
              <p className="text-primary mt-3 mb-0">
                With modern Technology and the best hands in the business, all assets are fully covered
              </p>
              <div className="mt-3">
                <a href="#" className="text-custom">Read More <i className="mdi mdi-chevron-right"></i></a>
              </div>
            </div>
            <div className="big-icon h1 text-custom">
              {/* SVG Icon 4 (Repeated) */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-tertiary" d="M20 11a.99018.99018 0 0 1-.71-.29 1.16044 1.16044 0 0 1-.21-.33008.94107.94107 0 0 1 0-.75976A1.02883 1.02883 0 0 1 19.29 9.29a1.04667 1.04667 0 0 1 1.41992 0 1.14718 1.14718 0 0 1 .21.33008.94107.94107 0 0 1 0 .75976 1.16044 1.16044 0 0 1-.21.33008A.99349.99349 0 0 1 20 11zM19 6.5a1.0032 1.0032 0 0 1 1-1h0a1.0032 1.0032 0 0 1 1 1h0a1.0032 1.0032 0 0 1-1 1h0A1.0032 1.0032 0 0 1 19 6.5zM20 4a.98979.98979 0 0 1-.91992-1.37988A1.02883 1.02883 0 0 1 19.29 2.29a1.04669 1.04669 0 0 1 1.41992 0 1.02883 1.02883 0 0 1 .21.33008A.98919.98919 0 0 1 20.71 3.71a1.16044 1.16044 0 0 1-.33008.21A.9994.9994 0 0 1 20 4zM7.03027 6.24023a.99364.99364 0 0 1 .7295-1.21h0a.9907.9907 0 0 1 1.21.7295h0a.99891.99891 0 0 1-.7295 1.21h0A.96451.96451 0 0 1 8 7H8A.99122.99122 0 0 1 7.03027 6.24023zm4-1a.99364.99364 0 0 1 .7295-1.21h0a.9907.9907 0 0 1 1.21.7295h0a.99891.99891 0 0 1-.7295 1.21h0A.96451.96451 0 0 1 12 6h0A1.00294 1.00294 0 0 1 11.03027 5.24023zm4-1a.99816.99816 0 0 1 .7295-1.21h0a1.00272 1.00272 0 0 1 1.21.7295h0a.99891.99891 0 0 1-.7295 1.21h0A.96451.96451 0 0 1 16 5h0A.99122.99122 0 0 1 15.03027 4.24023zM4 8A.99042.99042 0 0 1 3 7a.83154.83154 0 0 1 .08008-.37988A1.02883 1.02883 0 0 1 3.29 6.29 1.04669 1.04669 0 0 1 4.71 6.29a1.02883 1.02883 0 0 1 .21.33008A.99013.99013 0 0 1 4 8zM4 11a.99018.99018 0 0 1-.71-.29 1.16044 1.16044 0 0 1-.21-.33008.94107.94107 0 0 1 0-.75976A1.14718 1.14718 0 0 1 3.29 9.29 1.04667 1.04667 0 0 1 4.71 9.29a1.14718 1.14718 0 0 1 .21.33008.94107.94107 0 0 1 0 .75976 1.16044 1.16044 0 0 1-.21.33008A.99349.99349 0 0 1 4 11zM15 10a1.0032 1.0032 0 0 1 1-1h0a1.0032 1.0032 0 0 1 1 1h0a1.0032 1.0032 0 0 1-1 1h0A1.0032 1.0032 0 0 1 15 10zm-4 0a1.0032 1.0032 0 0 1 1-1h0a1.0032 1.0032 0 0 1 1 1h0a1.0032 1.0032 0 0 1-1 1h0A1.0032 1.0032 0 0 1 11 10zM7 10A1.0032 1.0032 0 0 1 8 9H8a1.0032 1.0032 0 0 1 1 1H9a1.0032 1.0032 0 0 1-1 1H8A1.0032 1.0032 0 0 1 7 10z"></path>
                  <polygon className="uim-primary" points="20 14 20 21 4 17 4 14 20 14"></polygon>
                  <path className="uim-primary" d="M20,22a.97427.97427,0,0,1-.24219-.03027l-16-4A.99961.99961,0,0,1,3,17V14a.99943.99943,0,0,1,1-1H20a.99943.99943,0,0,1,1,1v7a1.0005,1.0005,0,0,1-1,1ZM5,16.21875l14,3.5V15H5Z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>{/*end col*/}

        {/* Feature 5 */}
        <div className="col-lg-4 col-md-6 col-12 mt-4 pt-2">
          <div className="card service-wrapper rounded border-0 shadow p-4">
            <div className="icon text-center text-custom h1 shadow rounded bg-white">
              {/* SVG Icon 5 */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-quaternary" d="M12,22a.99974.99974,0,0,1-1-1V3a1,1,0,0,1,2,0V21A.99974.99974,0,0,1,12,22Z"></path>
                  <polygon className="uim-primary" points="21 12 16 7 16 17 21 12"></polygon>
                  <path className="uim-primary" d="M16,18a1,1,0,0,1-1-1V7a.99991.99991,0,0,1,1.707-.707l5,5a.99962.99962,0,0,1,0,1.41406l-5,5A.99893.99893,0,0,1,16,18Zm1-8.58594v5.17188L19.58594,12Z"></path>
                  <path className="uim-tertiary" d="M3 13a.99075.99075 0 0 1-.92041-1.37988A1.14883 1.14883 0 0 1 2.29 11.29a1.04669 1.04669 0 0 1 1.41992 0 1.03724 1.03724 0 0 1 .21.33008A.83792.83792 0 0 1 4 12a.99042.99042 0 0 1-1 1zM4.79 15.21a1.00761 1.00761 0 0 1 0-1.41992h0a1.00671 1.00671 0 0 1 1.41992 0h0a1.0085 1.0085 0 0 1 0 1.41992h0a1.02749 1.02749 0 0 1-.71.29h0A1.02577 1.02577 0 0 1 4.79 15.21zM8 18a.99183.99183 0 0 1-.71-.29 1.16213 1.16213 0 0 1-.21045-.33008A.99906.99906 0 0 1 7 17a1.05 1.05 0 0 1 .29-.71 1.0387 1.0387 0 0 1 1.08984-.21 1.15384 1.15384 0 0 1 .33008.21A1.05232 1.05232 0 0 1 9 17a.9994.9994 0 0 1-.08008.37988 1.17124 1.17124 0 0 1-.21.33008A.99183.99183 0 0 1 8 18zM7 13.66992a.996.996 0 0 1 1-1H8a.99632.99632 0 0 1 1 1H9a1.00319 1.00319 0 0 1-1 1H8A1.00288 1.00288 0 0 1 7 13.66992zm0-3.33984a1.00288 1.00288 0 0 1 1-1H8a1.00319 1.00319 0 0 1 1 1H9a.99693.99693 0 0 1-1 1H8A.99663.99663 0 0 1 7 10.33008zM8 8a.99075.99075 0 0 1-.92041-1.37988A1.03011 1.03011 0 0 1 7.29 6.29a.98544.98544 0 0 1 1.62988.33008A.99013.99013 0 0 1 8 8zM4.79 10.21A1.00761 1.00761 0 0 1 4.79 8.79h0A1.00671 1.00671 0 0 1 6.21 8.79h0a1.0085 1.0085 0 0 1 0 1.41992h0a1.02749 1.02749 0 0 1-.71.29h0A1.02577 1.02577 0 0 1 4.79 10.21z"></path>
                </svg>
              </span>
            </div>
            <div className="content mt-4">
              <h5 className="title text-custom">Unique Features</h5>
              <p className="text-primary mt-3 mb-0">
                We offer Loaning Services where you can collect low interest loans to pay back at a later date
              </p>
              <div className="mt-3">
                <a href="#" className="text-custom">Read More <i className="mdi mdi-chevron-right"></i></a>
              </div>
            </div>
            <div className="big-icon h1 text-custom">
              {/* SVG Icon 5 (Repeated) */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-quaternary" d="M12,22a.99974.99974,0,0,1-1-1V3a1,1,0,0,1,2,0V21A.99974.99974,0,0,1,12,22Z"></path>
                  <polygon className="uim-primary" points="21 12 16 7 16 17 21 12"></polygon>
                  <path className="uim-primary" d="M16,18a1,1,0,0,1-1-1V7a.99991.99991,0,0,1,1.707-.707l5,5a.99962.99962,0,0,1,0,1.41406l-5,5A.99893.99893,0,0,1,16,18Zm1-8.58594v5.17188L19.58594,12Z"></path>
                  <path className="uim-tertiary" d="M3 13a.99075.99075 0 0 1-.92041-1.37988A1.14883 1.14883 0 0 1 2.29 11.29a1.04669 1.04669 0 0 1 1.41992 0 1.03724 1.03724 0 0 1 .21.33008A.83792.83792 0 0 1 4 12a.99042.99042 0 0 1-1 1zM4.79 15.21a1.00761 1.00761 0 0 1 0-1.41992h0a1.00671 1.00671 0 0 1 1.41992 0h0a1.0085 1.0085 0 0 1 0 1.41992h0a1.02749 1.02749 0 0 1-.71.29h0A1.02577 1.02577 0 0 1 4.79 15.21zM8 18a.99183.99183 0 0 1-.71-.29 1.16213 1.16213 0 0 1-.21045-.33008A.99906.99906 0 0 1 7 17a1.05 1.05 0 0 1 .29-.71 1.0387 1.0387 0 0 1 1.08984-.21 1.15384 1.15384 0 0 1 .33008.21A1.05232 1.05232 0 0 1 9 17a.9994.9994 0 0 1-.08008.37988 1.17124 1.17124 0 0 1-.21.33008A.99183.99183 0 0 1 8 18zM7 13.66992a.996.996 0 0 1 1-1H8a.99632.99632 0 0 1 1 1H9a1.00319 1.00319 0 0 1-1 1H8A1.00288 1.00288 0 0 1 7 13.66992zm0-3.33984a1.00288 1.00288 0 0 1 1-1H8a1.00319 1.00319 0 0 1 1 1H9a.99693.99693 0 0 1-1 1H8A.99663.99663 0 0 1 7 10.33008zM8 8a.99075.99075 0 0 1-.92041-1.37988A1.03011 1.03011 0 0 1 7.29 6.29a.98544.98544 0 0 1 1.62988.33008A.99013.99013 0 0 1 8 8zM4.79 10.21A1.00761 1.00761 0 0 1 4.79 8.79h0A1.00671 1.00671 0 0 1 6.21 8.79h0a1.0085 1.0085 0 0 1 0 1.41992h0a1.02749 1.02749 0 0 1-.71.29h0A1.02577 1.02577 0 0 1 4.79 10.21z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>{/*end col*/}

        {/* Feature 6 */}
        <div className="col-lg-4 col-md-6 col-12 mt-4 pt-2">
          <div className="card service-wrapper rounded border-0 shadow p-4">
            <div className="icon text-center text-custom h1 shadow rounded bg-white">
              {/* SVG Icon 6 */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-primary" d="M12,6a.99974.99974,0,0,1,1,1v4.42249l2.09766,1.2113a1.00016,1.00016,0,0,1-1,1.73242l-2.59766-1.5A1.00455,1.00455,0,0,1,11,12V7A.99974.99974,0,0,1,12,6Z"></path>
                  <path className="uim-tertiary" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12Zm9-5a1,1,0,0,1,2,0v4.42249l2.09766,1.2113a1.00016,1.00016,0,0,1-1,1.73242l-2.59766-1.5A1.00455,1.00455,0,0,1,11,12Z"></path>
                </svg>
              </span>
            </div>
            <div className="content mt-4">
              <h5 className="title text-custom">Support 24/7</h5>
              <p className="text-primary mt-3 mb-0">
                We have a 24/7 support that you can call if there are any issues partaining to your funds and full on lossess coverage
              </p>
              <div className="mt-3">
                <a href="#" className="text-custom">Read More <i className="mdi mdi-chevron-right"></i></a>
              </div>
            </div>
            <div className="big-icon h1 text-custom">
              {/* SVG Icon 6 (Repeated) */}
              <span className="uim-svg" style={{}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em">
                  <path className="uim-primary" d="M12,6a.99974.99974,0,0,1,1,1v4.42249l2.09766,1.2113a1.00016,1.00016,0,0,1-1,1.73242l-2.59766-1.5A1.00455,1.00455,0,0,1,11,12V7A.99974.99974,0,0,1,12,6Z"></path>
                  <path className="uim-tertiary" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12Zm9-5a1,1,0,0,1,2,0v4.42249l2.09766,1.2113a1.00016,1.00016,0,0,1-1,1.73242l-2.59766-1.5A1.00455,1.00455,0,0,1,11,12Z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>{/*end col*/}
      </div>{/*end row*/}
    </div>
  );
}

export default Schemes; // Export with uppercase name
