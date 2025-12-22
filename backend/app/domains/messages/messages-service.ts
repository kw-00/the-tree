import { pool } from "../00-common/service/pool"
import type { ServiceResponse } from "../00-common/service/types"
import { userDoesNotExist, chatroomDoesNotExist, userNotInChatroom, queryRowsToCamelCase } from "../00-common/service/utility"



export type MessageData = {
    id: number
    content: string
    userId: number
    userLogin: string
    chatroomId: number
    createdAt: Date
}

export type CreateMessageParams = {
    userId: number
    chatroomId: number
    content: string
}

export type CreateMessageResponse = {
    messageData?: MessageData
} & ServiceResponse

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
        WITH inserted AS (
            INSERT INTO messages (user_id, chatroom_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, content, created_at
        )
        SELECT i.id, i.content, u.login AS user_login, i.created_at
        FROM inserted i
        INNER JOIN users u ON u.id = $1;
        
    `, [params.userId, params.chatroomId, params.content])

    const {id, content, userLogin, createdAt} = queryRowsToCamelCase(query.rows)[0]

    // Return message data
    return {
        messageData: {
            id, 
            content, 
            userId: params.userId, 
            userLogin: userLogin, 
            chatroomId: params.chatroomId, 
            createdAt
        },
        status: "SUCCESS",
        message: "Message created."
    }
}

export type GetNextMessagesParams = {
    userId: number
    chatroomId: number
    after: number
    limit: number
}

export type MessagesPage = {
    messagesData: MessageData[]
    nextCursor: number | null
    prevCursor: number | null
}

export type GetNextMessagesResponse = {
    page?: MessagesPage
} & ServiceResponse

/**
 * Retrieves messages from a chatroom, on behalf of a user. That user must be in the chatroom.
 * 
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function getNextMessages(params: GetNextMessagesParams): Promise<GetNextMessagesResponse> {
    const {userId, chatroomId, after, limit} = params

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
            AND m.id > $2
        ORDER BY m.id ASC
        LIMIT $3;
    `, [chatroomId, after, limit])

    const result = queryRowsToCamelCase(query.rows)

    return {
        page: {
            messagesData: result,
            nextCursor: result[result.length - 1]?.id ?? null,
            prevCursor: result[0]?.id ?? null
        },
        status: "SUCCESS",
        message: `Successfully retrieved messages for chatroom with ID of ${chatroomId}.`
    }
}


export type GetPreviousMessagesParams = {
    userId: number
    chatroomId: number
    before: number | null
    limit: number
}

export type GetPreviousMessagesResponse = {
    page?: MessagesPage
} & ServiceResponse

/**
 * Retrieves messages from a chatroom, on behalf of a user. That user must be in the chatroom.
 * 
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function getPreviousMessages(params: GetPreviousMessagesParams): Promise<GetPreviousMessagesResponse> {
    const {userId, chatroomId, before, limit} = params

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
            AND ($2::INT IS NULL OR m.id < $2::INT)
        ORDER BY m.id DESC
        LIMIT $3;
    `, [chatroomId, before, limit])

    const result = queryRowsToCamelCase(query.rows).reverse()

    return {
        page: {
            messagesData: result,
            nextCursor: result[result.length - 1]?.id ?? null,
            prevCursor: result[0]?.id ?? null
        },
        status: "SUCCESS",
        message: `Successfully retrieved messages for chatroom with ID of ${chatroomId}.`
    }
}
