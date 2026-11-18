# 🍔 Sistema de Gestión de Plazoleta de Comidas - Microservicios

Arquitectura de microservicios desarrollada con **Java**, **Spring Boot 3**, **Spring Security (JWT)**, **Spring Data JPA** y **Arquitectura Hexagonal** para la gestión integral de una plazoleta de comidas (usuarios, roles, restaurantes, menús, pedidos, notificaciones PIN, trazabilidad y métricas de eficiencia).

---

## 🏗️ Arquitectura del Proyecto

El sistema está compuesto por dos microservicios independientes que se comunican y validan identidad mediante tokens **JWT (HS384)**:

1. **`usuarios-service` (Puerto `8080`)**:
   * Gestión de autenticación (`/api/v1/auth/login`).
   * Creación de usuarios con encriptación **BCrypt** y control de acceso basado en roles (`ROLE_ADMINISTRADOR`, `ROLE_PROPIETARIO`, `ROLE_EMPLEADO`, `ROLE_CLIENTE`).
2. **`plazoleta-service` (Puerto `8081`)**:
   * Gestión de restaurantes, platos, flujo completo de pedidos, generación de PIN de seguridad, historial de trazabilidad y cálculo de eficiencia por pedido y ranking de empleados.

Ambos proyectos implementan **Arquitectura Hexagonal (Ports & Adapters)** dividida en tres capas limpias:
* `domain`: Modelos de negocio puros y excepciones de dominio (`DomainException`).
* `application`: Casos de uso (puertos de entrada), puertos de salida e implementación de reglas de negocio (`Service`).
* `infrastructure`: Adaptadores REST (`Controller`, DTOs), adaptadores de persistencia JPA (`Entity`, `JpaRepository`, `JpaAdapter`) y configuración de seguridad (`SecurityConfig`, `JwtAuthenticationFilter`).

---

## ✅ Historias de Usuario Implementadas (HU-01 a HU-18)

### Módulo de Usuarios (`usuarios-service` - Puerto `8080`)
| HU | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| **HU-01** | `POST /api/v1/usuarios/propietario` | `ROLE_ADMINISTRADOR` | Crear cuenta de Propietario validando mayoría de edad. |
| **HU-05** | `POST /api/v1/auth/login` | Público | Iniciar sesión y generar token JWT con `idUsuario` y `rol`. |
| **HU-06** | `POST /api/v1/usuarios/empleado` | `ROLE_PROPIETARIO` | Crear cuenta de Empleado para el restaurante. |
| **HU-08** | `POST /api/v1/usuarios/cliente` | Público | Registro abierto para cuentas de Clientes. |

### Módulo de Plazoleta, Pedidos y Trazabilidad (`plazoleta-service` - Puerto `8081`)
| HU | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| **HU-02** | `POST /api/v1/restaurantes` | `ROLE_ADMINISTRADOR` | Crear un restaurante validando NIT, teléfono y formato de nombre. |
| **HU-03** | `POST /api/v1/platos` | `ROLE_PROPIETARIO` | Crear plato asociado a un restaurante (activo por defecto). |
| **HU-04** | `PUT /api/v1/platos/{id}` | `ROLE_PROPIETARIO` | Modificar exclusivamente precio y descripción de un plato. |
| **HU-07** | `PATCH /api/v1/platos/{id}/estado` | `ROLE_PROPIETARIO` | Habilitar o deshabilitar un plato del menú. |
| **HU-09** | `GET /api/v1/restaurantes` | Público / Cliente | Listar restaurantes paginados y ordenados alfabéticamente (`nombre`, `urlLogo`). |
| **HU-10** | `GET /api/v1/platos/restaurante/{id}` | Público / Cliente | Listar platos activos de un restaurante paginados y filtrados por categoría. |
| **HU-11** | `POST /api/v1/pedidos` | `ROLE_CLIENTE` | Crear un nuevo pedido en estado `PENDIENTE` (valida que no tenga pedidos activos). |
| **HU-12** | `GET /api/v1/pedidos` | `ROLE_EMPLEADO` | Listar pedidos del restaurante paginados y filtrados por estado. |
| **HU-13** | `PATCH /api/v1/pedidos/{id}/asignar` | `ROLE_EMPLEADO` | Asignarse a un pedido y cambiar su estado a `EN_PREPARACION`. |
| **HU-14** | `PATCH /api/v1/pedidos/{id}/listo` | `ROLE_EMPLEADO` | Marcar pedido como `LISTO`, generar PIN de 6 dígitos y notificar por SMS. |
| **HU-15** | `PATCH /api/v1/pedidos/{id}/entregar` | `ROLE_EMPLEADO` | Entregar pedido validando el PIN de seguridad y cambiar estado a `ENTREGADO`. |
| **HU-16** | `PATCH /api/v1/pedidos/{id}/cancelar` | `ROLE_CLIENTE` | Cancelar pedido si se encuentra en estado `PENDIENTE`. |
| **HU-17** | `GET /api/v1/pedidos/{id}/trazabilidad` | `ROLE_CLIENTE` | Consultar historial de estados, fechas y empleado asignado del pedido. |
| **HU-18** | `GET /api/v1/pedidos/eficiencia` | `ROLE_PROPIETARIO` | Consultar tiempo de duración por pedido y ranking de empleados por tiempo promedio. |

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Levantar `usuarios-service` (Puerto 8080)
```powershell
cd usuarios-service
.\gradlew bootRun