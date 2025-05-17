import React from 'react';

const PlanCardMini = ({ plans }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="price-item text-center">
        <div className="price-top">
          <h4>{plans.typeo}</h4>
          <h2 className="mb-0">
            <sup>$</sup>
            {plans.amount1} ~ {plans.amount2}
          </h2>
          <span className="text-capitalize">Interest Rate: {plans.rate}%</span>
        </div>
        <div className="price-content">
          <p className="card-text mx-5 text-muted">{plans.Desc}</p>
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default PlanCardMini;