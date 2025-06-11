// src/Admin/AdminLayouts/AdminSettings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL

const ADMIN_SETTINGS_ID = 'globalAdminSettings'; // Fixed ID for the single settings object

const CRYPTO_CONFIG = {
    bitcoin: { name: 'Bitcoin', defaultBlockchain: 'Bitcoin Network (BTC)' },
    ethereum: { name: 'Ethereum', defaultBlockchain: 'ERC20 (ETH)' },
    usdt: { name: 'USDT', defaultBlockchain: 'TRC20 (Tron)' },
};

const initialCryptoState = { blockchain: '', walletAddress: '', isSaving: false, error: null, success: null };

const AdminSettings = () => {
    const [cryptoSettings, setCryptoSettings] = useState({
        bitcoin: { ...initialCryptoState },
        ethereum: { ...initialCryptoState },
        usdt: { ...initialCryptoState },
    });
    const [globalIsLoading, setGlobalIsLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);

    const fetchSettings = useCallback(async () => {
        setGlobalIsLoading(true);
        setGlobalError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/adminSettings/${ADMIN_SETTINGS_ID}`);
            if (response.ok) {
                const data = await response.json();
                setCryptoSettings({
                    bitcoin: { ...initialCryptoState, ...(data.bitcoin || {}) },
                    ethereum: { ...initialCryptoState, ...(data.ethereum || {}) },
                    usdt: { ...initialCryptoState, ...(data.usdt || {}) },
                });
            } else if (response.status === 404) {
                console.log('Admin settings not yet configured. Will be created on save.');
                // Initialize with empty values, which is already done by initialCryptoState
                setCryptoSettings({
                    bitcoin: { ...initialCryptoState },
                    ethereum: { ...initialCryptoState },
                    usdt: { ...initialCryptoState },
                });
            } else {
                throw new Error(`Failed to fetch settings. Status: ${response.status}`);
            }
        } catch (err) {
            setGlobalError(err.message || 'An unexpected error occurred while fetching settings.');
            console.error('Fetch settings error:', err);
        } finally {
            setGlobalIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (cryptoKey, field, value) => {
        setCryptoSettings(prev => ({
            ...prev,
            [cryptoKey]: {
                ...prev[cryptoKey],
                [field]: value,
                error: null, // Clear error/success on input change
                success: null,
            }
        }));
    };

    const handleSaveCryptoSettings = async (e, cryptoKey) => {
        e.preventDefault();
        setCryptoSettings(prev => ({
            ...prev,
            [cryptoKey]: { ...prev[cryptoKey], isSaving: true, error: null, success: null }
        }));

        try {
            let currentFullSettings = { id: ADMIN_SETTINGS_ID };
            try {
                const fetchRes = await fetch(`${API_BASE_URL}/adminSettings/${ADMIN_SETTINGS_ID}`);
                if (fetchRes.ok) {
                    currentFullSettings = await fetchRes.json();
                } else if (fetchRes.status !== 404) {
                    throw new Error(`Failed to fetch current settings before saving. Status: ${fetchRes.status}`);
                }
            } catch (fetchErr) {
                console.warn("Could not fetch existing settings before save, proceeding with potentially new record:", fetchErr);
            }

            const updatedCryptoData = {
                blockchain: cryptoSettings[cryptoKey].blockchain,
                walletAddress: cryptoSettings[cryptoKey].walletAddress,
            };

            const payload = {
                ...currentFullSettings,
                id: ADMIN_SETTINGS_ID,
                [cryptoKey]: updatedCryptoData,
            };

            const response = await fetch(`${API_BASE_URL}/adminSettings/${ADMIN_SETTINGS_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
                throw new Error(errorData.message || `Failed to save ${CRYPTO_CONFIG[cryptoKey].name} settings. Status: ${response.status}`);
            }

            setCryptoSettings(prev => ({
                ...prev,
                [cryptoKey]: { ...prev[cryptoKey], isSaving: false, success: `${CRYPTO_CONFIG[cryptoKey].name} settings saved successfully!` }
            }));

        } catch (err) {
            setCryptoSettings(prev => ({
                ...prev,
                [cryptoKey]: { ...prev[cryptoKey], isSaving: false, error: err.message || `An unexpected error occurred.` }
            }));
            console.error(`Save ${cryptoKey} settings error:`, err);
        } finally {
            // isSaving is set individually above
        }
    };

    if (globalIsLoading) {
        return (
            <Container fluid className="mt-5 text-center">
                <Spinner animation="border" /> <p>Loading settings...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            <style>{`
                .crypto-card {
                    transition: box-shadow 0.3s ease-in-out;
                }
                .crypto-card:hover {
                    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2) !important;
                }
                .btn-custom-pill {
                    background-color: white;
                    color: var(--bs-primary); /* Make sure your primary color is accessible or replace with actual color */
                    border: 2px solid white; /* Start with white border to maintain size on hover */
                    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;
                }
                .btn-custom-pill:hover, .btn-custom-pill:focus {
                    background-color: transparent;
                    color: white;
                    border: 2px solid white;
                }
                .form-control-plaintext.text-white::placeholder { /* For better placeholder visibility on primary bg if needed */
                    color: rgba(255, 255, 255, 0.7);
                }
                .form-control { /* Ensure inputs are not transparent by default */
                    background-color: rgba(255, 255, 255, 0.9);
                    color: #212529; /* Dark text for readability in inputs */
                }
                .form-control::placeholder {
                    color: #6c757d; /* Standard placeholder color */
                }
                .form-label.small {
                    font-weight: 500; /* Make labels a bit bolder */
                }
            `}</style>
            <h4 className="mb-4 fw-bold">Cryptocurrency Wallet Settings</h4>
            {globalError && <Alert variant="danger" onClose={() => setGlobalError(null)} dismissible>{globalError}</Alert>}
            <Row xs={1} md={1} lg={3} className="g-4">
                {Object.keys(CRYPTO_CONFIG).map(cryptoKey => (
                    <Col key={cryptoKey}>
                        <Card className="bg-primary text-white rounded-4 crypto-card h-100">
                            <Card.Body className="d-flex flex-column p-4">
                                <div className="d-flex justify-content-end">
                                    <h5 className="mb-3 fw-semibold">{CRYPTO_CONFIG[cryptoKey].name}</h5>
                                </div>

                                <Form onSubmit={(e) => handleSaveCryptoSettings(e, cryptoKey)}>
                                    {cryptoSettings[cryptoKey]?.error && <Alert variant="danger" size="sm" className="mb-2 py-1 small" onClose={() => handleInputChange(cryptoKey, 'error', null)} dismissible>{cryptoSettings[cryptoKey].error}</Alert>}
                                    {cryptoSettings[cryptoKey]?.success && <Alert variant="success" size="sm" className="mb-2 py-1 small" onClose={() => handleInputChange(cryptoKey, 'success', null)} dismissible>{cryptoSettings[cryptoKey].success}</Alert>}

                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor={`${cryptoKey}-blockchain`} className="small">Blockchain</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id={`${cryptoKey}-blockchain`}
                                            className="rounded-1 form-control-sm"
                                            value={cryptoSettings[cryptoKey]?.blockchain || ''}
                                            onChange={(e) => handleInputChange(cryptoKey, 'blockchain', e.target.value)}
                                            placeholder={`e.g., ${CRYPTO_CONFIG[cryptoKey].defaultBlockchain}`}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor={`${cryptoKey}-walletAddress`} className="small">Wallet Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            id={`${cryptoKey}-walletAddress`}
                                            className="rounded-1 form-control-sm"
                                            value={cryptoSettings[cryptoKey]?.walletAddress || ''}
                                            onChange={(e) => handleInputChange(cryptoKey, 'walletAddress', e.target.value)}
                                            placeholder="Enter wallet address"
                                        />
                                    </Form.Group>

                                    <div className="mt-auto pt-2">
                                        <Button
                                            type="submit"
                                            className="btn-custom-pill rounded-pill w-100 fw-medium"
                                            disabled={cryptoSettings[cryptoKey]?.isSaving}
                                        >
                                            {cryptoSettings[cryptoKey]?.isSaving ? (
                                                <><Spinner as="span" animation="border" size="sm" /> Saving...</>
                                            ) : (
                                                `Save ${CRYPTO_CONFIG[cryptoKey].name} Settings`
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default AdminSettings;
