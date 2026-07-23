ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(100);
UPDATE "companies" SET "slug" = CONCAT('company-', "id") WHERE "slug" IS NULL OR "slug" = '';
ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "companies_slug_key" ON "companies"("slug");

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "external_sku" VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS "products_company_id_product_url_key" ON "products"("company_id", "product_url");

ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "stock_qty" INTEGER;

ALTER TABLE "scraping_history" ADD COLUMN IF NOT EXISTS "source" VARCHAR(100);
UPDATE "scraping_history" SET "source" = 'legacy' WHERE "source" IS NULL;
ALTER TABLE "scraping_history" ALTER COLUMN "source" SET NOT NULL;
ALTER TABLE "scraping_history" ADD COLUMN IF NOT EXISTS "error_message" TEXT;
CREATE INDEX IF NOT EXISTS "scraping_history_source_idx" ON "scraping_history"("source");
