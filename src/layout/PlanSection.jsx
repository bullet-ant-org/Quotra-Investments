import React from 'react';

const PlanSection = () => {
  return (
    <section className="py-12 py-lg-24 bg-primary-light position-relative overflow-hidden">
      <div className="container">
        <div className="text-center mb-20">
          <span className="badge px-3 py-1 mb-4 bg-primary text-white">OUR PLANS</span>
          <h3 className="font-heading mb-0">
            <span>Get your</span>
            <span style={{ fontFamily: "'Playfair Display', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman'" }}>ticket</span>
            <span>here</span>
          </h3>
        </div>
        <div className="row">
          <div className="col-12 col-lg-4 mb-8 mb-lg-0">
            <div className="position-relative mw-sm mw-lg-none mx-auto bg-white rounded-5">
              <div className="pt-2 px-2">
                <div className="position-relative pt-12 pb-12 px-6 rounded-5 bg-light overflow-hidden" style={{ height: '208px' }}>
                  <img className="position-absolute bottom-0 start-0 w-100" src="saturn-assets/images/pricing/wave-bg1.svg" alt="" />
                  <div className="position-relative text-center">
                    <span className="d-inline-block py-1 px-5 mb-8 fw-semibold text-danger bg-danger-light rounded-pill">Beginner</span>
                    <span className="d-block fs-2 fw-bold">$99.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 mb-12 position-relative">
                <div className="position-absolute start-0 top-50 translate-middle-y w-100">
                  <div className="w-100 border-primary-light" style={{ borderTop: 0, borderBottom: '8px', borderStyle: 'dotted' }}></div>
                </div>
                <div className="position-absolute top-0 start-0 ms-n4 translate-middle-y p-4 bg-primary-light rounded-pill"></div>
                <div className="position-absolute top-0 end-0 me-n4 translate-middle-y p-4 bg-primary-light rounded-pill"></div>
              </div>
              <div className="px-6 pb-12">
                <ul className="list-unstyled mb-12">
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">1 days access to the conference</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">Music, launch and snack</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">Meet Event Speaker</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/red-check.svg" alt="" />
                    <span className="ms-3 text-secondary">Live video online access</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/red-check.svg" alt="" />
                    <span className="ms-3 text-secondary">Get a certificate</span>
                  </li>
                </ul>
                <div className="text-center">
                  <a className="btn btn-sm btn-primary rounded-pill" href="#">
                    <span>Choose Plan</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 7.20998C18.617 7.11625 18.5064 7.04186 18.3846 6.99109C18.2627 6.94032 18.132 6.91418 18 6.91418C17.868 6.91418 17.7373 6.94032 17.6154 6.99109C17.4936 7.04186 17.383 7.11625 17.29 7.20998L9.84001 14.67L6.71001 11.53C6.61349 11.4367 6.49955 11.3634 6.37469 11.3142C6.24984 11.265 6.11651 11.2409 5.98233 11.2432C5.84815 11.2455 5.71574 11.2743 5.59266 11.3278C5.46959 11.3812 5.35825 11.4585 5.26501 11.555C5.17177 11.6515 5.09846 11.7654 5.04925 11.8903C5.00005 12.0152 4.97592 12.1485 4.97824 12.2827C4.98056 12.4168 5.00929 12.5493 5.06278 12.6723C5.11628 12.7954 5.19349 12.9067 5.29001 13L9.13001 16.84C9.22297 16.9337 9.33358 17.0081 9.45543 17.0589C9.57729 17.1096 9.708 17.1358 9.84001 17.1358C9.97202 17.1358 10.1027 17.1096 10.2246 17.0589C10.3464 17.0081 10.457 16.9337 10.55 16.84L18.71 8.67998C18.8115 8.58634 18.8925 8.47269 18.9479 8.34619C19.0033 8.21969 19.0319 8.08308 19.0319 7.94498C19.0319 7.80688 19.0033 7.67028 18.9479 7.54378C18.8925 7.41728 18.8115 7.30363 18.71 7.20998Z" fill="#FFF2EE"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4 mb-8 mb-lg-0">
            <div className="position-relative mw-sm mw-lg-none mx-auto bg-primary bg-opacity-75 rounded-5">
              <div className="pt-2 px-2">
                <div className="position-relative pt-12 pb-12 px-6 rounded-5 bg-primary overflow-hidden" style={{ height: '208px' }}>
                  <img className="position-absolute bottom-0 start-0 w-100" src="saturn-assets/images/pricing/wave-bg2.svg" alt="" />
                  <div className="position-relative text-center">
                    <span className="d-inline-block py-1 px-5 mb-8 fw-semibold text-white bg-danger-light bg-opacity-25 rounded-pill">Beginner</span>
                    <span className="d-block fs-2 fw-bold text-white">$149.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 mb-12 position-relative">
                <div className="position-absolute start-0 top-50 translate-middle-y w-100">
                  <div className="w-100 border-primary-light" style={{ borderTop: 0, borderBottom: '8px', borderStyle: 'dotted' }}></div>
                </div>
                <div className="position-absolute top-0 start-0 ms-n4 translate-middle-y p-4 bg-primary-light rounded-pill"></div>
                <div className="position-absolute top-0 end-0 me-n4 translate-middle-y p-4 bg-primary-light rounded-pill"></div>
              </div>
              <div className="px-6 pb-12">
                <ul className="list-unstyled mb-12">
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/orange-check.svg" alt="" />
                    <span className="ms-3 text-white">1 days access to the conference</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/orange-check.svg" alt="" />
                    <span className="ms-3 text-white">Music, launch and snack</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/orange-check.svg" alt="" />
                    <span className="ms-3 text-white">Meet Event Speaker</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/orange-check.svg" alt="" />
                    <span className="ms-3 text-white">Live video online access</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/orange-disable.svg" alt="" />
                    <span className="ms-3 text-light text-opacity-50">Get a certificate</span>
                  </li>
                </ul>
                <div className="text-center">
                  <a className="btn btn-sm btn-light text-primary rounded-pill" href="#">
                    <span>Choose Plan</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 7.20998C18.617 7.11625 18.5064 7.04186 18.3846 6.99109C18.2627 6.94032 18.132 6.91418 18 6.91418C17.868 6.91418 17.7373 6.94032 17.6154 6.99109C17.4936 7.04186 17.383 7.11625 17.29 7.20998L9.84001 14.67L6.71001 11.53C6.61349 11.4367 6.49955 11.3634 6.37469 11.3142C6.24984 11.265 6.11651 11.2409 5.98233 11.2432C5.84815 11.2455 5.71574 11.2743 5.59266 11.3278C5.46959 11.3812 5.35825 11.4585 5.26501 11.555C5.17177 11.6515 5.09846 11.7654 5.04925 11.8903C5.00005 12.0152 4.97592 12.1485 4.97824 12.2827C4.98056 12.4168 5.00929 12.5493 5.06278 12.6723C5.11628 12.7954 5.19349 12.9067 5.29001 13L9.13001 16.84C9.22297 16.9337 9.33358 17.0081 9.45543 17.0589C9.57729 17.1096 9.708 17.1358 9.84001 17.1358C9.97202 17.1358 10.1027 17.1096 10.2246 17.0589C10.3464 17.0081 10.457 16.9337 10.55 16.84L18.71 8.67998C18.8115 8.58634 18.8925 8.47269 18.9479 8.34619C19.0033 8.21969 19.0319 8.08308 19.0319 7.94498C19.0319 7.80688 19.0033 7.67028 18.9479 7.54378C18.8925 7.41728 18.8115 7.30363 18.71 7.20998Z" fill="currentColor"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="position-relative mw-sm mw-lg-none mx-auto bg-white rounded-5">
              <div className="pt-2 px-2">
                <div className="position-relative pt-12 pb-12 px-6 rounded-5 bg-light overflow-hidden" style={{ height: '208px' }}>
                  <img className="position-absolute bottom-0 start-0 w-100" src="saturn-assets/images/pricing/wave-bg1.svg" alt="" />
                  <div className="position-relative text-center">
                    <span className="d-inline-block py-1 px-5 mb-8 fw-semibold text-info bg-info-light rounded-pill">Advanced</span>
                    <span className="d-block fs-2 fw-bold">$199.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 mb-12 position-relative">
                <div className="position-absolute start-0 top-50 translate-middle-y w-100">
                  <div className="w-100 border-primary-light" style={{ borderTop: 0, borderBottom: '8px', borderStyle: 'dotted' }}></div>
                </div>
                <div className="position-absolute top-0 start-0 ms-n4 translate-middle-y p-4 bg-primary-light rounded-pill"></div>
                <div className="position-absolute top-0 end-0 me-n4 translate-middle-y p-4 bg-primary-light rounded-pill"></div>
              </div>
              <div className="px-6 pb-12">
                <ul className="list-unstyled mb-12">
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">1 days access to the conference</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">Music, launch and snack</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">Meet Event Speaker</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">Live video online access</span>
                  </li>
                  <li className="d-flex mb-5 align-items-center">
                    <img className="img-fluid" src="saturn-assets/images/pricing/green-check.svg" alt="" />
                    <span className="ms-3">Get a certificate</span>
                  </li>
                </ul>
                <div className="text-center">
                  <a className="btn btn-sm btn-primary rounded-pill" href="#">
                    <span>Choose Plan</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 7.20998C18.617 7.11625 18.5064 7.04186 18.3846 6.99109C18.2627 6.94032 18.132 6.91418 18 6.91418C17.868 6.91418 17.7373 6.94032 17.6154 6.99109C17.4936 7.04186 17.383 7.11625 17.29 7.20998L9.84001 14.67L6.71001 11.53C6.61349 11.4367 6.49955 11.3634 6.37469 11.3142C6.24984 11.265 6.11651 11.2409 5.98233 11.2432C5.84815 11.2455 5.71574 11.2743 5.59266 11.3278C5.46959 11.3812 5.35825 11.4585 5.26501 11.555C5.17177 11.6515 5.09846 11.7654 5.04925 11.8903C5.00005 12.0152 4.97592 12.1485 4.97824 12.2827C4.98056 12.4168 5.00929 12.5493 5.06278 12.6723C5.11628 12.7954 5.19349 12.9067 5.29001 13L9.13001 16.84C9.22297 16.9337 9.33358 17.0081 9.45543 17.0589C9.57729 17.1096 9.708 17.1358 9.84001 17.1358C9.97202 17.1358 10.1027 17.1096 10.2246 17.0589C10.3464 17.0081 10.457 16.9337 10.55 16.84L18.71 8.67998C18.8115 8.58634 18.8925 8.47269 18.9479 8.34619C19.0033 8.21969 19.0319 8.08308 19.0319 7.94498C19.0319 7.80688 19.0033 7.67028 18.9479 7.54378C18.8925 7.41728 18.8115 7.30363 18.71 7.20998Z" fill="#FFF2EE"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PlanSection;
