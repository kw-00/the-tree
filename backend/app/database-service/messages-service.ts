import { chatroomDoesNotExist, DBServiceResponse, PaginationParams, pool, userDoesNotExist, userNotInChatroom } from "./utility"

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

export async function createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExist(params.chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    const notInChatroom = await userNotInChatroom({userId: params.userId, chatroomId: params.chatroomId})
    if (notInChatroom) return notInChatroom

    const query = await pool.query(`
        INSERT INTO messages (user_id, chatroom_id, content)
        VALUES ($1, $2, $3)
        RETURNING AT id, content, created_at as createdAt;        
    `, [params.userId, params.chatroomId, params.content])

    const {id, content, createdAt} = query.rows[0]

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

export async function getMessages(params: GetMessagesParams): Promise<GetMessagesResponse> {
    const {userId, chatroomId, before, after, descending, limit} = params

    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExist(chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    const notInChatroom = await userNotInChatroom({userId, chatroomId})
    if (notInChatroom) return notInChatroom

    
    const query = await pool.query(`
        SELECT m.id, m.content, m.created_at AS createdAt
        FROM chatrooms c
        INNER JOIN messages m ON m.chatroom_id = c.id
        WHERE
            c.id = $1
            AND ($2 IS NULL OR m.created_at < $2)
            AND ($3 IS NULL OR m.created_at > $3)
        ORDER BY 
            CASE WHEN $4 THEN f.created_at END DESC
            fc.created_at ASC
        LIMIT $5;
    `, [chatroomId, before, after, descending, limit])

    return {
        messagesData: query.rows,
        status: "SUCCESS",
        message: `Successfully retrieved messages for chatroom with ID of ${chatroomId}.` 
    }
}
