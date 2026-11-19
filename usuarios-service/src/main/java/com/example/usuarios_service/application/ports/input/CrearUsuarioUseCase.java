package com.example.usuarios_service.application.ports.input;

import com.example.usuarios_service.domain.models.Usuario;

public interface CrearUsuarioUseCase {
    Usuario crearPropietario(Usuario usuario);
    Usuario crearEmpleado(Usuario usuario);
    Usuario crearCliente(Usuario usuario);
}