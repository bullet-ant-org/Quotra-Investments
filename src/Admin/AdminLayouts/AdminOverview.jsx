import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  PeopleFill,
  PersonCheckFill,
  PiggyBankFill,
  HourglassSplit,
  BoxArrowUpRight,
  PlusCircleFill,
  GearFill,
} from 'react-bootstrap-icons';
import { API_BASE_URL } from '../../utils/api'; // Import API_BASE_URL
import { Spinner, Alert, Card, Table, Badge, Button, ButtonGroup } from 'react-bootstrap'; // Import additional components

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  try {
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (error) {
    return 'Invalid Date';
  }
};

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const AdminOverview = () => {
  const { addToast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDepositsAmount: 0,
    pendingTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegistrationData, setUserRegistrationData] = useState(null);
  const [userActivityData, setUserActivityData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userMap, setUserMap] = useState(new Map());

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
        const [usersRes, activitiesRes, depositRequestsRes, withdrawalRequestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/all`, { headers }),
          fetch(`${API_BASE_URL}/activities/all`, { headers }),
          fetch(`${API_BASE_URL}/depositRequests/all`, { headers }),
          fetch(`${API_BASE_URL}/withdrawalRequests/all`, { headers }),
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

        // Create a map for quick user lookup
        const newUserMap = new Map(usersData.map(user => [user.id, user.username]));
        setUserMap(newUserMap);

        // --- Chart Data Calculation ---

        // 1. Bar Chart: Monthly deposit amounts
        const monthlyDepositTotals = Array(12).fill(0);
        const currentYear = new Date().getFullYear();

        if (Array.isArray(depositRequestsData)) {
          depositRequestsData.forEach(deposit => {
            // We only care about confirmed deposits with a valid date and amount.
            // Assuming the deposit object has a 'date' field.
            if (deposit.status === 'confirmed' && deposit.date && deposit.amount) {
              const depositDate = new Date(deposit.date);
              if (depositDate.getFullYear() === currentYear) {
                const month = depositDate.getMonth(); // 0-11
                monthlyDepositTotals[month] += parseFloat(deposit.amount);
              }
            }
          });
        }

        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setUserRegistrationData({
          labels: monthLabels,
          datasets: [{ label: `Confirmed Deposits in ${currentYear} (USD)`, data: monthlyDepositTotals, backgroundColor: 'rgba(88, 122, 246, 0.7)', borderColor: 'rgba(88, 122, 246, 1)', borderWidth: 1 }],
        });

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

        // 2. Pie Chart: Active vs. Inactive Users
        const inactiveUsers = totalUsers - activeUsers;
        setUserActivityData({
          labels: ['Active Users', 'Inactive Users'],
          datasets: [{
            label: '# of Users',
            data: [activeUsers, inactiveUsers],
            backgroundColor: ['rgba(21, 202, 32, 0.7)', 'rgba(253, 53, 80, 0.7)'],
            borderColor: ['rgba(21, 202, 32, 1)', 'rgba(253, 53, 80, 1)'],
            borderWidth: 1,
          }],
        });

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

        // --- Table Data Calculation ---

        // 1. Recent Transactions (Deposits and Withdrawals)
        const deposits = depositRequestsData.map(d => ({ ...d, type: 'Deposit', date: d.date }));
        const withdrawals = withdrawalRequestsData.map(w => ({ ...w, type: 'Withdrawal', date: w.timestamp }));

        const combinedTransactions = [...deposits, ...withdrawals]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8); // Get latest 8 transactions

        setRecentTransactions(combinedTransactions);

        // 2. Recent User Registrations
        const sortedUsers = [...usersData]
          .sort((a, b) => {
            // Assuming users have a 'createdAt' or similar timestamp. Fallback to id.
            const dateA = a.createdAt ? new Date(a.createdAt) : 0;
            const dateB = b.createdAt ? new Date(b.createdAt) : 0;
            if (dateB > dateA) return 1;
            if (dateA > dateB) return -1;
            return 0;
          })
          .slice(0, 5); // Get latest 5 users
        setRecentUsers(sortedUsers);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
        addToast(err.message || 'Failed to load dashboard data.', 'error');
      } finally {
        setIsLoading(false);
        if (!error) {
          addToast('Dashboard data loaded successfully.', 'success');
        }
      }
    };

    fetchDashboardData();
  }, [addToast, error]);

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

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: { display: false },
    },
  };

  return (
    <div className="container mt-4">
      <h6 className='display-6 text-muted pt-2'>Hello Admin</h6>
      <p>check out your website overview</p>

      {/* Quick Actions */}
      <div className="mb-4">
        <ButtonGroup>
          <Button as={Link} to="/admin/create-deposit" variant="primary">
            <PlusCircleFill className="me-2" />Create Deposit
          </Button>
          <Button as={Link} to="/admin/users" variant="outline-secondary">
            <PeopleFill className="me-2" />Manage Users
          </Button>
          <Button as={Link} to="/admin/settings" variant="outline-secondary">
            <GearFill className="me-2" />Site Settings
          </Button>
        </ButtonGroup>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
        {/* Total Users */}
        <div className="col">
          <div className="card cardee border-start border-0 border-3 border-primary card-background-icon-wrapper">
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
          <div className="card cardee border-start border-0 border-3 border-success card-background-icon-wrapper">
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
          <div className="card cardee border-start border-0 border-3 border-warning card-background-icon-wrapper">
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
          <div className="card cardee border-start border-0 border-3 border-danger card-background-icon-wrapper">
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

      {/* Charts Section */}
      <div className="row mt-4 g-3">
        {/* Bar Chart for Monthly Deposits */}
        {userRegistrationData && (
          <div className="col-xl-8">
            <div className="card cardee border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0">
                <h6 className="mb-0 text-secondary">Monthly Deposit Volume</h6>
              </div>
              <div className="card-body">
                <Bar options={barChartOptions} data={userRegistrationData} />
              </div>
            </div>
          </div>
        )}

        {/* Pie Chart for User Activity */}
        {userActivityData && (
          <div className="col-xl-4">
            <div className="card cardee border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0">
                <h6 className="mb-0 text-secondary">User Activity Status</h6>
              </div>
              <div className="card-body d-flex justify-content-center align-items-center">
                <div style={{maxWidth: '300px', width: '100%'}}><Pie options={pieChartOptions} data={userActivityData} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Tables Section */}
      <div className="row mt-4 g-3">
        {/* Recent Transactions Table */}
        <div className="col-lg-8">
          <Card className="cardee border-0 h-100">
            <Card.Header className="bg-transparent border-bottom-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-secondary">Recent Transactions</h6>
              <Link to="/admin/admintransactions" className="btn btn-sm btn-outline-primary">
                View All <BoxArrowUpRight />
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, index) => (
                    <tr key={`tx-${index}`}>
                      <td>{userMap.get(tx.userId) || 'Unknown User'}</td>
                      <td>{tx.type}</td>
                      <td>{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                      <td>
                        <Badge pill bg={
                          tx.status === 'confirmed' ? 'success' :
                          tx.status === 'pending' ? 'warning' : 'danger'
                        } className="text-capitalize">{tx.status}</Badge>
                      </td>
                      <td>{formatDate(tx.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        {/* Recent Registrations Table */}
        <div className="col-lg-4">
          <Card className="cardee border-0 h-100">
            <Card.Header className="bg-transparent border-bottom-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-secondary">New Users</h6>
              <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                View All <BoxArrowUpRight />
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
        