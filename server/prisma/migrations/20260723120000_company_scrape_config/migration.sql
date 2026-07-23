-- AlterTable
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "scrape_config" JSONB;
