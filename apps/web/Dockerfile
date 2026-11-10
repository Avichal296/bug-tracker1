FROM node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY apps/api/prisma apps/api/prisma
COPY apps/web/package.json apps/web/package.json

RUN npm ci --include=dev

COPY apps/web apps/web

ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build --workspace=@bug-tracker/web

FROM nginx:1.27-alpine AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html

EXPOSE 80
