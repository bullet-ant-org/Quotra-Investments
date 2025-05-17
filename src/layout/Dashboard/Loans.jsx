// src/layout/Dashboard/Loans.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const Loans = () => {
  const [loans, setLoans] = useState([]); // State for fetched loan data
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/loanTypes`)
      .then((res) => res.json())
      .then((data) => setLoans(data))
      .catch(() => setError('Failed to load loan options'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleApplyForLoan = (loan) => {
    // Navigate to LoansCheckout page and pass the selected loan object in state
    navigate('/dashboard/loans-checkout', {
      state: {
        loan: loan,
      },
    });
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="container text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Loans...</span>
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
      <h2 className="text-center my-4">Available Loan Options</h2>
      <div className="mt-3">
        {loans.map((loan) => (
          <div
            key={loan.id} // Use MongoDB's `id`
            className="d-style btn-brc-tp bgc-white border-light-subtle w-100 my-3 py-3 shadow-sm loan-card-hover p-3"
          >
            <div className="row align-items-center">
              {/* Loan Name and Details */}
              <div className="col-12 col-md-4">
                <h4 className="pt-3 text-170 text-600 text-primary letter-spacing">
                  {loan.name}
                </h4>
                <div className="text-secondary-d1 text-100 mt-2">
                  <div>
                    <strong>Rate:</strong> {loan.interestRate ?? 'N/A'}
                  </div>
                  <div>
                    <strong>Term:</strong> {loan.term ?? 'N/A'}
                  </div>
                  <div>
                    <strong>Amount:</strong> {loan.amountRange ?? 'N/A'}
                  </div>
                </div>
              </div>

              {/* Description Points List */}
              <ul className="list-unstyled mb-0 col-12 col-md-4 text-dark-l1 text-90 text-left my-4 my-md-0">
                {(loan.descriptionPoints || []).map((point, index) => (
                  <li key={index} className={index > 0 ? 'mt-25' : ''}>
                    <i
                      className={`fa ${
                        point.included ? 'fa-check text-success-m2' : 'fa-times text-danger-m3'
                      } text-110 mr-2 mt-1`}
                    ></i>
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <div className="col-12 col-md-4 text-center">
                <button
                  onClick={() => handleApplyForLoan(loan)} // Call handler on click
                  className="f-n-hover btn btn-primary btn-raised px-4 py-25 w-75 text-600 mt-3 mt-md-0"
                >
                  {loan.buttonText || 'Apply Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loans;
