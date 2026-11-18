package com.example.plazoleta_service.infrastructure.adapters.input.rest;

import com.example.plazoleta_service.application.ports.input.PedidoUseCase;
import com.example.plazoleta_service.domain.models.EficienciaRestaurante;
import com.example.plazoleta_service.domain.models.Pedido;
import com.example.plazoleta_service.domain.models.PedidoPlato;
import com.example.plazoleta_service.domain.models.Trazabilidad;
import com.example.plazoleta_service.infrastructure.adapters.input.rest.dto.PedidoRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    private final PedidoUseCase pedidoUseCase;

    public PedidoController(PedidoUseCase pedidoUseCase) {
        this.pedidoUseCase = pedidoUseCase;
    }

    private Long obtenerIdUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Number idUsuario) {
            return idUsuario.longValue();
        }
        return 1L;
    }

    @Operation(summary = "HU-11: Realizar pedido (Solo Cliente)")
    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody PedidoRequestDto dto) {
        List<PedidoPlato> items = dto.getPlatos().stream()
                .map(i -> new PedidoPlato(i.getIdPlato(), i.getCantidad()))
                .toList();
        Pedido p = new Pedido(null, null, null, null, null, dto.getIdRestaurante(), null, items);
        Pedido creado = pedidoUseCase.crearPedido(p, obtenerIdUsuarioActual());
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @Operation(summary = "HU-12: Listar pedidos filtrando por estado (Solo Empleado)")
    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidos(
            @RequestParam Long idRestaurante,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(pedidoUseCase.listarPedidosPorEstado(idRestaurante, estado, page, size));
    }

    @Operation(summary = "HU-13: Asignarse a un pedido y cambiar estado a EN_PREPARACION (Solo Empleado)")
    @PatchMapping("/{id}/asignar")
    public ResponseEntity<Pedido> asignarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoUseCase.asignarPedido(id, obtenerIdUsuarioActual()));
    }

    @Operation(summary = "HU-14: Marcar pedido como LISTO y enviar PIN por SMS (Solo Empleado)")
    @PatchMapping("/{id}/listo")
    public ResponseEntity<Pedido> marcarPedidoListo(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoUseCase.marcarPedidoListo(id, obtenerIdUsuarioActual()));
    }

    @Operation(summary = "HU-15: Entregar pedido validando PIN de seguridad (Solo Empleado)")
    @PatchMapping("/{id}/entregar")
    public ResponseEntity<Pedido> entregarPedido(@PathVariable Long id, @RequestParam String pin) {
        return ResponseEntity.ok(pedidoUseCase.entregarPedido(id, pin, obtenerIdUsuarioActual()));
    }

    @Operation(summary = "HU-16: Cancelar pedido si está en estado PENDIENTE (Solo Cliente)")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Pedido> cancelarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoUseCase.cancelarPedido(id, obtenerIdUsuarioActual()));
    }

    @Operation(summary = "HU-17: Consultar trazabilidad del pedido (Solo Cliente)")
    @GetMapping("/{id}/trazabilidad")
    public ResponseEntity<List<Trazabilidad>> consultarTrazabilidad(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoUseCase.consultarTrazabilidad(id, obtenerIdUsuarioActual()));
    }

    @Operation(summary = "HU-18: Mostrar eficiencia de pedidos y ranking de empleados (Solo Propietario)")
    @GetMapping("/eficiencia")
    public ResponseEntity<EficienciaRestaurante> consultarEficiencia(@RequestParam Long idRestaurante) {
        return ResponseEntity.ok(pedidoUseCase.consultarEficiencia(idRestaurante, obtenerIdUsuarioActual()));
    }
}