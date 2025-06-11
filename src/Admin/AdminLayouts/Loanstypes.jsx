// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\Loanstypes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Spinner, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL

const initialLoanState = {
    name: '',
    interestRate: '',
    term: '',
    amountRange: '',
    descriptionPoints: [{ text: '', included: true }],
    applicationFee: '', // Added applicationFee
    buttonText: 'Apply Now',
};

const Loanstypes = () => {
    const [loanData, setLoanData] = useState(initialLoanState);
    const [existingLoanTypes, setExistingLoanTypes] = useState([]);
    const [isLoadingLoanTypes, setIsLoadingLoanTypes] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingLoanId, setEditingLoanId] = useState(null); // <-- NEW

    const fetchExistingLoanTypes = useCallback(async () => {
        setIsLoadingLoanTypes(true);
        setError(null);
        try {
            // Fetch from JSON server's /loanTypes endpoint
            const response = await fetch(`${API_BASE_URL}/loanTypes`);

            if (!response.ok) {
                throw new Error(`Failed to fetch existing loan types. Status: ${response.status}`);
            }

            const data = await response.json();
            setExistingLoanTypes(data);
        } catch (err) {
            setError(err.message);
            console.error('Fetch existing loan types error:', err);
        } finally {
            setIsLoadingLoanTypes(false);
        }
    }, []);

    useEffect(() => {
        fetchExistingLoanTypes();
    }, [fetchExistingLoanTypes]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoanData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleDescriptionPointChange = (index, field, value) => {
        const newPoints = [...loanData.descriptionPoints];
        newPoints[index][field] = value;
        setLoanData((prev) => ({ ...prev, descriptionPoints: newPoints }));
    };

    const addDescriptionPoint = () => {
        setLoanData((prev) => ({
            ...prev,
            descriptionPoints: [...prev.descriptionPoints, { text: '', included: true }],
        }));
    };

    const removeDescriptionPoint = (index) => {
        if (loanData.descriptionPoints.length <= 1) return; // Keep at least one point
        const newPoints = loanData.descriptionPoints.filter((_, i) => i !== index);
        setLoanData((prev) => ({ ...prev, descriptionPoints: newPoints }));
    };

    const handleEditLoanType = (loan) => {
        setEditingLoanId(loan.id);
        setLoanData({
            name: loan.name || '',
            interestRate: loan.interestRate || '',
            term: loan.term || '',
            amountRange: loan.amountRange || '',
            descriptionPoints: loan.descriptionPoints ? JSON.parse(JSON.stringify(loan.descriptionPoints)) : [{ text: '', included: true }],
            applicationFee: loan.applicationFee !== null && loan.applicationFee !== undefined ? String(loan.applicationFee) : '',
            buttonText: loan.buttonText || 'Apply Now',
        });
        setError(null);
        setSuccess(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingLoanId(null);
        setLoanData(initialLoanState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        if (!loanData.name.trim() || loanData.descriptionPoints.some((p) => !p.text.trim())) {
            setError('Loan name and all description point texts are required.');
            setIsSubmitting(false);
            return;
        }

        try {
            let response;
            let successMessage;

            const payload = {
                ...loanData,
                buttonLink: '/dashboard/loans-checkout',
                applicationFee: parseFloat(loanData.applicationFee) || 0,
            };

            if (editingLoanId) {
                // PUT request to update
                response = await fetch(`${API_BASE_URL}/loanTypes/${editingLoanId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                successMessage = `Loan type "${loanData.name}" updated successfully!`;
            } else {
                // POST request to add
                response = await fetch(`${API_BASE_URL}/loanTypes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                successMessage = `Loan type "${loanData.name}" added successfully!`;
            }

            if (!response.ok) {
                let errData;
                try {
                    errData = await response.json();
                } catch (parseError) {
                    errData = { message: `Request failed with status ${response.status}` };
                }
                throw new Error(errData.message || `Failed to ${editingLoanId ? 'update' : 'add'} loan type. Status: ${response.status}`);
            }

            setSuccess(successMessage);
            setLoanData(initialLoanState);
            setEditingLoanId(null);
            fetchExistingLoanTypes();
        } catch (err) {
            setError(err.message);
            console.error(`${editingLoanId ? 'Update' : 'Add'} loan type error:`, err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLoanType = async (loanTypeId, loanTypeName) => {
        if (window.confirm(`Are you sure you want to delete the loan type "${loanTypeName}"? This action cannot be undone.`)) {
            setIsSubmitting(true); // Can use a different loading state for delete if preferred
            setError(null);
            setSuccess(null);
            try {
                // DELETE request to JSON server's /loanTypes/:id endpoint
                const response = await fetch(`${API_BASE_URL}/loanTypes/${loanTypeId}`, {
                    method: 'DELETE',
                    // No Authorization header for simple JSON server
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete loan type. Status: ${response.status}`);
                }

                setSuccess(`Loan type "${loanTypeName}" deleted successfully!`);
                fetchExistingLoanTypes(); // Refresh the list
            } catch (err) {
                setError(err.message);
                console.error('Delete loan type error:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    return (
        <div className="container-fluid mt-4">
            <Card className="mb-4">
                <Card.Header as="h5">{editingLoanId ? 'Edit Loan Type' : 'Add New Loan Type'}</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="loanName">
                                <Form.Label>Loan Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={loanData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Personal Loan, Mortgage"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="interestRate">
                                <Form.Label>Interest Rate</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="interestRate"
                                    value={loanData.interestRate}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 5.99% or 3% - 7%"
                                />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="term">
                                <Form.Label>Term</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="term"
                                    value={loanData.term}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 12 - 60 Months, Up to 30 Years"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="amountRange">
                                <Form.Label>Amount Range</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="amountRange"
                                    value={loanData.amountRange}
                                    onChange={handleInputChange}
                                    placeholder="e.g., $1,000 - $50,000"
                                />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="applicationFee">
                                <Form.Label>Application Fee (USD)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="applicationFee"
                                    value={loanData.applicationFee}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 50.00"
                                    step="0.01"
                                />
                            </Form.Group>
                        </Row>

                        <Card.Subtitle className="mb-2 mt-4 text-muted">Description Points</Card.Subtitle>
                        {loanData.descriptionPoints.map((point, index) => (
                            <Row key={index} className="mb-2 align-items-center">
                                <Col md={8}>
                                    <Form.Control
                                        type="text"
                                        placeholder={`Point ${index + 1} text`}
                                        value={point.text}
                                        onChange={(e) => handleDescriptionPointChange(index, 'text', e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Check
                                        type="switch"
                                        id={`included-switch-${index}`}
                                        label="Included"
                                        checked={point.included}
                                        onChange={(e) => handleDescriptionPointChange(index, 'included', e.target.checked)}
                                    />
                                </Col>
                                <Col md={1}>
                                    {loanData.descriptionPoints.length > 1 && (
                                        <Button variant="outline-danger" size="sm" onClick={() => removeDescriptionPoint(index)}>X</Button>
                                    )}
                                </Col>
                            </Row>
                        ))}
                        <Button variant="outline-secondary" size="sm" onClick={addDescriptionPoint} className="mb-3 mt-1">Add Description Point</Button>

                        <Row className="mb-3 mt-3">
                            <Form.Group as={Col} md="6" controlId="buttonText">
                                <Form.Label>Button Text</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="buttonText"
                                    value={loanData.buttonText}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Apply Now, Learn More"
                                />
                            </Form.Group>
                        </Row>

                        <Button variant="primary" type="submit" disabled={isSubmitting} className="mt-3">
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> {editingLoanId ? 'Updating Loan Type...' : 'Adding Loan Type...'}
                                </>
                            ) : (
                                editingLoanId ? 'Update Loan Type' : 'Add Loan Type'
                            )}
                        </Button>
                        {editingLoanId && (
                            <Button variant="outline-secondary" onClick={cancelEdit} className="mt-3 ms-2" disabled={isSubmitting}>
                                Cancel Edit
                            </Button>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <Card className="mt-4">
                <Card.Header as="h5">Existing Loan Types</Card.Header>
                <Card.Body>
                    {isLoadingLoanTypes && (
                        <div className="text-center">
                            <Spinner animation="border" />
                            <p>Loading loan types...</p>
                        </div>
                    )}
                    {!isLoadingLoanTypes && error && !existingLoanTypes.length && (
                        <Alert variant="warning">Could not load existing loan types: {error}</Alert>
                    )}
                    {!isLoadingLoanTypes && !error && existingLoanTypes.length === 0 && (
                        <p>No loan types created yet.</p>
                    )}
                    {!isLoadingLoanTypes && existingLoanTypes.length > 0 && (
                        <>
                        {error && <Alert variant="info" className="mb-2">Note: There was an issue, but some loan types might be displayed from a previous successful fetch or cache.</Alert>}
                        <ListGroup>
                            {existingLoanTypes.map((loan) => (
                                <ListGroup.Item
                                    key={loan.id}
                                    className="d-flex justify-content-between align-items-center flex-wrap"
                                >
                                    <div style={{ flexGrow: 1, minWidth: '200px', paddingRight: '10px' }}>
                                        <strong>{loan.name}</strong>
                                        <br />
                                        <small className="text-muted">
                                            Rate: {loan.interestRate || 'N/A'} |
                                            Term: {loan.term || 'N/A'} |
                                            Amount: {loan.amountRange || 'N/A'} |
                                            Fee: ${typeof loan.applicationFee === 'number' ? loan.applicationFee.toFixed(2) : 'N/A'}
                                        </small>
                                        <ul className="list-unstyled list-inline mt-1 mb-0">
                                            {(loan.descriptionPoints || []).map((p, idx) => (
                                                <li key={idx} className={`list-inline-item small ${p.included ? 'text-success' : 'text-danger text-decoration-line-through'}`}>
                                                    {p.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-2 mt-md-0">
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => handleEditLoanType(loan)}
                                            disabled={isSubmitting || editingLoanId === loan.id}
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteLoanType(loan.id, loan.name)}
                                            disabled={isSubmitting}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Loanstypes;
