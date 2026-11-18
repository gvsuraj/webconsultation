package com.medical.webconsultation.controller;

import com.medical.webconsultation.model.Appointment;
import com.medical.webconsultation.model.Consultation;
import com.medical.webconsultation.model.User;
import com.medical.webconsultation.repository.AppointmentRepository;
import com.medical.webconsultation.repository.ConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = "http://localhost:3000")
public class ConsultationController {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ✅ 1. Get all consultations (Admin/debugging use)
    @GetMapping
    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    // ✅ 2. Create a consultation and link to an appointment
    @PostMapping("/create")
    public Consultation createConsultation(@RequestBody Consultation consultation) {
        int appointmentId = consultation.getAppointment().getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        if ((consultation.getNotes() == null || consultation.getNotes().trim().isEmpty()) &&
                (consultation.getPrescription() == null || consultation.getPrescription().trim().isEmpty())) {
            throw new RuntimeException("Consultation notes or prescription must be provided.");
        }

        consultation.setAppointment(appointment);
        return consultationRepository.save(consultation);
    }

    // ✅ 3. Search consultations by patient name (for doctor-side filtering)
    @GetMapping("/search")
    public List<Consultation> searchByPatientName(@RequestParam("name") String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Name parameter is required for searching.");
        }
        return consultationRepository.findByAppointmentUserNameContainingIgnoreCase(name);
    }

    // ✅ 4. Get consultations for a specific patient (for PatientPrescriptions)
    @GetMapping("/patient/{patientId}")
    public List<Consultation> getConsultationsByPatientId(@PathVariable int patientId) {
        return consultationRepository.findByAppointmentUserId(patientId);
    }

    // ✅ 5. Get distinct patients for a given doctor (used in doctor-side chat list)
    @GetMapping("/doctor/{doctorId}/patients")
    public List<User> getPatientsByDoctor(@PathVariable int doctorId) {
        return consultationRepository.findDistinctPatientsByDoctorId(doctorId);
    }
}
