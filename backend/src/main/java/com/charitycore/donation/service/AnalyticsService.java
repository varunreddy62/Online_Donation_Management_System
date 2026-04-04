package com.charitycore.donation.service;

import com.charitycore.donation.model.dto.AnalyticsDTOs.MonthlySummary;
import com.charitycore.donation.model.dto.AnalyticsDTOs.TopDonor;
import com.charitycore.donation.repository.DonationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final DonationRepository donationRepository;

    public AnalyticsService(DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    @Transactional(readOnly = true)
    public Double getTotalDonationAmount() {
        Double total = donationRepository.getTotalDonationAmount();
        return total != null ? total : 0.0;
    }

    @Transactional(readOnly = true)
    public List<MonthlySummary> getMonthlySummary() {
        List<Object[]> results = donationRepository.getMonthlyDonationSummary();
        return results.stream()
                .map(row -> new MonthlySummary(
                        (String) row[0],
                        (Double) row[1]
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopDonor> getTopDonors(int limit) {
        List<Object[]> results = donationRepository.getTopDonors(PageRequest.of(0, limit));
        return results.stream()
                .map(row -> new TopDonor(
                        (String) row[0],
                        (Double) row[1],
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
