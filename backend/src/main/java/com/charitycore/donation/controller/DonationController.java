package com.charitycore.donation.controller;

import com.charitycore.donation.model.dto.DonationReqDTO;
import com.charitycore.donation.model.dto.DonationResDTO;
import com.charitycore.donation.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    public ResponseEntity<DonationResDTO> createDonation(@Valid @RequestBody DonationReqDTO request) {
        return new ResponseEntity<>(donationService.createDonation(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationResDTO> updateDonation(@PathVariable Long id, @Valid @RequestBody DonationReqDTO request) {
        return ResponseEntity.ok(donationService.updateDonation(id, request));
    }

    @GetMapping
    public ResponseEntity<Page<DonationResDTO>> getDonations(
            @RequestParam(required = false) Long donorId,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @PageableDefault(size = 10, sort = "date") Pageable pageable) {
        return ResponseEntity.ok(donationService.getDonations(donorId, minAmount, maxAmount, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResDTO> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.noContent().build();
    }
}
