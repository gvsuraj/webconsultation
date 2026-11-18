package com.medical.webconsultation.controller;

import com.medical.webconsultation.model.Appointment;
import com.medical.webconsultation.repository.AppointmentRepository;
import com.medical.webconsultation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    // Get appointments by doctor ID
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctorId(@PathVariable int doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // Get appointments by user (patient) ID
    @GetMapping("/user/{userId}")
    public List<Appointment> getAppointmentsByUserId(@PathVariable int userId) {
        return appointmentRepository.findByUserId(userId);
    }

    // Create a new appointment
    @PostMapping("/create")
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // Update appointment status (recommended endpoint)
    @PutMapping("/update-status/{id}")
    public ResponseEntity<Appointment> updateStatus(@PathVariable int id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(newStatus);
                    Appointment updated = appointmentRepository.save(appointment);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // [Optional/Legacy] Direct status update by string
    @PutMapping("/{id}/status")
    public Appointment updateAppointmentStatus(@PathVariable int id, @RequestBody String status) {
        return appointmentRepository.findById(id).map(appt -> {
            appt.setStatus(status);
            return appointmentRepository.save(appt);
        }).orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    // Delete appointment by ID
    @DeleteMapping("/{id}")
    public String deleteAppointment(@PathVariable int id) {
        return appointmentRepository.findById(id).map(appt -> {
            appointmentRepository.delete(appt);
            return "Appointment deleted";
        }).orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    // Get appointments by doctor ID and mode (Online/Offline)
    @GetMapping("/doctor/{doctorId}/mode/{mode}")
    public List<Appointment> getAppointmentsByDoctorIdAndMode(@PathVariable int doctorId, @PathVariable String mode) {
        return appointmentRepository.findByDoctorIdAndModeIgnoreCase(doctorId, mode);
    }

    // Get appointments by patient ID and mode
    @GetMapping("/user/{userId}/mode/{mode}")
    public List<Appointment> getAppointmentsByUserIdAndMode(@PathVariable int userId, @PathVariable String mode) {
        return appointmentRepository.findByUserIdAndModeIgnoreCase(userId, mode);
    }
}
