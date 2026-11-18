package com.example.plazoleta_service.domain.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    private Long id;
    private Long idCliente;
    private LocalDateTime fecha;
    private String estado;
    private Long idChef;
    private Long idRestaurante;
    private String pinSeguridad;
    private List<PedidoPlato> platos;
}