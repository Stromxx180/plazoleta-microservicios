package com.example.plazoleta_service.domain.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trazabilidad {
    private Long id;
    private Long idPedido;
    private Long idCliente;
    private LocalDateTime fecha;
    private String estadoAnterior;
    private String estadoNuevo;
    private Long idEmpleado;
}