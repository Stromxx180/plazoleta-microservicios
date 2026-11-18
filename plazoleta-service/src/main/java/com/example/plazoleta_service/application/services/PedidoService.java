package com.example.plazoleta_service.application.services;

import com.example.plazoleta_service.application.ports.input.PedidoUseCase;
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

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

public class PedidoService implements PedidoUseCase {

    private static final List<String> ESTADOS_ACTIVOS = List.of(
            "PENDIENTE", "EN_PREPARACION", "LISTO"
    );

    private final PedidoRepositoryPort pedidoRepositoryPort;
    private final PlatoRepositoryPort platoRepositoryPort;
    private final RestauranteRepositoryPort restauranteRepositoryPort;

    public PedidoService(PedidoRepositoryPort pedidoRepositoryPort,
                         PlatoRepositoryPort platoRepositoryPort,
                         RestauranteRepositoryPort restauranteRepositoryPort) {
        this.pedidoRepositoryPort = pedidoRepositoryPort;
        this.platoRepositoryPort = platoRepositoryPort;
        this.restauranteRepositoryPort = restauranteRepositoryPort;
    }

    @Override
    public Pedido crearPedido(Pedido pedido, Long idClienteAutenticado) {
        if (pedido.getIdRestaurante() == null) {
            throw new DomainException("El restaurante es obligatorio.");
        }
        if (pedido.getPlatos() == null || pedido.getPlatos().isEmpty()) {
            throw new DomainException("El pedido debe contener al menos un plato.");
        }
        if (pedidoRepositoryPort.clienteTienePedidoActivo(idClienteAutenticado, ESTADOS_ACTIVOS)) {
            throw new DomainException("El cliente ya tiene un pedido en proceso.");
        }

        restauranteRepositoryPort.obtenerPorId(pedido.getIdRestaurante())
                .orElseThrow(() -> new DomainException("El restaurante especificado no existe."));

        for (PedidoPlato item : pedido.getPlatos()) {
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new DomainException("La cantidad de cada plato debe ser mayor a 0.");
            }
            Plato plato = platoRepositoryPort.obtenerPorId(item.getIdPlato())
                    .orElseThrow(() -> new DomainException("El plato con ID " + item.getIdPlato() + " no existe."));

            if (!plato.getIdRestaurante().equals(pedido.getIdRestaurante())) {
                throw new DomainException("Todos los platos deben pertenecer al mismo restaurante.");
            }
        }

        pedido.setIdCliente(idClienteAutenticado);
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado("PENDIENTE");

