import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient',
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      setMessage(res.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data);
      } else {
        setMessage('Registration failed: server not reachable.');
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="PATIENT">Patient</option>
            <option value="doctor ">Doctor</option>
          </select>
          <button type="submit">Register</button>

          {/* ✅ Added Login link below */}
          <p className="login-link" style={{ marginTop: '1rem' }}>
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>

        {message && (
          <div style={{ marginTop: '1rem', color: 'crimson' }}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              <div>
                {message.error && <p><strong>Error:</strong> {message.error}</p>}
                {message.status && <p><strong>Status:</strong> {message.status}</p>}
                {message.path && <p><strong>Path:</strong> {message.path}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
