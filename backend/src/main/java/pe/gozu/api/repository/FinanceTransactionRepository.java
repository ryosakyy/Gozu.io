package pe.gozu.api.repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gozu.api.model.FinanceTransaction;
public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction,Long> {
    List<FinanceTransaction> findAllByOrderByOccurredOnDescIdDesc();
    @Query("select coalesce(sum(t.amount),0) from FinanceTransaction t where t.type=:type and t.occurredOn between :start and :end")
    BigDecimal total(@Param("type") FinanceTransaction.Type type,@Param("start") LocalDate start,@Param("end") LocalDate end);
}
