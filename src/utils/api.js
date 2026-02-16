// Helper to handle 401 Unauthorized globally
export function handle401(response) {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
    return true;
  }
  return false;
}
// filepath: src/utils/api.js

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const CLOUDINARY_CLOUD_NAME = 'djzi0scln'; // Replace with your actual cloud name
export const CLOUDINARY_UPLOAD_PRESET = 'user_profile_pictures'; // Replace with your actual upload preset

// EmailJS Configuration
// Replace with your actual EmailJS Service ID, Template ID, and Public Key
export const EMAILJS_SERVICE_ID = 'gmail_service'; // e.g., 'service_aygas31'
export const EMAILJS_OTP_TEMPLATE_ID = 'otp_service'; // e.g., 'template_871po4g'
export const EMAILJS_TRANSACTION_TEMPLATE_ID = 'transaction_template'; // If you have other templates
export const EMAILJS_PUBLIC_KEY = 'FcvI1xoYSIZW2Lmbc'; // e.g., 'O5SkCuTrFuMY5u50'


// New EmailJS Account Config
export const EMAILJS_NEW_SERVICE_ID = 'Email-id'; // e.g., 'service_xxxxxxx'
export const EMAILJS_NEW_TEMPLATE_ID = 'Signup_id'; // e.g., 'template_xxxxxxx'
export const EMAILJS_NEW_PUBLIC_KEY = '8WXlKt6LWE6G-AgTR'; // e.g., 'xxxxxxx'


export const GNEWS_API_KEY = 'd4f4bcd296d38c27184d6cee59ccd79c';