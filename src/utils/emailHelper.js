import emailjs from 'emailjs-com';
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_TRANSACTION_TEMPLATE_ID // Import the constant
} from './api'; // Assuming you have these in your api.js

// Use the imported constant instead of a hardcoded string

// Simple HTML escaping function
const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

export const sendTransactionEmail = async (params) => {
  // params should be an object containing the data for the email template, e.g.:
  // {
  //   recipient_email: 'user@example.com',
  //   recipient_name: 'User Name',
  //   transaction_type: 'Deposit' or 'Withdrawal',
  //   transaction_amount: '$100.00', // Formatted currency string
  //   transaction_date: 'Jun 6, 2024, 5:00 PM', // Formatted date string
  //   transaction_ref: 'deposit_abc123' or 'withdrawal_xyz456', // Unique ID
  //   payment_method: 'Crypto' or 'N/A', // For deposits
  //   withdrawal_address: 'wallet_address_string' or 'N/A', // For withdrawals
  //   current_year: new Date().getFullYear() // For the footer copyright
  // }

  if (!params.recipient_email) {
    console.error('Email sending skipped: No recipient_email provided in params.');
    return;
  }

  const emailForSending = String(params.recipient_email).trim();

  if (!emailForSending) {
    console.error('Email sending skipped: Recipient email is empty after trimming.');
    return;
  }

  const templateParamsForEmailJS = {
    ...params, // Spread original params for other template variables
    // Escape critical string fields
    recipient_name: escapeHTML(params.recipient_name),
    transaction_type: escapeHTML(params.transaction_type),
    // transaction_amount is usually pre-formatted with currency symbols, typically safe
    // transaction_date is also usually pre-formatted, typically safe
    transaction_ref: escapeHTML(params.transaction_ref),

    // Ensure optional fields for #if blocks are always strings (empty if not provided)
    // This can be more robust for some templating engines than completely absent keys.
    payment_method: typeof escapeHTML(params.payment_method) === 'string' ? escapeHTML(params.payment_method) : '',
    withdrawal_address: typeof escapeHTML(params.withdrawal_address) === 'string' ? escapeHTML(params.withdrawal_address) : '',

    to_email: emailForSending, // Ensure 'to_email' key is used for the recipient
    current_year: new Date().getFullYear().toString(), // Ensure current_year is a string
  };

  // Remove undefined or null properties to avoid sending them to EmailJS, which might cause issues
  Object.keys(templateParamsForEmailJS).forEach(key => (templateParamsForEmailJS[key] === undefined || templateParamsForEmailJS[key] === null) ? delete templateParamsForEmailJS[key] : {});

  try {
    // Log the parameters being sent to EmailJS for debugging
    console.log("Sending email to EmailJS with parameters:", templateParamsForEmailJS);

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TRANSACTION_TEMPLATE_ID, // Use the imported constant here
      templateParamsForEmailJS,
      EMAILJS_PUBLIC_KEY
    );
    console.log(`Transaction email (${params.transaction_type || 'Unknown'}) sent successfully to ${params.recipient_email}`);
  } catch (emailError) {
    console.error(`Failed to send transaction email (${params.transaction_type || 'Unknown'}):`, emailError);
    // In a real application, you might want to log this server-side or notify the admin in the UI.
  }
  
};