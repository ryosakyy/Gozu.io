package pe.gozu.api.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.gozu.api.model.Lead;
public interface LeadRepository extends JpaRepository<Lead,Long> { List<Lead> findAllByOrderByCreatedAtDesc(); long countByStatus(Lead.Status status); }
