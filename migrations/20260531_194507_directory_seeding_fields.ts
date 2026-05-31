import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_businesses_lifecycle_status" AS ENUM('active', 'temporarily-closed', 'permanently-closed', 'stale-unverified');
  ALTER TABLE "businesses" ALTER COLUMN "provenance_source" SET DEFAULT 'operator';
  ALTER TABLE "businesses" ADD COLUMN "lifecycle_status" "enum_businesses_lifecycle_status" DEFAULT 'active';
  ALTER TABLE "businesses" ADD COLUMN "place_id" varchar;
  ALTER TABLE "businesses" ADD COLUMN "directory_flags_flagged_duplicate" boolean DEFAULT false;
  ALTER TABLE "businesses" ADD COLUMN "directory_flags_duplicate_candidate_id" uuid;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_directory_flags_duplicate_candidate_id_businesses_id_fk" FOREIGN KEY ("directory_flags_duplicate_candidate_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "businesses_lifecycle_status_idx" ON "businesses" USING btree ("lifecycle_status");
  CREATE INDEX "businesses_place_id_idx" ON "businesses" USING btree ("place_id");
  CREATE INDEX "businesses_directory_flags_directory_flags_duplicate_can_idx" ON "businesses" USING btree ("directory_flags_duplicate_candidate_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "businesses" DROP CONSTRAINT "businesses_directory_flags_duplicate_candidate_id_businesses_id_fk";
  
  DROP INDEX "businesses_lifecycle_status_idx";
  DROP INDEX "businesses_place_id_idx";
  DROP INDEX "businesses_directory_flags_directory_flags_duplicate_can_idx";
  ALTER TABLE "businesses" ALTER COLUMN "provenance_source" SET DEFAULT 'seeded';
  ALTER TABLE "businesses" DROP COLUMN "lifecycle_status";
  ALTER TABLE "businesses" DROP COLUMN "place_id";
  ALTER TABLE "businesses" DROP COLUMN "directory_flags_flagged_duplicate";
  ALTER TABLE "businesses" DROP COLUMN "directory_flags_duplicate_candidate_id";
  DROP TYPE "public"."enum_businesses_lifecycle_status";`)
}
