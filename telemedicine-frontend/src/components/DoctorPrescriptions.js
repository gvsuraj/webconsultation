import React, { useEffect, useState } from 'react';
import './DoctorPrescriptions.css';

function DoctorPrescriptions() {
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError("Doctor not logged in");
        setLoading(false);
        return;
      }

      try {
        // Step 1: Get doctor profile using user ID
        const docRes = await fetch(`http://localhost:8080/api/doctors/user/${user.id}`);
        if (!docRes.ok) throw new Error("Doctor profile fetch failed");

        const doctor = await docRes.json();
        const doctorId = doctor.id;

        // Step 2: Get approved appointments for that doctor
        const apptRes = await fetch(`http://localhost:8080/api/appointments/doctor/${doctorId}`);
        if (!apptRes.ok) throw new Error("Appointments fetch failed");

        const apptData = await apptRes.json();
        setAppointments(apptData.filter(a => a.status.toLowerCase() === 'approved'));

        // Step 3: Fetch consultations
        const consultRes = await fetch('http://localhost:8080/api/consultations');
        if (!consultRes.ok) throw new Error("Consultations fetch failed");

        const consultData = await consultRes.json();
        setConsultations(consultData);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appointmentId || !notes || !prescription) {
      alert('Please fill all fields');
      return;
    }

    const consultationData = {
      appointment: { id: appointmentId },
      notes,
      prescription
    };

    fetch('http://localhost:8080/api/consultations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    })
      .then(res => res.json())
      .then((newConsultation) => {
        setConsultations(prev => [...prev, newConsultation]);
        setAppointmentId('');
        setNotes('');
        setPrescription('');
        setSearchName('');
        setFilteredConsultations([]);
      })
      .catch(() => alert("Failed to submit prescription"));
  };

  const handleSearch = () => {
    if (!searchName.trim()) {
      setFilteredConsultations([]);
      return;
    }

    fetch(`http://localhost:8080/api/consultations/search?name=${encodeURIComponent(searchName)}`)
      .then(res => res.json())
      .then(setFilteredConsultations)
      .catch(() => alert("Search failed"));
  };

  const displayedConsultations = searchName ? filteredConsultations : consultations;

  return (
    <div className="prescriptions-container">
      <h2>📝 E-Prescriptions</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <form className="prescription-form" onSubmit={handleSubmit}>
        <select value={appointmentId} onChange={e => setAppointmentId(e.target.value)} required>
          <option value="">Select Approved Appointment</option>
          {appointments.map((appt) => (
            <option key={appt.id} value={appt.id}>
              {`${appt.user.name} - ${appt.date} ${appt.time}`}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Consultation Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
        />
        <textarea
          placeholder="Prescription Details"
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          required
        />
        <button type="submit">Submit Prescription</button>
      </form>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by patient name"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </div>

      <div className="prescription-history">
        <h3>📖 Prescription History</h3>
        {displayedConsultations.length === 0 ? (
          <p>No prescriptions found.</p>
        ) : (
          <ul>
            {displayedConsultations.map((c) => (
              <li key={c.id} className="prescription-card">
                <strong>Patient:</strong> {c.appointment?.user?.name || "N/A"}<br />
                <strong>Date:</strong> {c.appointment?.date}<br />
                <strong>Time:</strong> {c.appointment?.time}<br />
                <strong>Notes:</strong> {c.notes}<br />
                <strong>Prescription:</strong> {c.prescription}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DoctorPrescriptions;
