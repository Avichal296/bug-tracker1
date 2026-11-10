# Bug Tracker Lite

Bug Tracker Lite is a small issue tracker built for the Evolient Full Stack Developer assignment. It is a Turborepo monorepo with a React and Tailwind web app, an Express API, PostgreSQL and Prisma ORM.

## Project structure

```text
apps/
  api/
    prisma/              Prisma schema and SQL migrations
    src/
      config/            Prisma and S3 clients
      controllers/       Authentication and bug workflows
      middleware/        JWT, rate limiting and error handling
      routes/            HTTP route definitions
      services/          S3 operations
      utils/             Request validation
  web/
    src/
      app/               Routing and session context
      components/        Shared interface components
      pages/             Login, bug list, detail and edit screens
      services/          API requests and image upload
packages/                Shared packages can be added here as the app grows
docs/
  production-monitoring-proposal.md
  paint-erp-architecture.svg
package.json             npm workspaces and Turborepo tasks
turbo.json
```

## Features

- Account registration and login with bcrypt password hashing, JWT authentication and per-IP rate limiting.
- Create, list, filter, view, edit and delete bugs. Ownership is checked on the server for every database operation.
- Private S3 screenshots uploaded directly from the browser using a short-lived pre-signed POST. File type and 5 MB size are checked by the API and the S3 upload policy.
- Short-lived signed image viewing URLs. Deleting a bug also deletes its attached S3 object.
- Prisma schema and migrations for PostgreSQL, including user ownership, enums and indexes.
- Task 2 proposal and meeting notes in [docs/production-monitoring-proposal.md](docs/production-monitoring-proposal.md).
- Task 3 ERP architecture diagram in [docs/paint-erp-architecture.svg](docs/paint-erp-architecture.svg).

## Requirements

- Node.js 22 or later
- npm 10 or later
- PostgreSQL 15 or later
- An AWS S3 bucket and credentials or an instance role for screenshot storage

## Run locally

1. Create a local PostgreSQL database named `bug_tracker_lite`.
2. Copy `apps/api/.env.example` to `apps/api/.env`. Set `DATABASE_URL` to your PostgreSQL connection string and choose a private random `JWT_SECRET`.
3. Optionally copy `apps/web/.env.example` to `apps/web/.env`. Its default API URL is `http://localhost:4100`.
4. From the repository root, install dependencies and apply the schema migration:

   ```sh
   npm install
   npm run db:migrate --workspace=@bug-tracker/api -- --name init
   npm run dev
   ```

Open the app at `http://localhost:5173`. The API listens on `http://localhost:4100`; the health endpoint is `/api/health`.

Run `npm run build` from the root to build both workspaces. `npm run db:studio --workspace=@bug-tracker/api` opens Prisma Studio.

## Docker

Run the complete stack (PostgreSQL, API and web server) with Docker Compose:

```sh
docker compose up --build
```

Open `http://localhost:8080`. Compose waits for PostgreSQL health, applies Prisma migrations when the API starts and keeps database data in a named volume. Copy `.env.example` to `.env` and set `POSTGRES_PASSWORD` and `JWT_SECRET`; add AWS settings there for S3 screenshots. The example values are for local development only.

The GitHub Actions CI workflow builds both workspaces and both Docker images on pull requests and pushes to `main`. Publishing a GitHub release, or manually running the publish workflow, builds and publishes the API and web images to GHCR. The `Deploy to EC2` workflow can then deploy a selected image tag over SSH.

For EC2 deployment, provision Docker Engine and Compose on the instance, log in to GHCR with a read-only package token, and create a private `.env` beside `docker-compose.prod.yml` with `API_IMAGE`, `WEB_IMAGE`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL` and `JWT_SECRET`. Add `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS` and `DEPLOY_PATH` as GitHub Actions secrets in the `production` environment. Publish a release image first, then run `Deploy to EC2` with that image tag. Add HTTPS through a reverse proxy/load balancer before exposing the service publicly.

## Environment and AWS security

Never commit `.env`, AWS keys or production secrets. Use an EC2 instance role in AWS and restrict its S3 permissions to the app's bucket and object prefix. Keep S3 Block Public Access enabled. Configure bucket CORS to allow the frontend origin to submit signed POST requests. Use signed GET URLs for private image viewing.

## API overview

All bug routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/health` | Liveness check |
| POST | `/api/bugs/upload-url` | Create a signed S3 upload form |
| POST | `/api/bugs` | Create a bug |
| GET | `/api/bugs?status=open` | List own bugs, optionally filtered |
| GET | `/api/bugs/:id` | Read own bug and get a signed image URL |
| PUT | `/api/bugs/:id` | Update own bug |
| DELETE | `/api/bugs/:id` | Delete own bug and attached image |

Severity values are `low`, `med` and `high`. Status values are `open`, `in-progress` and `closed`.

## Deployment status

There is no live URL in this submission because AWS and production database resources need account-specific configuration. A practical first release is the API on Elastic Beanstalk or EC2, the frontend behind CloudFront, and a separate private S3 bucket for screenshots. Configure TLS, production CORS, secrets, health checks, logs and backups before public release.
