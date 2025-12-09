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

type DBResponseStatus = keyof typeof dbServiceToHttpStatusMapping

// Types

/**
 * Used to determine which and how many records are retrieved
 * in a query that returns many rows. Used for pagination.
 */
export type PaginationParams = {
    before?: Date
    after?: Date
    descending?: boolean
    limit?: number
}

/**
 * Every database service function should return a result that
 * satisfied this type.
 */
export type DBServiceResponse = {
    status: DBResponseStatus
    message: string
}

/**
 * Maps response codes from database services to relevant HTTP status.
 */
export const dbServiceToHttpStatusMapping = {
    "SUCCESS": 200,
    "SUCCESS_REDUNDANT": 200,
    "NULL_PARAMETER": 400,
    "INVALID_CREDENTIALS": 401,
    "REFRESH_TOKEN_INVALID": 401,
    "REFRESH_TOKEN_REUSE": 401,
    "REFRESH_TOKEN_REVOKED": 401,
	"NOT_IN_CHATROOM": 403,
	"INVALID_FRIENDSHIP_CODE": 403,
    "NOT_OWNER_OF_FRIENDSHIP_CODE": 403,
    "NOT_FOUND": 404,
    "UUID_COLLISION": 409,
    "LOGIN_IN_USE": 409,
    "BEFRIENDING_SELF": 409,
}

export type RecordDoesNotExistParams<T> = {
    value: T
    column: string
    table: string
}

/**
 * Checks whether a record with a given value at a given column exists, for a given table.
 * Uses pg internally and does not catch pg-related errors.
 * 
 * Returns an appropriate ```DBServiceResponse``` if record does not exist, or ```false``` if it does.
 * 
 * Example usage: 
 * ```
 * // If monkey with ID of 1 does not exist, return an appropriate response
 * const monkeyNotExists = await recordDoesNotExist({value: 1, column: "id", table: "monkeys"})
 * if (monkeyNotExists) return monkeyNotExists 
 * // Otherwise, move on
 * ```
 */
export async function recordDoesNotExist<T>(params: RecordDoesNotExistParams<T>): Promise<DBServiceResponse | false> {
    const {value, column, table} = params
    const recordExists = (await pool.query(`
        SELECT EXISTS (SELECT 1 FROM ${table} WHERE ${column} = $1) AS userExists;
    `, [value])).rows[0]["userExists"]
    if (!recordExists) {
        return {
            status: "NOT_FOUND",
            message: 
                `${table[0].toUpperCase()}${table.substring(1, table.length - 1)} 
                with ${column.toUpperCase()} of ${value} does not exist.`
        }
    }
    return false
}


/**
 * Checks whether a user with a given ID exists. Calls ```recordDoesNotExist(...)``` internally.
 * 
 * Returns an appropriate DBServiceResponse if user does not exist, or ```false``` the user does exist.
 * 
 * Example usage: 
 * ```
 * // If user with ID of 1 does not exist, return an appropriate response
 * const userNotExists = await userDoesNotExist(1)
 * if (userNotExists) return userNotExists 
 * // Otherwise, move on
 * ```
 */
export async function userDoesNotExist(id: number): Promise<DBServiceResponse | false> {
    return recordDoesNotExist({value: id, column: "id", table: "chatrooms"})
}

/**
 * Checks whether a chatroom with a given ID exists. Calls ```recordDoesNotExist(...)``` internally.
 * 
 * Returns an appropriate DBServiceResponse if chatroom does not exist, or ```false``` the chatroom does exist.
 * 
 * Example usage: 
 * ```
 * // If chatroom with ID of 1 does not exist, return an appropriate response
 * const chatroomNotExists = await chatroomDoesNotExist(1)
 * if (chatroomNotExists) return chatroomNotExists 
 * // Otherwise, move on
 * ```
 */
export async function chatroomDoesNotExist(id: number): Promise<DBServiceResponse | false> {
    return recordDoesNotExist({value: id, column: "id", table: "chatrooms"})
}

export type NotInChatroomParams = {
    userId: number
    chatroomId: number
}


/**
 * Checks whether a user with a given ID is in the chatroom with the given ID.
 * 
 * Returns an appropriate DBServiceResponse if not. Otherwise, returns undefined.
 * 
 * Example usage: 
 * ```
 * // If user with ID of 1 is part of chatroom with ID of 7, return an appropriate response
 * const notInChatroom = await userNotInChatroom({userId: 1, chatroomId: 7})
 * if (notInChatroom) return notInChatroom 
 * // Otherwise, move on
 * ```
 */
export async function userNotInChatroom(params: NotInChatroomParams): Promise<DBServiceResponse | false> {
    const inChatroom = (await pool.query(`
        SELECT EXISTS(
            SELECT 1 FROM users u
            INNER JOIN chatrooms_users cu ON cu.user_id = u.id
            INNER JOIN chatrooms c ON c.id = cu.chatroom_id
        ) AS inChatroom;
    `)).rows[0]["inChatroom"]
    if (!inChatroom) {
        return {
            status: "NOT_IN_CHATROOM",
            message: `User with ID of ${params.userId} is not in chatroom with ID of ${params.chatroomId}.`
        }
    }
    return false

}
