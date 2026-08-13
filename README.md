# ParkSafe

ParkSafe es una aplicación distribuida para la gestión y reserva de espacios de estacionamiento.

El sistema permite registrar usuarios y vehículos, consultar la disponibilidad de estacionamientos, realizar reservas y mantener la operación disponible ante la caída del nodo principal mediante mecanismos de replicación, heartbeat, failover y recuperación automática.

---

## Características principales

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Protección de rutas privadas.
- Registro y consulta de vehículos.
- Consulta de estacionamientos y espacios disponibles.
- Reserva automática del primer espacio disponible del estacionamiento seleccionado.
- Prevención de reservas concurrentes mediante transacciones y `SELECT ... FOR UPDATE`.
- API Gateway como punto único de entrada.
- Nodo principal y nodo de respaldo.
- Replicación de reservas entre nodos.
- Heartbeat automático.
- Failover automático.
- Promoción del nodo de respaldo.
- Recuperación automática del nodo principal.
- Corrección de posibles escenarios de split-brain.
- Resincronización mediante snapshots.
- Interfaz web desarrollada en Angular.
- Administración gráfica de las bases de datos mediante CloudBeaver.

---

## Arquitectura general

```text
                    +-------------------+
                    |      Angular      |
                    |       :4200       |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |    API Gateway    |
                    |       :8080       |
                    +---------+---------+
                              |
                 +------------+------------+
                 |                         |
                 v                         v
        +----------------+        +----------------+
        | Primary Node   |        | Backup Node    |
        | :3003          |        | :3004          |
        +--------+-------+        +--------+-------+
                 |                         |
                 v                         v
        +----------------+        +----------------+
        | MySQL Primary  |        | MySQL Backup   |
        +----------------+        +----------------+

                 Autenticación
                      |
          +-----------+-----------+
          |                       |
          v                       v
   Register Service         Login Service
          \                       /
           \                     /
            +---------+---------+
                      |
                      v
                +------------+
                | MySQL Auth |
                +------------+
```

El frontend nunca se conecta directamente a los nodos de negocio. Todas las solicitudes pasan por el API Gateway, que determina qué nodo se encuentra activo.

---

## Tecnologías utilizadas

### Frontend

- Angular
- TypeScript
- HTML
- CSS

### Backend

- Node.js
- Express
- JWT
- Axios

### Base de datos

- MySQL 8.4

### Infraestructura

- Docker
- Docker Compose
- CloudBeaver

---

## Estructura principal

```text
parksafe/
├── database/
│   ├── auth/
│   ├── primary/
│   ├── backup/
│   └── dumps/
├── docs/
├── frontend/
├── gateway/
├── services/
│   ├── primary-node/
│   ├── backup-node/
│   ├── login-service/
│   └── register-service/
├── docker-compose.yml
└── README.md
```

---

## Bases de datos

ParkSafe utiliza tres bases de datos MySQL independientes.

### `parksafe_auth`

Almacena:

- usuarios;
- vehículos.

### `parksafe_primary`

Base operacional asociada al nodo principal.

Contiene:

- estacionamientos;
- espacios;
- movimientos de estacionamiento;
- operaciones de replicación.

### `parksafe_backup`

Base operacional asociada al nodo de respaldo.

Mantiene una copia sincronizada de la información operacional necesaria para continuar funcionando durante un failover.

---

## Datos de demostración

El entorno actual utiliza tres estacionamientos:

```text
Estacionamiento Principal
A-01 ... A-10

Estacionamiento Secundario
B-01 ... B-10

Estacionamiento Demo
C-01 ... C-10
```

Total configurado:

```text
30 espacios
```

La cantidad exacta de espacios disponibles y reservados puede cambiar durante las pruebas.

---

## Flujo de reserva

```text
Usuario selecciona estacionamiento
        ↓
Selecciona uno de sus vehículos
        ↓
Angular envía la solicitud
        ↓
API Gateway valida JWT
        ↓
Gateway valida que el vehículo pertenezca al usuario
        ↓
Solicitud enviada al nodo activo
        ↓
Se busca el primer espacio DISPONIBLE
        ↓
SELECT ... FOR UPDATE
        ↓
Se reserva el espacio
        ↓
Se registra el movimiento
        ↓
Se registra la operación de replicación
        ↓
COMMIT
        ↓
Replicación hacia el nodo STANDBY
```

---

## Alta disponibilidad

