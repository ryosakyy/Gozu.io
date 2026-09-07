package pe.gozu.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import pe.gozu.api.repository.LeadRepository;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:gozu-tests;DB_CLOSE_DELAY=-1", "GOZU_ADMIN_PASSWORD=test-only-password"})
@AutoConfigureMockMvc
@Transactional
class GozuApiApplicationTests {
	@Autowired MockMvc mvc;
	@Autowired LeadRepository leads;

	@Test
	void contextLoads() {
	}

	@Test
	void loginRequiresSessionCsrfToken() throws Exception {
		mvc.perform(post("/api/auth/login").param("username", "invalid").param("password", "invalid"))
			.andExpect(status().isForbidden());
		mvc.perform(get("/api/auth/csrf"))
			.andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
		mvc.perform(post("/api/auth/login")
			.with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
			.param("username", "invalid").param("password", "invalid"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void leadQualificationIsPersistedAndProtectedInAdmin() throws Exception {
		String payload = """
			{"name":"Prueba QA","businessName":"Negocio QA","phone":"999 000 111","city":"Lima",
			"industry":"Restaurante o pollería","modules":"Pedidos y mesas","usersRange":"4 a 10 usuarios",
			"locationsRange":"1 local","urgency":"Empezar este mes","preferredPlan":"Negocio",
			"currentSystem":"Excel, cuaderno o WhatsApp","volumeRange":"501 a 2,000 operaciones al mes",
			"budgetRange":"S/ 1,000 a S/ 3,000 para implementar","details":"Prueba automatizada"}
			""";

		String response = mvc.perform(post("/api/public/leads").contentType(MediaType.APPLICATION_JSON).content(payload))
			.andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("NEW"))
			.andExpect(jsonPath("$.preferredPlan").value("Negocio"))
			.andExpect(jsonPath("$.budgetRange").value("S/ 1,000 a S/ 3,000 para implementar"))
			.andReturn().getResponse().getContentAsString();
		Matcher id = Pattern.compile("\\\"id\\\"\\s*:\\s*(\\d+)").matcher(response);
		if (!id.find()) throw new AssertionError("La API no devolvió el id del prospecto");

		mvc.perform(get("/api/admin/leads")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/admin/leads").with(user("admin@gozu.pe").roles("ADMIN")))
			.andExpect(status().isOk());
		leads.deleteById(Long.parseLong(id.group(1)));
	}

	@Test
	void onlyTheThreePublishedDemosCanBeTracked() throws Exception {
		mvc.perform(post("/api/public/demo-views/inventario")).andExpect(status().isNoContent());
		mvc.perform(post("/api/public/demo-views/clinica")).andExpect(status().isNotFound());
	}

	@Test
	void commercialEventsFeedTheProtectedDashboard() throws Exception {
		mvc.perform(post("/api/public/events").contentType(MediaType.APPLICATION_JSON)
			.content("{\"type\":\"PLAN_SELECT\",\"label\":\"Web · Corporativa\",\"path\":\"/\"}"))
			.andExpect(status().isNoContent());
		mvc.perform(post("/api/public/events").contentType(MediaType.APPLICATION_JSON)
			.content("{\"type\":\"UNKNOWN\",\"label\":\"No permitido\",\"path\":\"/\"}"))
			.andExpect(status().isBadRequest());
		mvc.perform(get("/api/admin/dashboard").with(user("admin@gozu.pe").roles("ADMIN")))
			.andExpect(status().isOk()).andExpect(jsonPath("$.pageViews").isNumber())
			.andExpect(jsonPath("$.ctaClicks").isNumber()).andExpect(jsonPath("$.popularPlan").exists());
	}

}
