import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import PlanCardMini from './PlanCardMini';
import PlanCardMain from './PlanCardMain';

const PlanSection = () => {
  const [plans] = useState([
    {
      head: '',
      typeo: 'Basic',
      rate: 30,
      amount1: 50,
      amount2: 500,
      Desc: 'The best plan for someone on a budget but plans to maximise profits',
      id: 1,
    },
    {
      head: 'Popular',
      typeo: 'Platinum',
      rate: 350,
      amount1: 5000,
      amount2: 50000,
      Desc: 'The best plan for anyone with plans of making more than peers with high interest rates and a good runtime',
      id: 2,
    },
    {
      head: '',
      typeo: 'Advanced',
      rate: 45,
      amount1: 200,
      amount2: 2500,
      Desc: 'The best plan for someone on a budget but plans to maximise profits',
      id: 3,
    },
  ]);

  return (
    <section id="pricing">
      <div className="container-lg py-5">
        <div className="text-center">
          <h2>Popular Plans</h2>
          <p className="lead">Most popular pricing plans filtered for you</p>
        </div>
        <div className="row my-5 align-items-center justify-content-center g-3">
          {/* Map over the plans array */}
          {plans.map((plan, index) =>
            index === 1 ? (
              // Render PlanCardMain for the middle card
              <PlanCardMain key={plan.id} plans={plan} />
            ) : (
              // Render PlanCardMini for other cards
              <PlanCardMini key={plan.id} plans={plan} />
            )
          )}
          {/* 2. Wrap the button/div with Link and set the 'to' prop */}
          <div className="text-center my-3"> {/* Added text-center for better alignment */}
            <Link to="/pricing" className="other-plans btn btn-primary"> {/* Use Link here */}
              View all Plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
