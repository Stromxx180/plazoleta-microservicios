package com.example.plazoleta_service.application.ports.output;

import com.example.plazoleta_service.domain.models.Plato;
import java.util.List;
import java.util.Optional;

public interface PlatoRepositoryPort {
    Plato guardar(Plato plato);
    Optional<Plato> obtenerPorId(Long id);
    List<Plato> listarPorRestauranteYCategoria(Long idRestaurante, String categoria, int page, int size);
}