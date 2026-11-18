package com.example.plazoleta_service.application.services;

import com.example.plazoleta_service.application.ports.output.PedidoRepositoryPort;
import com.example.plazoleta_service.application.ports.output.PlatoRepositoryPort;
import com.example.plazoleta_service.application.ports.output.RestauranteRepositoryPort;
import com.example.plazoleta_service.domain.exceptions.DomainException;
import com.example.plazoleta_service.domain.models.EficienciaRestaurante;
import com.example.plazoleta_service.domain.models.Pedido;
import com.example.plazoleta_service.domain.models.PedidoPlato;
import com.example.plazoleta_service.domain.models.Plato;
import com.example.plazoleta_service.domain.models.Restaurante;
import com.example.plazoleta_service.domain.models.Trazabilidad;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepositoryPort pedidoRepositoryPort;

    @Mock
    private PlatoRepositoryPort platoRepositoryPort;

    @Mock
    private RestauranteRepositoryPort restauranteRepositoryPort;

    @InjectMocks
    private PedidoService pedidoService;

    private Restaurante restauranteMock;
    private Plato platoMock;
    private Pedido pedidoValido;

    @BeforeEach
    void setUp() {
        restauranteMock = new Restaurante(
                2L, "Sabor Caribeño", "900123", "Calle 72", "+573001112233", "logo.png", 10L
        );
        platoMock = new Plato(
                1L, "Bandeja Paisa", 25000, "Típico", "img.png", "Fuertes", true, 2L
        );
        pedidoValido = new Pedido(
                1L, 4L, LocalDateTime.now().minusMinutes(15), "PENDIENTE", 11L, 2L, null, List.of(new PedidoPlato(1L, 2))
        );
    }

    @Test
    void crearPedido_Exitoso_QuedaEnEstadoPendiente() {
        when(pedidoRepositoryPort.clienteTienePedidoActivo(eq(4L), anyList())).thenReturn(false);
        when(restauranteRepositoryPort.obtenerPorId(2L)).thenReturn(Optional.of(restauranteMock));
        when(platoRepositoryPort.obtenerPorId(1L)).thenReturn(Optional.of(platoMock));
        when(pedidoRepositoryPort.guardar(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.crearPedido(pedidoValido, 4L);

        assertEquals("PENDIENTE", resultado.getEstado());
        verify(pedidoRepositoryPort, times(1)).guardarTrazabilidad(any(Trazabilidad.class));
    }

    @Test
    void listarPedidosPorEstado_Exitoso_RetornaListaPaginada() {
        when(pedidoRepositoryPort.listarPorRestauranteYEstado(2L, "PENDIENTE", 0, 10))
                .thenReturn(List.of(pedidoValido));

        List<Pedido> resultado = pedidoService.listarPedidosPorEstado(2L, "PENDIENTE", 0, 10);

        assertEquals(1, resultado.size());
    }

    @Test
    void asignarPedido_Exitoso_AsignaEmpleadoYCambiaEstadoAEnPreparacion() {
        when(pedidoRepositoryPort.obtenerPorId(1L)).thenReturn(Optional.of(pedidoValido));
        when(pedidoRepositoryPort.guardar(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.asignarPedido(1L, 11L);

        assertEquals("EN_PREPARACION", resultado.getEstado());
    }

    @Test
    void marcarPedidoListo_Exitoso_GeneraPinYCambiaEstadoAListo() {
        pedidoValido.setEstado("EN_PREPARACION");
        when(pedidoRepositoryPort.obtenerPorId(1L)).thenReturn(Optional.of(pedidoValido));
        when(pedidoRepositoryPort.guardar(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.marcarPedidoListo(1L, 11L);

        assertEquals("LISTO", resultado.getEstado());
    }

    @Test
    void entregarPedido_Exitoso_CuandoPinEsCorrecto() {
        pedidoValido.setEstado("LISTO");
        pedidoValido.setPinSeguridad("123456");
        when(pedidoRepositoryPort.obtenerPorId(1L)).thenReturn(Optional.of(pedidoValido));
        when(pedidoRepositoryPort.guardar(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.entregarPedido(1L, "123456", 11L);

        assertEquals("ENTREGADO", resultado.getEstado());
    }

    @Test
    void cancelarPedido_Exitoso_CuandoEstaPendiente() {
        pedidoValido.setEstado("PENDIENTE");
        when(pedidoRepositoryPort.obtenerPorId(1L)).thenReturn(Optional.of(pedidoValido));
        when(pedidoRepositoryPort.guardar(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.cancelarPedido(1L, 4L);

        assertEquals("CANCELADO", resultado.getEstado());
    }

    @Test
    void consultarTrazabilidad_Exitoso_CuandoPedidoEsDelCliente() {
        Trazabilidad log = new Trazabilidad(1L, 1L, 4L, LocalDateTime.now(), null, "PENDIENTE", null);
        when(pedidoRepositoryPort.obtenerPorId(1L)).thenReturn(Optional.of(pedidoValido));
        when(pedidoRepositoryPort.listarTrazabilidadPorPedido(1L)).thenReturn(List.of(log));

        List<Trazabilidad> resultado = pedidoService.consultarTrazabilidad(1L, 4L);

        assertEquals(1, resultado.size());
    }

    // --- TESTS HU-18: CONSULTAR EFICIENCIA ---

    @Test
    void consultarEficiencia_Exitoso_CalculaTiemposYRankingDeEmpleados() {
        pedidoValido.setEstado("ENTREGADO");
        LocalDateTime inicio = LocalDateTime.now().minusMinutes(10);
        LocalDateTime fin = LocalDateTime.now();

        List<Trazabilidad> logs = List.of(
                new Trazabilidad(1L, 1L, 4L, inicio, null, "PENDIENTE", null),
                new Trazabilidad(2L, 1L, 4L, fin, "LISTO", "ENTREGADO", 11L)
        );

        when(restauranteRepositoryPort.obtenerPorId(2L)).thenReturn(Optional.of(restauranteMock));
        when(pedidoRepositoryPort.listarTodosPorRestaurante(2L)).thenReturn(List.of(pedidoValido));
        when(pedidoRepositoryPort.listarTrazabilidadPorPedido(1L)).thenReturn(logs);

        EficienciaRestaurante reporte = pedidoService.consultarEficiencia(2L, 10L);

        assertNotNull(reporte);
        assertEquals(1, reporte.getTiemposPorPedido().size());
        assertEquals(1, reporte.getRankingEmpleados().size());
        assertEquals(11L, reporte.getRankingEmpleados().get(0).getIdEmpleado());
    }

    @Test
    void consultarEficiencia_LanzaExcepcion_CuandoPropietarioNoEsDuenoDelRestaurante() {
        when(restauranteRepositoryPort.obtenerPorId(2L)).thenReturn(Optional.of(restauranteMock));

        assertThrows(DomainException.class, () -> pedidoService.consultarEficiencia(2L, 99L));
    }
}