        Pedido guardado = pedidoRepositoryPort.guardar(pedido);
        registrarCambioEstado(guardado, null, "PENDIENTE", null);
        return guardado;
    }

    @Override
    public List<Pedido> listarPedidosPorEstado(Long idRestaurante, String estado, int page, int size) {
        if (idRestaurante == null) {
            throw new DomainException("El ID del restaurante es obligatorio.");
        }
        if (page < 0 || size <= 0) {
            throw new DomainException("El número de página debe ser >= 0 y el tamaño > 0.");
        }
        return pedidoRepositoryPort.listarPorRestauranteYEstado(idRestaurante, estado, page, size);
    }

    @Override
    public Pedido asignarPedido(Long idPedido, Long idEmpleadoAutenticado) {
        Pedido pedido = pedidoRepositoryPort.obtenerPorId(idPedido)
                .orElseThrow(() -> new DomainException("El pedido con ID " + idPedido + " no existe."));

        if (!"PENDIENTE".equals(pedido.getEstado())) {
            throw new DomainException("Solo se pueden asignar pedidos que estén en estado PENDIENTE.");
        }

        String estadoAnterior = pedido.getEstado();
        pedido.setIdChef(idEmpleadoAutenticado);
        pedido.setEstado("EN_PREPARACION");

        Pedido actualizado = pedidoRepositoryPort.guardar(pedido);
        registrarCambioEstado(actualizado, estadoAnterior, "EN_PREPARACION", idEmpleadoAutenticado);
        return actualizado;
    }

    @Override
    public Pedido marcarPedidoListo(Long idPedido, Long idEmpleadoAutenticado) {
        Pedido pedido = pedidoRepositoryPort.obtenerPorId(idPedido)
                .orElseThrow(() -> new DomainException("El pedido con ID " + idPedido + " no existe."));

        if (!"EN_PREPARACION".equals(pedido.getEstado())) {
            throw new DomainException("Solo los pedidos EN_PREPARACION pueden pasar a LISTO.");
        }

        String pin = String.valueOf(100000 + new Random().nextInt(900000));
        String estadoAnterior = pedido.getEstado();
        pedido.setEstado("LISTO");
        pedido.setPinSeguridad(pin);

        Pedido actualizado = pedidoRepositoryPort.guardar(pedido);
        registrarCambioEstado(actualizado, estadoAnterior, "LISTO", idEmpleadoAutenticado);
        System.out.println(">>> [SMS NOTIFICACION] Tu pedido #" + idPedido + " está LISTO. Tu PIN de seguridad es: " + pin);
        return actualizado;
    }

    @Override
    public Pedido entregarPedido(Long idPedido, String pinSeguridad, Long idEmpleadoAutenticado) {
        Pedido pedido = pedidoRepositoryPort.obtenerPorId(idPedido)
                .orElseThrow(() -> new DomainException("El pedido con ID " + idPedido + " no existe."));

        if ("ENTREGADO".equals(pedido.getEstado())) {
            throw new DomainException("Ningún pedido en estado ENTREGADO puede ser modificado.");
        }
        if (!"LISTO".equals(pedido.getEstado())) {
            throw new DomainException("Solo los pedidos que están en estado LISTO pueden pasar a estado ENTREGADO.");
        }
        if (pinSeguridad == null || !pinSeguridad.equals(pedido.getPinSeguridad())) {
            throw new DomainException("El PIN de seguridad proporcionado es incorrecto.");
        }

        String estadoAnterior = pedido.getEstado();
        pedido.setEstado("ENTREGADO");

        Pedido actualizado = pedidoRepositoryPort.guardar(pedido);
        registrarCambioEstado(actualizado, estadoAnterior, "ENTREGADO", idEmpleadoAutenticado);
        return actualizado;
    }

    @Override
    public Pedido cancelarPedido(Long idPedido, Long idClienteAutenticado) {
        Pedido pedido = pedidoRepositoryPort.obtenerPorId(idPedido)
                .orElseThrow(() -> new DomainException("El pedido con ID " + idPedido + " no existe."));

        if (!pedido.getIdCliente().equals(idClienteAutenticado)) {
            throw new DomainException("No puedes cancelar un pedido que pertenece a otro cliente.");
        }

        if (!"PENDIENTE".equals(pedido.getEstado())) {
            throw new DomainException("Lo sentimos, tu pedido ya está en preparación y no puede cancelarse");
        }

        String estadoAnterior = pedido.getEstado();
        pedido.setEstado("CANCELADO");

        Pedido actualizado = pedidoRepositoryPort.guardar(pedido);
        registrarCambioEstado(actualizado, estadoAnterior, "CANCELADO", null);
        return actualizado;
    }

    @Override
    public List<Trazabilidad> consultarTrazabilidad(Long idPedido, Long idClienteAutenticado) {
        Pedido pedido = pedidoRepositoryPort.obtenerPorId(idPedido)
                .orElseThrow(() -> new DomainException("El pedido con ID " + idPedido + " no existe."));

        if (!pedido.getIdCliente().equals(idClienteAutenticado)) {
            throw new DomainException("Solo puedes consultar la trazabilidad de tus propios pedidos.");
        }

        return pedidoRepositoryPort.listarTrazabilidadPorPedido(idPedido);
    }

    @Override
    public EficienciaRestaurante consultarEficiencia(Long idRestaurante, Long idPropietarioAutenticado) {
        Restaurante restaurante = restauranteRepositoryPort.obtenerPorId(idRestaurante)
                .orElseThrow(() -> new DomainException("El restaurante con ID " + idRestaurante + " no existe."));

        if (!restaurante.getIdPropietario().equals(idPropietarioAutenticado)) {
            throw new DomainException("Solo el propietario del restaurante puede consultar su eficiencia.");
        }

        List<Pedido> pedidos = pedidoRepositoryPort.listarTodosPorRestaurante(idRestaurante);
        List<EficienciaRestaurante.TiempoPedido> tiemposPorPedido = new ArrayList<>();

        for (Pedido p : pedidos) {
            List<Trazabilidad> logs = pedidoRepositoryPort.listarTrazabilidadPorPedido(p.getId());
            LocalDateTime inicio = p.getFecha();
            LocalDateTime fin = null;

            for (Trazabilidad log : logs) {
                if ("PENDIENTE".equals(log.getEstadoNuevo()) && log.getFecha() != null) {
                    inicio = log.getFecha();
                }
                if ("ENTREGADO".equals(log.getEstadoNuevo()) && log.getFecha() != null) {
                    fin = log.getFecha();
                }
            }

            if (fin == null && "ENTREGADO".equals(p.getEstado()) && inicio != null) {
                fin = LocalDateTime.now();
            }

            if (inicio != null && fin != null) {
                long segundos = Math.max(0L, Duration.between(inicio, fin).getSeconds());
                double minutos = Math.round((segundos / 60.0) * 100.0) / 100.0;
                tiemposPorPedido.add(new EficienciaRestaurante.TiempoPedido(
                        p.getId(), p.getIdChef(), p.getEstado(), segundos, minutos
                ));
            }
        }

        Map<Long, List<EficienciaRestaurante.TiempoPedido>> porEmpleado = tiemposPorPedido.stream()
                .filter(t -> t.getIdEmpleado() != null)
                .collect(Collectors.groupingBy(EficienciaRestaurante.TiempoPedido::getIdEmpleado));

        List<EficienciaRestaurante.RankingEmpleado> ranking = porEmpleado.entrySet().stream()
                .map(entry -> {
                    Long idEmp = entry.getKey();
                    List<EficienciaRestaurante.TiempoPedido> lista = entry.getValue();
                    double promSeg = lista.stream()
                            .mapToLong(EficienciaRestaurante.TiempoPedido::getDuracionSegundos)
                            .average()
                            .orElse(0.0);
                    double promMin = Math.round((promSeg / 60.0) * 100.0) / 100.0;
                    return new EficienciaRestaurante.RankingEmpleado(
                            idEmp,
                            lista.size(),
                            Math.round(promSeg * 100.0) / 100.0,
                            promMin
                    );
                })
                .sorted(Comparator.comparingDouble(EficienciaRestaurante.RankingEmpleado::getPromedioSegundos))
                .toList();

        return new EficienciaRestaurante(idRestaurante, tiemposPorPedido, ranking);
    }

    private void registrarCambioEstado(Pedido pedido, String estadoAnterior, String estadoNuevo, Long idEmpleado) {
        Trazabilidad log = new Trazabilidad(
                null,
                pedido.getId(),
                pedido.getIdCliente(),
                LocalDateTime.now(),
                estadoAnterior,
                estadoNuevo,
                idEmpleado
        );
        pedidoRepositoryPort.guardarTrazabilidad(log);
    }
}