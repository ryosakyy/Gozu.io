package pe.gozu.api.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.gozu.api.model.ServiceOffering;
public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering,Long> { List<ServiceOffering> findByActiveTrueOrderById(); }
