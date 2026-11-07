# Local Development Guide

This guide explains how to run BDMS during development on Windows. It covers native development, Docker Compose, environment configuration, and common troubleshooting steps.

## 1. Development Options

BDMS supports two ways to run the application:

| Option | How it runs | Best used for |
|---|---|---|
| Native development | Frontend and backend run directly on Windows; PostgreSQL can run locally or in Docker | Daily coding and hot reload |
| Docker Compose | Frontend, backend, and PostgreSQL run in containers | Testing the containerized application |

**Recommended development workflow:** Use native development when actively editing frontend or backend code. Use Docker Compose when checking that the complete containerized application works.

## 2. Required Software

Install the following:

- Node.js and npm
- Git
- Docker Desktop (for Docker-based development)
- PostgreSQL, if not using the Docker PostgreSQL service
- Visual Studio Code or another code editor

## 3. Native Development

In native development, the frontend and backend run as separate processes on Windows.

### 3.1 Start PostgreSQL

Make sure PostgreSQL is running and that the database configured in `server/.env` is accessible.

You can use the PostgreSQL service installed on Windows or start only the database container through Docker Compose:

```powershell
docker compose up -d db
```

When using the Compose database from Windows, connect through:

- Host: `localhost`
- Port: `5433`
- Database: `bdms_db`
- Username: `postgres`

The password must match the Compose configuration.

### 3.2 Configure the Backend

The backend reads its environment variables from `server/.env`.

Required variables:

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_value
JWT_EXPIRES_IN=1d
```

Use the actual database connection string and secret values for your environment. Do not commit real credentials or secrets to Git.

The backend uses:

- Default port: `5000`
- Development command: `npm run dev`
- Build command: `npm run build`

Open a terminal:

```powershell
cd C:\Users\RENZ\Desktop\BDMS\server
npm ci
npm run dev
```

Keep this terminal running.

### 3.3 Configure the Frontend

The frontend reads its API base URL from `client/.env.development`.

The current configuration in the project is:

```env
VITE_API_URL=http://localhost:5001/api
```

**Important: Choose the API URL according to which backend you are running.**

| Backend setup | Frontend API URL |
|---|---|
| Native backend on Windows | `http://localhost:5000/api` |
| Backend running through Docker Compose | `http://localhost:5001/api` |

The current frontend environment file points to the Docker-published backend port (`5001`). If you are running the backend natively, change the value to `http://localhost:5000/api` for that development session.

Open another terminal:

```powershell
cd C:\Users\RENZ\Desktop\BDMS\client
npm ci
npm run dev
```

Vite normally starts on `http://localhost:5173`.

Keep this terminal running.

### 3.4 Native Development URLs

| Service | Address |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |
| Backend API base | `http://localhost:5000/api` |

If the backend is running through Docker instead, its host address is `http://localhost:5001`.

## 4. Docker Compose Development

Docker Compose starts the database, backend, and frontend containers together.

The project uses the root `compose.yaml` file.

### 4.1 Environment Configuration

The root `.env` file supplies Compose variables, including:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional; defaults to `1d`)

Do not commit real secrets or share their values in screenshots or logs.

### 4.2 Validate the Compose Configuration

From the project root:

```powershell
docker compose config
```

This checks the Compose configuration and variable substitution.

### 4.3 Start the Containers

```powershell
docker compose up -d --build
```

This builds the images when necessary and starts the services in the background.

### 4.4 Check Container Status

```powershell
docker compose ps
```

The expected services are:

- `db`
- `backend`
- `frontend`

The database has a health check, and the backend waits for the database to become healthy.

### 4.5 Docker Service Addresses

| Service | Windows host address | Container address |
|---|---|---|
| Frontend | `http://localhost:5173` | Nginx port `80` |
| Backend | `http://localhost:5001` | Port `5000` |
| PostgreSQL | `localhost:5433` | Port `5432` |

Inside the Compose network, the backend connects to PostgreSQL using the service hostname `db` and port `5432`.

The Docker frontend uses `/api` as its API base URL. Nginx forwards API requests to the backend service at `backend:5000`.

### 4.6 View Logs

All services:

```powershell
docker compose logs
```

Follow logs continuously:

```powershell
docker compose logs -f
```

Backend only:

```powershell
docker compose logs -f backend
```

Frontend only:

```powershell
docker compose logs -f frontend
```

Database only:

