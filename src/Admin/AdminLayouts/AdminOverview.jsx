import React, { useState, useEffect } from 'react';
import {
  CartFill,
  CurrencyDollar,
  BarChartLineFill,
  PeopleFill,
} from 'react-bootstrap-icons';
import { API_BASE_URL } from '../../utils/api'; // Import API_BASE_URL
import { Spinner, Alert } from 'react-bootstrap'; // Import Spinner and Alert

const AdminOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    bounceRate: 0,
    totalCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all users from JSON server
        const usersResponse = await fetch(`${API_BASE_URL}/users`);

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch user data. Status: ${usersResponse.status}`);
        }
        const users = await usersResponse.json();

        // Calculate dashboard metrics
        const totalCustomers = users.length;

        const orders = users.filter(
          (user) => user.investmentStatus && user.investmentStatus !== 'none' && user.investmentStatus !== 'rejected'
        );
        const totalOrders = orders.length;

        const totalRevenue = users.reduce((sum, user) => {
          if ((user.investmentStatus === 'completed' || user.investmentStatus === 'active') && user.currentInvestmentAmount) {
            return sum + parseFloat(user.currentInvestmentAmount);
          }
          return sum;
        }, 0);
        
        // Mock bounce rate or a very simple calculation if possible.
        // For now, let's set a static placeholder.
        const bounceRate = 15; // Example: Static 15%

        setDashboardData({
          totalOrders,
          totalRevenue,
          bounceRate,
          totalCustomers,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container text-center mt-5"> {/* Consistent styling */}
        <Spinner animation="border" text="primary" role="status"> {/* Use Spinner component */}
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
        {/* Total Orders */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Total Investments</p>
                  <h4 className="my-1 text-info">{dashboardData.totalOrders}</h4>
                  {/* <p className="mb-0 font-13">+2.5% from last week</p> */}
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-scooter text-white ms-auto">
                  <CartFill size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-danger">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Total Revenue</p>
                  <h4 className="my-1 text-danger">${dashboardData.totalRevenue.toLocaleString()}</h4>
                  {/* <p className="mb-0 font-13">+5.4% from last week</p> */}
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-bloody text-white ms-auto">
                  <CurrencyDollar size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bounce Rate (Mocked/Static) */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Bounce Rate</p>
                  <h4 className="my-1 text-success">{dashboardData.bounceRate}%</h4> {/* Static or simply calculated */}
                  {/* <p className="mb-0 font-13">-4.5% from last week</p> */}
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-ohhappiness text-white ms-auto">
                  <BarChartLineFill size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="col">
          <div className="card cardee radius-10 border-start border-0 border-3 border-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Total Customers</p>
                  <h4 className="my-1 text-warning">{dashboardData.totalCustomers}</h4>
                  {/* <p className="mb-0 font-13">+8.4% from last week</p> */}
                </div>
                <div className="widgets-icons-2 rounded-circle bg-gradient-blooker text-white ms-auto">
                  <PeopleFill size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;