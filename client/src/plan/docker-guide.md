# BDMS Docker Guide

## 1. The three ways to run BDMS

Keep these workflows distinct:

| Workflow | Purpose | How it runs |
|---|---|---|
| Native local development | Day-to-day coding with fast feedback | Run PostgreSQL, backend with `npm run dev`, and frontend with `npm run dev` in separate terminals |
| Current Docker Compose runtime | Run the frontend, backend, and PostgreSQL together in containers | Root `compose.yaml` |
| Future production deployment | Run a reviewed, secured, production-configured release | To be defined separately when a deployment target is chosen |

The current `compose.yaml` builds the frontend into static files served by Nginx and runs the backend's production Docker image. It is therefore a containerized integration/runtime workflow, not a hot-reload development Compose setup.

## 2. Native local development (recommended for active coding)

This is the simplest workflow when changing frontend or backend source code.

### Start PostgreSQL

Start the local PostgreSQL service/container configured for your development database. Confirm the host, port, database name, username, and password match `server/.env`.

### Start the backend

In PowerShell terminal 1:

```powershell
cd .\server
npm run dev
```

The backend development script uses `tsx watch` and normally listens on port `5000`.

### Start the frontend

In PowerShell terminal 2:

```powershell
cd .\client
npm run dev
```

Vite prints the local URL (commonly `http://localhost:5173`). The frontend environment should point to the local API, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart the relevant development server after changing environment variables.

## 3. Current Docker Compose workflow

The repository-root `compose.yaml` currently defines:

- `db`: PostgreSQL 18, host port `5433` mapped to container port `5432`.
- `backend`: backend container, host port `5001` mapped to container port `5000`, connects to PostgreSQL through Compose service hostname `db`.
- `frontend`: Nginx-served frontend, host port `5173` mapped to container port `80`, built with `VITE_API_URL=/api`.
- Named volume `bdms-postgres-data`, currently declared external. It must already exist before Compose can use it.

The file expects `POSTGRES_PASSWORD` and `JWT_SECRET` from the Compose environment. Keep them in a local ignored environment file or another secure environment-injection mechanism. Never put real secrets in this guide or commit them.

Run commands from the repository root:

```powershell
# Check the resolved Compose configuration (review output for secrets before sharing it).
docker compose config

# Start/recreate the database, backend, and frontend.
docker compose up -d

# Check service/container status.
docker compose ps

# Follow logs for all services.
docker compose logs -f

# Follow logs for one service.
docker compose logs -f backend

# Rebuild images and recreate containers after source or Dockerfile changes.
docker compose up -d --build

# Stop and remove containers/network; named database volume is retained.
docker compose down
```

Open the containerized frontend at `http://localhost:5173`. The containerized backend is exposed on `http://localhost:5001`.

### Important volume warning

The Compose file declares `bdms-postgres-data` as an external volume. `docker compose down` does not remove it. Do not use `docker compose down -v` or remove the volume unless you intentionally want to delete the database data and have a verified backup.

### When UI changes do not appear

The frontend Dockerfile builds the React app into static files during image build. Editing local source does not update the running Nginx container automatically. Rebuild and recreate the frontend image:

```powershell
docker compose up -d --build frontend
```

For backend changes, rebuild/recreate the backend:

```powershell
docker compose up -d --build backend
```

If shared dependencies, Dockerfiles, or Compose configuration change, rebuild the relevant services (or use `docker compose up -d --build`).

## 4. Avoid port and database confusion

Native local development and Compose can use different host ports:

| Service | Native local example | Current Compose host port |
|---|---:|---:|
| Frontend | Vite 5173 (or next available port) | 5173 |
| Backend | 5000 | 5001 |
| PostgreSQL | 5432 (if local PostgreSQL uses it) | 5433 |

Do not run two workflows that bind the same host port at the same time. If a port is occupied, identify which process/container owns it before changing configuration.

Inside Compose, the backend must connect to the database using `db:5432`, not `localhost:5433`. From the Windows host, database tools connect through `localhost:5433`.

## 5. Development vs production configuration

Do not turn the current Compose file into a complicated all-purpose configuration.

Recommended approach:

- Keep native local development as the default coding workflow.
- Keep the current `compose.yaml` as the current containerized local/integration runtime until its intended deployment role is explicitly decided.
- When a real production target is selected, add a separate production Compose file (for example `compose.production.yaml`) or a small override file. Do not create it prematurely.
- Keep production secrets outside Git and use deployment-managed environment variables/secrets.
- Use a separate production database and persistent volume. Never point a production deployment at the development database.
- Configure production HTTPS/reverse proxy, backups, restore testing, logging, updates, and access controls before going live.
- Pin/review image versions and database migration procedure before deployment.

The split is normal and should remain manageable as long as each workflow has one documented purpose and does not duplicate unnecessary configuration.

## 6. Current limitations / items to verify before deployment

This repository review confirmed a single root Compose file and multi-stage Dockerfiles. It did not verify a production hosting provider or a complete production operations plan.

Before using this system for real production data, verify:
- Production environment variable and secret management.
- HTTPS and public API routing.
- Database backups and a tested restore procedure.
- Persistent volume location and storage monitoring.
- Database migration execution and rollback strategy.
- Health checks and startup/readiness behavior for backend/frontend.
- Logging, monitoring, and restart/recovery behavior.
- Firewall and network exposure (especially PostgreSQL should not be publicly exposed).
- A separate production database and non-production test environment.

## 7. Safe operating reminders

- `docker compose up -d --build` rebuilds images and starts/recreates services; it does not reset the database volume.
- `docker compose down` removes containers and network but keeps the named volume.
- `docker compose down -v` can remove volumes; do not use casually.
- `docker compose logs -f` streams logs; press Ctrl+C to stop viewing logs (containers continue running).
- Never share unredacted output from `docker compose config`, `.env`, or container inspection if it includes secrets.
