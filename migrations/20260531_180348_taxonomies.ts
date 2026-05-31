import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "neighbourhoods" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"color" varchar NOT NULL,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" uuid,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "business_categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"city_id" uuid NOT NULL,
  	"parent_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "neighbourhoods_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_categories_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_categories_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "business_categories_id" uuid;
  ALTER TABLE "neighbourhoods" ADD CONSTRAINT "neighbourhoods_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_categories" ADD CONSTRAINT "news_categories_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_categories_breadcrumbs" ADD CONSTRAINT "business_categories_breadcrumbs_doc_id_business_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."business_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_categories_breadcrumbs" ADD CONSTRAINT "business_categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_parent_id_business_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "neighbourhoods_slug_idx" ON "neighbourhoods" USING btree ("slug");
  CREATE INDEX "neighbourhoods_city_idx" ON "neighbourhoods" USING btree ("city_id");
  CREATE INDEX "neighbourhoods_updated_at_idx" ON "neighbourhoods" USING btree ("updated_at");
  CREATE INDEX "neighbourhoods_created_at_idx" ON "neighbourhoods" USING btree ("created_at");
  CREATE INDEX "news_categories_slug_idx" ON "news_categories" USING btree ("slug");
  CREATE INDEX "news_categories_city_idx" ON "news_categories" USING btree ("city_id");
  CREATE INDEX "news_categories_updated_at_idx" ON "news_categories" USING btree ("updated_at");
  CREATE INDEX "news_categories_created_at_idx" ON "news_categories" USING btree ("created_at");
  CREATE INDEX "event_categories_slug_idx" ON "event_categories" USING btree ("slug");
  CREATE INDEX "event_categories_city_idx" ON "event_categories" USING btree ("city_id");
  CREATE INDEX "event_categories_updated_at_idx" ON "event_categories" USING btree ("updated_at");
  CREATE INDEX "event_categories_created_at_idx" ON "event_categories" USING btree ("created_at");
  CREATE INDEX "business_categories_breadcrumbs_order_idx" ON "business_categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "business_categories_breadcrumbs_parent_id_idx" ON "business_categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "business_categories_breadcrumbs_doc_idx" ON "business_categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "business_categories_slug_idx" ON "business_categories" USING btree ("slug");
  CREATE INDEX "business_categories_city_idx" ON "business_categories" USING btree ("city_id");
  CREATE INDEX "business_categories_parent_idx" ON "business_categories" USING btree ("parent_id");
  CREATE INDEX "business_categories_updated_at_idx" ON "business_categories" USING btree ("updated_at");
  CREATE INDEX "business_categories_created_at_idx" ON "business_categories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_neighbourhoods_fk" FOREIGN KEY ("neighbourhoods_id") REFERENCES "public"."neighbourhoods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_categories_fk" FOREIGN KEY ("news_categories_id") REFERENCES "public"."news_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_categories_fk" FOREIGN KEY ("event_categories_id") REFERENCES "public"."event_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_business_categories_fk" FOREIGN KEY ("business_categories_id") REFERENCES "public"."business_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_neighbourhoods_id_idx" ON "payload_locked_documents_rels" USING btree ("neighbourhoods_id");
  CREATE INDEX "payload_locked_documents_rels_news_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("news_categories_id");
  CREATE INDEX "payload_locked_documents_rels_event_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("event_categories_id");
  CREATE INDEX "payload_locked_documents_rels_business_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("business_categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "neighbourhoods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_categories_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "neighbourhoods" CASCADE;
  DROP TABLE "news_categories" CASCADE;
  DROP TABLE "event_categories" CASCADE;
  DROP TABLE "business_categories_breadcrumbs" CASCADE;
  DROP TABLE "business_categories" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_neighbourhoods_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_business_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_neighbourhoods_id_idx";
  DROP INDEX "payload_locked_documents_rels_news_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_event_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_business_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "neighbourhoods_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "business_categories_id";`)
}
