FROM node:22-alpine

WORKDIR /workspace

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY apps/api/prisma apps/api/prisma
COPY apps/web/package.json apps/web/package.json

RUN npm ci --include=dev

COPY apps/api apps/api

RUN npm run build --workspace=@bug-tracker/api

ENV NODE_ENV=production
ENV PORT=4100

EXPOSE 4100

CMD ["sh", "-c", "npm run db:deploy --workspace=@bug-tracker/api && npm run start --workspace=@bug-tracker/api"]
