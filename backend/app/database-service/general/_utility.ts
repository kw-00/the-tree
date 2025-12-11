import { pool } from "./pool"
import type { RecordDoesNotExistParams, DBServiceResponse } from "./types"



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
                `${(table[0] ?? "").toUpperCase()}${table.substring(1, table.length - 1)} 
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
