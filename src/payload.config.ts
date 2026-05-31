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
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
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