ParkSafe implementa heartbeat desde el API Gateway.

Si el nodo principal deja de responder:

```text
PRIMARY cae
    ↓
Heartbeat detecta los fallos
    ↓
BACKUP se promueve a PRIMARY
    ↓
Gateway cambia el nodo activo
    ↓
La aplicación continúa funcionando
```

Cuando el nodo principal vuelve:

```text
3003 vuelve
    ↓
Gateway detecta posible split-brain
    ↓
3003 cambia a STANDBY
    ↓
Se obtiene snapshot desde el líder
    ↓
3003 se sincroniza
    ↓
El nodo recuperado queda disponible como STANDBY
```

Después del failover no se realiza failback automático.

---

## Puertos principales

| Servicio | Puerto |
|---|---:|
| Angular | 4200 |
| API Gateway | 8080 |
| Primary Node | 3003 |
| Backup Node | 3004 |
| MySQL Auth | 3306 |
| MySQL Primary | 3307 |
| MySQL Backup | 3308 |
| CloudBeaver | 8978 |

---

## Inicio del entorno

### Infraestructura Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Para comprobar los contenedores:

```bash
docker compose ps
```

---

## Servicios Node.js

Cada servicio se ejecuta desde su propia carpeta con:

```bash
npm run dev
```

Servicios principales:

- `register-service`
- `login-service`
- `primary-node`
- `backup-node`
- `gateway`

---

## Frontend Angular

Desde:

```text
frontend/
```

ejecutar:

```bash
ng serve
```

La aplicación queda disponible en:

```text
http://localhost:4200
```

---

## CloudBeaver

CloudBeaver permite administrar gráficamente las tres bases MySQL desde una única interfaz.

Dirección:

```text
http://localhost:8978
```

Conexiones configuradas:

```text
mysql-auth
mysql-primary
mysql-backup
```

---

## Respaldo de datos

El proyecto utiliza dumps SQL para conservar una copia del estado actual de las bases de datos.

Directorio:

```text
database/dumps/
```

Archivos utilizados:

```text
parksafe_auth.sql
parksafe_primary.sql
parksafe_backup.sql
```

Estos respaldos permiten conservar usuarios, vehículos, estacionamientos, espacios, reservas, movimientos y operaciones para facilitar la portabilidad del proyecto entre equipos.

Los archivos `init.sql` se utilizan para crear una instalación inicial, mientras que los dumps permiten conservar el estado actual del entorno de demostración.

---

## Pantallas principales

```text
/login
/registro
/inicio
/vehiculos
/estacionamiento
/mis-reservas
/estado-sistema
```

### Inicio

Muestra el resumen general de disponibilidad y el estado básico del sistema distribuido.

### Mis vehículos

Permite consultar y registrar vehículos.

### Estacionamiento

Permite seleccionar un estacionamiento, consultar sus espacios y realizar una reserva.

### Mis reservas

Muestra las reservas pertenecientes al usuario autenticado y el nodo que procesó cada operación.

### Estado del sistema

Permite observar:

- nodo activo;
- estado del nodo principal;
- estado del nodo de respaldo;
- roles actuales;
- heartbeat;
- failover;
- flujo de solicitudes.

---

## Seguridad

- Autenticación mediante JWT.
- Contraseñas almacenadas mediante hash.
- Validación de propiedad del vehículo antes de reservar.
- Guards en rutas privadas de Angular.
- El identificador del usuario se obtiene desde el token y no se confía directamente en datos enviados desde el frontend.

---

## Documentación adicional

La documentación detallada del proyecto se encuentra en:

```text
docs/
```

La documentación se organiza en archivos separados para mantener el README principal simple y fácil de consultar.

La separación prevista es:

```text
docs/
├── arquitectura.md
├── base-de-datos.md
├── api.md
├── failover.md
├── instalacion-windows.md
├── instalacion-macos.md
├── respaldo-restauracion.md
└── demo.md
```

Cada archivo desarrolla en mayor profundidad su tema correspondiente.

---

## Estado general

ParkSafe integra:

```text
Angular
API Gateway
JWT
MySQL
Docker
transacciones
FOR UPDATE
replicación
heartbeat
failover
snapshot
sincronización
recuperación automática
prevención de split-brain
CloudBeaver
```

El objetivo principal es mantener disponible el sistema de reservas incluso ante la caída de uno de los nodos de procesamiento.
