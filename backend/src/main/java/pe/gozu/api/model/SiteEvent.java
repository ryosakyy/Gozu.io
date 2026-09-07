package pe.gozu.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
public class SiteEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String type;
    private String label;
    private String path;
    private Instant occurredAt = Instant.now();

    public SiteEvent() {}
    public SiteEvent(String type, String label, String path) {
        this.type = type; this.label = label; this.path = path;
    }
    public Long getId() { return id; }
    public String getType() { return type; } public void setType(String value) { type=value; }
    public String getLabel() { return label; } public void setLabel(String value) { label=value; }
    public String getPath() { return path; } public void setPath(String value) { path=value; }
    public Instant getOccurredAt() { return occurredAt; } public void setOccurredAt(Instant value) { occurredAt=value; }
}
