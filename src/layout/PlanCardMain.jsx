import React from 'react';

const PlanCardMain = ({ plans }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="price-item text-center popular">
        <div className="price-top">
          <h4>{plans.head || plans.typeo}</h4>
          <h2 className="mb-0">
            <sup>$</sup>
            {plans.amount1} ~ {plans.amount2}
          </h2>
          <span className="text-capitalize">Interest Rate: {plans.rate}%</span>
        </div>
        <div className="price-content">
          <p className="card-text mx-5 text-muted">{plans.Desc}</p>
          <button className="btn btn-light">Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default PlanCardMain;