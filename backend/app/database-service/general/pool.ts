import { Pool } from "pg"

const databaseCredentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
}
/**
 * The query pool used by all database services.
 */
export const pool = new Pool(databaseCredentials)

export async function close() {
    pool.end()
}
