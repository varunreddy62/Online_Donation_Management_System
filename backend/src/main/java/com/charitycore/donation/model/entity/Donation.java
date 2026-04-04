package com.charitycore.donation.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "donations")
public class Donation {

    public Donation() {}

    public Donation(Long id, Double amount, LocalDate date, String paymentType, Donor donor) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.paymentType = paymentType;
        this.donor = donor;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 30)
    private String paymentType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }
    public Donor getDonor() { return donor; }
    public void setDonor(Donor donor) { this.donor = donor; }

    public static DonationBuilder builder() {
        return new DonationBuilder();
    }

    public static class DonationBuilder {
        private Double amount;
        private LocalDate date;
        private String paymentType;
        private Donor donor;

        public DonationBuilder amount(Double amount) { this.amount = amount; return this; }
        public DonationBuilder date(LocalDate date) { this.date = date; return this; }
        public DonationBuilder paymentType(String paymentType) { this.paymentType = paymentType; return this; }
        public DonationBuilder donor(Donor donor) { this.donor = donor; return this; }

        public Donation build() {
            Donation donation = new Donation();
            donation.setAmount(amount);
            donation.setDate(date);
            donation.setPaymentType(paymentType);
            donation.setDonor(donor);
            return donation;
        }
    }
}
