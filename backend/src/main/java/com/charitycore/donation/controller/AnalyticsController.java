package com.charitycore.donation.controller;

import com.charitycore.donation.model.dto.AnalyticsDTOs.MonthlySummary;
import com.charitycore.donation.model.dto.AnalyticsDTOs.TopDonor;
import com.charitycore.donation.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Double>> getTotalDonation() {
        Map<String, Double> response = new HashMap<>();
        response.put("totalAmount", analyticsService.getTotalDonationAmount());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlySummary>> getMonthlySummary() {
        return ResponseEntity.ok(analyticsService.getMonthlySummary());
    }

    @GetMapping("/top-donors")
    public ResponseEntity<List<TopDonor>> getTopDonors(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsService.getTopDonors(limit));
    }
}
