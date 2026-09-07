package pe.gozu.api.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pe.gozu.api.model.Client;
import pe.gozu.api.model.FinanceTransaction;
import pe.gozu.api.model.ProjectShowcase;
import pe.gozu.api.model.ServiceOffering;
import pe.gozu.api.repository.ClientRepository;
import pe.gozu.api.repository.FinanceTransactionRepository;
import pe.gozu.api.repository.ProjectShowcaseRepository;
import pe.gozu.api.repository.ServiceOfferingRepository;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(ServiceOfferingRepository services, ProjectShowcaseRepository projects,
                           ClientRepository clients, FinanceTransactionRepository transactions) {
        return args -> {
            if (services.count() == 0) {
                services.save(new ServiceOffering("Web corporativa", "Presencia digital", "Landing o sitio multipágina optimizado para convertir visitas en consultas.", new BigDecimal("89")));
                services.save(new ServiceOffering("Ecommerce y catálogo QR", "Ventas", "Productos, filtros, carrito, pedidos y conexión con inventario.", new BigDecimal("149")));
                services.save(new ServiceOffering("POS e inventario", "Operación", "Caja, stock, movimientos, alertas, usuarios y reportes.", new BigDecimal("189")));
                services.save(new ServiceOffering("Sistema SaaS a medida", "Desarrollo", "Arquitectura multiempresa y módulos adaptados a procesos específicos.", new BigDecimal("399")));
            }
            if (projects.count() == 0) {
                projects.save(new ProjectShowcase("GOZU Venta", "Tiendas, stock y distribución", "POS, compras, almacenes, alertas y margen.", "/images/inventory.jpg", "Angular · Spring Boot · PostgreSQL", false));
                projects.save(new ProjectShowcase("GOZU Restaurante", "Restaurantes y pollerías", "Pedidos, mesas, cocina, inventario y caja.", "/images/restaurant.jpg", "Angular · Spring Boot · PostgreSQL", false));
                projects.save(new ProjectShowcase("GOZU Agenda", "Barberías, salones y servicios", "Reservas, clientes, equipo, anticipos y caja.", "/images/barber.jpg", "Angular · Spring Boot · PostgreSQL", false));
            }
            if (clients.count() == 0) {
                Client a = new Client(); a.setBusinessName("Brasa Real"); a.setContactName("María Rojas"); a.setPhone("+51 999 111 222"); a.setPlanName("Control"); a.setMonthlyFee(new BigDecimal("189")); a.setStatus(Client.Status.ACTIVE); clients.save(a);
                Client b = new Client(); b.setBusinessName("Market San José"); b.setContactName("Carlos Díaz"); b.setPhone("+51 988 333 444"); b.setPlanName("Escala"); b.setMonthlyFee(new BigDecimal("399")); b.setStatus(Client.Status.ACTIVE); clients.save(b);
            }
            if (transactions.count() == 0) {
                LocalDate now = LocalDate.now();
                transactions.save(new FinanceTransaction(FinanceTransaction.Type.INCOME,"Implementación ecommerce",new BigDecimal("1500"),now.minusDays(8)));
                transactions.save(new FinanceTransaction(FinanceTransaction.Type.INCOME,"Suscripciones del mes",new BigDecimal("588"),now.minusDays(2)));
                transactions.save(new FinanceTransaction(FinanceTransaction.Type.EXPENSE,"Hosting y herramientas",new BigDecimal("180"),now.minusDays(6)));
                transactions.save(new FinanceTransaction(FinanceTransaction.Type.EXPENSE,"Publicidad",new BigDecimal("250"),now.minusDays(3)));
            }
        };
    }
}
