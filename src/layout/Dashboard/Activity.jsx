// src/layout/Dashboard/Activity.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
// import { API_BASE_URL } from '../../utils/api'; // Assuming you have this
import { API_BASE_URL } from '../../utils/api'; // Assuming you have this
const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real app, get userId from context or props
  const userId = localStorage.getItem('userId'); // Example: Get userId

  const fetchLoginActivities = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Cannot fetch login activities.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // --- Fetch login activities for the specific user ---
      // JSON Server allows filtering by query parameters like ?userId=...
      const response = await fetch(`${API_BASE_URL}/activities?userId=${userId}&activityType=login`); // Filter by userId and activityType
      if (!response.ok) {
        // Attempt to read error message from response body if available
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.message || `Failed to fetch login activities: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      // Assuming the backend returns an array of activity objects with a 'timestamp' field
      // Sort by timestamp (most recent first)
      setActivities(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
      console.error("Error fetching login activities:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLoginActivities();
  }, [fetchLoginActivities]);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading account activities...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Account Activities</h2>
      {activities.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {activities.map((activity) => (
            <Col key={activity.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div>
                    {/* Use activity.timestamp from backend */}
                    <small className="text-muted d-block">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy - HH:mm:ss')}
                    </small>
                    <Card.Text className="mb-1">
                      <strong>IP:</strong> {activity.details?.ipAddress || 'N/A'} {/* Use activity.details.ipAddress */}
                    </Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">No login activities found for this account.</Alert>
      )}
    </Container>
  );
};

export default Activity; // Make sure this line is present