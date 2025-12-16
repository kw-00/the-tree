import { pool } from "./_internal/pool"
import { chatroomDoesNotExist, userNotInChatroom, userDoesNotExist, queryRowsToCamelCase } from "./_internal/utility"
import { type DBServiceResponse, } from "./public/types"

export type ChatroomData = {
    id: number
    name: string
    joinedAt: Date
}

export type CreateChatroomParams = {
    userId: number
    chatroomName: string
}

export type CreateChatroomResponse = {
    chatroomData?: ChatroomData
} & DBServiceResponse

/**
 * Creates a chatroom on behalf of a given user. Adds that user into the chatroom immediately after.
 * 
 * Possible status values:
 * - SUCCCESS
 * - NOT_FOUND
 */
export async function createChatroom(params: CreateChatroomParams): Promise<CreateChatroomResponse> {
    // Make sure user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists
    
    // Create the chatroom and add the user to it
    const query = await pool.query(`
        WITH chatroom AS (
            INSERT INTO chatrooms (name) 
            VALUES ($1)
            RETURNING id, name
        ),
        cu AS (
            INSERT INTO chatrooms_users (chatroom_id, user_id)
            SELECT id, $2 FROM inserted
            RETURNING created_at
        )
        SELECT c.id, c.name, cu.created_at AS joined_at
        FROM chatroom
        LEFT JOIN cu ON TRUE;
    `, [params.chatroomName, params.userId])

    const {id, name, joinedAt} = queryRowsToCamelCase(query.rows)[0]

    // Return chatroom data
    return {
        chatroomData: {
            id: id,
            name: name,
            joinedAt: joinedAt
        },
        status: "SUCCESS",
        message: "Successfully created chatroom and added user into it." 
    }
}

export type GetChatroomsParams = {
    userId: number
}
export type GetChatroomsResponse = {
    chatroomsData?: ChatroomData[]
} & DBServiceResponse

/**
 * Retrieves all chatrooms for a given user.
 * 
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function getChatrooms(params: GetChatroomsParams): Promise<GetChatroomsResponse> {
    const {userId} = params
    // Make sure user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists
    
    // Retrieve chatrooms
    const query = await pool.query(`
        SELECT c.id, c.name, c.created_at AS joined_at
        FROM chatrooms c
        INNER JOIN chatrooms_users cu ON cu.chatroom_id = c.id
        INNER JOIN users u ON u.id = cu.user_id
        WHERE u.id = $1
        ORDER BY c.name ASC;
    `, [userId])

    return {
        chatroomsData: query.rows,
        status: "SUCCESS",
        message: `Successfully retrieved connected chatroom for user ID of ${userId}.`
    }
}


export type AddFriendsToChatroomParams = {
    userId: number
    friendIds: number[]
    chatroomId: number
}

export type AddFriendsToChatroomResponse = {
    added?: number[]
    skipped?: number[]
    notFound?: number[]
} & DBServiceResponse


/**
 * Adds a user's friends to a given chatroom. User must be in that chatroom.
 * 
 * Returns three arrays with user IDs — one for friends that were added, another for friends that were skipped for whatever reason
 * and one more for users who weren't friends 
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
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

export type LeaveChatroomParams = {
    userId: number
    chatroomId: number
}

export type LeaveChatroomResponse = DBServiceResponse


/**
 * Removes a user from a chatroom.
 * 
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 */
export async function leaveChatroom(params: LeaveChatroomParams): Promise<LeaveChatroomResponse> {
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

