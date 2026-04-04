package com.charitycore.donation.model.dto;

public class AnalyticsDTOs {

    public static class MonthlySummary {
        private String month;
        private Double total;

        public MonthlySummary(String month, Double total) {
            this.month = month;
            this.total = total;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public Double getTotal() { return total; }
        public void setTotal(Double total) { this.total = total; }
    }

    public static class TopDonor {
        private String donorName;
        private Double totalAmount;
        private Long donationCount;

        public TopDonor(String donorName, Double totalAmount, Long donationCount) {
            this.donorName = donorName;
            this.totalAmount = totalAmount;
            this.donationCount = donationCount;
        }

        public String getDonorName() { return donorName; }
        public void setDonorName(String donorName) { this.donorName = donorName; }
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        public Long getDonationCount() { return donationCount; }
        public void setDonationCount(Long donationCount) { this.donationCount = donationCount; }
    }
}
