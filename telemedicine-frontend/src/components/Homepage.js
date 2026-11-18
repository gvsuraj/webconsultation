import React from 'react';
import { Link } from 'react-router-dom'; // Add this for routing
import './Homepage.css';

import appointmentImg from '../images/appointment1.jpg';
import availabilityImg from '../images/availability.jpg';
import deliveryImg from '../images/delivery.jpg';

function Homepage() {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Telemedicine</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero">
        <h2>Skip the Clinic. Talk to a Doctor Online.</h2>
        <p>Consult top doctors 24x7, book appointments instantly, and get medicines delivered to your door.</p>
        <Link to="/register">
          <button>Get Started</button>
        </Link>
      </section>

      <section className="features">
        <div className="feature-box">
          <img src={appointmentImg} alt="Instant Appointments" />
          <h3>Instant Appointments</h3>
          <p>Find doctors and book within seconds.</p>
        </div>
        <div className="feature-box">
          <img src={availabilityImg} alt="24/7 Availability" />
          <h3>24/7 Availability</h3>
          <p>Consult with specialists anytime, anywhere.</p>
        </div>
        <div className="feature-box">
          <img src={deliveryImg} alt="Medicine Delivery" />
          <h3>Medicine Delivery</h3>
          <p>Get prescriptions and medicine delivered at home.</p>
        </div>
      </section>

      <footer>
        <p>&copy; 2025 Telemedicine. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Homepage;
