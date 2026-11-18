// All imports must be first
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import DoctorDashboard from './components/doctor-dashboard';
import PatientDashboard from './components/patient-dashboard';
import DoctorAppointments from './components/DoctorAppointments';
import DoctorPrescriptions from './components/DoctorPrescriptions';
import DoctorPatientRecords from './components/DoctorPatientRecords';
import LiveConsultation from './components/LiveConsultation';

import PatientAppointments from './components/PatientAppointments';
import PatientPrescriptions from './components/PatientPrescriptions';
import PatientHealthRecords from './components/PatientHealthRecords';
import PatientLiveConsultation from './components/PatientLiveConsultation';

import { Buffer } from 'buffer';
import process from 'process';

// Fix: Assign globals *after* all imports
window.Buffer = Buffer;
window.process = process;

// ProtectedRoute component
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  return user.role === allowedRole ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔓 Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🩺 Doctor Routes */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/records"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorPatientRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/consultations"
          element={
            <ProtectedRoute allowedRole="doctor">
              <LiveConsultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/consultations/:consultationId"
          element={
            <ProtectedRoute allowedRole="doctor">
              <LiveConsultation />
            </ProtectedRoute>
          }
        />

        {/* 👩‍⚕️ Patient Routes */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/records"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientHealthRecords />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/consultations"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientLiveConsultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/consultations/:consultationId"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientLiveConsultation />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
