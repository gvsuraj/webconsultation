
package com.medical.webconsultation.repository;

import com.medical.webconsultation.model.MedicineOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineOrderRepository extends JpaRepository<MedicineOrder, Integer> {
    List<MedicineOrder> findByUserId(int userId);
}

