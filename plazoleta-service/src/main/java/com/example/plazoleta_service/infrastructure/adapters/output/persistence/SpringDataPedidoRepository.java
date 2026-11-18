package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataPedidoRepository extends JpaRepository<PedidoEntity, Long> {
    boolean existsByIdClienteAndEstadoIn(Long idCliente, List<String> estados);
    Page<PedidoEntity> findByIdRestauranteAndEstadoIgnoreCase(Long idRestaurante, String estado, Pageable pageable);
    Page<PedidoEntity> findByIdRestaurante(Long idRestaurante, Pageable pageable);
    List<PedidoEntity> findByIdRestaurante(Long idRestaurante);
}