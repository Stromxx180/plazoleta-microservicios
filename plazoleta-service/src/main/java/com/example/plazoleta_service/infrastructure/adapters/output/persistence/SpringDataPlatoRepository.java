package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataPlatoRepository extends JpaRepository<PlatoEntity, Long> {
    Page<PlatoEntity> findByIdRestauranteAndActivoTrue(Long idRestaurante, Pageable pageable);
    Page<PlatoEntity> findByIdRestauranteAndCategoriaIgnoreCaseAndActivoTrue(Long idRestaurante, String categoria, Pageable pageable);
}