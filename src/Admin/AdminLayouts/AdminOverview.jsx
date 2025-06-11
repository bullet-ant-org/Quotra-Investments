import React, { useState, useEffect } from 'react';
import {
  PeopleFill,
  PersonCheckFill,
  PiggyBankFill,
  HourglassSplit,
} from 'react-bootstrap-icons';
import { API_BASE_URL } from '../../utils/api'; // Import API_BASE_URL
import { Spinner, Alert } from 'react-bootstrap'; // Import Spinner and Alert

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const AdminOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDepositsAmount: 0,
    pendingTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [usersRes, activitiesRes, depositRequestsRes, withdrawalRequestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/activities`),
          fetch(`${API_BASE_URL}/depositRequests`),
          fetch(`${API_BASE_URL}/withdrawalRequests`),
        ]);

        if (!usersRes.ok) throw new Error(`Failed to fetch users. Status: ${usersRes.status}`);
        if (!activitiesRes.ok) throw new Error(`Failed to fetch activities. Status: ${activitiesRes.status}`);
        if (!depositRequestsRes.ok) throw new Error(`Failed to fetch deposit requests. Status: ${depositRequestsRes.status}`);
        if (!withdrawalRequestsRes.ok) throw new Error(`Failed to fetch withdrawal requests. Status: ${withdrawalRequestsRes.status}`);

        const usersData = await usersRes.json();
        const activitiesData = await activitiesRes.json();
        const depositRequestsData = await depositRequestsRes.json();
        const withdrawalRequestsData = await withdrawalRequestsRes.json();

        // Calculate dashboard metrics
        const totalUsers = usersData.length;

        // Calculate Active Users (logged in within the last 30 days)
        const thirtyDaysAgoTimestamp = Date.now() - THIRTY_DAYS_IN_MS;
        const latestLoginTimestamps = {}; // Map to store latest login timestamp per user
        let activeUsers; // Declare activeUsers to store the calculated count

        if (Array.isArray(activitiesData)) {
          const loginActivities = activitiesData.filter(activity => activity.activityType === 'login');

          loginActivities.forEach(activity => {
            // Ensure activity has a userId and a valid timestamp
            if (activity.userId && activity.timestamp) {
              const activityTimestamp = new Date(activity.timestamp).getTime();
              // Update the latest timestamp for this user if the current activity is more recent
              if (!latestLoginTimestamps[activity.userId] || activityTimestamp > latestLoginTimestamps[activity.userId]) {
                latestLoginTimestamps[activity.userId] = activityTimestamp;
              }
            }
          });

          // Count users whose latest login is within the last 30 days
          let activeUsersCount = 0;
          for (const userId in latestLoginTimestamps) {
            if (latestLoginTimestamps[userId] >= thirtyDaysAgoTimestamp) {
              activeUsersCount++;
            }
          }
          activeUsers = activeUsersCount;

        } else {
           // Handle case where activitiesData is not an array
           activeUsers = 0;
        }

        // Calculate Total Deposits Amount (sum of confirmed deposits)
        const totalDepositsAmount = Array.isArray(depositRequestsData) ? depositRequestsData
          .filter(dep => dep.status === 'confirmed' && dep.amount)
          .reduce((sum, dep) => sum + parseFloat(dep.amount), 0) : 0;

        // Calculate Pending Transactions (pending deposits + pending withdrawals)
        const pendingDepositsCount = Array.isArray(depositRequestsData) ? depositRequestsData
          .filter(dep => dep.status === 'pending').length : 0;
        const pendingWithdrawalsCount = Array.isArray(withdrawalRequestsData) ? withdrawalRequestsData
          .filter(wd => wd.status === 'pending').length : 0;
        const pendingTransactions = pendingDepositsCount + pendingWithdrawalsCount;

        setDashboardData({
          totalUsers,
          activeUsers,
          totalDepositsAmount,
          pendingTransactions,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
        // Keep stale data if available, or clear it:
        // setDashboardData({
        //   totalUsers: 0, activeUsers: 0,
        //   totalDepositsAmount: 0, pendingTransactions: 0,
        // });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container text-center mt-5"> {/* Consistent styling */}
        <Spinner animation="border" variant="primary" role="status"> {/* Use Spinner component */}
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5"> {/* Consistent styling */}
        <Alert variant="danger">{error}</Alert> {/* Use Alert component */}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
        {/* Total Users */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-primary card-background-icon-wrapper">
            <div className="card-body card-content-wrapper">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Total Users</p>
                  <h4 className="my-1 text-primary">{dashboardData.totalUsers}</h4>
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-info text-white ms-auto">
                  <PeopleFill size={24} />
                </div>
              </div>
            </div>
            <PeopleFill className="animated-bg-icon" />
          </div>
        </div>

        {/* Active Users */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-success card-background-icon-wrapper">
            <div className="card-body card-content-wrapper">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Active Users</p>
                  <h4 className="my-1 text-success">{dashboardData.activeUsers}</h4>
                  <p className="mb-0 font-13 small text-muted">In last 30 days</p>
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-success text-white ms-auto">
                  <PersonCheckFill size={24} />
                </div>
              </div>
            </div>
            <PersonCheckFill className="animated-bg-icon" />
          </div>
        </div>

        {/* Total Deposits Amount */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-warning card-background-icon-wrapper">
            <div className="card-body card-content-wrapper">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Total Deposits</p>
                  <h4 className="my-1 text-warning">
                    {dashboardData.totalDepositsAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </h4>
                  <p className="mb-0 font-13 small text-muted">Confirmed</p>
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-warning text-white ms-auto">
                  <PiggyBankFill size={24} />
                </div>
              </div>
            </div>
            <PiggyBankFill className="animated-bg-icon" />
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-danger card-background-icon-wrapper">
            <div className="card-body card-content-wrapper">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Pending Transactions</p>
                  <h4 className="my-1 text-danger">{dashboardData.pendingTransactions}</h4>
                  <p className="mb-0 font-13 small text-muted">Deposits & Withdrawals</p>
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-danger text-white ms-auto">
                  <HourglassSplit size={24} />
                </div>
              </div>
            </div>
            <HourglassSplit className="animated-bg-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
        