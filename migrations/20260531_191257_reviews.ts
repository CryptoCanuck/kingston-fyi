import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reviews_provenance_source" AS ENUM('seeded', 'google-places', 'owner-edited', 'operator');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('draft', 'pending', 'approved', 'published');
  CREATE TABLE "reviews" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"author" varchar,
  	"rating" numeric NOT NULL,
  	"review_date" timestamp(3) with time zone,
  	"text" varchar,
  	"business_id" uuid NOT NULL,
  	"provenance_source" "enum_reviews_provenance_source" DEFAULT 'seeded' NOT NULL,
  	"provenance_refresh_required" boolean DEFAULT false,
  	"provenance_last_refreshed_at" timestamp(3) with time zone,
  	"status" "enum_reviews_status" DEFAULT 'published' NOT NULL,
  	"city_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" uuid;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_texts" ADD CONSTRAINT "reviews_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "reviews_business_idx" ON "reviews" USING btree ("business_id");
  CREATE INDEX "reviews_provenance_provenance_source_idx" ON "reviews" USING btree ("provenance_source");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_city_idx" ON "reviews" USING btree ("city_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_texts_order_parent" ON "reviews_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  DROP TYPE "public"."enum_reviews_provenance_source";
  DROP TYPE "public"."enum_reviews_status";`)
}
