package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataTrazabilidadRepository extends JpaRepository<TrazabilidadEntity, Long> {
    List<TrazabilidadEntity> findByIdPedidoOrderByFechaAsc(Long idPedido);
}