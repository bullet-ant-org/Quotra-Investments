// c:\Users\Bullet Ant\Desktop\CODING\quotra\src\layout\Dashboard\SupportPage.jsx
import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
// Make sure you import your CSS file if you create one for this component
// import './SupportPage.css';

const SupportPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Just POST to /supportMessages (add this resource to your db.json)
      const res = await fetch(`${API_BASE_URL}/supportMessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSuccess('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="contact-area section-padding">
      <div className="container">
        <div className="section-title text-center">
          <h1>Get in Touch</h1>
          <p>have any complaints? or any issues you need ironed out? contact us now</p>
        </div>
        <div className="row">
          <div className="col-lg-7">
            <div className="contact">
              <form className="form" onSubmit={handleFormSubmit}>
                <div className="row">
                  {success && <div className="alert alert-success">{success}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="form-group col-md-6 mb-3">
                    <input
                      type="text"
                      name="name"
                      className="form-control custom-form-control"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group col-md-6 mb-3">
                    <input
                      type="email"
                      name="email"
                      className="form-control custom-form-control"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group col-md-12 mb-3">
                    <input
                      type="text"
                      name="subject"
                      className="form-control custom-form-control"
                      placeholder="Subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group col-md-12 mb-3">
                    <textarea
                      rows="6"
                      name="message"
                      className="form-control custom-form-control"
                      placeholder="Your Message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div className="col-md-12 text-center">
                    <button type="submit" id="submitButton" className="btn btn-contact-bg" title="Submit Your Message!" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="single_address">
              <i className="fa fa-map-marker"></i>
              <h4>Our Address</h4>
              <p>3481 Melrose Place, Beverly Hills</p>
            </div>
            <div className="single_address">
              <i className="fa fa-envelope"></i>
              <h4>Send your message</h4>
              <p>Info@example.com</p>
            </div>
            <div className="single_address">
              <i className="fa fa-phone"></i>
              <h4>Call us on</h4>
              <p>(+1) 517 397 7100</p>
            </div>
            <div className="single_address">
              <i className="fas fa-clock"></i>
              <h4>Work Time</h4>
              <p>Mon - Fri: 08.00 - 16.00. <br />Sat: 10.00 - 14.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
