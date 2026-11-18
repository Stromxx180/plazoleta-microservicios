package com.example.plazoleta_service.infrastructure.adapters.output.persistence;

import com.example.plazoleta_service.application.ports.output.PlatoRepositoryPort;
import com.example.plazoleta_service.domain.models.Plato;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class PlatoJpaAdapter implements PlatoRepositoryPort {

    private final SpringDataPlatoRepository repository;

    public PlatoJpaAdapter(SpringDataPlatoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Plato guardar(Plato p) {
        PlatoEntity entity = new PlatoEntity(
                p.getId(), p.getNombre(), p.getPrecio(), p.getDescripcion(),
                p.getUrlImagen(), p.getCategoria(), p.getActivo(), p.getIdRestaurante()
        );
        PlatoEntity saved = repository.save(entity);
        p.setId(saved.getId());
        return p;
    }

    @Override
    public Optional<Plato> obtenerPorId(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Plato> listarPorRestauranteYCategoria(Long idRestaurante, String categoria, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PlatoEntity> resultPage;

        if (categoria != null && !categoria.isBlank()) {
            resultPage = repository.findByIdRestauranteAndCategoriaIgnoreCaseAndActivoTrue(idRestaurante, categoria.trim(), pageable);
        } else {
            resultPage = repository.findByIdRestauranteAndActivoTrue(idRestaurante, pageable);
        }

        return resultPage.getContent().stream().map(this::toDomain).toList();
    }

    private Plato toDomain(PlatoEntity e) {
        return new Plato(
                e.getId(), e.getNombre(), e.getPrecio(), e.getDescripcion(),
                e.getUrlImagen(), e.getCategoria(), e.getActivo(), e.getIdRestaurante()
        );
    }
}