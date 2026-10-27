# BDMS Docker and Development Environment Guide

## 1. Purpose

This guide explains how to develop, test, and run the Bakery Distribution Management System (BDMS) using two separate workflows:

1. **Local Development Mode** — run the frontend and backend directly on Windows for faster development and debugging.
2. **Docker Mode** — run the frontend, backend, and PostgreSQL using Docker Compose to verify the containerized application.

The recommended workflow is to develop and test changes locally first, then rebuild and test them in Docker.

**Important:** The local and Docker workflows can use different API URLs and database connection settings. Always verify which environment you are using before running migrations or modifying data.

## 2. Project Structure

The repository contains the following relevant files:

```text
BDMS/
├── client/
│   ├── .env.development
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── server/
│   ├── .env
│   ├── Dockerfile
│   ├── prisma/
│   └── src/
├── docs/
│   └── docker-environment.md
├── compose.yaml
└── .env
```

Environment files may contain passwords, database URLs, and authentication secrets. Do not commit them or share their secret values.

## 3. Workflow A — Local Development Mode

In local development mode, Vite runs the frontend and Node.js runs the Express backend directly on Windows.

### 3.1 Start PostgreSQL

You may use the PostgreSQL container as the database while running the frontend and backend locally.

From the repository root:

```powershell
# Start the PostgreSQL service without rebuilding the application.
docker compose up -d db

# Confirm the database container is running and healthy.
docker ps --filter "name=bdms-postgres"

# Check PostgreSQL readiness.
docker exec bdms-postgres pg_isready -U postgres -d bdms_db
```

The PostgreSQL container listens on port `5432` internally and is published on Windows port `5433`.

If the database is already running, you do not need to start it again.

### 3.2 Configure the local backend

The backend loads environment variables through `dotenv/config` and requires:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

The backend defaults to port `5000` unless the `PORT` environment variable overrides it.

For local development, ensure that `server/.env` points to the intended database. If you use the PostgreSQL container, the database host from Windows is `localhost` and the published port is `5433`.

A typical connection URL has this structure:

```text
postgresql://USER:PASSWORD@localhost:5433/DATABASE_NAME
```

Use the actual credentials and database name configured for your environment. Do not copy this example literally without checking your settings.

### 3.3 Start the backend

Open a PowerShell terminal at the repository root:

```powershell
# Move into the backend project.
cd .\server

# Start the backend with automatic restart during development.
npm run dev
```

With the default configuration, the backend listens on:

```text
http://localhost:5000
```

Keep this terminal running.

### 3.4 Configure the local frontend API URL

The current `client/.env.development` contains:

```env
VITE_API_URL=http://localhost:5001/api
```

This points the local frontend to the Docker-published backend port, not to the default local backend port.

For a fully local frontend/backend workflow, use:

```env
VITE_API_URL=http://localhost:5000/api
```

This is a local development configuration change. It does not change the Docker frontend configuration, which uses `/api` during its production build.

If you change a Vite environment file, restart the Vite development server so the new value is loaded.

### 3.5 Start the frontend

Open another PowerShell terminal at the repository root:

```powershell
# Move into the frontend project.
cd .\client

# Start the Vite development server.
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

The browser should send API requests to the URL configured by `VITE_API_URL`.

### 3.6 Local development checklist

- PostgreSQL is running and healthy.
- `server/.env` points to the intended database.
- The backend is listening on the expected port.
- `client/.env.development` points to the correct backend URL.
- The frontend and backend terminals remain running.
- The browser can log in and load the expected data.

The current Vite configuration does not define a development API proxy. The frontend therefore calls the configured API URL directly.

## 4. Workflow B — Docker Mode

Docker mode runs the frontend, backend, and database in containers.

The current Compose configuration uses these host ports:

| Service | Host address | Container port |
|---|---|---|
| Frontend | `http://localhost:5173` | `80` |
| Backend | `http://localhost:5001` | `5000` |
| PostgreSQL | `localhost:5433` | `5432` |

