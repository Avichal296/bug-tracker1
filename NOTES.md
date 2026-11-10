# Implementation notes

## What I prioritized

I prioritized user-scoped database queries, safe authentication, server-side validation and the direct-to-S3 upload flow. The repository is a Turborepo with separate API and web workspaces. The API keeps routes, controllers, Prisma access, S3 operations and validation in focused modules; the React app separates pages, components, session state and API services.

Docker Compose runs PostgreSQL, the API and the web server together. GitHub Actions builds the workspaces and container images on pull requests and main branch pushes, publishes tagged images to GHCR, and provides an SSH deployment workflow for an EC2 host.



## Why PostgreSQL and Prisma

Bugs belong to users, so a relational foreign key provides a clear ownership relationship and allows the database to enforce referential integrity. PostgreSQL enums keep severity and status values consistent, while indexes support each user's newest bugs and status filters. Prisma provides a readable schema, generated query client and versioned migrations so the database can be recreated consistently across development and deployment.

## AWS deployment choice

For a first release I would deploy the API to Elastic Beanstalk and host the React build behind CloudFront with an S3 origin. Screenshots would live in a separate private bucket and be accessed only through short-lived signed requests. The API would use an instance role with access limited to its bucket and object prefix.

## If usage grew to 10,000 users

The first pressure points would likely be unpaginated lists, database load and a single API instance during traffic spikes. I would add cursor pagination and tune indexes for user, status and creation time, then run stateless API instances behind a load balancer with autoscaling. I would monitor query latency and connection pool use, add request metrics and structured logs, and move slow reporting work to a queue. Rate limits would move to shared storage such as Redis so they work consistently across API instances.

## Running status

The local app is configured to run through the root Turborepo scripts against PostgreSQL. A deployed URL is not included because no cloud account configuration was available in the workspace.
