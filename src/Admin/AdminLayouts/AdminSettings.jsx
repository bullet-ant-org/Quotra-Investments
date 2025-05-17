// src/Admin/AdminLayouts/AdminSettings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Spinner, Alert, Container } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL

const ADMIN_SETTINGS_ID = 'globalAdminSettings'; // Fixed ID for the single settings object

const AdminSettings = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Fetch the specific settings object by its fixed ID
            const response = await fetch(`${API_BASE_URL}/adminSettings/${ADMIN_SETTINGS_ID}`);

            if (response.ok) {
                const data = await response.json();
                setWalletAddress(data.checkoutWalletAddress || '');
            } else if (response.status === 404) {
                // Settings not found, which is fine, admin can create them by saving.
                // setError('Admin settings not yet configured. Save new settings to create them.');
                console.log('Admin settings not yet configured. Will be created on save.');
                setWalletAddress(''); // Initialize as empty if not found
            } else {
                throw new Error(`Failed to fetch settings. Status: ${response.status}`);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred while fetching settings.');
            console.error('Fetch settings error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Use PUT to create or replace the settings object at the fixed ID
            const response = await fetch(`${API_BASE_URL}/adminSettings/${ADMIN_SETTINGS_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // No Authorization header for simple JSON server
                },
                // Ensure the body includes the id for JSON server to correctly PUT to the specific resource
                body: JSON.stringify({ id: ADMIN_SETTINGS_ID, checkoutWalletAddress: walletAddress }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
                throw new Error(errorData.message || `Failed to save settings. Status: ${response.status}`);
            }

            setSuccess('Wallet address saved successfully!');
            // Optionally re-fetch or update state directly if needed, but PUT should replace it.
            // const savedData = await response.json();
            // setWalletAddress(savedData.checkoutWalletAddress || '');
        } catch (err) {
            setError(err.message || 'An unexpected error occurred while saving settings.');
            console.error('Save settings error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Container fluid className="mt-5 text-center">
                <Spinner animation="border" /> <p>Loading settings...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4"> {/* Changed to mt-4 for consistency */}
            <Card> {/* Removed mt-2 as Container has mt-4 */}
                <Card.Header as="h5">Admin Settings - Checkout Wallet</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
                    <Form onSubmit={handleSaveSettings}>
                        <Form.Group className="mb-3" controlId="walletAddress">
                            <Form.Label>Checkout Wallet Address</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter the wallet address to be displayed on the user checkout page"
                                value={walletAddress}
                                onChange={(e) => {
                                    setWalletAddress(e.target.value);
                                    if (error) setError(null); // Clear error on input change
                                    if (success) setSuccess(null); // Clear success on input change
                                }}
                            />
                            <Form.Text className="text-muted">
                                This wallet address will be shown to users when they proceed to checkout for an investment.
                            </Form.Text>
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                                    Saving...
                                </>
                            ) : (
                                'Save Wallet Address'
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminSettings;
