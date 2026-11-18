package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import com.example.plazoleta_service.application.ports.output.PedidoRepositoryPort;
import com.example.plazoleta_service.domain.models.Pedido;
import com.example.plazoleta_service.domain.models.PedidoPlato;
import com.example.plazoleta_service.domain.models.Trazabilidad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class PedidoJpaAdapter implements PedidoRepositoryPort {

    private final SpringDataPedidoRepository pedidoRepository;
    private final SpringDataTrazabilidadRepository trazabilidadRepository;

    public PedidoJpaAdapter(SpringDataPedidoRepository pedidoRepository,
                            SpringDataTrazabilidadRepository trazabilidadRepository) {
        this.pedidoRepository = pedidoRepository;
        this.trazabilidadRepository = trazabilidadRepository;
    }

    @Override
    public Pedido guardar(Pedido p) {
        List<PedidoPlatoEmbeddable> items = p.getPlatos() == null ? List.of() :
                p.getPlatos().stream()
                        .map(i -> new PedidoPlatoEmbeddable(i.getIdPlato(), i.getCantidad()))
                        .toList();

        PedidoEntity entity = new PedidoEntity(
                p.getId(), p.getIdCliente(), p.getFecha(), p.getEstado(),
                p.getIdChef(), p.getIdRestaurante(), p.getPinSeguridad(), items
        );
        PedidoEntity saved = pedidoRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Pedido> obtenerPorId(Long id) {
        return pedidoRepository.findById(id).map(this::toDomain);
    }

    @Override
    public boolean clienteTienePedidoActivo(Long idCliente, List<String> estadosActivos) {
        return pedidoRepository.existsByIdClienteAndEstadoIn(idCliente, estadosActivos);
    }

    @Override
    public List<Pedido> listarPorRestauranteYEstado(Long idRestaurante, String estado, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PedidoEntity> resultPage;

        if (estado != null && !estado.isBlank()) {
            resultPage = pedidoRepository.findByIdRestauranteAndEstadoIgnoreCase(idRestaurante, estado.trim(), pageable);
        } else {
            resultPage = pedidoRepository.findByIdRestaurante(idRestaurante, pageable);
        }

        return resultPage.getContent().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Pedido> listarTodosPorRestaurante(Long idRestaurante) {
        return pedidoRepository.findByIdRestaurante(idRestaurante).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void guardarTrazabilidad(Trazabilidad t) {
        TrazabilidadEntity entity = new TrazabilidadEntity(
                t.getId(), t.getIdPedido(), t.getIdCliente(),
                t.getFecha(), t.getEstadoAnterior(), t.getEstadoNuevo(), t.getIdEmpleado()
        );
        trazabilidadRepository.save(entity);
    }

    @Override
    public List<Trazabilidad> listarTrazabilidadPorPedido(Long idPedido) {
        return trazabilidadRepository.findByIdPedidoOrderByFechaAsc(idPedido).stream()
                .map(e -> new Trazabilidad(
                        e.getId(), e.getIdPedido(), e.getIdCliente(),
                        e.getFecha(), e.getEstadoAnterior(), e.getEstadoNuevo(), e.getIdEmpleado()
                ))
                .toList();
    }

    private Pedido toDomain(PedidoEntity e) {
        List<PedidoPlato> items = e.getPlatos() == null ? List.of() :
                e.getPlatos().stream()
                        .map(i -> new PedidoPlato(i.getIdPlato(), i.getCantidad()))
                        .toList();
        return new Pedido(
                e.getId(), e.getIdCliente(), e.getFecha(), e.getEstado(),
                e.getIdChef(), e.getIdRestaurante(), e.getPinSeguridad(), items
        );
    }
}