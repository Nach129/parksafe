# Arquitectura de ParkSafe

ParkSafe utiliza una arquitectura distribuida con un frontend Angular, un API Gateway, servicios de autenticación y dos nodos de procesamiento para las operaciones de estacionamiento.

## Componentes principales

```text
Angular :4200
    |
    v
API Gateway :8080
    |
    +------------------+
    |                  |
    v                  v
Primary :3003      Backup :3004
    |                  |
    v                  v
MySQL Primary      MySQL Backup

Register / Login
       |
       v
   MySQL Auth
```

## API Gateway

Es el punto único de entrada del frontend. Sus principales responsabilidades son:

- validar JWT;
- comprobar el usuario autenticado;
- determinar el nodo activo;
- reenviar solicitudes;
- ejecutar heartbeat;
- controlar failover y recuperación.

## Nodos de negocio

El nodo físico `PRIMARY` utiliza normalmente el puerto `3003` y el nodo físico `BACKUP` el puerto `3004`.

Los roles lógicos pueden cambiar:

```text
PRIMARY
STANDBY
BACKUP
```

Después de un failover, el nodo físico Backup puede asumir el rol lógico `PRIMARY`.

## Alta disponibilidad

```text
Nodo activo cae
    ↓
Heartbeat detecta fallos
    ↓
Respaldo se promueve
    ↓
Gateway cambia el destino
    ↓
La aplicación continúa funcionando
```

Cuando el nodo caído vuelve, se reintegra como STANDBY y se sincroniza desde el nodo líder.
