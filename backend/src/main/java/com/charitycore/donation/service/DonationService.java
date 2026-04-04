package com.charitycore.donation.service;

import com.charitycore.donation.exception.ResourceNotFoundException;
import com.charitycore.donation.model.dto.DonationReqDTO;
import com.charitycore.donation.model.dto.DonationResDTO;
import com.charitycore.donation.model.entity.Donation;
import com.charitycore.donation.model.entity.Donor;
import com.charitycore.donation.repository.DonationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonorService donorService;

    public DonationService(DonationRepository donationRepository, DonorService donorService) {
        this.donationRepository = donationRepository;
        this.donorService = donorService;
    }

    @Transactional
    public DonationResDTO createDonation(DonationReqDTO request) {
        Donor donor = donorService.getDonorEntity(request.getDonorId());

        Donation donation = new Donation();
        donation.setAmount(request.getAmount());
        donation.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        donation.setPaymentType(request.getPaymentType());
        donation.setDonor(donor);

        donation = donationRepository.save(donation);
        return mapToDTO(donation);
    }

    @Transactional
    public DonationResDTO updateDonation(Long id, DonationReqDTO request) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        Donor donor = donorService.getDonorEntity(request.getDonorId());

        donation.setAmount(request.getAmount());
        donation.setDate(request.getDate() != null ? request.getDate() : donation.getDate());
        donation.setPaymentType(request.getPaymentType());
        donation.setDonor(donor);

        donation = donationRepository.save(donation);
        return mapToDTO(donation);
    }

    @Transactional(readOnly = true)
    public Page<DonationResDTO> getDonations(Long donorId, Double minAmount, Double maxAmount, Pageable pageable) {
        Page<Donation> donationsPage;

        if (donorId != null && minAmount != null && maxAmount != null) {
            donationsPage = donationRepository.findByDonorIdAndAmountBetween(donorId, minAmount, maxAmount, pageable);
        } else if (donorId != null) {
            donationsPage = donationRepository.findByDonorId(donorId, pageable);
        } else if (minAmount != null && maxAmount != null) {
            donationsPage = donationRepository.findByAmountBetween(minAmount, maxAmount, pageable);
        } else {
            donationsPage = donationRepository.findAll(pageable);
        }

        return donationsPage.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public DonationResDTO getDonationById(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        return mapToDTO(donation);
    }

    @Transactional
    public void deleteDonation(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        donationRepository.delete(donation);
    }

    private DonationResDTO mapToDTO(Donation donation) {
        DonationResDTO dto = new DonationResDTO();
        dto.setId(donation.getId());
        dto.setAmount(donation.getAmount());
        dto.setDate(donation.getDate());
        dto.setPaymentType(donation.getPaymentType());
        if (donation.getDonor() != null) {
            dto.setDonorId(donation.getDonor().getId());
            dto.setDonorName(donation.getDonor().getName());
        }
        return dto;
    }
}
