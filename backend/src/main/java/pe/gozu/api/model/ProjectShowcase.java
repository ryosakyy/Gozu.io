package pe.gozu.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ProjectShowcase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String industry;
    private String summary;
    private String imagePath;
    private String technologies;
    private boolean featured;

    public ProjectShowcase() {}
    public ProjectShowcase(String name, String industry, String summary, String imagePath, String technologies, boolean featured) {
        this.name=name; this.industry=industry; this.summary=summary; this.imagePath=imagePath; this.technologies=technologies; this.featured=featured;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getIndustry() { return industry; }
    public String getSummary() { return summary; }
    public String getImagePath() { return imagePath; }
    public String getTechnologies() { return technologies; }
    public boolean isFeatured() { return featured; }
}
