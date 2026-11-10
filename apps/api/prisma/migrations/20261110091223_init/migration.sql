-- CreateEnum
CREATE TYPE "severity" AS ENUM ('low', 'med', 'high');

-- CreateEnum
CREATE TYPE "bug_status" AS ENUM ('open', 'in-progress', 'closed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bugs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(5000) NOT NULL DEFAULT '',
    "severity" "severity" NOT NULL DEFAULT 'med',
    "status" "bug_status" NOT NULL DEFAULT 'open',
    "image_key" VARCHAR(1024) NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bugs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "bugs_user_id_created_at_idx" ON "bugs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bugs_user_id_status_created_at_idx" ON "bugs"("user_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
