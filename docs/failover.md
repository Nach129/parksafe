# Failover y recuperación

ParkSafe utiliza heartbeat desde el API Gateway para supervisar los nodos de negocio.

## Funcionamiento normal

```text
3003 → PRIMARY
3004 → BACKUP
Gateway → PRIMARY
```

## Failover

Si el nodo activo deja de responder durante el número configurado de comprobaciones:

```text
3003 cae
    ↓
Heartbeat detecta los fallos
    ↓
3004 se promueve a PRIMARY
    ↓
Gateway cambia el nodo activo a BACKUP
    ↓
Las solicitudes continúan en 3004
```

## Recuperación

Si 3003 vuelve después del failover:

```text
3003 vuelve como PRIMARY
    ↓
Gateway detecta posible split-brain
    ↓
3003 se cambia a STANDBY
    ↓
Se obtiene snapshot desde 3004
    ↓
3003 se sincroniza
```

Estado final:

```text
3003 → ACTIVE / STANDBY
3004 → ACTIVE / PRIMARY
Gateway → BACKUP
```

No se realiza failback automático hacia 3003.

## Split-brain

Si ambos nodos declaran simultáneamente rol `PRIMARY`, el sistema detecta el conflicto y evita seleccionar arbitrariamente dos líderes. Durante la recuperación, 3003 es degradado a STANDBY y resincronizado.