```powershell
docker compose logs -f db
```

### 4.7 Stop the Containers

```powershell
docker compose down
```

This stops and removes the Compose containers and network. The external database volume `bdms-postgres-data` is retained.

**Database safety:** Do not use `docker compose down -v` as a routine cleanup command. Removing volumes can destroy database data.

## 5. Important Development Differences

### Native Development

- Vite serves the frontend directly.
- The Express backend runs through its development script.
- Frontend changes are reflected through Vite's development server.
- Backend changes are watched by the development script.
- The frontend API URL must match the backend's Windows host port.

### Docker Compose

- The frontend is built into static files and served by Nginx.
- The backend runs using its production Docker image.
- The frontend uses Nginx to forward `/api` requests.
- Source-code changes require rebuilding the relevant image.

Rebuild after frontend changes:

```powershell
docker compose up -d --build frontend
```

Rebuild after backend changes:

```powershell
docker compose up -d --build backend
```

Rebuild all services:

```powershell
docker compose up -d --build
```

## 6. Troubleshooting

### 6.1 Vite Uses Port 5174 Instead of 5173

Vite may select another port when the default port is already occupied.

Check the common development ports:

```powershell
Get-NetTCPConnection -LocalPort 5173,5174,5175 -State Listen -ErrorAction SilentlyContinue
```

Inspect the process using a port:

```powershell
Get-Process -Id PROCESS_ID
```

Replace `PROCESS_ID` with the actual process ID.

Only stop a process after confirming that it is an old or unnecessary development process:

```powershell
Stop-Process -Id PROCESS_ID -Force
```

Avoid running multiple frontend development servers unintentionally.

### 6.2 CORS Errors

The backend currently allows these frontend origins:

- `http://localhost:5173`
- `http://localhost:5174`

If Vite starts on another port, the backend may reject browser requests because that origin is not allowed.

Check the frontend address in the Vite terminal and compare it with the allowed origins in `server/src/app.ts`.

### 6.3 Failed to Fetch

Check the following:

1. Is the backend running?
2. Is the frontend using the correct `VITE_API_URL`?
3. Is the backend listening on the expected port?
4. Is the database accessible?
5. Is the browser reporting a CORS error?

Remember the port difference:

- Native backend: `5000`
- Docker backend from Windows: `5001`

### 6.4 Login Returns 401 Unauthorized

A `401 Unauthorized` response means the server rejected the authentication request.

Check:

- Whether the account credentials are correct.
- Whether the account is active.
- Whether the backend is connected to the intended database.
- Whether the login request reaches the correct backend.

Use the browser's Developer Tools → Network tab to inspect the login request and response.

Do not put real account passwords or authentication tokens in documentation or screenshots.

### 6.5 Environment Variable Changes Are Not Reflected

After changing frontend environment variables, restart the Vite development server.

For Docker, rebuild the frontend image when changing its build-time API URL or frontend source.

For backend environment changes, restart the backend process or recreate the backend container as appropriate.

## 7. Useful Commands

| Purpose | Command |
|---|---|
| Validate Compose | `docker compose config` |
| Start Compose services | `docker compose up -d` |
| Build and start services | `docker compose up -d --build` |
| Check containers | `docker compose ps` |
| View logs | `docker compose logs -f` |
| Stop containers | `docker compose down` |
| Start only PostgreSQL | `docker compose up -d db` |
| Start backend development server | `npm run dev` |
| Build backend | `npm run build` |
| Start frontend development server | `npm run dev` |
| Build frontend | `npm run build` |

Run npm commands from the appropriate `server` or `client` directory.

## 8. Database and Data Safety

Before running database migrations or other operations that change data:

1. Confirm the current Git branch.
2. Confirm which database the backend is connected to.
3. Verify the database host, port, and name.
4. Back up important data before schema-changing operations.
5. Review the migration or database command before executing it.
6. Verify the application and database after the operation.

Use a separate test database for experiments involving schema changes or stock mutations.

Avoid running destructive database commands against a database containing important business data.

## 9. Related Documentation

- [Architecture Reference](../ARCHITECTURE.md)
- [Development Guide](./development-guide.md)
- [Feature Status](./feature-status.md)
- [Backlog](./backlog.md)
- [Docker Environment](../ARCHITECTURE.md)

This guide describes the current inspected development configuration. If ports, environment variables, Docker services, or CORS settings change, update this document to match the actual source configuration.