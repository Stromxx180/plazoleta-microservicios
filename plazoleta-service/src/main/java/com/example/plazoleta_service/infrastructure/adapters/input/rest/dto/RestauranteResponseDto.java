package com.example.plazoleta_service.infrastructure.adapters.input.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestauranteResponseDto {
    private Long id;
    private String nombre;
    private String urlLogo;
}