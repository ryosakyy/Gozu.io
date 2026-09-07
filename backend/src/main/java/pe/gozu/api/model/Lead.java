package pe.gozu.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
public class Lead {
    public enum Status { NEW, CONTACTED, PROPOSAL, WON, LOST }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String name;
    @NotBlank private String businessName;
    @NotBlank private String phone;
    private String city;
    private String industry;
    private String modules;
    private String usersRange;
    private String locationsRange;
    private String urgency;
    private String preferredPlan;
    private String currentSystem;
    private String volumeRange;
    private String budgetRange;
    private String details;
    @Enumerated(EnumType.STRING) private Status status = Status.NEW;
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getName() { return name; } public void setName(String v) { name=v; }
    public String getBusinessName() { return businessName; } public void setBusinessName(String v) { businessName=v; }
    public String getPhone() { return phone; } public void setPhone(String v) { phone=v; }
    public String getCity() { return city; } public void setCity(String v) { city=v; }
    public String getIndustry() { return industry; } public void setIndustry(String v) { industry=v; }
    public String getModules() { return modules; } public void setModules(String v) { modules=v; }
    public String getUsersRange() { return usersRange; } public void setUsersRange(String v) { usersRange=v; }
    public String getLocationsRange() { return locationsRange; } public void setLocationsRange(String v) { locationsRange=v; }
    public String getUrgency() { return urgency; } public void setUrgency(String v) { urgency=v; }
    public String getPreferredPlan() { return preferredPlan; } public void setPreferredPlan(String v) { preferredPlan=v; }
    public String getCurrentSystem() { return currentSystem; } public void setCurrentSystem(String v) { currentSystem=v; }
    public String getVolumeRange() { return volumeRange; } public void setVolumeRange(String v) { volumeRange=v; }
    public String getBudgetRange() { return budgetRange; } public void setBudgetRange(String v) { budgetRange=v; }
    public String getDetails() { return details; } public void setDetails(String v) { details=v; }
    public Status getStatus() { return status; } public void setStatus(Status v) { status=v; }
    public Instant getCreatedAt() { return createdAt; }
}
