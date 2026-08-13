# API de ParkSafe

El frontend utiliza el API Gateway como punto único de acceso.

Base local:

```text
http://localhost:8080
```

## Autenticación

```text
POST /api/auth/register
POST /api/auth/login
```

## Vehículos

```text
GET  /api/vehicles
POST /api/vehicles
```

Estas operaciones trabajan con el usuario autenticado mediante JWT.

## Estacionamiento

```text
GET /api/parking/status
GET /api/parking/spaces
GET /api/parking/spaces/:id
```

## Reservas

```text
GET  /api/parking/reservations
POST /api/parking/reservations
```

El GET obtiene las reservas del usuario autenticado.

El POST valida que el vehículo pertenezca al usuario y envía la solicitud al nodo activo.

## Sistema

```text
GET /api/system/status
```

Entrega información sobre:

- nodo activo;
- heartbeat;
- estado de Primary;
- estado de Backup;
- failover;
- servicios disponibles.

## Endpoints internos de los nodos

Los nodos utilizan además endpoints internos como:

```text
GET  /health
POST /promote
POST /demote
GET  /snapshot
POST /sync
POST /replication
```

Estos endpoints apoyan la disponibilidad, replicación y recuperación del sistema.
