package com.charitycore.donation.repository;

import com.charitycore.donation.model.entity.Donation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    
    Page<Donation> findByDonorId(Long donorId, Pageable pageable);
    
    Page<Donation> findByAmountBetween(Double minAmount, Double maxAmount, Pageable pageable);
    
    Page<Donation> findByDonorIdAndAmountBetween(Long donorId, Double minAmount, Double maxAmount, Pageable pageable);
    
    @Query("SELECT SUM(d.amount) FROM Donation d")
    Double getTotalDonationAmount();

    @Query("SELECT MONTHNAME(d.date) as month, SUM(d.amount) as total " +
           "FROM Donation d GROUP BY MONTH(d.date), MONTHNAME(d.date) ORDER BY MONTH(d.date)")
    List<Object[]> getMonthlyDonationSummary();

    @Query("SELECT d.donor.name, SUM(d.amount) as totalAmount, COUNT(d.id) as donationCount " +
           "FROM Donation d GROUP BY d.donor " +
           "ORDER BY totalAmount DESC")
    List<Object[]> getTopDonors(Pageable pageable);
}
