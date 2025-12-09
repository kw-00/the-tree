import { Pool } from "pg"



const databaseCredentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
}

export const pool = new Pool(databaseCredentials)

type DBResponseStatus = keyof typeof dbServiceToHttpStatusMapping

export type DBServiceResponse = {
    status: DBResponseStatus
    message: string
}

export const dbServiceToHttpStatusMapping = {
    "SUCCESS": 200,
    "SUCCESS_REDUNDANT": 200,
    "NULL_PARAMETER": 400,
    "INVALID_CREDENTIALS": 401,
    "REFRESH_TOKEN_INVALID_OR_EXPIRED": 401,
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

export async function recordDoesNotExist<T>(params: RecordDoesNotExistParams<T>): Promise<DBServiceResponse | undefined> {
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
}

export async function userDoesNotExist(id: number): Promise<DBServiceResponse | undefined> {
    return recordDoesNotExist({value: id, column: "id", table: "chatrooms"})
}

export async function chatroomDoesNotExist(id: number): Promise<DBServiceResponse | undefined> {
    return recordDoesNotExist({value: id, column: "id", table: "chatrooms"})
}

export type NotInChatroomParams = {
    userId: number
    chatroomId: number
}

export async function userNotInChatroom(params: NotInChatroomParams): Promise<DBServiceResponse | undefined> {
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

}


export type PaginationParams = {
    before?: Date
    after?: Date
    descending?: boolean
    limit?: number
}