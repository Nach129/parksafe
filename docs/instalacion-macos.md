# Instalación en macOS

ParkSafe puede ejecutarse en macOS utilizando las mismas tecnologías del entorno Windows.

## Requisitos

- Node.js
- npm
- Angular CLI
- Docker Desktop para Mac
- Navegador web

Docker Desktop debe corresponder a la arquitectura del equipo, incluido Apple Silicon cuando corresponda.

## Infraestructura

Desde la raíz:

```bash
docker compose up -d
```

## Servicios

En terminales independientes:

```bash
npm run dev
```

para los servicios Node principales.

## Frontend

```bash
cd frontend
ng serve
```

Abrir:

```text
http://localhost:4200
```

## Datos existentes

Los dumps ubicados en:

```text
database/dumps/
```

se utilizan como respaldo del estado actual cuando sea necesario trasladar los datos de demostración entre equipos.
