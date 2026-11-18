package com.example.plazoleta_service.application.ports.input;

import com.example.plazoleta_service.domain.models.EficienciaRestaurante;
import com.example.plazoleta_service.domain.models.Pedido;
import com.example.plazoleta_service.domain.models.Trazabilidad;
import java.util.List;

public interface PedidoUseCase {
    Pedido crearPedido(Pedido pedido, Long idClienteAutenticado);
    List<Pedido> listarPedidosPorEstado(Long idRestaurante, String estado, int page, int size);
    Pedido asignarPedido(Long idPedido, Long idEmpleadoAutenticado);
    Pedido marcarPedidoListo(Long idPedido, Long idEmpleadoAutenticado);
    Pedido entregarPedido(Long idPedido, String pinSeguridad, Long idEmpleadoAutenticado);
    Pedido cancelarPedido(Long idPedido, Long idClienteAutenticado);
    List<Trazabilidad> consultarTrazabilidad(Long idPedido, Long idClienteAutenticado);
    EficienciaRestaurante consultarEficiencia(Long idRestaurante, Long idPropietarioAutenticado);
}