# Guía breve de demostración

## 1. Preparación

Antes de comenzar comprobar:

- Docker activo;
- MySQL Auth, Primary y Backup activos;
- servicios Node activos;
- Gateway activo;
- Angular activo;
- CloudBeaver disponible;
- al menos un espacio disponible;
- al menos un vehículo disponible para reservar.

## 2. Flujo funcional

1. Iniciar sesión.
2. Mostrar el panel Inicio.
3. Entrar a Mis vehículos.
4. Mostrar o registrar un vehículo.
5. Entrar a Estacionamiento.
6. Seleccionar un estacionamiento.
7. Seleccionar un vehículo.
8. Realizar una reserva.
9. Mostrar el espacio asignado.
10. Abrir Mis reservas.

## 3. Verificación en base de datos

En CloudBeaver comprobar:

- el espacio reservado;
- `movimientos_estacionamiento`;
- `operaciones_replicacion`;
- estado equivalente en ambos nodos.

## 4. Failover

1. Abrir Estado del sistema.
2. Detener el nodo activo.
3. Esperar la detección del heartbeat.
4. Mostrar el nodo como INACTIVE.
5. Mostrar la promoción del respaldo.
6. Comprobar que Angular continúa funcionando.

## 5. Reserva durante failover

Realizar otra reserva y comprobar que:

```text
processedBy = RESPALDO
```

## 6. Recuperación

1. Volver a levantar el nodo caído.
2. Mostrar la recuperación automática.
3. Mostrar la corrección del posible split-brain.
4. Comprobar la sincronización.
5. Confirmar el estado final:

```text
Nodo recuperado → STANDBY
Nodo sobreviviente → PRIMARY
```