The frontend uses `VITE_API_URL=/api`. Nginx forwards `/api` requests to `backend:5000` inside the Compose network.

The backend connects to PostgreSQL using `db:5432`, which is the internal Compose service address. Do not replace that address with `localhost` inside the backend container.

### 4.1 Inspect the current containers

From the repository root:

```powershell
# Show running containers and their published ports.
docker ps

# Show all containers, including stopped containers.
docker ps -a

# Show services known to the current Compose project.
docker compose ps
```

`docker ps` lists running Docker containers even if they were started through a different Compose project. If `docker compose ps` shows no services while `docker ps` lists the BDMS containers, investigate the Compose project and configuration before starting another stack.

### 4.2 Start or rebuild Docker

```powershell
# Build images if necessary and start the Compose services.
docker compose up -d --build

# Confirm the running containers and ports.
docker ps

# Inspect the Compose service status.
docker compose ps
```

Open:

```text
http://localhost:5173
```

The `--build` option rebuilds images using the current source files and Docker build configuration.

### 4.3 Rebuild only the service you changed

After changing frontend code:

```powershell
# Rebuild and recreate the frontend service.
docker compose up -d --build frontend
```

After changing backend code:

```powershell
# Rebuild and recreate the backend service.
docker compose up -d --build backend
```

If a change affects multiple services, rebuild the relevant services together or rebuild the full stack.

### 4.4 View logs

```powershell
# Follow backend logs.
docker compose logs -f backend

# Follow frontend logs.
docker compose logs -f frontend

# Follow PostgreSQL logs.
docker compose logs -f db

# Follow logs from every Compose service.
docker compose logs -f
```

Press `Ctrl+C` to stop following logs. This does not stop the containers.

## 5. Local Development Mode vs. Docker Mode

| Detail | Local development | Docker |
|---|---|---|
| Frontend runtime | Vite development server | Nginx serving the production build |
| Backend runtime | Node.js with `tsx watch` | Node.js inside a container |
| Frontend API URL | `http://localhost:5000/api` for the recommended fully local setup | `/api` |
| Backend port | `5000` by default | `5000` inside the container, published as `5001` |
| Database hostname | `localhost` when connecting to the published PostgreSQL port | `db` inside the Compose network |
| PostgreSQL port | `5433` if using the Docker database | `5432` internally, published as `5433` |
| Code changes | Usually reload automatically | Rebuild the affected image and recreate the service |

**Important:** The local frontend configuration currently points to `localhost:5001`, which targets the Docker backend's published port. Change it to `localhost:5000` for the fully local workflow described above.

## 6. Environment Variables and API Configuration

### Root `.env`

The root environment file supplies variables used by Docker Compose, including:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Compose also supplies `DATABASE_URL` directly to the backend container, using the internal hostname `db`.

### Backend `server/.env`

The backend loads its environment variables through `dotenv/config`. It requires:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

The local backend's port defaults to `5000`; `PORT` can override this default if deliberately configured.

### Frontend `client/.env.development`

The frontend uses `VITE_API_URL` to determine where API requests go.

For fully local development:

```env
VITE_API_URL=http://localhost:5000/api
```

For the Docker production build, Compose supplies:

```text
VITE_API_URL=/api
```

Vite variables are embedded in the frontend build and must never contain passwords, JWT secrets, or other private credentials.

## 7. Database Persistence and Safety

The PostgreSQL service uses an external named volume:

```text
bdms-postgres-data
```

The volume is mounted at:

```text
/var/lib/postgresql
```

This volume is intended to preserve PostgreSQL data when containers are recreated.

### Safe inspection commands

```powershell
# Inspect the existing database volume.
docker volume inspect bdms-postgres-data

# Check whether PostgreSQL is ready.
docker exec bdms-postgres pg_isready -U postgres -d bdms_db

# Open an interactive PostgreSQL session.
docker exec -it bdms-postgres psql -U postgres -d bdms_db
```

Inside `psql`, use read-only queries when you only need to inspect the database:

