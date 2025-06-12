// src/layout/Dashboard/LoanTypesPage.jsx
import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faCheckCircle, faTimesCircle, faPercentage, faCalendarAlt,
  faMoneyBillWave, faTimes, faFileImage, faQuestionCircle, faCircleNotch, faCamera
} from '@fortawesome/free-solid-svg-icons';

const LoanTypesPage = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(null);

  // Modal & checkout flow states
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Multi-step checkout states
  const [checkoutStep, setCheckoutStep] = useState('form'); // form | verifying | success | payment
  const [homeAddress, setHomeAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [country, setCountry] = useState('');
  const [driversLicense, setDriversLicense] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [requirementText, setRequirementText] = useState('Verifying identity...');
  const [copied, setCopied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chosenCrypto, setChosenCrypto] = useState('');

  // Admin settings state
  const [adminSettings, setAdminSettings] = useState(null);

  // Fetch adminSettings from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/adminSettings`)
      .then(res => res.json())
      .then(data => {
        // If it's an array, use the first object (as in your endpoint example)
        setAdminSettings(Array.isArray(data) ? data[0] : data);
      })
      .catch(() => setAdminSettings(null));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/loanTypes`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch loan types. Status: ${res.status}`);
        return res.json();
      })
      .then((data) => setLoanTypes(data))
      .catch((err) => setError(err.message || 'Failed to load loan types. Please try again later.'))
      .finally(() => setIsLoading(false));
  }, []);

  // --- Modal logic ---
  const handleApplyForLoan = (loanType) => {
    setSelectedLoan(loanType);
    setShowModal(true);
    setCheckoutStep('form');
    setHomeAddress('');
    setCity('');
    setStateVal('');
    setCountry('');
    setDriversLicense(null);
    setIdCard(null);
    setFaceImage(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLoan(null);
    setCheckoutStep('form');
    setShowPaymentModal(false);
    setChosenCrypto('');
  };

  // --- Face Verification: Open Camera and Capture Selfie ---
  const handleFaceIconClick = async () => {
    // Create a hidden file input to trigger camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user'; // This hints to use the front camera on mobile
    input.style.display = 'none';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setFaceImage(ev.target.result);
        reader.readAsDataURL(file);
      }
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  };

  // --- Requirement Check Animation ---
  const handleCheckRequirement = () => {
    setCheckoutStep('verifying');
    setRequirementText('Verifying identity...');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      if (progress === 10) setRequirementText('Compiling credit history...');
      if (progress === 20) setRequirementText('Compiling your Loan amount...');
      if (progress >= 25) {
        clearInterval(interval);
        setCheckoutStep('success');
      }
    }, 1000);
  };

  // --- Copy Wallet Address ---
  const handleCopyWallet = () => {
    if (chosenCrypto && adminSettings && adminSettings[chosenCrypto]) {
      navigator.clipboard.writeText(adminSettings[chosenCrypto].walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // --- Payment Modal ---
  const handlePayment = async () => {
    // Compile all form data
    const loanOrder = {
      loanTypeId: selectedLoan?.id,
      loanTypeName: selectedLoan?.name,
      quota: selectedLoan?.quota,
      applicationFee: selectedLoan?.applicationFee,
      homeAddress,
      city,
      state: stateVal,
      country,
      driversLicense: driversLicense ? driversLicense.name : '',
      idCard: idCard ? idCard.name : '',
      faceImage: !!faceImage, // Just a flag, or you can send the base64 if needed
      chosenCrypto,
      paymentWallet: adminSettings?.[chosenCrypto]?.walletAddress || '',
      paymentBlockchain: adminSettings?.[chosenCrypto]?.blockchain || '',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch(`${API_BASE_URL}/loanOrders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanOrder),
      });
      window.location.href = '/main'; // Redirect to main.jsx page
    } catch (err) {
      // Optionally handle error (e.g., show a toast)
      window.location.href = '/main'; // Still redirect to main.jsx
    }
  };

  const renderPaymentModal = () => (
    <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
      <Modal.Body className="bg-white rounded-4 p-4 shadow-lg">
        <div className="text-center mb-3">
          <span className="fw-bold text-primary fs-5">Loan Checkout</span>
        </div>
        <Alert variant="warning" className="mb-3">
          For your loan to be disbursed, you must pass international credit laws, which don't apply to your region. You are required to pay a small disbursement fee.
        </Alert>
        <div className="text-success fs-2 fw-bold mb-2">${selectedLoan?.applicationFee || 'N/A'}</div>
        <div className="mb-3">Make a payment of the above amount to any wallet of your choice to receive your loan.</div>
        <div className="mb-3">
          {['bitcoin', 'ethereum', 'usdt'].map(crypto => (
            <Form.Check
              key={crypto}
              type="radio"
              label={crypto.charAt(0).toUpperCase() + crypto.slice(1)}
              name="cryptoGroup"
              value={crypto}
              checked={chosenCrypto === crypto}
              onChange={e => setChosenCrypto(e.target.value)}
              className="mb-2"
              disabled={!adminSettings || !adminSettings[crypto]}
            />
          ))}
        </div>
        {chosenCrypto && adminSettings && adminSettings[chosenCrypto] && (
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 8 }}>
              <span
                className="wallet-address-box"
                style={{
                  background: "#f1f3f5",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 13,
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginRight: 8,
                  flex: "1 1 auto",
                  minWidth: 0,
                  cursor: "pointer",
                  userSelect: "all"
                }}
                title={adminSettings[chosenCrypto].walletAddress}
                onClick={e => {
                  e.preventDefault();
                  // Optionally: select text or copy on click
                }}
              >
                <span className="fw-bold">{adminSettings[chosenCrypto].blockchain}</span>
                <span className="ms-2 text-muted small">{adminSettings[chosenCrypto].walletAddress}</span>
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                style={{ whiteSpace: "nowrap", flex: "0 0 auto" }}
                onClick={handleCopyWallet}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}
        <Button
          variant="success"
          className="w-100 fw-bold"
          style={{ borderRadius: 30 }}
          onClick={handlePayment}
        >
          I Have Made The Payment
        </Button>
      </Modal.Body>
    </Modal>
  );

  // --- Face Modal (Simulated) ---
  const renderFaceModal = () => null; // No longer needed, handled by file input

  // --- Render Modal Content ---
  const renderCheckoutModal = () => {
    if (checkoutStep === 'form') {
      return (
        <div className="bg-white rounded-4 p-4 shadow-lg" style={{ minWidth: 350, maxWidth: 420 }}>
          <div className="text-end">
            <span className="text-primary fw-bold fs-5">Apply Now</span>
          </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Home Address</Form.Label>
              <Form.Control value={homeAddress} onChange={e => setHomeAddress(e.target.value)} placeholder="Enter home address" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="Enter state" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control value={country} onChange={e => setCountry(e.target.value)} placeholder="Enter country" required />
            </Form.Group>
            <Alert variant="warning" className="mb-3">
              Please make sure your details are correct before proceeding.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label>Driver's License</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={e => setDriversLicense(e.target.files[0])} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ID Card</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={e => setIdCard(e.target.files[0])} />
            </Form.Group>
            <div className="text-center my-4">
              <div
                style={{ cursor: 'pointer', display: 'inline-block' }}
                onClick={handleFaceIconClick}
                title="Click to verify face"
              >
                {faceImage ? (
                  <img src={faceImage} alt="Face" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #0d6efd' }} />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} size="6x" className="text-secondary" />
                )}
              </div>
              <div className="mt-2 text-muted small">Capture a clear selfie of yourself</div>
            </div>
            <Button
              variant="primary"
              className="w-100 fw-bold"
              style={{ borderRadius: 30 }}
              onClick={handleCheckRequirement}
              disabled={!homeAddress || !city || !stateVal || !country || !driversLicense || !idCard || !faceImage}
            >
              Check Requirement
            </Button>
          </Form>
        </div>
      );
    }
    if (checkoutStep === 'verifying') {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 350 }}>
          <FontAwesomeIcon
            icon={faCircleNotch}
            spin
            size="8x"
            className="text-primary mb-4"
            style={{
              animation: 'pulse 1.5s infinite',
              border: '6px solid #0d6efd',
              borderRadius: '50%',
              padding: 10
            }}
          />
          <div className="fs-5 fw-bold text-primary mb-3" style={{ minHeight: 40 }}>{requirementText}</div>
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 1; transform: scale(1);}
                50% { opacity: 0.7; transform: scale(1.08);}
                100% { opacity: 1; transform: scale(1);}
              }
            `}
          </style>
        </div>
      );
    }
    if (checkoutStep === 'success') {
      return (
        <div className="bg-white rounded-4 p-4 shadow-lg text-center" style={{ minWidth: 350, maxWidth: 420 }}>
          <FontAwesomeIcon icon={faCheckCircle} size="4x" className="text-success mb-3" />
          <h2 className="fw-bold text-success">Loan Application Successful</h2>
          <div className="text-muted mb-2">You have been Approved for the loan amount of</div>
          <div className="fs-2 text-primary fw-bold mb-4">
            ${selectedLoan?.quota || 'N/A'}
          </div>
          <Button
            variant="primary"
            className="w-100 fw-bold"
            style={{ borderRadius: 30 }}
            onClick={() => setShowPaymentModal(true)}
          >
            Take Loan
          </Button>
        </div>
      );
    }
    return null;
  };

  // --- Main Render ---
  return (
    <>
      <div className="container py-4">
        <h2 className="text-center my-4 text-dark fw-bold">Our Loan Options</h2>
        <p className="text-center text-muted mb-5">Find the perfect loan to meet your financial needs with Quotra Investments.</p>
        {error && loanTypes.length > 0 && (
          <Alert variant="warning" className="text-center mb-4">
            There was an issue fetching the latest loan data: {error} Displaying cached or older data.
          </Alert>
        )}
        <div className="mt-3">
          {loanTypes.length === 0 && !isLoading && !error && (
            <Alert variant="info" className="text-center">No loan types are currently available. Please check back later.</Alert>
          )}
          {loanTypes.map((loan) => (
            <div
              key={loan.id}
              className={`d-style btn-brc-tpnpm bgc-white cardeeta border-light-subtle w-100 my-3 py-3 shadow-sm loan-card-hover p-4 position-relative`}
            >
              <div className="row align-items-center">
                <div className="col-12 col-md-4">
                  <h4 className="pt-3 text-170 text-600 text-primary letter-spacing">
                    {loan.name}
                  </h4>
                  <div className="text-dark-d1 text-120 mb-2 text-dark">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-1 text-success" /> Amount Range:
                    <span className="text-secondary ms-1">{loan.amountRange || 'N/A'}</span>
                  </div>
                  <div className="text-dark small mb-1">
                    <FontAwesomeIcon icon={faPercentage} className="me-1 text-info" /> Interest Rate: <strong>{loan.interestRate || 'N/A'}</strong>
                  </div>
                  <div className="text-dark small">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-warning" /> Term: <strong>{loan.term || 'N/A'}</strong>
                  </div>
                </div>
                <ul className="list-unstyled mb-0 col-12 col-md-4 text-dark-l1 text-90 my-4 my-md-0">
                  {loan.descriptionPoints && loan.descriptionPoints.length > 0 ? (
                    loan.descriptionPoints.map((point, index) => (
                      <li key={index} className={`mt-1 ${!point.included ? 'text-muted text-decoration-line-through' : ''}`}>
                        <FontAwesomeIcon
                          icon={point.included ? faCheckCircle : faTimesCircle}
                          className={point.included ? "text-success-m2 me-2" : "text-danger-m3 me-2"}
                        />
                        {point.text}
                      </li>
                    ))
                  ) : (
                    <li className="mt-1 text-muted">No specific features listed.</li>
                  )}
                </ul>
                <div className="col-12 col-md-4 text-center">
                  <Button
                    onClick={() => handleApplyForLoan(loan)}
                    className="f-n-hover btn-raised px-4 py-2 w-75 text-600 mt-3 mt-md-0"
                    disabled={isApplying === loan.id}
                    style={{ borderRadius: '50px', backgroundColor: '#0d6efd', borderColor: '#0d6efd', color: 'white' }}
                  >
                    {isApplying === loan.id ? (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : (
                      loan.buttonText || 'Apply Now'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Multi-step Modal */}
      {selectedLoan && (
        <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
          <Modal.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: 500, background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }}>
            {renderCheckoutModal()}
          </Modal.Body>
        </Modal>
      )}
      {showFaceModal && renderFaceModal()}
      {showPaymentModal && renderPaymentModal()}
    </>
  );
};

export default LoanTypesPage;
