import { pool } from "./_internal/pool"
import { userDoesNotExist, chatroomDoesNotExist, userNotInChatroom, queryRowsToCamelCase } from "./_internal/utility"
import type { DBServiceResponse, PaginationParams } from "./public/types"


export type MessageData = {
    id: number
    content: string
    userId: number
    userLogin: string
    createdAt: Date
}

export type CreateMessageParams = {
    userId: number
    chatroomId: number
    content: string
}

export type CreateMessageResponse = {
    messageData?: MessageData
} & DBServiceResponse

/**
 * Creates a message from a specific user, in a specific chatroom
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
    // Make sure the user and chatroom exist
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExist(params.chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    // Make sure the user is in the chatroom
    const notInChatroom = await userNotInChatroom({userId: params.userId, chatroomId: params.chatroomId})
    if (notInChatroom) return notInChatroom

    // Create the message
    const query = await pool.query(`
        WITTH inserted AS (
            INSERT INTO messages (user_id, chatroom_id, content)
            VALUES ($1, $2, $3)
            RETURNING AT id, content, created_at
        )
        SELECT i.id, i.content, u.login AS user_login, i.created_at
        FROM inserted i
        INNER JOIN users u ON u.id = $1;
        
    `, [params.userId, params.chatroomId, params.content])

    const {id, content, userLogin, createdAt} = queryRowsToCamelCase(query.rows)[0]

    // Return message data
    return {
        messageData: {id, content, userId: params.userId, userLogin: userLogin, createdAt},
        status: "SUCCESS",
        message: "Message created."
    }
}

export type GetMessagesParams = {
    userId: number
    chatroomId: number
} & PaginationParams

export type GetMessagesResponse = {
    messagesData?: MessageData[] 
} & DBServiceResponse

/**
 * Retrieves messages from a chatroom, on behalf of a user. That user must be in the chatroom.
 * 
 * Accepts ```PaginationParams```.
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function getMessages(params: GetMessagesParams): Promise<GetMessagesResponse> {
    const {userId, chatroomId, before, after, descending, limit} = params

    // Make sure user and chatroom exist
    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExist(chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    // Make sure user is in the chatroom
    const notInChatroom = await userNotInChatroom({userId, chatroomId})
    if (notInChatroom) return notInChatroom

    // Retrieve messages
    const query = await pool.query(`
        SELECT m.id, m.content, u.id AS user_id, u.login AS user_login, m.created_at
        FROM chatrooms c
        INNER JOIN messages m ON m.chatroom_id = c.id
        INNER JOIN users u ON u.id = m.user_id
        WHERE
            c.id = $1
            AND ($2::TIMESTAMPTZ IS NULL OR m.created_at < $2::TIMESTAMPTZ)
            AND ($3::TIMESTAMPTZ IS NULL OR m.created_at > $3::TIMESTAMPTZ)
        ORDER BY 
            CASE WHEN $4 THEN m.id END DESC,
            m.id ASC
        LIMIT $5;
    `, [chatroomId, before, after, descending, limit])

    return {
        messagesData: queryRowsToCamelCase(query.rows),
        status: "SUCCESS",
        message: `Successfully retrieved messages for chatroom with ID of ${chatroomId}.` 
    }
}
