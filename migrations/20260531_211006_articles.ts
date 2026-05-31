import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_provenance_source" AS ENUM('seeded', 'google-places', 'owner-edited', 'operator');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'pending', 'approved', 'published');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'aggregate-events';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'aggregate-events';
  CREATE TABLE "articles" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"dek" varchar,
  	"body" jsonb,
  	"byline" varchar,
  	"published_at" timestamp(3) with time zone,
  	"read_time" numeric,
  	"category_id" uuid,
  	"hero_image_id" uuid,
  	"source_url" varchar,
  	"provenance_source" "enum_articles_provenance_source" DEFAULT 'operator' NOT NULL,
  	"provenance_refresh_required" boolean DEFAULT false,
  	"provenance_last_refreshed_at" timestamp(3) with time zone,
  	"status" "enum_articles_status" DEFAULT 'draft' NOT NULL,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" uuid,
  	"businesses_id" uuid
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" uuid;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_news_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."news_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_businesses_fk" FOREIGN KEY ("businesses_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_hero_image_idx" ON "articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_provenance_provenance_source_idx" ON "articles" USING btree ("provenance_source");
  CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");
  CREATE INDEX "articles_city_idx" ON "articles" USING btree ("city_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles_texts_order_parent" ON "articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_events_id_idx" ON "articles_rels" USING btree ("events_id");
  CREATE INDEX "articles_rels_businesses_id_idx" ON "articles_rels" USING btree ("businesses_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_texts" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'heartbeat', 'seed-directory', 'check-staleness', 'dedup-flag');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'heartbeat', 'seed-directory', 'check-staleness', 'dedup-flag');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  DROP TYPE "public"."enum_articles_provenance_source";
  DROP TYPE "public"."enum_articles_status";`)
}
