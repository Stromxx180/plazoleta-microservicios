package com.example.plazoleta_service.infrastructure.adapters.input.rest.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoRequestDto {
    @NotNull(message = "El idRestaurante es obligatorio")
    private Long idRestaurante;

    @NotEmpty(message = "La lista de platos no puede estar vacía")
    private List<PedidoPlatoDto> platos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PedidoPlatoDto {
        @NotNull
        private Long idPlato;
        @NotNull
        private Integer cantidad;
    }
}