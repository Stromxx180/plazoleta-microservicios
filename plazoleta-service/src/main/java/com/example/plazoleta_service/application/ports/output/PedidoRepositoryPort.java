package com.example.plazoleta_service.application.ports.output;

import com.example.plazoleta_service.domain.models.Pedido;
import com.example.plazoleta_service.domain.models.Trazabilidad;
import java.util.List;
import java.util.Optional;

public interface PedidoRepositoryPort {
    Pedido guardar(Pedido pedido);
    Optional<Pedido> obtenerPorId(Long id);
    boolean clienteTienePedidoActivo(Long idCliente, List<String> estadosActivos);
    List<Pedido> listarPorRestauranteYEstado(Long idRestaurante, String estado, int page, int size);
    List<Pedido> listarTodosPorRestaurante(Long idRestaurante);
    void guardarTrazabilidad(Trazabilidad trazabilidad);
    List<Trazabilidad> listarTrazabilidadPorPedido(Long idPedido);
}