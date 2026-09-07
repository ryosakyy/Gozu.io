package pe.gozu.api.web;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.Set;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import pe.gozu.api.model.DemoView;
import pe.gozu.api.model.Lead;
import pe.gozu.api.model.ProjectShowcase;
import pe.gozu.api.model.ServiceOffering;
import pe.gozu.api.model.SiteEvent;
import pe.gozu.api.repository.LeadRepository;
import pe.gozu.api.repository.DemoViewRepository;
import pe.gozu.api.repository.ProjectShowcaseRepository;
import pe.gozu.api.repository.ServiceOfferingRepository;
import pe.gozu.api.repository.SiteEventRepository;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final ServiceOfferingRepository services;
    private final ProjectShowcaseRepository projects;
    private final LeadRepository leads;
    private final DemoViewRepository demoViews;
    private final SiteEventRepository siteEvents;
    private static final Set<String> DEMO_SLUGS = Set.of("inventario", "polleria", "barberia");

    public PublicController(ServiceOfferingRepository services, ProjectShowcaseRepository projects, LeadRepository leads, DemoViewRepository demoViews, SiteEventRepository siteEvents) {
        this.services=services; this.projects=projects; this.leads=leads; this.demoViews=demoViews; this.siteEvents=siteEvents;
    }
    @GetMapping("/services") public List<ServiceOffering> services() { return services.findByActiveTrueOrderById(); }
    @GetMapping("/projects") public List<ProjectShowcase> projects() { return projects.findAllByOrderByFeaturedDescIdAsc(); }
    @PostMapping("/leads") public ResponseEntity<Lead> createLead(@Valid @RequestBody Lead lead) {
        lead.setStatus(Lead.Status.NEW);
        Lead saved = leads.save(lead);
        return ResponseEntity.created(URI.create("/api/admin/leads/"+saved.getId())).body(saved);
    }

    @PostMapping("/demo-views/{slug}")
    public ResponseEntity<Void> trackDemo(@PathVariable String slug) {
        if (!DEMO_SLUGS.contains(slug)) return ResponseEntity.notFound().build();
        demoViews.save(new DemoView(slug));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events")
    public ResponseEntity<Void> trackEvent(@Valid @RequestBody SiteEvent event) {
        if (!Set.of("PAGE_VIEW", "CTA_CLICK", "PLAN_SELECT", "WHATSAPP_CLICK").contains(event.getType())) {
            return ResponseEntity.badRequest().build();
        }
        event.setOccurredAt(java.time.Instant.now());
        siteEvents.save(event);
        return ResponseEntity.noContent().build();
    }
}
