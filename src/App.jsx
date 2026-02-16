// c:\Users\Bullet Ant\Desktop\CODING\quotra\src\App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'; // Import useNavigate
import Home from './layout/Home';
import Login from './layout/LoginPage';
import OtpVerificationPage from './layout/OtpVerificationPage'; // Import the new page
import { ToastProvider } from './context/ToastContext'; // Adjust path
// Import the Dashboard layout component
import DashboardLayout from './layout/Dashboard'; // Renamed for clarity, assuming this is your layout file

// Import the components to be rendered inside the Dashboard Outlet
// import Loans from './layout/Dashboard/Loans';
import Profile from './layout/Dashboard/Profile';
import Main from './layout/Dashboard/Main'; // This could be your default dashboard view
import Settings from './layout/Dashboard/Settings'; // Assuming you have this component
import PricingPage from './layout/Dashboard/PricingPage'; // Example if you have a dedicated pricing page
// import SupportPage from './layout/Dashboard/SupportPage'; // Example if you have a dedicated support page
import CustomInvestmentEntryPage from './layout/Dashboard/Checkout'; // This is the "Enter Amount" page
import FinalPaymentPage from './layout/Dashboard/CheckoutPage'; // This is the "Payment Details" page
// import LoansCheckout from './layout/Dashboard/loansCheckout'; // Added this import
import Withdrawal from './layout/Dashboard/Withdraw'; // Import the Withdrawal component
import Transactions from './layout/Dashboard/Transactions';
import Deposit from './layout/Dashboard/Deposit'; // Import the Deposit component
import Investments from './layout/Dashboard/Investments';
import Activity from './layout/Dashboard/Activity'; // Import the Activity component
import LoanTypesPage from './layout/Dashboard/LoanTypesPage'; // Import the new Loan Types page
import ServicesPage from './layout/ServicesPage';


// Import the Admin layout and page components
// Assuming AdminDashboard.jsx exports DashboardLayout as the admin layout
import AdminLayout from './Admin/AdminDashboard'; // This should be your Admin Layout
import AdminOverview from './Admin/AdminLayouts/AdminOverview'; // The new overview page
import AdminUsers from './Admin/AdminLayouts/Users';
import AdminOrders from './Admin/AdminLayouts/Orders';
import UserActionsPage from './Admin/AdminLayouts/UserActionsPage';
import AdminPricing from './Admin/AdminLayouts/PricingAdmin';
import AdminLoanTypes from './Admin/AdminLayouts/Loanstypes';
import LoanOrders from './Admin/AdminLayouts/LoanOrders';
import AdminSettingsPage from './Admin/AdminLayouts/AdminSettings'; // Import the new settings page
import WithdrawalRequests from "./Admin/AdminLayouts/Withdrawals";
import DepositRequests from "./Admin/AdminLayouts/Deposits"; // Import the new deposit requests page
import AdminTransactions from "./Admin/AdminLayouts/Transactions"; // Import the new transaction requests page
import NotFoundPage from './layout/NotFoundPage'; // Import the new 404 page
import AboutPage from './layout/AboutPage';


import { Spinner } from 'react-bootstrap'; // For loading state

const ProtectedAdminRoute = ({ children }) => {
  const storedUser = localStorage.getItem('loggedInUser');
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (e) { console.error("Error parsing user for admin check", e); }
  }

  // Robust admin role check (case/whitespace tolerant)
  if (user && typeof user.role === 'string' && user.role.trim().toLowerCase() === 'admin') {
    return children;
  }
  return <Navigate to="/login" replace />;
};

// ... rest of App.jsx

const App = () => {
  return (
    <ToastProvider>
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/pricing" element={<PricingPage />} /> */}
      <Route path="/verify-otp" element={<OtpVerificationPage />} /> {/* Add this route */}
        {/* <Route path="/support" element={<SupportPage />} /> */}

<Route path="/services" element={<ServicesPage />} />
<Route path="/about" element={<AboutPage />} />
        {/* --- Dashboard Parent Route --- */}
        {/* The DashboardLayout component will render the sidebar and the Outlet */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* --- Nested Child Routes for Dashboard --- */}
          {/* These components will render in DashboardLayout's <Outlet /> */}

          {/* 'index' route renders when the path is exactly "/dashboard" */}
          <Route index element={<Main />} />

          {/* Other child routes (paths are relative to "/dashboard") */}
          {/* <Route path="loans" element={<Loans />} /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="main" element={<Main />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="custom-investment" element={<CustomInvestmentEntryPage />} /> {/* New route for entering custom amount */}
          {/* <Route path="support" element={<SupportPage />} /> */}
          <Route path="checkout/:planId" element={<FinalPaymentPage />} /> {/* For specific plan checkout */}
          <Route path="checkout" element={<FinalPaymentPage />} /> {/* For general checkout (from custom amount or loan) */}
          <Route path="withdrawal" element={<Withdrawal />} /> {/* Added Withdrawal route */}
          {/* LoansCheckout.jsx itself is a page, it then navigates to /dashboard/checkout */}
          {/* <Route path="loans-checkout" element={<LoansCheckout />} /> */}
          <Route path="transactions" element={<Transactions />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="investments" element={<Investments />} />
          <Route path="activity" element={<Activity />} />
          <Route path="loan-types" element={<LoanTypesPage />} /> {/* New route for Loan Types */}

          {/* --- End of Nested Routes --- */}
        </Route>
        {/* --- End of Dashboard Parent Route --- */}

        {/* --- Admin Section Parent Route --- */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />

          <Route path="orders" element={<AdminOrders />} />
          <Route path="pricing-admin" element={<AdminPricing />} />
          <Route path="loan-types-admin" element={<AdminLoanTypes />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="create-deposit" element={<UserActionsPage />} />
<Route path="add-bonus" element={<UserActionsPage />} />
          <Route path="admintransactions" element={<AdminTransactions />} />
          <Route path="deposit-requests" element={<DepositRequests />} />
          <Route path="loanorders" element={<LoanOrders />} />
          {/* Withdrawal requests route */}
          <Route path="withdrawal-requests" element={<WithdrawalRequests />} />
        </Route>
        {/* --- End of Admin Section Parent Route --- */}

        {/* Optional: Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
};

export default App;
