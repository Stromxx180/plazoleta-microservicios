package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long idCliente;
    private LocalDateTime fecha;
    private String estado;
    private Long idChef;
    private Long idRestaurante;
    private String pinSeguridad;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pedidos_platos", joinColumns = @JoinColumn(name = "id_pedido"))
    private List<PedidoPlatoEmbeddable> platos = new ArrayList<>();
}