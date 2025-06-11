// src/layout/Dashboard/LoanTypesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap'; // Added Modal, Form, InputGroup
import { API_BASE_URL } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCheckCircle, faTimesCircle, faPercentage, faCalendarAlt, faMoneyBillWave, faTimes, faFileImage, faQuestionCircle, faCircleNotch, faSmile, faCamera } from '@fortawesome/free-solid-svg-icons'; //Added icons

const LoanTypesPage = () => {
  const [loanTypes, setLoanTypes] = useState([]); // State to hold fetched loan types
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isApplying, setIsApplying] = useState(null); // To show loading on specific button
  const navigate = useNavigate();
    // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [dispensedAmount, setDispensedAmount] = useState('');
  const [idImage, setIdImage] = useState(null); // For handling the ID image
  // Add a new state for modal-specific errors to avoid overwriting page-level errors
  const [modalError, setModalError] = useState('');

  // --- Checkout Flow States ---
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('form'); // form | verifying | success | payment
  const [faceImage, setFaceImage] = useState(null);
  const [homeAddress, setHomeAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [country, setCountry] = useState('');
  const [driversLicense, setDriversLicense] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [requirementText, setRequirementText] = useState('verifying identity');
  const [requirementProgress, setRequirementProgress] = useState(0);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chosenCrypto, setChosenCrypto] = useState('');
  const [copied, setCopied] = useState(false);

  // Dummy adminSettings for wallet addresses
  const adminSettings = {
    bitcoin: { blockchain: "Bitcoin Network", walletAddress: "balablu123" },
    ethereum: { blockchain: "erc 10", walletAddress: "esjhfefweuh657" },
    usdt: { blockchain: "trc20 tron", walletAddress: "wefrcaecrfe678" }
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/loanTypes`) // Fetch from /loanTypes endpoint
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch loan types. Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setLoanTypes(data))
      .catch((err) => {
        console.error("Error fetching loan types:", err);
        setError(err.message || 'Failed to load loan types. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLoan(null);
    setDispensedAmount('');
    setIdImage(null);
    setModalError(''); // Clear modal error on close
  };

  const handleApplyForLoan = (loanType) => {
     setSelectedLoan(loanType);
     setShowModal(true);
     setModalError(''); // Clear any previous modal errors
  };

  const handleSubmitLoan = async () => {
       if (!dispensedAmount || parseFloat(dispensedAmount) <= 0) {
            setModalError('Please enter a valid amount to dispense.'); // Use modalError
            return;
       }
       if (!idImage) {
            setModalError('Please upload an ID image.'); // Use modalError
            return;
       }
       setModalError(''); // Clear modal error before submission
       setIsApplying(selectedLoan.id); // Show loading on the main button if needed, or use a modal-specific loading state

        // --- Actual API call to /loanOrders ---
        const userId = localStorage.getItem('userId'); // Assuming you have userId in localStorage
        const loggedInUserString = localStorage.getItem('loggedInUser');
        const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : {};


        if (!userId) {
            setModalError("User not identified. Please log in again.");
            setIsApplying(null);
            return;
        }

        const loanOrderData = {
            userId: userId,
            username: loggedInUser.username || 'N/A', // Get username if available
            loanTypeId: selectedLoan.id,
            loanName: selectedLoan.name,
            requestedAmount: parseFloat(dispensedAmount),
            // For the ID image, you'd typically upload it to a service (like Cloudinary)
            // and store the URL. For json-server, you might store a placeholder or filename.
            idImageProof: idImage.name, // Storing filename as a placeholder
            status: 'pending', // Initial status
            requestDate: new Date().toISOString(),
            // Include other relevant details from selectedLoan if needed
            interestRate: selectedLoan.interestRate,
            term: selectedLoan.term,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/loanOrders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loanOrderData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to submit loan application. Status: ${response.status}`);
            }

            // Handle successful submission
            alert(`Loan application for ${selectedLoan.name} submitted successfully!`);
            handleCloseModal(); // Close modal on success
            // Optionally, navigate or refresh data
            // navigate('/dashboard/my-loans');

        } catch (err) {
            console.error("Error submitting loan application:", err);
            setModalError(err.message || "An unexpected error occurred.");
        } finally {
            setIsApplying(null); // Reset applying state
        }
  };

  // --- Face Verification Simulation ---
  const handleFaceIconClick = () => {
    setShowFaceModal(true);
    // Simulate face verification steps
    // In production, use a real face verification SDK
  };

  const handleFakeFaceVerification = () => {
    // Simulate selfie capture
    setTimeout(() => {
      setFaceImage('https://randomuser.me/api/portraits/men/32.jpg'); // Replace with real selfie
      setShowFaceModal(false);
    }, 3000);
  };

  // --- Requirement Check Animation ---
  const handleCheckRequirement = () => {
    setCheckoutStep('verifying');
    setRequirementText('Verifying identity...');
    setRequirementProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setRequirementProgress(progress);
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
    if (chosenCrypto && adminSettings[chosenCrypto]) {
      navigator.clipboard.writeText(adminSettings[chosenCrypto].walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

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
              <div className="mt-2 text-muted small">Click the image to verify face</div>
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
          <div className="fs-2 text-primary fw-bold mb-4">${selectedLoan?.amountRange || 'N/A'}</div>
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

  // --- Payment Modal ---
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
            />
          ))}
        </div>
        {chosenCrypto && (
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <span>
                <span className="fw-bold">{adminSettings[chosenCrypto].blockchain}</span>
                <span className="ms-2 text-muted small">({adminSettings[chosenCrypto].walletAddress})</span>
              </span>
              <Button variant="outline-secondary" size="sm" onClick={handleCopyWallet}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}
        <Button
          variant="success"
          className="w-100 fw-bold"
          style={{ borderRadius: 30 }}
        >
          I Have Made The Payment
        </Button>
      </Modal.Body>
    </Modal>
  );

  // --- Face Modal (Simulated) ---
  const renderFaceModal = () => (
    <Modal show={showFaceModal} onHide={() => setShowFaceModal(false)} centered>
      <Modal.Body className="text-center p-4">
        <FontAwesomeIcon icon={faCamera} size="4x" className="text-primary mb-3" />
        <div className="mb-2 fw-bold">Face Verification</div>
        <div className="mb-3 text-muted">Please follow the instructions:<br />Close your eyes, open your mouth, look left and right.</div>
        <Button variant="primary" onClick={handleFakeFaceVerification}>Simulate Verification</Button>
      </Modal.Body>
    </Modal>
  );

  // --- Main Render ---
  return (
    <> {/* Wrapper Fragment */}
      <div className="container py-4">
        <h2 className="text-center my-4 text-dark fw-bold">Our Loan Options</h2>
        <p className="text-center text-muted mb-5">Find the perfect loan to meet your financial needs with Quotra Investments.</p>
        {/* Display page-level error if it exists and some loan types might still be shown */}
        {error && loanTypes.length > 0 && (
            <Alert variant="warning" className="text-center mb-4">
                There was an issue fetching the latest loan data: {error} Displaying cached or older data.
            </Alert>
        )}
        <div className="mt-3">
          {loanTypes.length === 0 && !isLoading && !error && ( // Added !error here
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
                    {/* Removed trailing % as it might be in the data */}
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
                    disabled={isApplying === loan.id} // This state is for the button on the card
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

      {/* Modal for Loan Application */}
      {selectedLoan && ( // Conditionally render Modal only if a loan is selected
        <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
            <Modal.Header className="border-0 pb-0 pt-3 px-4">
                <Modal.Title as="h5" className="ms-auto text-primary fw-bolder">{selectedLoan?.name} Application</Modal.Title>
                <Button variant="link" className="text-muted p-0 shadow-none" onClick={handleCloseModal} style={{position: 'absolute', top: '15px', left: '20px', fontSize: '1.2rem'}}>
                    <FontAwesomeIcon icon={faTimes}/>
                </Button>
            </Modal.Header>
            <Modal.Body className="p-4">
                {modalError && <Alert variant="danger" className="py-2 small">{modalError}</Alert>}
                <Form onSubmit={(e) => { e.preventDefault(); handleSubmitLoan(); }}> {/* Added form onSubmit */}
                    <Form.Group className="mb-3" controlId="amountToDispense">
                        <Form.Label className="fw-medium">Amount to Dispense (USD)</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{ borderTopLeftRadius: '50rem', borderBottomLeftRadius: '50rem', borderRight: 0, background: '#e9ecef' }}>
                                $
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                placeholder="Enter desired amount"
                                value={dispensedAmount}
                                onChange={(e) => setDispensedAmount(e.target.value)}
                                min="0.01" // Or selectedLoan.minAmount if available
                                // max={selectedLoan.maxAmount} // If you have max amount per loan type
                                step="0.01"
                                required
                                className="form-control-pill"
                                style={{ borderTopRightRadius: '50rem', borderBottomRightRadius: '50rem', borderLeft: 0, paddingLeft: '0.75rem' }}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="idImage">
                        <Form.Label className="fw-medium">ID Image Upload</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg" 
                            onChange={(e) => setIdImage(e.target.files[0])} 
                            required 
                            className="form-control-pill"
                        />
                        <Form.Text className="text-muted small">Please upload a clear image of your government-issued ID (PNG, JPG, JPEG).</Form.Text>
                    </Form.Group>
                    <Alert variant="warning" className="mt-3 py-2 small d-flex align-items-center">
                        <FontAwesomeIcon icon={faQuestionCircle} className="me-2 flex-shrink-0" style={{fontSize: '1.2em'}} />
                        <div>Please note: The funds will be sent to the wallet address associated with your account once the loan is confirmed. Ensure your profile wallet address is up to date.</div>
                    </Alert>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 d-flex justify-content-center px-4 pb-4">
                <Button 
                    variant="primary" 
                    onClick={handleSubmitLoan} 
                    disabled={!dispensedAmount || !idImage || isApplying === selectedLoan.id} // Disable if submitting
                    className="w-100 text-white fw-bold"
                    style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd', borderRadius: '50rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                    {isApplying === selectedLoan.id ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Submitting...</>
                    ) : (
                        'Submit Application'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
      )}

      {/* Face Verification Modal (Simulated) */}
      {showFaceModal && renderFaceModal()}

      {/* Payment Modal */}
      {showPaymentModal && renderPaymentModal()}
    </> 
  );
};

export default LoanTypesPage;
