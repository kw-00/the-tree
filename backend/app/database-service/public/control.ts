import { pool } from "../internal/pool";


export async function close() {
    pool.end()
}