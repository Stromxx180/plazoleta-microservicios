package com.example.plazoleta_service.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/error").permitAll()
                        // HU-09 y HU-10: Listar restaurantes y platos de un restaurante
                        .requestMatchers(HttpMethod.GET, "/api/v1/restaurantes/**", "/api/v1/platos/**").permitAll()
                        // HU-02: Crear restaurante (Solo Admin)
                        .requestMatchers(HttpMethod.POST, "/api/v1/restaurantes").hasAuthority("ROLE_ADMINISTRADOR")
                        // HU-03: Crear plato (Solo Propietario)
                        .requestMatchers(HttpMethod.POST, "/api/v1/platos").hasAuthority("ROLE_PROPIETARIO")
                        // HU-04: Modificar plato (Solo Propietario)
                        .requestMatchers(HttpMethod.PUT, "/api/v1/platos/**").hasAuthority("ROLE_PROPIETARIO")
                        // HU-07: Habilitar/Deshabilitar plato (Solo Propietario)
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/platos/**").hasAuthority("ROLE_PROPIETARIO")
                        // HU-18: Eficiencia de pedidos y empleados (Solo Propietario)
                        .requestMatchers(HttpMethod.GET, "/api/v1/pedidos/eficiencia").hasAuthority("ROLE_PROPIETARIO")
                        // HU-11, HU-16 y HU-17: Realizar, cancelar y ver trazabilidad de pedido (Solo Cliente)
                        .requestMatchers(HttpMethod.POST, "/api/v1/pedidos").hasAuthority("ROLE_CLIENTE")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/pedidos/*/cancelar").hasAuthority("ROLE_CLIENTE")
                        .requestMatchers(HttpMethod.GET, "/api/v1/pedidos/*/trazabilidad").hasAuthority("ROLE_CLIENTE")
                        // HU-12: Listar pedidos por estado (Solo Empleado)
                        .requestMatchers(HttpMethod.GET, "/api/v1/pedidos").hasAuthority("ROLE_EMPLEADO")
                        // HU-13, HU-14, HU-15: Asignar, Listo y Entregar pedido (Solo Empleado)
                        .requestMatchers(HttpMethod.PATCH,
                                "/api/v1/pedidos/*/asignar",
                                "/api/v1/pedidos/*/listo",
                                "/api/v1/pedidos/*/entregar"
                        ).hasAuthority("ROLE_EMPLEADO")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .name("BearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}