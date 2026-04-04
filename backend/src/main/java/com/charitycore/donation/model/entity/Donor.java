package com.charitycore.donation.model.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "donors")
public class Donor {

    public Donor() {}

    public Donor(Long id, String name, String email, String phone, List<Donation> donations) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.donations = donations;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @OneToMany(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Donation> donations;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public List<Donation> getDonations() { return donations; }
    public void setDonations(List<Donation> donations) { this.donations = donations; }

    public static DonorBuilder builder() {
        return new DonorBuilder();
    }

    public static class DonorBuilder {
        private String name;
        private String email;
        private String phone;

        public DonorBuilder name(String name) { this.name = name; return this; }
        public DonorBuilder email(String email) { this.email = email; return this; }
        public DonorBuilder phone(String phone) { this.phone = phone; return this; }

        public Donor build() {
            Donor donor = new Donor();
            donor.setName(name);
            donor.setEmail(email);
            donor.setPhone(phone);
            return donor;
        }
    }
}
