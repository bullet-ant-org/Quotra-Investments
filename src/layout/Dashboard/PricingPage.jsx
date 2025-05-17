// src/layout/Dashboard/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const PricingPage = () => {
  const [plans, setPlans] = useState([]); // State to hold fetched plans
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isPurchasing, setIsPurchasing] = useState(null); // To show loading on specific button
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/assets`)
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => setError('Failed to load pricing plans'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChoosePlan = (plan) => {
    setIsPurchasing(plan.id); // Use MongoDB's `id` instead of Appwrite's `$id`
    // Just go to checkout page for this plan
    navigate(`/dashboard/checkout/${plan.id}`);
    setIsPurchasing(null); // Reset purchasing state
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="container text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Plans...</span>
        </Spinner>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="text-center my-4">Our Pricing Plans</h2>
      <div className="mt-3">
        {plans.map((plan) => (
          <div
            key={plan.id} // Use MongoDB's `id`
            className={`d-style btn-brc-tpnpm bgc-white border-light-subtle w-100 my-3 py-3 shadow-sm loan-card-hover p-3 position-relative ${
              plan.isPopular ? 'border-primary border-2' : ''
            }`}
          >
            {plan.isPopular && (
              <span
                className="badge bg-primary position-absolute top-0 start-0 translate-middle-y ms-3 mt-2 p-2"
                style={{ zIndex: 1, transform: 'translateY(-50%) translateX(-10px)' }}
              >
                Popular
              </span>
            )}
            <div className="row align-items-center">
              {/* Plan Name and Price */}
              <div className="col-12 col-md-4">
                <h4 className="pt-3 text-170 text-600 text-primary letter-spacing">
                  {plan.name}
                </h4>
                <div className="text-secondary-d1 text-120 mb-2">
                  <span className="ml-n15 align-text-bottom">$</span>
                  <span className="text-180">{plan.priceRange || 'N/A'}</span> {plan.period}
                </div>
                <div className="text-muted small mb-1">
                  <strong>Trade Time:</strong> {plan.tradeTime || 'Not specified'}
                </div>
                <div className="text-muted small">
                  <strong>Profit Potential:</strong> {plan.profitPotential || 'Variable'}
                </div>
              </div>

              {/* Features List */}
              <ul className="list-unstyled mb-0 col-12 col-md-4 text-dark-l1 text-90 my-4 my-md-0">
                {(plan.features || []).map((feature, index) => (
                  <li key={index} className={index > 0 ? 'mt-25' : ''}>
                    <i
                      className={`fa ${
                        feature.included ? 'fa-check text-success-m2' : 'fa-times text-danger-m3'
                      } text-110 mr-2 mt-1`}
                    ></i>
                    <span>
                      {feature.text}
                      {feature.detail && ` ${feature.detail}`}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <div className="col-12 col-md-4 text-center">
                <button
                  onClick={() => handleChoosePlan(plan)}
                  className="f-n-hover btn btn-primary btn-raised px-4 py-25 w-75 text-600 mt-3 mt-md-0"
                  disabled={isPurchasing === plan.id}
                >
                  {isPurchasing === plan.id ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    plan.buttonText || 'Invest Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;