package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoPlatoEmbeddable {
    private Long idPlato;
    private Integer cantidad;
}