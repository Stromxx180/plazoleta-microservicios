package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "trazabilidad_pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrazabilidadEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long idPedido;
    private Long idCliente;
    private LocalDateTime fecha;
    private String estadoAnterior;
    private String estadoNuevo;
    private Long idEmpleado;
}