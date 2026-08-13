# Instalación en Windows

## Requisitos

- Node.js
- npm
- Angular CLI
- Docker Desktop
- Git opcional
- Navegador web

## Infraestructura

Desde la raíz:

```powershell
docker compose up -d
```

Comprobar:

```powershell
docker compose ps
```

## Servicios Node

Cada servicio debe ejecutarse en su propia terminal:

```powershell
npm run dev
```

Servicios principales:

```text
register-service
login-service
primary-node
backup-node
gateway
```

## Frontend

```powershell
cd frontend
ng serve
```

Abrir:

```text
http://localhost:4200
```

## CloudBeaver

Abrir:

```text
http://localhost:8978
```

Permite revisar `parksafe_auth`, `parksafe_primary` y `parksafe_backup`.