```sql
SELECT current_database(), version();
```

Exit `psql` with:

```text
\q
```

### Database safety rules

- Do not run `docker compose down -v`.
- Do not remove `bdms-postgres-data`.
- Do not run `docker volume rm bdms-postgres-data`.
- Do not run `prisma migrate reset` against a database containing data you need.
- Do not assume local development and Docker point to the same database.
- Back up important data before migrations or other risky database operations.

Stopping or recreating an application container is different from deleting the database volume. Always verify the target database before performing a data-changing operation.

## 8. Prisma and Database Migrations

Run Prisma commands only after confirming which database the backend configuration targets.

Before a migration:

1. Confirm the active Git branch.
2. Inspect the relevant Prisma schema changes.
3. Verify the database host, port, and database name without exposing credentials.
4. Back up important data.
5. Use the project's existing migration workflow.
6. Verify the resulting schema and application behavior.

Do not use a database reset as a routine way to update Docker or rebuild the application.

If Prisma reports an engine or connection error, diagnose that error before attempting database-changing commands.

## 9. Common Docker Commands

```powershell
# Start services in the background.
docker compose up -d

# Rebuild images and start services.
docker compose up -d --build

# Stop services without deleting the database volume.
docker compose down

# Show running containers.
docker ps

# Show container logs.
docker compose logs -f

# Show backend logs.
docker compose logs -f backend

# Show frontend logs.
docker compose logs -f frontend

# Show database logs.
docker compose logs -f db

# Restart a service.
docker compose restart backend

# Rebuild a single service.
docker compose up -d --build backend
```

If containers were started under a different Compose project, first identify that project and its configuration. Do not start duplicate services or remove containers blindly.

## 10. Recommended Phase 2 Workflow

Use this process for each Phase 2 feature:

1. **Inspect:** Review the relevant files, current architecture, and existing implementation.
2. **Plan:** Define the smallest safe change and identify any database impact.
3. **Develop locally:** Run the frontend and backend locally and use the intended database.
4. **Test locally:** Verify the feature and related existing functionality.
5. **Review Git:** Inspect `git diff` and `git status`; commit only intended changes.
6. **Build and test Docker:** Rebuild the affected service or services.
7. **Verify the Docker application:** Test login, the changed feature, and related existing modules.
8. **Update documentation:** Record the completed work in the appropriate project documentation and progress tracker.

Keep Phase 2 changes isolated on the appropriate development branch and avoid unrelated changes.

## 11. Troubleshooting Checklist

### Frontend cannot reach the backend

- Check the value of `VITE_API_URL` for the active frontend mode.
- Confirm the backend is running on the expected port.
- Check whether the frontend is using the local backend or the Docker backend.
- Inspect browser developer tools and backend logs.
- Remember that Vite has no configured API proxy in the current setup.

### Docker frontend loads but API requests fail

- Check `docker compose ps` and `docker ps`.
- Review frontend Nginx configuration.
- Confirm Nginx forwards `/api` to `backend:5000`.
- Review backend logs.
- Verify that the backend can reach PostgreSQL through `db:5432`.

### PostgreSQL is unavailable

- Check `docker ps` for the database container.
- Run `docker exec bdms-postgres pg_isready -U postgres -d bdms_db`.
- Inspect database logs.
- Verify the intended database connection settings.
- Do not remove or recreate the data volume as a troubleshooting shortcut.

### Docker is showing old frontend or backend code

- Confirm that the expected source files are saved.
- Rebuild the affected service with `docker compose up -d --build frontend` or `docker compose up -d --build backend`.
- Inspect logs and test again.
- If the running containers do not belong to the current Compose project, identify their origin before changing them.

## 12. Maintenance

Keep this document updated when the following change:

- Compose service names or port mappings.
- Frontend API configuration.
- Backend environment variables.
- Database volume configuration.
- Dockerfiles or Nginx routing.
- Database migration procedures.

Do not record real passwords, JWT secrets, or complete private database URLs in this document or in Git.