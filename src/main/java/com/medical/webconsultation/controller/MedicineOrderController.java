package com.medical.webconsultation.controller;

import com.medical.webconsultation.model.MedicineOrder;
import com.medical.webconsultation.repository.MedicineOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicine-orders")
public class MedicineOrderController {

    @Autowired
    private MedicineOrderRepository medicineOrderRepository;

    @GetMapping
    public List<MedicineOrder> getAllOrders() {
        return medicineOrderRepository.findAll();
    }

    @PostMapping
    public MedicineOrder placeOrder(@RequestBody MedicineOrder order) {
        return medicineOrderRepository.save(order);
    }

    @PutMapping("/{id}/status")
    public MedicineOrder updateStatus(@PathVariable int id, @RequestBody String status) {
        MedicineOrder order = medicineOrderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(status);
            return medicineOrderRepository.save(order);
        }
        return null;
    }

    @GetMapping("/user/{userId}")
    public List<MedicineOrder> getOrdersByUser(@PathVariable int userId) {
        return medicineOrderRepository.findByUserId(userId);
    }
}
