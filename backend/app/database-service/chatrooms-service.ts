import { chatroomDoesNotExist, DBServiceResponse, userNotInChatroom, PaginationParams, pool, userDoesNotExist } from "./general/utility"

type ChatroomData = {
    id: number
    name: string
    joinedAt: Date
}

type CreateChatroomParams = {
    userId: number
    chatroomName: string
}

type CreateChatroomResponse = {
    chatroomId?: number
} & DBServiceResponse

/**
 * Creates a chatroom on behalf of a given user. Adds that user into the chatroom immediately after.
 */
export async function createChatroom(params: CreateChatroomParams): Promise<CreateChatroomResponse> {
    // Make sure user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists
    
    // Create the chatroom and add the user to it
    const query = await pool.query(`
        WITH inserted(id) AS (
            INSERT INTO chatrooms (name) 
            VALUES ($1)
            RETURNING id
        )
        INSERT INTO chatrooms_users (chatroom_id, user_id)
        SELECT id, $2 FROM inserted
        RETURNING chatroom_id;
    `, [params.chatroomName, params.userId])

    const chatroomId = query.rows[0]["id"]

    // Return the chatroom's ID
    return {
        chatroomId: chatroomId,
        status: "SUCCESS",
        message: "Successfully created chatroom and added user into it." 
    }
}

type GetConnectedChatroomsParams = {
    userId: number
} & PaginationParams

type GetConnectedChatroomsResponse = {
    chatrooms?: ChatroomData[]
} & DBServiceResponse

/**
 * Retrieves all chatrooms for a given user.
 * 
 * Accepts ```PaginationParams```.
 */
export async function getConnectedChatrooms(params: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponse> {
    const {userId, before, after, descending, limit} = params
    // Make sure user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists
    
    // Retrieve chatrooms
    const query = await pool.query(`
        SELECT c.id, c.name, c.created_at AS joinedAt
        FROM chatrooms c
        INNER JOIN chatrooms_users cu ON cu.chatroom_id = c.id
        INNER JOIN users u ON u.id = cu.user_id
        WHERE
            u.id = $1
            AND ($2 IS NULL OR c.created_at < $2)
            AND ($3 IS NULL OR c.created_at > $3)
        ORDER BY 
            CASE WHEN $4 THEN c.id END DESC
            c.id ASC
        LIMIT $5;
    `, [userId, before, after, descending, limit])

    return {
        chatrooms: query.rows,
        status: "SUCCESS",
        message: `Successfully retrieved connected chatroom for user ID of ${userId}.`
    }
}


type AddFriendsToChatroomParams = {
    userId: number
    friendIds: number
    chatroomId: number
}

type AddFriendsToChatroomResponse = {
    added?: number[]
    skipped?: number[]
    notFound?: number[]
} & DBServiceResponse


/**
 * Adds a user's friends to a given chatroom. User must be in that chatroom.
 * 
 * Returns three arrays with user IDs — one for friends that were added, another for friends that were skipped for whatever reason
 * and one more for users who weren't friends 
 */
export async function addFriendsToChatroom(params: AddFriendsToChatroomParams): Promise<AddFriendsToChatroomResponse> {
    // Make sure user and chatroom exist
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExist(params.chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    // Make sure user is in the chatroom
    const notInChatroom = await userNotInChatroom({userId: params.userId, chatroomId: params.chatroomId})
    if (notInChatroom) return notInChatroom

    // Add friends
    const query = await pool.query(`
        -- Gather the user IDs among friendIds that actually exist
	    -- and are the users's friends. Put them in a CTE called "valid"
        WITH valid AS (
            SELECT id
            FROM UNNEST($1) AS ids_to_add(id)
            INNER JOIN users u ON u.id = ids_to_add.id
            INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id) 
                AND $2 IN (f.user1_id, f.user2_id)
        ),
        -- Try to add those users to the chatroom
        -- and put those who were successfully added in a CTE called "inserted"
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

type LeaveChatroomParams = {
    userId: number
    chatroomId: number
}

type LeaveChatroomResponse = DBServiceResponse


/**
 * Removes a user from a chatroom.
 */
export async function removeUserFromChatroom(params: LeaveChatroomParams): Promise<LeaveChatroomResponse> {
    // Make sure user and chatroom exist
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    const chatroomNotExists = await chatroomDoesNotExist(params.chatroomId)
    if (chatroomNotExists) return chatroomNotExists

    // Remove user from chatroom
    const query = await pool.query(`
        DELETE FROM chatrooms_users
        WHERE user_id = $1 and chatroom_id = $2;
    `, [params.userId, params.chatroomId])

    // If any rows were modified, success
    if (query.rowCount !== null && query.rowCount > 0) {
        return {
            status: "SUCCESS",
            message: "Removed user from chatroom."
        }
    } else {
        // Otherwise, the user already did not belong to chatroom. Return SUCCESS_REDUNDANT
        return {
            status: "SUCCESS_REDUNDANT",
            message: "User is not in chatroom. No need to remove them."
        }
    }
}

