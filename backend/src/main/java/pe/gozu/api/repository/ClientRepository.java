package pe.gozu.api.repository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gozu.api.model.Client;
public interface ClientRepository extends JpaRepository<Client,Long> {
    List<Client> findAllByOrderByCreatedAtDesc();
    long countByStatus(Client.Status status);
    @Query("select coalesce(sum(c.monthlyFee),0) from Client c where c.status=:status")
    BigDecimal monthlyRecurringRevenue(@Param("status") Client.Status status);
}
