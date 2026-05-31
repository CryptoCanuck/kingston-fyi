import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_provenance_source" AS ENUM('seeded', 'google-places', 'owner-edited', 'operator');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'pending', 'approved', 'published');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'seed-directory';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'check-staleness';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'dedup-flag';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'seed-directory';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'check-staleness';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'dedup-flag';
  CREATE TABLE "events" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"blurb" varchar,
  	"description" jsonb,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"ends_at" timestamp(3) with time zone,
  	"display_date" varchar,
  	"display_time" varchar,
  	"category_id" uuid,
  	"neighbourhood_id" uuid,
  	"is_free" boolean DEFAULT false,
  	"price_text" varchar,
  	"image_id" uuid,
  	"venue_id" uuid,
  	"location_name" varchar,
  	"address_street" varchar,
  	"address_locality" varchar DEFAULT 'Kingston',
  	"address_region" varchar DEFAULT 'ON',
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'CA',
  	"location" geometry(Point),
  	"provenance_source" "enum_events_provenance_source" DEFAULT 'operator' NOT NULL,
  	"provenance_refresh_required" boolean DEFAULT false,
  	"provenance_last_refreshed_at" timestamp(3) with time zone,
  	"status" "enum_events_status" DEFAULT 'draft' NOT NULL,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" uuid;
  ALTER TABLE "events" ADD CONSTRAINT "events_category_id_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_neighbourhood_id_neighbourhoods_id_fk" FOREIGN KEY ("neighbourhood_id") REFERENCES "public"."neighbourhoods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_businesses_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_texts" ADD CONSTRAINT "events_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_category_idx" ON "events" USING btree ("category_id");
  CREATE INDEX "events_neighbourhood_idx" ON "events" USING btree ("neighbourhood_id");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_venue_idx" ON "events" USING btree ("venue_id");
  CREATE INDEX "events_provenance_provenance_source_idx" ON "events" USING btree ("provenance_source");
  CREATE INDEX "events_status_idx" ON "events" USING btree ("status");
  CREATE INDEX "events_city_idx" ON "events" USING btree ("city_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events_texts_order_parent" ON "events_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  ALTER TABLE "events" ALTER COLUMN "location" TYPE geometry(Point, 4326) USING ST_SetSRID("location", 4326);
  CREATE INDEX IF NOT EXISTS "events_location_gist_idx" ON "events" USING gist ("location");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'heartbeat');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'heartbeat');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  DROP TYPE "public"."enum_events_provenance_source";
  DROP TYPE "public"."enum_events_status";`)
}
