import { pool } from "./_internal/pool"
import { userDoesNotExist, chatroomDoesNotExist, userNotInChatroom, queryRowsToCamelCase } from "./_internal/utility"
import type { DBServiceResponse, PaginationParams } from "./public/types"


export type MessageData = {
    id: number
    content: string
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
        INSERT INTO messages (user_id, chatroom_id, content)
        VALUES ($1, $2, $3)
        RETURNING AT id, content, created_at AS created_at;        
    `, [params.userId, params.chatroomId, params.content])

    const {id, content, createdAt} = queryRowsToCamelCase(query.rows)[0]

    // Return message data
    return {
        messageData: {id, content, createdAt},
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
        SELECT m.id, m.content, m.created_at
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

    return {
        messagesData: queryRowsToCamelCase(query.rows),
        status: "SUCCESS",
        message: `Successfully retrieved messages for chatroom with ID of ${chatroomId}.` 
    }
}
