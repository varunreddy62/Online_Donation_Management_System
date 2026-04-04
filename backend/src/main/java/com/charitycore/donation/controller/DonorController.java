package com.charitycore.donation.controller;

import com.charitycore.donation.model.dto.DonorReqDTO;
import com.charitycore.donation.model.dto.DonorResDTO;
import com.charitycore.donation.service.DonorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    @PostMapping
    public ResponseEntity<DonorResDTO> createDonor(@Valid @RequestBody DonorReqDTO request) {
        return new ResponseEntity<>(donorService.createDonor(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DonorResDTO>> getAllDonors() {
        return ResponseEntity.ok(donorService.getAllDonors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonorResDTO> getDonorById(@PathVariable Long id) {
        return ResponseEntity.ok(donorService.getDonorById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonorResDTO> updateDonor(@PathVariable Long id, @Valid @RequestBody DonorReqDTO request) {
        return ResponseEntity.ok(donorService.updateDonor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonor(@PathVariable Long id) {
        donorService.deleteDonor(id);
        return ResponseEntity.noContent().build();
    }
}
