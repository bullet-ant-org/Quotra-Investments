import React from 'react';
import PlanCardMini from './PlanCardMini'; // Assuming you might want to reuse this
import PlanCardMain from './PlanCardMain'; // Assuming you might want to reuse this

// Dummy data for demonstration
const dummyPlans = [
  {
    head: '',
    typeo: 'Starter',
    rate: 10,
    amount1: 10,
    amount2: 100,
    Desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    id: 1,
  },
  {
    head: 'Best Value',
    typeo: 'Pro',
    rate: 25,
    amount1: 101,
    amount2: 1000,
    Desc: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    id: 2,
  },
  {
    head: '',
    typeo: 'Enterprise',
    rate: 50,
    amount1: 1001,
    amount2: 10000,
    Desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    id: 3,
  },
   {
    head: '',
    typeo: 'Basic Plus',
    rate: 15,
    amount1: 50,
    amount2: 250,
    Desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
    id: 4,
  },
];

const Pricing = () => {
  return (
    <section id="pricing-page" className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h1>Explore All Our Plans</h1>
          <p className="lead text-muted">Find the perfect plan that fits your needs and budget.</p>
          <p>We offer a variety of options, from basic entry points to comprehensive enterprise solutions. Compare the features below.</p>
        </div>

        <div className="row justify-content-center g-4">
          {/* Example of using the existing card components */}
          {dummyPlans.map((plan, index) =>
            // Example logic: Make the second plan the 'main' highlighted one
            index === 1 ? (
              <PlanCardMain key={plan.id} plans={plan} />
            ) : (
              <PlanCardMini key={plan.id} plans={plan} />
            )
          )}

          {/* You could also add more simple placeholder divs */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">Custom Plan</h5>
                <p className="card-text">Need something specific? Contact us for a tailored solution.</p>
                <p className="text-muted">Pricing varies based on requirements.</p>
                <a href="#" className="btn btn-outline-secondary mt-3">Contact Sales</a>
              </div>
            </div>
          </div>

        </div>

        <div className="text-center mt-5">
            <p>All plans come with standard support. Premium support available as an add-on.</p>
            <small className="text-muted">*Prices subject to change. Terms and conditions apply.</small>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
