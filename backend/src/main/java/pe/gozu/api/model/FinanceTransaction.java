package pe.gozu.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class FinanceTransaction {
    public enum Type { INCOME, EXPENSE }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING) private Type type;
    @NotBlank private String description;
    @Positive private BigDecimal amount;
    private LocalDate occurredOn = LocalDate.now();

    public FinanceTransaction() {}
    public FinanceTransaction(Type type, String description, BigDecimal amount, LocalDate occurredOn) {
        this.type=type; this.description=description; this.amount=amount; this.occurredOn=occurredOn;
    }
    public Long getId() { return id; }
    public Type getType() { return type; } public void setType(Type v) { type=v; }
    public String getDescription() { return description; } public void setDescription(String v) { description=v; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal v) { amount=v; }
    public LocalDate getOccurredOn() { return occurredOn; } public void setOccurredOn(LocalDate v) { occurredOn=v; }
}
