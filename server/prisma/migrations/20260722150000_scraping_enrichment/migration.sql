-- AlterTable companies: add slug
ALTER TABLE "companies" ADD COLUMN "slug" VARCHAR(100);

UPDATE "companies" SET "slug" = CONCAT('company-', "id") WHERE "slug" IS NULL;

ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- AlterTable products
ALTER TABLE "products" ADD COLUMN "external_sku" VARCHAR(100);

CREATE UNIQUE INDEX "products_company_id_product_url_key" ON "products"("company_id", "product_url");

-- AlterTable product_prices
ALTER TABLE "product_prices" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "product_prices" ADD COLUMN "stock_qty" INTEGER;

ALTER TABLE "product_prices" ALTER COLUMN "updated_at" DROP DEFAULT;
-- keep existing default behavior via app; re-add default for inserts without explicit value
ALTER TABLE "product_prices" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Drop @updatedAt auto-trigger behavior is Prisma-side only; no DB trigger to drop

-- AlterTable scraping_history
ALTER TABLE "scraping_history" ADD COLUMN "source" VARCHAR(100);
UPDATE "scraping_history" SET "source" = 'legacy' WHERE "source" IS NULL;
ALTER TABLE "scraping_history" ALTER COLUMN "source" SET NOT NULL;
ALTER TABLE "scraping_history" ADD COLUMN "error_message" TEXT;

CREATE INDEX "scraping_history_source_idx" ON "scraping_history"("source");
