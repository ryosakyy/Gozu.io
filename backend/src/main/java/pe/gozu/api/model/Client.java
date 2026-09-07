package pe.gozu.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Client {
    public enum Status { TRIAL, ACTIVE, PAUSED, CANCELLED }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String businessName;
    @NotBlank private String contactName;
    private String phone;
    private String planName;
    @PositiveOrZero private BigDecimal monthlyFee;
    @Enumerated(EnumType.STRING) private Status status = Status.TRIAL;
    private LocalDate createdAt = LocalDate.now();

    public Long getId() { return id; }
    public String getBusinessName() { return businessName; } public void setBusinessName(String v) { businessName=v; }
    public String getContactName() { return contactName; } public void setContactName(String v) { contactName=v; }
    public String getPhone() { return phone; } public void setPhone(String v) { phone=v; }
    public String getPlanName() { return planName; } public void setPlanName(String v) { planName=v; }
    public BigDecimal getMonthlyFee() { return monthlyFee; } public void setMonthlyFee(BigDecimal v) { monthlyFee=v; }
    public Status getStatus() { return status; } public void setStatus(Status v) { status=v; }
    public LocalDate getCreatedAt() { return createdAt; }
}
