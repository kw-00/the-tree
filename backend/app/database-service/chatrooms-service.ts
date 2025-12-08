import { chatroomDoesNotExistResponse, DBServiceResponse, PaginationParams, pool, userDoesNotExistResponse } from "./utility"


export type AddFriendsToChatroomParams = {
    userId: number
    friendIds: number
    chatroomId: number
}

export type AddFriendsToChatroomResponse = {
    added?: number[]
    skipped?: number[]
    notFound?: number[]
} & DBServiceResponse


export async function addFriendsToChatroom(params: AddFriendsToChatroomParams): Promise<AddFriendsToChatroomResponse> {
    const userNotExists = await userDoesNotExistResponse(params.userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExistResponse(params.chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    const query = await pool.query(`
        -- Gather the user IDs among friendIds that actually exist
	    -- and put them in a CTE called valid
        WITH valid AS (
            SELECT id
            FROM UNNEST($1) AS ids_to_add(id)
            INNER JOIN users u ON u.id = ids_to_add.id
            INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id) 
                AND $2 IN (f.user1_id, f.user2_id)
        ),
        -- Try to add those users to the chatroom
        -- and put those who were successfully added in a CTE called inserted
        inserted AS (
            INSERT INTO chatrooms_users (chatroom_id, user_id)
            SELECT $3, id FROM valid
            ON CONFLICT DO NOTHING
            RETURNING id
        )
        -- Select three arrays — one for users who were added to chatroom, one for those who were skipped, and one for
        -- the IDs that do not exist
        SELECT 
            -- Store users who were auccessfully added in an array
            (SELECT array_agg(inserted.id)) AS added, 
            -- Store those who exist but were not added in another array
            (SELECT array_agg(valid.id) FILTER (WHERE valid.id NOT IN (SELECT inserted.id FROM inserted))) AS skipped,
            -- Store the ones that do not exist in a separate one
            (
                SELECT array_agg(id) FILTER (WHERE id NOT IN (SELECT valid.id FROM valid) )
                FROM UNNEST($1) AS ids_to_add(id)
            ) AS notFound
        ;
    `, [params.friendIds, params.userId, params.chatroomId])

    const {added = [], skipped = [], notFound = []} = query.rows[0]

    return {
        added: added,
        skipped: skipped,
        notFound: notFound,

        status: "SUCCESS",
        message: "Complete."
    }
}

export type CreateChatroomParams = {
    userId: number
    chatroomName: string
}

export type CreateChatroomResponse = {
    chatroomId?: number
} & DBServiceResponse


export async function createChatroom(params: CreateChatroomParams): Promise<CreateChatroomResponse> {
    const userNotExists = await userDoesNotExistResponse(params.userId)
    if (userNotExists) return userNotExists
    
    const query = await pool.query(`
        WITH inserted(id) AS (
            INSERT INTO chatrooms (name) 
            VALUES ($1)
            RETURNING id
        )
        INSERT INTO chatrooms_users (chatroom_id, user_id)
        SELECT id, $2 FROM inserted
        RETURNING (SELECT id FROM inserted);
    `, [params.chatroomName, params.userId])

    const chatroomId = query.rows[0]["id"]

    return {
        chatroomId: chatroomId,
        status: "SUCCESS",
        message: "Successfully created chatroom and added user into it." 
    }
}

export type GetConnectedChatroomsParams = {
    userId: number
} & PaginationParams

export type GetConnectedChatroomsResponse = {
    chatrooms?: {
        id: number
        name: string
        createdAt: Date
    }[]
} & DBServiceResponse

export async function getConnectedChatrooms(params: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponse> {
    const {userId, before, after, descending, limit} = params
    const userNotExists = await userDoesNotExistResponse(params.userId)
    if (userNotExists) return userNotExists
    
    const query = await pool.query(`
        SELECT id, name, created_at AS createdAt
        FROM chatrooms c
        INNER JOIN chatrooms_users cu ON cu.chatroom_id = c.id
        INNER JOIN users u ON u.id = cu.user_id
        WHERE
            u.id = $1
            AND ($2 IS NULL OR c.created_at < $2)
            AND ($3 IS NULL OR c.created_at > $3)
        ORDER BY 
            CASE WHEN $4 THEN c.created_at END DESC
            created_at ASC
        LIMIT $5;
    `, [userId, before, after, descending, limit])

    const result: GetConnectedChatroomsResponse["chatrooms"] = []
    for (const row in query.rows) {
        result.push(row as any)
    }

    return {
        chatrooms: result,
        status: "SUCCESS",
        message: "Successfully created chatroom and added user into it." 
    }
}