// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\PricingAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Spinner, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL

const initialPlanState = {
    name: '',
    priceRange: '', // e.g., "$10 - $20 / month" or "Contact Us"
    features: [{ text: '', included: true }],
    profitPotential: '', // New field for profit potential (e.g., "1.5" for 1.5x or "25" for 25%)
    tradeDurationDays: '', // New field for trade duration in days
    buttonText: 'Choose Plan',
    isPopular: false, // Added for consistency with PricingPage
    period: '', // e.g., "/ month", "/ year"
    tradeTime: '', // e.g., "24/7", "Business Hours"
};

const PricingAdmin = () => {
    const [newPlanData, setNewPlanData] = useState(initialPlanState);
    const [existingPlans, setExistingPlans] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingPlanId, setEditingPlanId] = useState(null); // To store the ID of the plan being edited

    const fetchExistingPlans = useCallback(async () => {
        setIsLoadingPlans(true);
        setError(null);
        try {
            // Fetch from JSON server's /assets endpoint
            const response = await fetch(`${API_BASE_URL}/assets`);

            if (!response.ok) {
                throw new Error(`Failed to fetch existing plans. Status: ${response.status}`);
            }

            const data = await response.json();
            setExistingPlans(data);
        } catch (err) {
            setError(err.message);
            console.error('Fetch existing plans error:', err);
        } finally {
            setIsLoadingPlans(false);
        }
    }, []);

    useEffect(() => {
        fetchExistingPlans();
    }, [fetchExistingPlans]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPlanData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...newPlanData.features];
        newFeatures[index][field] = value;
        setNewPlanData((prev) => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setNewPlanData((prev) => ({
            ...prev,
            features: [...prev.features, { text: '', included: true }],
        }));
    };

    const removeFeature = (index) => {
        if (newPlanData.features.length <= 1) return; // Keep at least one feature
        const newFeatures = newPlanData.features.filter((_, i) => i !== index);
        setNewPlanData((prev) => ({ ...prev, features: newFeatures }));
    };

    const handleEditPlan = (plan) => {
        setEditingPlanId(plan.id);
        setNewPlanData({
            name: plan.name || '',
            priceRange: plan.priceRange || '',
            features: plan.features ? JSON.parse(JSON.stringify(plan.features)) : [{ text: '', included: true }], // Deep copy
            profitPotential: plan.profitPotential !== null && plan.profitPotential !== undefined ? String(plan.profitPotential) : '',
            tradeDurationDays: plan.tradeDurationDays !== null && plan.tradeDurationDays !== undefined ? String(plan.tradeDurationDays) : '',
            buttonText: plan.buttonText || 'Choose Plan',
            isPopular: plan.isPopular || false,
            period: plan.period || '',
            tradeTime: plan.tradeTime || '',
        });
        setError(null);
        setSuccess(null);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
    };

    const cancelEdit = () => {
        setEditingPlanId(null);
        setNewPlanData(initialPlanState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        if (!newPlanData.name.trim() || newPlanData.features.some((f) => !f.text.trim())) {
            setError('Plan name and all feature texts are required.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...newPlanData,
                profitPotential: newPlanData.profitPotential === '' ? null : parseFloat(newPlanData.profitPotential),
                tradeDurationDays: newPlanData.tradeDurationDays === '' ? null : parseInt(newPlanData.tradeDurationDays, 10),
            };

            let response;
            let successMessage;

            if (editingPlanId) {
                // Update existing plan (PUT request)
                response = await fetch(`${API_BASE_URL}/assets/${editingPlanId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                successMessage = `Pricing plan "${newPlanData.name}" updated successfully!`;
            } else {
                // Add new plan (POST request)
                response = await fetch(`${API_BASE_URL}/assets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload), // JSON server will auto-assign an 'id'
                });
                successMessage = `Pricing plan "${newPlanData.name}" added successfully!`;
            }

            if (!response.ok) {
                let errData;
                try {
                    errData = await response.json();
                } catch (parseError) {
                    errData = { message: `Request failed with status ${response.status}` };
                }
                throw new Error(errData.message || `Failed to ${editingPlanId ? 'update' : 'add'} pricing plan. Status: ${response.status}`);
            }

            setSuccess(successMessage);
            setNewPlanData(initialPlanState); // Reset form
            setEditingPlanId(null); // Exit edit mode
            fetchExistingPlans(); // Refresh the list of plans

        } catch (err) {
            setError(err.message);
            console.error(`${editingPlanId ? 'Update' : 'Add'} pricing plan error:`, err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlan = async (planId, planName) => {
        if (window.confirm(`Are you sure you want to delete the pricing plan "${planName}"? This action cannot be undone.`)) {
            setIsSubmitting(true); // Can use a different loading state for delete if preferred
            setError(null);
            setSuccess(null);
            try {
                // DELETE request to JSON server's /assets/:id endpoint
                const response = await fetch(`${API_BASE_URL}/assets/${planId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete pricing plan. Status: ${response.status}`);
                }

                setSuccess(`Pricing plan "${planName}" deleted successfully!`);
                fetchExistingPlans(); // Refresh the list of plans
            } catch (err) {
                setError(err.message);
                console.error('Delete pricing plan error:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="container-fluid mt-4">
            <Card className="mb-4">
                <Card.Header as="h5">{editingPlanId ? 'Edit Asset/Pricing Plan' : 'Add New Asset/Pricing Plan'}</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* ... (Form.Group for planName, priceRange, profitPotential, tradeDurationDays, period, tradeTime, isPopular remain the same) ... */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="planName">
                                <Form.Label>Plan Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={newPlanData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Basic, Pro, Enterprise"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="priceRange">
                                <Form.Label>Price / Price Range</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="priceRange"
                                    value={newPlanData.priceRange}
                                    onChange={handleInputChange}
                                    placeholder="e.g., $9.99 or $100 - $500"
                                />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="profitPotential">
                                <Form.Label>Profit Potential (e.g., 1.5 for 1.5x or 25 for 25%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="profitPotential"
                                    value={newPlanData.profitPotential}
                                    onChange={handleInputChange}
                                    placeholder="Enter a numerical value"
                                    step="any"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="tradeDurationDays">
                                <Form.Label>Trade Duration (Days)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="tradeDurationDays"
                                    value={newPlanData.tradeDurationDays}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 7, 30"
                                    step="1"
                                    min="0"
                                />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                             <Form.Group as={Col} md="4" controlId="period">
                                <Form.Label>Period</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="period"
                                    value={newPlanData.period}
                                    onChange={handleInputChange}
                                    placeholder="e.g., / month, / year"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="tradeTime">
                                <Form.Label>Trade Time</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="tradeTime"
                                    value={newPlanData.tradeTime}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 24/7, Business Hours"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="isPopular" className="d-flex align-items-end">
                                <Form.Check
                                    type="switch"
                                    name="isPopular"
                                    id="isPopularSwitch"
                                    label="Mark as Popular"
                                    checked={newPlanData.isPopular}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Row>

                        <Card.Subtitle className="mb-2 mt-4 text-muted">Plan Features</Card.Subtitle>
                        {newPlanData.features.map((feature, index) => (
                            <Row key={index} className="mb-2 align-items-center">
                                <Col md={8}>
                                    <Form.Control
                                        type="text"
                                        placeholder={`Feature ${index + 1} text`}
                                        value={feature.text}
                                        onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Check
                                        type="switch"
                                        id={`feature-included-switch-${index}`}
                                        label="Included"
                                        checked={feature.included}
                                        onChange={(e) => handleFeatureChange(index, 'included', e.target.checked)}
                                    />
                                </Col>
                                <Col md={1}>
                                    {newPlanData.features.length > 1 && (
                                        <Button variant="outline-danger" size="sm" onClick={() => removeFeature(index)}>X</Button>
                                    )}
                                </Col>
                            </Row>
                        ))}
                        <Button variant="outline-secondary" size="sm" onClick={addFeature} className="mb-3 mt-1">Add Feature</Button>

                        <Row className="mb-3 mt-3">
                            <Form.Group as={Col} md="12" controlId="buttonText">
                                <Form.Label>Button Text</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="buttonText"
                                    value={newPlanData.buttonText}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Get Started, Choose Plan, Invest Now"
                                />
                            </Form.Group>
                        </Row>

                        <Button variant="primary" type="submit" disabled={isSubmitting} className="mt-3">
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> {editingPlanId ? 'Updating Plan...' : 'Adding Plan...'}
                                </>
                            ) : (
                                editingPlanId ? 'Update Pricing Plan' : 'Add Pricing Plan'
                            )}
                        </Button>
                        {editingPlanId && (
                            <Button variant="outline-secondary" onClick={cancelEdit} className="mt-3 ms-2" disabled={isSubmitting}>
                                Cancel Edit
                            </Button>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <Card className="mt-4">
                <Card.Header as="h5">Existing Pricing Plans</Card.Header>
                <Card.Body>
                    {isLoadingPlans && (
                        <div className="text-center">
                            <Spinner animation="border" />
                            <p>Loading plans...</p>
                        </div>
                    )}
                    {!isLoadingPlans && error && !existingPlans.length && ( // Show error only if no plans loaded
                        <Alert variant="warning">Could not load existing plans: {error}</Alert>
                    )}
                    {!isLoadingPlans && !error && existingPlans.length === 0 && (
                        <p>No pricing plans created yet.</p>
                    )}
                    {!isLoadingPlans && existingPlans.length > 0 && ( // Error might still exist but we have some data
                        <>
                        {error && <Alert variant="info" className="mb-2">Note: There was an issue, but some plans might be displayed from a previous successful fetch or cache.</Alert>}
                        <ListGroup>
                            {existingPlans.map((plan) => (
                                <ListGroup.Item
                                    key={plan.id} // JSON server typically uses 'id'
                                    className="d-flex justify-content-between align-items-center flex-wrap"
                                >
                                    <div style={{ flexGrow: 1, minWidth: '200px', paddingRight: '10px' }}>
                                        <strong>{plan.name}</strong> {plan.isPopular && <span className="badge bg-success ms-2">Popular</span>}
                                        <br />
                                        <small className="text-muted">
                                            Price: {plan.priceRange || 'N/A'} |
                                            Profit: {plan.profitPotential !== null && plan.profitPotential !== undefined ? plan.profitPotential : 'N/A'} |
                                            Duration: {plan.tradeDurationDays ? `${plan.tradeDurationDays} days` : 'N/A'} |
                                            Period: {plan.period || 'N/A'} |
                                            Trade Time: {plan.tradeTime || 'N/A'}
                                        </small>
                                        <ul className="list-unstyled list-inline mt-1 mb-0">
                                            {(plan.features || []).map((f, idx) => (
                                                <li key={idx} className={`list-inline-item small ${f.included ? 'text-success' : 'text-danger text-decoration-line-through'}`}>
                                                    {f.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-2 mt-md-0">
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => handleEditPlan(plan)}
                                            disabled={isSubmitting || editingPlanId === plan.id}
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeletePlan(plan.id, plan.name)}
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

export default PricingAdmin;
