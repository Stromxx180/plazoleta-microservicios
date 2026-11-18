package com.example.plazoleta_service.domain.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoPlato {
    private Long idPlato;
    private Integer cantidad;
}