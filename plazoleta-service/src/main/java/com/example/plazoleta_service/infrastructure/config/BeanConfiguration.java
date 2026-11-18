package com.example.plazoleta_service.infrastructure.config;

import com.example.plazoleta_service.application.ports.input.PedidoUseCase;
import com.example.plazoleta_service.application.ports.input.PlatoUseCase;
import com.example.plazoleta_service.application.ports.input.RestauranteUseCase;
import com.example.plazoleta_service.application.ports.output.PedidoRepositoryPort;
import com.example.plazoleta_service.application.ports.output.PlatoRepositoryPort;
import com.example.plazoleta_service.application.ports.output.RestauranteRepositoryPort;
import com.example.plazoleta_service.application.services.PedidoService;
import com.example.plazoleta_service.application.services.PlatoService;
import com.example.plazoleta_service.application.services.RestauranteService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfiguration {

    @Bean
    public RestauranteUseCase restauranteUseCase(RestauranteRepositoryPort repo) {
        return new RestauranteService(repo);
    }

    @Bean
    public PlatoUseCase platoUseCase(PlatoRepositoryPort platoRepo, RestauranteRepositoryPort restauranteRepo) {
        return new PlatoService(platoRepo, restauranteRepo);
    }

    @Bean
    public PedidoUseCase pedidoUseCase(PedidoRepositoryPort pedidoRepo,
                                       PlatoRepositoryPort platoRepo,
                                       RestauranteRepositoryPort restauranteRepo) {
        return new PedidoService(pedidoRepo, platoRepo, restauranteRepo);
    }
}