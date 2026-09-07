package pe.gozu.api.web;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gozu.api.model.Client;
import pe.gozu.api.model.FinanceTransaction;
import pe.gozu.api.model.Lead;
import pe.gozu.api.model.ServiceOffering;
import pe.gozu.api.repository.ClientRepository;
import pe.gozu.api.repository.DemoViewRepository;
import pe.gozu.api.repository.FinanceTransactionRepository;
import pe.gozu.api.repository.LeadRepository;
import pe.gozu.api.repository.ServiceOfferingRepository;
import pe.gozu.api.repository.SiteEventRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final LeadRepository leads; private final ClientRepository clients;
    private final ServiceOfferingRepository services; private final FinanceTransactionRepository transactions;
    private final DemoViewRepository demoViews;
    private final SiteEventRepository siteEvents;
    public AdminController(LeadRepository leads, ClientRepository clients, ServiceOfferingRepository services, FinanceTransactionRepository transactions, DemoViewRepository demoViews, SiteEventRepository siteEvents) {
        this.leads=leads; this.clients=clients; this.services=services; this.transactions=transactions; this.demoViews=demoViews; this.siteEvents=siteEvents;
    }
    @GetMapping("/dashboard") public Map<String,Object> dashboard() {
        LocalDate now=LocalDate.now(), start=now.with(TemporalAdjusters.firstDayOfMonth()), end=now.with(TemporalAdjusters.lastDayOfMonth());
        BigDecimal income=transactions.total(FinanceTransaction.Type.INCOME,start,end), expense=transactions.total(FinanceTransaction.Type.EXPENSE,start,end);
        ZoneId lima = ZoneId.of("America/Lima");
        Instant demoStart = start.atStartOfDay(lima).toInstant();
        Instant demoEnd = end.plusDays(1).atStartOfDay(lima).toInstant();
        List<Object[]> popularity = demoViews.popularity(demoStart, demoEnd);
        String popularDemo = popularity.isEmpty() ? "Sin datos" : String.valueOf(popularity.getFirst()[0]);
        long pageViews = siteEvents.countByTypeAndOccurredAtGreaterThanEqualAndOccurredAtLessThan("PAGE_VIEW", demoStart, demoEnd);
        long ctaClicks = siteEvents.countByTypeAndOccurredAtGreaterThanEqualAndOccurredAtLessThan("CTA_CLICK", demoStart, demoEnd)
            + siteEvents.countByTypeAndOccurredAtGreaterThanEqualAndOccurredAtLessThan("WHATSAPP_CLICK", demoStart, demoEnd);
        List<Object[]> planPopularity = siteEvents.popularity("PLAN_SELECT", demoStart, demoEnd);
        String popularPlan = planPopularity.isEmpty() ? "Sin datos" : String.valueOf(planPopularity.getFirst()[0]);
        long leadCount = leads.count();
        double leadConversion = pageViews == 0 ? 0 : Math.round((leadCount * 1000.0 / pageViews)) / 10.0;
        return Map.ofEntries(
            Map.entry("activeClients",clients.countByStatus(Client.Status.ACTIVE)), Map.entry("newLeads",leads.countByStatus(Lead.Status.NEW)),
            Map.entry("mrr",clients.monthlyRecurringRevenue(Client.Status.ACTIVE)), Map.entry("income",income),
            Map.entry("expenses",expense), Map.entry("profit",income.subtract(expense)),
            Map.entry("demoViews",demoViews.countByViewedAtGreaterThanEqualAndViewedAtLessThan(demoStart,demoEnd)), Map.entry("popularDemo",popularDemo),
            Map.entry("pageViews",pageViews), Map.entry("ctaClicks",ctaClicks), Map.entry("leadConversion",leadConversion), Map.entry("popularPlan",popularPlan));
    }
    @GetMapping("/leads") public List<Lead> leads() { return leads.findAllByOrderByCreatedAtDesc(); }
    @PatchMapping("/leads/{id}/status") public ResponseEntity<Lead> leadStatus(@PathVariable Long id,@RequestBody Map<String,String> body) {
        return leads.findById(id).map(lead->{lead.setStatus(Lead.Status.valueOf(body.get("status")));return ResponseEntity.ok(leads.save(lead));}).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/clients") public List<Client> clients() { return clients.findAllByOrderByCreatedAtDesc(); }
    @PostMapping("/clients") public Client createClient(@Valid @RequestBody Client client) { return clients.save(client); }
    @GetMapping("/services") public List<ServiceOffering> services() { return services.findAll(); }
    @PostMapping("/services") public ServiceOffering createService(@Valid @RequestBody ServiceOffering service) { return services.save(service); }
    @PutMapping("/services/{id}") public ResponseEntity<ServiceOffering> updateService(@PathVariable Long id,@Valid @RequestBody ServiceOffering input) {
        return services.findById(id).map(current->{current.setName(input.getName());current.setCategory(input.getCategory());current.setDescription(input.getDescription());current.setMonthlyPrice(input.getMonthlyPrice());current.setActive(input.isActive());return ResponseEntity.ok(services.save(current));}).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/transactions") public List<FinanceTransaction> transactions() { return transactions.findAllByOrderByOccurredOnDescIdDesc(); }
    @PostMapping("/transactions") public FinanceTransaction createTransaction(@Valid @RequestBody FinanceTransaction tx) { return transactions.save(tx); }
}
