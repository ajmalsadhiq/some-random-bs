import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Create pool only if DATABASE_URL is available (skip at build time)
let pool: Pool | null = null
let db: ReturnType<typeof drizzle> | null = null

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  db = drizzle(pool, { schema })
}

export { pool, db }
