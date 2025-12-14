import { pool } from "../_internal/pool";


export async function close() {
    pool.end()
}