package pe.gozu.api.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gozu.api.model.DemoView;

public interface DemoViewRepository extends JpaRepository<DemoView, Long> {
    long countByViewedAtGreaterThanEqualAndViewedAtLessThan(Instant start, Instant end);

    @Query("""
        select d.slug, count(d) from DemoView d
        where d.viewedAt >= :start and d.viewedAt < :end
        group by d.slug order by count(d) desc
        """)
    List<Object[]> popularity(@Param("start") Instant start, @Param("end") Instant end);
}
