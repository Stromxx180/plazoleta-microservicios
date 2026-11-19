# Plazoleta de Comidas - Frontend

Aplicación web desarrollada en **React + Vite + Tailwind CSS** para la gestión integral de una plazoleta de comidas, conectada a una arquitectura de microservicios con Spring Boot y autenticación JWT.

## Tecnologías
- **React 19** + **Vite**
- **Tailwind CSS**
- **Axios** (con interceptores para inyección automática de JWT)
- **React Router DOM**
- **Lucide React** (iconografía)

## Requisitos previos
Antes de iniciar el frontend, asegúrate de tener corriendo ambos microservicios en local:
1. `usuarios-service` en `http://localhost:8080`
2. `plazoleta-service` en `http://localhost:8081`

## Instalación y ejecución
```bash
npm install
npm run dev