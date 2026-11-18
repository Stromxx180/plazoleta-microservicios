package com.example.plazoleta_service.domain.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EficienciaRestaurante {
    private Long idRestaurante;
    private List<TiempoPedido> tiemposPorPedido;
    private List<RankingEmpleado> rankingEmpleados;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TiempoPedido {
        private Long idPedido;
        private Long idEmpleado;
        private String estadoFinal;
        private Long duracionSegundos;
        private Double duracionMinutos;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankingEmpleado {
        private Long idEmpleado;
        private Integer pedidosCompletados;
        private Double promedioSegundos;
        private Double promedioMinutos;
    }
}