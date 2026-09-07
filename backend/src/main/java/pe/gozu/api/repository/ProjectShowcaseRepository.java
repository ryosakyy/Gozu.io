package pe.gozu.api.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.gozu.api.model.ProjectShowcase;
public interface ProjectShowcaseRepository extends JpaRepository<ProjectShowcase,Long> { List<ProjectShowcase> findAllByOrderByFeaturedDescIdAsc(); }
