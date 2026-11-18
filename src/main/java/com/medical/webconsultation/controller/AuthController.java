package com.medical.webconsultation.controller;

import com.medical.webconsultation.model.User;
import com.medical.webconsultation.model.Role;
import com.medical.webconsultation.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")  // Change if frontend URL differs
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // 🔐 Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("📨 Registration attempt for: " + user.getEmail());

        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        // ✅ Default role if missing
        if (user.getRole() == null) {
            user.setRole(Role.patient); // or Role.doctor if registration is role-specific
        }

        try {
            userRepository.save(user);
            return ResponseEntity.ok("Registration successful!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    // 🔓 Login user
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        if (user == null || user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Email and password are required."));
        }

        User found = userRepository.findByEmail(user.getEmail());

        if (found == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Invalid credentials"));
        }

        if (!found.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Invalid credentials"));
        }

        // ✅ Avoid sending password back to frontend
        found.setPassword(null);
        return ResponseEntity.ok(found);
    }
}
