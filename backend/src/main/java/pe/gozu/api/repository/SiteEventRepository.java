package pe.gozu.api.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gozu.api.model.SiteEvent;

public interface SiteEventRepository extends JpaRepository<SiteEvent, Long> {
    long countByTypeAndOccurredAtGreaterThanEqualAndOccurredAtLessThan(String type, Instant start, Instant end);

    @Query("""
        select e.label, count(e) from SiteEvent e
        where e.type = :type and e.occurredAt >= :start and e.occurredAt < :end
        group by e.label order by count(e) desc
        """)
    List<Object[]> popularity(@Param("type") String type, @Param("start") Instant start, @Param("end") Instant end);
}
