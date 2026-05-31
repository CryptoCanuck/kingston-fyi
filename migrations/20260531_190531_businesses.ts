import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_businesses_hours_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_businesses_price_tier" AS ENUM('$', '$$', '$$$', '$$$$');
  CREATE TYPE "public"."enum_businesses_provenance_source" AS ENUM('seeded', 'google-places', 'owner-edited', 'operator');
  CREATE TYPE "public"."enum_businesses_status" AS ENUM('draft', 'pending', 'approved', 'published');
  CREATE TABLE "businesses_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_businesses_hours_day" NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "businesses" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"blurb" varchar,
  	"description" jsonb,
  	"category_id" uuid,
  	"neighbourhood_id" uuid,
  	"price_tier" "enum_businesses_price_tier",
  	"address_street" varchar,
  	"address_locality" varchar DEFAULT 'Kingston',
  	"address_region" varchar DEFAULT 'ON',
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'CA',
  	"phone" varchar,
  	"website" varchar,
  	"rating" numeric,
  	"review_count" numeric,
  	"location" geometry(Point),
  	"provenance_source" "enum_businesses_provenance_source" DEFAULT 'seeded' NOT NULL,
  	"provenance_refresh_required" boolean DEFAULT false,
  	"provenance_last_refreshed_at" timestamp(3) with time zone,
  	"status" "enum_businesses_status" DEFAULT 'draft' NOT NULL,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "businesses_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "businesses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "businesses_id" uuid;
  ALTER TABLE "businesses_hours" ADD CONSTRAINT "businesses_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_category_id_business_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."business_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_neighbourhood_id_neighbourhoods_id_fk" FOREIGN KEY ("neighbourhood_id") REFERENCES "public"."neighbourhoods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses_texts" ADD CONSTRAINT "businesses_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "businesses_rels" ADD CONSTRAINT "businesses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "businesses_rels" ADD CONSTRAINT "businesses_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "businesses_hours_order_idx" ON "businesses_hours" USING btree ("_order");
  CREATE INDEX "businesses_hours_parent_id_idx" ON "businesses_hours" USING btree ("_parent_id");
  CREATE INDEX "businesses_slug_idx" ON "businesses" USING btree ("slug");
  CREATE INDEX "businesses_category_idx" ON "businesses" USING btree ("category_id");
  CREATE INDEX "businesses_neighbourhood_idx" ON "businesses" USING btree ("neighbourhood_id");
  CREATE INDEX "businesses_provenance_provenance_source_idx" ON "businesses" USING btree ("provenance_source");
  CREATE INDEX "businesses_status_idx" ON "businesses" USING btree ("status");
  CREATE INDEX "businesses_city_idx" ON "businesses" USING btree ("city_id");
  CREATE INDEX "businesses_updated_at_idx" ON "businesses" USING btree ("updated_at");
  CREATE INDEX "businesses_created_at_idx" ON "businesses" USING btree ("created_at");
  CREATE INDEX "businesses_texts_order_parent" ON "businesses_texts" USING btree ("order","parent_id");
  CREATE INDEX "businesses_rels_order_idx" ON "businesses_rels" USING btree ("order");
  CREATE INDEX "businesses_rels_parent_idx" ON "businesses_rels" USING btree ("parent_id");
  CREATE INDEX "businesses_rels_path_idx" ON "businesses_rels" USING btree ("path");
  CREATE INDEX "businesses_rels_media_id_idx" ON "businesses_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_businesses_fk" FOREIGN KEY ("businesses_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_businesses_id_idx" ON "payload_locked_documents_rels" USING btree ("businesses_id");`)

  // --- Geospatial (Story 2.1, FR24) ----------------------------------------------------
  // Payload's point field declares the column as geometry(Point) (SRID 0, no spatial
  // index). Constrain it to geometry(Point,4326) — Payload writes points via
  // ST_GeomFromGeoJSON, which yields SRID 4326, so this typmod matches every insert — and
  // add a GiST index so lib/geo's ST_DWithin / ST_MakeEnvelope queries are index-backed.
  await db.execute(sql`
    ALTER TABLE "businesses"
      ALTER COLUMN "location" TYPE geometry(Point, 4326)
      USING ST_SetSRID("location", 4326);
    CREATE INDEX IF NOT EXISTS "businesses_location_gist_idx"
      ON "businesses" USING gist ("location");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "businesses_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "businesses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "businesses_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "businesses_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "businesses_hours" CASCADE;
  DROP TABLE "businesses" CASCADE;
  DROP TABLE "businesses_texts" CASCADE;
  DROP TABLE "businesses_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_businesses_fk";
  
  DROP INDEX "payload_locked_documents_rels_businesses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "businesses_id";
  DROP TYPE "public"."enum_businesses_hours_day";
  DROP TYPE "public"."enum_businesses_price_tier";
  DROP TYPE "public"."enum_businesses_provenance_source";
  DROP TYPE "public"."enum_businesses_status";`)
}
