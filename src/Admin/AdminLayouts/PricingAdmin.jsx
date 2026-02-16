// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\PricingAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Spinner, Alert, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL
import { useToast } from '../../context/ToastContext'; // Import useToast
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const initialPlanState = {
    name: '',
    symbol: '', // Unique symbol for the asset
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
    const [editingPlanId, setEditingPlanId] = useState(null); // To store the ID of the plan being edited
    const [showForm, setShowForm] = useState(false);
    const { addToast } = useToast();


    const fetchExistingPlans = useCallback(async () => {
        setIsLoadingPlans(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authorization token found. Please log in again.');
            // Fetch from admin-only endpoint
            const response = await fetch(`${API_BASE_URL}/assets/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch existing plans. Status: ${response.status}`);
            }

            const data = await response.json();
            setExistingPlans(data);
        } catch (err) {
            addToast(err.message || 'Failed to fetch existing plans.', 'error');
            console.error('Fetch existing plans error:', err);
        } finally {
            setIsLoadingPlans(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchExistingPlans();
    }, [fetchExistingPlans]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPlanData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
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
        // Use _id for MongoDB assets
        setEditingPlanId(plan._id || plan.id);
        setNewPlanData({
            name: plan.name || '',
            symbol: plan.symbol || '',
            priceRange: plan.priceRange || '',
            features: plan.features ? JSON.parse(JSON.stringify(plan.features)) : [{ text: '', included: true }], // Deep copy
            profitPotential: plan.profitPotential !== null && plan.profitPotential !== undefined ? String(plan.profitPotential) : '',
            tradeDurationDays: plan.tradeDurationDays !== null && plan.tradeDurationDays !== undefined ? String(plan.tradeDurationDays) : '',
            buttonText: plan.buttonText || 'Choose Plan',
            isPopular: plan.isPopular || false,
            period: plan.period || '',
            tradeTime: plan.tradeTime || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
    };

    const cancelEdit = () => {
        setEditingPlanId(null);
        setNewPlanData(initialPlanState);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!newPlanData.name.trim() || newPlanData.features.some((f) => !f.text.trim())) {
            addToast('Plan name and all feature texts are required.', 'error');
            setIsSubmitting(false);
            return;
        }


        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authorization token found. Please log in again.');

            // Build payload to match Asset.js schema
            const payload = {
                name: newPlanData.name,
                symbol: newPlanData.symbol,
                priceRange: newPlanData.priceRange,
                features: Array.isArray(newPlanData.features) ? newPlanData.features : [],
                profitPotential: newPlanData.profitPotential === '' ? undefined : Number(newPlanData.profitPotential),
                tradeDurationDays: newPlanData.tradeDurationDays === '' ? undefined : Number(newPlanData.tradeDurationDays),
                buttonText: newPlanData.buttonText,
                isPopular: !!newPlanData.isPopular,
                period: newPlanData.period,
                tradeTime: newPlanData.tradeTime,
            };

            let response;
            let successMessage;

            if (editingPlanId) {
                // Update existing plan (PUT request, admin-only)
                response = await fetch(`${API_BASE_URL}/assets/${editingPlanId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload),
                });
                successMessage = `Pricing plan "${newPlanData.name}" updated successfully!`;
            } else {
                // Add new plan (POST request, admin-only)
                response = await fetch(`${API_BASE_URL}/assets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload),
                });
                successMessage = `Pricing plan "${newPlanData.name}" added successfully!`;
            }

            if (!response.ok) {
                let errData;
                try {
                    errData = await response.json();
                } catch {
                    errData = { message: `Request failed with status ${response.status}` };
                }
                throw new Error(errData.message || `Failed to ${editingPlanId ? 'update' : 'add'} pricing plan. Status: ${response.status}`);
            }

            addToast(successMessage, 'success');
            setNewPlanData(initialPlanState); // Reset form
            setEditingPlanId(null); // Exit edit mode
            setShowForm(false); // Hide form on success
            fetchExistingPlans(); // Refresh the list of plans

        } catch (err) {
            addToast(err.message, 'error');
            console.error(`${editingPlanId ? 'Update' : 'Add'} pricing plan error:`, err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlan = async (planId, planName) => {
        if (window.confirm(`Are you sure you want to delete the pricing plan "${planName}"? This action cannot be undone.`)) {
            setIsSubmitting(true); // Can use a different loading state for delete if preferred
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authorization token found. Please log in again.');
                // Use _id for MongoDB assets
                const response = await fetch(`${API_BASE_URL}/assets/${planId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete pricing plan. Status: ${response.status}`);
                }

                addToast(`Pricing plan "${planName}" deleted successfully!`, 'success');
                fetchExistingPlans(); // Refresh the list of plans
            } catch (err) {
                addToast(err.message, 'error');
                console.error('Delete pricing plan error:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="container-fluid mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                <h4 className="mb-0">Assets Management</h4>
                <Button onClick={() => {
                    setEditingPlanId(null);
                    setNewPlanData(initialPlanState);
                    setShowForm(true);
                }} className='totobutton'>
                    New +
                </Button>
            </div>

            {showForm && (
                <Card className="mb-4 bg-white border-0">
                    <Card.Header as="h5" className='bg-white border-0'>{editingPlanId ? 'Edit Asset/Pricing Plan' : 'Add New Asset/Pricing Plan'}</Card.Header>
                    <Card.Body>

                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4" controlId="planName">
                                    <Form.Label>Plan Name</Form.Label>
                                    <Form.Control
                                        className=' border-0 totoform'
                                        type="text"
                                        name="name"
                                        value={newPlanData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Basic, Pro, Enterprise"
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="symbol">
                                    <Form.Label>Symbol <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        className=' border-0 totoform'
                                        type="text"
                                        name="symbol"
                                        value={newPlanData.symbol}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., STARTUP, PRO, ENTERPRISE"
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="priceRange">
                                    <Form.Label>Price / Price Range</Form.Label>
                                    <Form.Control
                                        className=' border-0 totoform'
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
                                    className=' border-0 totoform'
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
                                        className=' border-0 totoform'
                                        type="number"
                                        name="tradeDurationDays"
                                        value={newPlanData.tradeDurationDays}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 30"
                                        min="0"
                                        step="1"
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4" controlId="period">
                                    <Form.Label>Period</Form.Label>
                                    <Form.Control
                                    className=' border-0 totoform'
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
                                    className=' border-0 totoform'
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
                                        className=' border-0 totoform'
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
                                    <Col md={1} className="text-end">
                                        {newPlanData.features.length > 1 && (
                                            <Button variant="outline-danger" size="sm" onClick={() => removeFeature(index)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="outline-secondary" size="sm" onClick={addFeature} className=' border-0 totobutton'>Add Feature</Button>

                            <Row className="mb-3 mt-3">
                                <Form.Group as={Col} md="12" controlId="buttonText">
                                    <Form.Label>Button Text</Form.Label>
                                    <Form.Control
                                    className=' border-0 totoform'
                                        type="text"
                                        name="buttonText"
                                        value={newPlanData.buttonText}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Get Started, Choose Plan, Invest Now"
                                    />
                                </Form.Group>
                            </Row>

                            <div className="d-flex justify-content-end">
                                {editingPlanId && (
                                    <Button variant="outline-secondary" onClick={cancelEdit} className="me-2" disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                )}
                                <Button variant="primary" type="submit" disabled={isSubmitting} className=' border-0 totobutton'> 
                                    {isSubmitting ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> {editingPlanId ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        editingPlanId ? 'Update Plan' : 'Add Plan'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            <Card className="mt-4 border-0">
                
                    {isLoadingPlans && (
                        <div className="text-center">
                            <Spinner animation="border" />
                            <p>Loading plans...</p>
                        </div>
                    )}
                    {!isLoadingPlans && existingPlans.length === 0 && (
                        <p>No pricing plans created yet.</p>
                    )}
                    {!isLoadingPlans && (
                        <>
                        {existingPlans.length > 0 ? (
                            <Row>
                                {existingPlans.map((plan) => (
                                    <Col key={plan._id || plan.id} xs={12} md={6} lg={4} className="mb-4">
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <Card.Title className="mb-0">
                                                        <strong>{plan.name}</strong> {plan.isPopular && <span className="badge bg-success ms-2">Popular</span>}
                                                    </Card.Title>
                                                    <div>
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleEditPlan(plan)}
                                                            disabled={isSubmitting || editingPlanId === (plan._id || plan.id)}
                                                            className="me-2"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeletePlan(plan._id || plan.id, plan.name)}
                                                            disabled={isSubmitting}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Card.Subtitle className="mb-2 text-muted">
                                                    Price: {plan.priceRange || 'N/A'} USD<br />
                                                    Profit: {plan.profitPotential !== null && plan.profitPotential !== undefined ? plan.profitPotential : 'N/A'}%<br />
                                                    Trade Duration: {plan.tradeDurationDays !== null && plan.tradeDurationDays !== undefined ? plan.tradeDurationDays : 'N/A'} days<br />
                                                    Trade Time: {plan.tradeTime || 'N/A'}
                                                </Card.Subtitle>
                                                <ul className="list-unstyled list-inline mt-2 mb-0">
                                                    {(plan.features || []).map((f, idx) => (
                                                        <li key={idx} className={`list-inline-item small ${f.included ? 'text-success' : 'text-danger text-decoration-line-through'}`}>
                                                            {f.text}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-2">
                                                    <span className="badge bg-secondary">{plan.buttonText || 'Choose Plan'}</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="text-center text-muted">No pricing plans found in the database.</div>
                        )}
                        </>
                    )}
              
            </Card>
        </div>
    );
};

export default PricingAdmin;
