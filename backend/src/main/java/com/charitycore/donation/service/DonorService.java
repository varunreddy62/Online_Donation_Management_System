package com.charitycore.donation.service;

import com.charitycore.donation.exception.ResourceNotFoundException;
import com.charitycore.donation.model.dto.DonorReqDTO;
import com.charitycore.donation.model.dto.DonorResDTO;
import com.charitycore.donation.model.entity.Donor;
import com.charitycore.donation.repository.DonorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonorService {

    private final DonorRepository donorRepository;

    public DonorService(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    @Transactional
    public DonorResDTO createDonor(DonorReqDTO request) {
        Donor donor = new Donor();
        donor.setName(request.getName());
        donor.setEmail(request.getEmail());
        donor.setPhone(request.getPhone());

        donor = donorRepository.save(donor);
        return mapToDTO(donor);
    }

    @Transactional(readOnly = true)
    public List<DonorResDTO> getAllDonors() {
        return donorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DonorResDTO getDonorById(Long id) {
        return mapToDTO(getDonorEntity(id));
    }

    @Transactional
    public DonorResDTO updateDonor(Long id, DonorReqDTO request) {
        Donor donor = getDonorEntity(id);

        donor.setName(request.getName());
        donor.setEmail(request.getEmail());
        donor.setPhone(request.getPhone());

        return mapToDTO(donorRepository.save(donor));
    }

    @Transactional
    public void deleteDonor(Long id) {
        Donor donor = getDonorEntity(id);
        donorRepository.delete(donor);
    }

    public Donor getDonorEntity(Long id) {
        return donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found with id: " + id));
    }

    private DonorResDTO mapToDTO(Donor donor) {
        DonorResDTO dto = new DonorResDTO();
        dto.setId(donor.getId());
        dto.setName(donor.getName());
        dto.setEmail(donor.getEmail());
        dto.setPhone(donor.getPhone());

        double total = 0.0;
        if (donor.getDonations() != null) {
            total = donor.getDonations().stream().mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0.0).sum();
        }
        dto.setTotalDonated(total);

        return dto;
    }
}
