import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "cities_hostnames" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hostname" varchar NOT NULL
  );
  
  CREATE TABLE "cities" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"timezone" varchar DEFAULT 'America/Toronto' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "media" ADD COLUMN "city_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cities_id" uuid;
  ALTER TABLE "cities_hostnames" ADD CONSTRAINT "cities_hostnames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cities_hostnames_order_idx" ON "cities_hostnames" USING btree ("_order");
  CREATE INDEX "cities_hostnames_parent_id_idx" ON "cities_hostnames" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cities_slug_idx" ON "cities" USING btree ("slug");
  CREATE INDEX "cities_updated_at_idx" ON "cities" USING btree ("updated_at");
  CREATE INDEX "cities_created_at_idx" ON "cities" USING btree ("created_at");
  ALTER TABLE "media" ADD CONSTRAINT "media_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_city_idx" ON "media" USING btree ("city_id");
  CREATE INDEX "payload_locked_documents_rels_cities_id_idx" ON "payload_locked_documents_rels" USING btree ("cities_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cities_hostnames" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cities_hostnames" CASCADE;
  DROP TABLE "cities" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_city_id_cities_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cities_fk";
  
  DROP INDEX "media_city_idx";
  DROP INDEX "payload_locked_documents_rels_cities_id_idx";
  ALTER TABLE "media" DROP COLUMN "city_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cities_id";`)
}
