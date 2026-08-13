# Base de datos

ParkSafe utiliza tres bases MySQL separadas.

## parksafe_auth

Almacena los datos relacionados con usuarios y vehículos.

Tablas principales:

- `usuarios`
- `vehiculos`

Las contraseñas se almacenan mediante hash y no en texto plano.

## parksafe_primary

Base operacional del nodo principal.

Tablas principales:

- `estacionamientos`
- `espacios`
- `movimientos_estacionamiento`
- `operaciones_replicacion`

## parksafe_backup

Base operacional del nodo de respaldo. Mantiene una copia sincronizada del estado necesario para continuar operando durante un failover.

## Estados

Espacios:

```text
DISPONIBLE
RESERVADO
OCUPADO
```

Movimientos:

```text
ACTIVO
COMPLETADO
CANCELADO
```

Replicación:

```text
PENDIENTE
APLICADA
```

## Datos de demostración

Actualmente existen tres estacionamientos con diez espacios cada uno:

```text
A-01 ... A-10
B-01 ... B-10
C-01 ... C-10
```

Total: **30 espacios**.
