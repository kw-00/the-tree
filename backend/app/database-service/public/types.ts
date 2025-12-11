import type { stMap } from "@/utilities/status-mapping";


type DBResponseStatus = keyof typeof stMap

/**
 * Every database service function should return a result that
 * satisfies this type.
 */
export type DBServiceResponse = {
    status: DBResponseStatus
    message: string
}

/**
 * Represents a database service function.
 */
export type DBServiceFunction<P, R extends DBServiceResponse> = (params: P) => Promise<R>

/**
 * Used to determine which and how many records are retrieved
 * in a query that returns many rows. Used for pagination.
 * 
 * Usually, a service function that uses PaginationParams will
 * have a query similar to this one in its body:
 * 
 * ```    
 * const query = await pool.query(`
         SELECT m.id, m.content, m.created_at AS createdAt
         FROM chatrooms c
         INNER JOIN messages m ON m.chatroom_id = c.id
         WHERE
             c.id = $1
             AND ($2 IS NULL OR m.created_at < $2)
             AND ($3 IS NULL OR m.created_at > $3)
         ORDER BY 
             CASE WHEN $4 THEN m.id END DESC
             m.id ASC
         LIMIT $5;
     `, [chatroomId, before, after, descending, limit])
     ```
 */
export type PaginationParams = {
    before?: Date
    after?: Date
    descending?: boolean
    limit?: number
}

