package com.medical.webconsultation.repository;

import com.medical.webconsultation.model.Doctor;
import com.medical.webconsultation.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    Doctor findByUser(User user);

    // ✅ New method to find doctor by user ID (for frontend check)
    Optional<Doctor> findByUserId(int userId);
}
