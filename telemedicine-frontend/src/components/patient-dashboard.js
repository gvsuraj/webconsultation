import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientDashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchProfileImage(storedUser.id);
    }
  }, []);

  const fetchProfileImage = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${userId}`);
      if (res.data && res.data.profileImage) {
        setProfileImage(res.data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching profile image", err);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user.id) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      try {
        await axios.post(`http://localhost:8080/api/users/upload-image/${user.id}`, {
          profileImage: base64Image
        });
        setProfileImage(base64Image);
        alert("Profile image uploaded successfully");
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload profile image");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = async () => {
    if (!user.id) return;

    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      try {
        await axios.put(`http://localhost:8080/api/users/remove-image/${user.id}`);
        setProfileImage('');
        alert("Profile image removed");
      } catch (error) {
        console.error("Remove failed", error);
        alert("Failed to remove profile image");
      }
    }
  };

  return (
    <div className="patient-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="patient-sidebar-header">
          <span role="img" aria-label="hospital">🏥</span>
          <h2>Patient Dashboard</h2>
        </div>

        <div className="patient-profile">
          <img
            src={profileImage || '/default-profile.png'}
            alt="Profile"
          />
          <p><strong>{user.name}</strong></p>
          <p>{user.email}</p>

          <div className="profile-actions">
            <input
              type="file"
              accept="image/*"
              id="upload-profile"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="upload-profile" className="upload-button">Upload Photo</label>

            {profileImage && (
              <button onClick={removeProfileImage} className="remove-button">
                Remove Photo
              </button>
            )}
          </div>
        </div>

        <nav className="patient-sidebar-nav">
          <button onClick={() => navigate('/patient/appointments')}>📅 Appointments</button>
          <button onClick={() => navigate('/patient/records')}>📁 Health Records</button>
          <button onClick={() => navigate('/patient/prescriptions')}>💊 Prescriptions</button>
          <button onClick={() => navigate('/')}>🚪 Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="patient-dashboard-main">
        <div className="patient-dashboard-welcome">
          <h2>👋 Hello, {user.name}</h2>
          <p>Manage your appointments, health records, and more from one place.</p>
        </div>

        <div className="patient-dashboard-cards">
          <div className="patient-dashboard-card" onClick={() => navigate('/patient/appointments')}>
            <h3>📅 Appointments</h3>
            <p>View and manage your bookings</p>
          </div>

          <div className="patient-dashboard-card" onClick={() => navigate('/patient/records')}>
            <h3>📁 Health Records</h3>
            <p>Access and upload documents</p>
          </div>

          <div className="patient-dashboard-card" onClick={() => navigate('/patient/prescriptions')}>
            <h3>💊 Prescriptions</h3>
            <p>See your medication history</p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
