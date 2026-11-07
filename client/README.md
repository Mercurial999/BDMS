# BDMS Frontend

This folder contains the React, TypeScript, and Vite frontend for the Bakery Distribution Management System.

## Development

From this folder:

```powershell
npm install
npm run dev
```

Run frontend checks with:

```powershell
npm run lint
npm run build
```

Configure `VITE_API_URL` in the appropriate local environment file. For native development, it should point to the running backend API (commonly `http://localhost:5000/api`). The Docker frontend build uses the Compose-provided `/api` path through Nginx.

## Project guidance

- [Repository overview](../README.md)
- [Development guide](../docs/development-guide.md)
- [Architecture](../ARCHITECTURE.md)
- [Local development and Docker](../docs/local-development.md)

Do not add Axios or duplicate token/header handling; use the existing native-fetch API helper and frontend service conventions.