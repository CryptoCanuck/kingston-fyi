import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Cities } from './collections/Cities'
import { Neighbourhoods } from './collections/Neighbourhoods'
import { NewsCategories } from './collections/NewsCategories'
import { EventCategories } from './collections/EventCategories'
import { BusinessCategories } from './collections/BusinessCategories'
import { Businesses } from './collections/Businesses'
import { Reviews } from './collections/Reviews'
import { Events } from './collections/Events'
import { Articles } from './collections/Articles'
import { canRunJobs, jobTasks } from './jobs'
import { seed } from './lib/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Cities,
    Neighbourhoods,
    NewsCategories,
    EventCategories,
    BusinessCategories,
    Businesses,
    Reviews,
    Events,
    Articles,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Background automation (AR20). Tasks live in src/jobs/; autoRun runs the queue on the
  // persistent Railway host on a cron, and the /api/payload-jobs/run Route Handler lets an
  // external cron trigger a run on demand (CRON_SECRET-guarded). Queue runs are restricted
  // to admin/operator staff (canRunJobs); the cron handler authenticates then overrides.
  jobs: {
    tasks: jobTasks,
    access: { run: canRunJobs },
    autoRun: [{ cron: '*/5 * * * *', queue: 'default' }],
    // Skip autoRun outside a persistent host (e.g. local/test/serverless) to avoid noise.
    shouldAutoRun: async () => process.env.ENABLE_JOBS_AUTORUN === 'true',
  },
  // Ensure the launch city + shared taxonomies exist on a fresh DB.
  onInit: async (payload) => {
    await seed(payload)
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Single PostgreSQL + PostGIS via Drizzle. UUID primary keys across all collections.
  // `extensions: ['postgis']` runs CREATE EXTENSION IF NOT EXISTS during init/migrate,
  // before any geometry column is created (see architecture.md §Project Structure).
  db: postgresAdapter({
    idType: 'uuid',
    extensions: ['postgis'],
    migrationDir: path.resolve(dirname, '../migrations'),
    // Migrations-only (no dev auto-push) so local dev, CI, and prod share one schema
    // path and every migration file is exercised before deploy.
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // Two-level business category hierarchy (parent → leaf), editable in the admin.
    nestedDocsPlugin({
      collections: ['business-categories'],
      generateLabel: (_, doc) => String(doc.name ?? ''),
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug ?? ''}`, ''),
    }),
  ],
})
