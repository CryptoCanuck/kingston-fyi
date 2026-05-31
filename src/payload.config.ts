import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Cities } from './collections/Cities'
import { seedKingston } from './lib/seed/seedKingston'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Cities],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Ensure the launch city exists so hostname→city resolution works on a fresh DB.
  onInit: async (payload) => {
    await seedKingston(payload)
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
  plugins: [],
})
