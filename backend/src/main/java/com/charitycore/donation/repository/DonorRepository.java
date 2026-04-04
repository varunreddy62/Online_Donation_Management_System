package com.charitycore.donation.repository;

import com.charitycore.donation.model.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    boolean existsByEmail(String email);
}
