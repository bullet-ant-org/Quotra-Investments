// src/layout/Footer.jsx
import React from 'react';
// Option A: Import the logo (adjust path if needed)
import logo from '../assets/logo-no-background1.png';
import cert from '../assets/Cert.jpg'
import cert2 from '../assets/1000002915.png'

// Make sure you have Font Awesome included in your project for the icons!
// Make sure you have the necessary CSS for classes like 'deneb_cta', 'deneb_footer', etc.

const Footer = () => {
  return (
    <> {/* Use a Fragment to return multiple top-level elements */}

      {/* --- Call to Action Section --- */}
      <section className="deneb_cta mt-5"> {/* Keep original classes */}
        <div className="container">
          <div className="cta_wrapper"> {/* Add necessary CSS for this */}
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="cta_content footercol">
                  {/* Content as provided */}
                  <h3>Need Money Urgently?</h3>
                  <p>Take a loan from us, and repay when you get the money back</p>
                  <ul>
                    <li>Utilize our Low interest rates</li>
                    <li>Have fun with a long repayment date</li>
                    <li>Get Exactly how much you request for</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="button_box">
                  {/* Kept as 'a' tag as per original HTML */}
                  <a href="#" className="btn btn-warning text-light">Apply For a Loan</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- New Footer Section --- */}
      <footer className="deneb_footer">
        <div
          className="widget_wrapper"
          // Keep the inline style for background image
          style={{ backgroundImage: 'url(http://demo.tortoizthemes.com/deneb-html/deneb-ltr/assets/images/footer_bg.png)' }}
        >
          <div className="container">
            <div className="row">
              {/* About Widget */}
              <div className="col-lg-4 col-md-6 col-12">
                <div className="widget widegt_about">
                  <div className="widget_title">
                    {/* Use the imported logo */}
                    <img src={logo} className="img-fluid" alt="Company Logo" style={{
                      width:'250px'
                    }}/>
                    {/* If using public folder: <img src="/assets/images/logo_1.png" className="img-fluid" alt="Company Logo" /> */}
                  </div>
                  <p><b>QUOTRA INVESTMENTS</b> The best choice when it comes to letting your money work for you and making more money to take care of other issues. <br />
                 <br /> Have Quotra do the hard work for you and just relax while your money keeps coming</p>
                  <ul className="social">
                    {/* Kept as 'a' tags */}
                    <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                    <li><a href="#"><i className="fab fa-twitter"></i></a></li>
                    <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                  </ul>
                </div>
              </div>

              {/* Links Widget */}
              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="widget widget_link widgetlist">
                  <div className="widget_title">
                    <h4>Links</h4>
                  </div>
                  <ul>
                    {/* Kept as 'a' tags */}
                    <li><a href="#">Support</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Loans</a></li>
                  </ul>
                </div>
              </div>

              {/* Contact Widget */}
              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="widget widget_contact">
                  <div className="widget_title">
                    <h4>Contact Us</h4>
                  </div>
                  <div className="contact_info">
                    <div className="single_info">
                      <div className="icon">
                        <i className="fas fa-phone-alt"></i>
                      </div>
                      <div className="info">
                        {/* Kept as 'a' tags */}
                        <p><a href="tel:+44 7732 043224">+44 7732 043224</a></p>
                        <p><a href="tel:+44 7732 043224">+44 7732 043224</a></p>
                      </div>
                    </div>
                    <div className="single_info">
                      <div className="icon">
                        <i className="fas fa-envelope"></i>
                      </div>
                      <div className="info">
                        {/* Kept as 'a' tags */}
                        <p><a href="mailto:quotrainvestments@gmail.com">quotrainvestments@gmail.com</a></p>
                        <p><a href="mailto:services@deneb.com">quotrainvestments@gmail.com</a></p>
                      </div>
                    </div>
                    <div className="single_info">
                      <div className="icon">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <div className="info">
                        {/* Kept span as is */}
                        <p>37 oxford street, <span>London.</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div> {/* End widget_wrapper */}
        <div className="certificate-area">
          <div className="container">
            <div className="row text-center">
              <div className="col-12 col-md-6">
                    <img src={cert} alt="cert1" height={250}/>
              </div>
              <div className="col-12 col-md-6">
                    <img src={cert2} alt="cert2" height={200} />
              </div>

            </div>
          </div>
        </div>


        {/* Copyright Area */}
        <div className="copyright_area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="copyright_text">
                  {/* Using dynamic year and HTML entity */}
                  <p>Copyright &copy; {new Date().getFullYear()} All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div> {/* End copyright_area */}
      </footer>

    </> // End Fragment
  );
};

export default Footer;
