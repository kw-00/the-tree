import { pool } from "../00-common/service/pool"
import type { ServiceResponse } from "../00-common/service/types"
import { userDoesNotExist, queryRowsToCamelCase, recordDoesNotExist } from "../00-common/service/utility"




export type FriendshipCodeData = {
    id: number
    code: string
    expiresAt?: Date
    createdAt: Date
}

export type FriendData = {
    id: number
    login: string
    friendSince: Date
}

export type CreateFriendshipCodeParams = {
    userId: number
    code: string
    expiresAt: Date | null
}

export type CreateFriendshipCodeResponse = {
    friendshipCodeData?: FriendshipCodeData
} & ServiceResponse

/**
 * Creates a friendship code for a given user. Expiry date is optional.
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function createFrienshipCode(params: CreateFriendshipCodeParams): Promise<CreateFriendshipCodeResponse> {
    // Make sure user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    // Create friendship code
    const query = await pool.query(`
        INSERT INTO friendship_codes (user_id, code, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id, code, expires_at, created_at;
    `, [params.userId, params.code, params.expiresAt])

    const {id, code, expiresAt, createdAt} = queryRowsToCamelCase(query.rows)[0]

    return {
        friendshipCodeData: {id, code, expiresAt, createdAt},
        status: "SUCCESS",
        message: "Friendship code created."
    }
}

export type GetFriendshipCodesParams = {
    userId: number
    after: Date | null
}

export type GetFriendshipCodesResponse = {
    friendshipCodesData?: FriendshipCodeData[]
} & ServiceResponse

/**
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function getFriendshipCodes(params: GetFriendshipCodesParams): Promise<GetFriendshipCodesResponse> {
    const {userId, after} = params
    // Make sure user exists
    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists
    
    // Retrieve friendship codes
    const query = await pool.query(`
        SELECT fc.id, fc.code, fc.expires_at, fc.created_at
        FROM friendship_codes fc
        INNER JOIN users u ON u.id = fc.user_id
        WHERE
            u.id = $1
            AND fc.expires_at > now()
            AND ($2::TIMESTAMPTZ IS NULL OR fc.created_at > $2::TIMESTAMPTZ)
        ORDER BY fc.id DESC;
    `, [userId, after])

    return {
        friendshipCodesData: queryRowsToCamelCase(query.rows),
        status: "SUCCESS",
        message: `Successfully retrieved friendship codes for user with ID of ${userId}.`
    }
}

export type RevokeFriendshipCodeParams = {
    userId: number
    friendshipCodeId: number
}

export type RevokeFriendshipCodeResponse = ServiceResponse

/**
 * Revokes (invalidates) a friendship code on behalf of a given user.
 * Only works if the user in fact owns the friendship code.
 * 
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 * - NOT_OWNER_OF_FRIENDSHIP_CODE
 * 
 */
export async function revokeFriendshipCode(params: RevokeFriendshipCodeParams): Promise<RevokeFriendshipCodeResponse> {
    // Make sure user and friendship code exist
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    const friendshipCodeNotExists = await recordDoesNotExist({value: params.friendshipCodeId, column: "id", table: "friendship_codes"})
    if (friendshipCodeNotExists) return friendshipCodeNotExists

    // Try to find a friendship code with matching ID and user and revoke it
    const query = await pool.query(`
        WITH updated AS (
            UPDATE friendship_codes
            SET revoked = TRUE
            WHERE 
                user_id = $1
                AND id = $2
                AND NOT revoked
            RETURNING 1
        )
        SELECT 
            EXISTS (SELECT 1 FROM friendship_codes WHERE user_id = $1 AND id = $2) AS belongs,
            EXISTS (SELECT 1 FROM updated) AS is_updated
        ;
    `, [params.userId, params.friendshipCodeId])

    const {belongs, isUpdated} = queryRowsToCamelCase(query.rows)[0]

    // If revokation is succesful, success
    if (isUpdated) {
        return {
            status: "SUCCESS",
            message: `Successfully revoked friendship code with ID of ${params.friendshipCodeId}.`
        }
    } else {
        // If the code belongs to the user but has already been revoked, return SUCCESS_REDUNDANT
        if (belongs) {
            return {
                status: "SUCCESS_REDUNDANT",
                message: `Friendship code with ID of ${params.friendshipCodeId} has already been revoked.`
            }
        } else {
            // If the code does not belong to the user, return an appropriate response
            return {
                status: "NOT_OWNER_OF_FRIENDSHIP_CODE",
                message: `Frienship code with ID of ${params.friendshipCodeId} does not belong to user with ID of ${params.userId}.`
            }
        }
    }
}


export type AddFriendParams = {
    userId: number
    userToBefriendLogin: string
    friendshipCode: string
}

export type AddFriendResponse = {
    friendData?: FriendData
} & ServiceResponse

/**
 * Establishes a friendship between two users, using a friendship code.
 * 
 * One user is "active", meaning the friendship code is used on their behalf.
 * The other is "passive". They issued the friendship code.
 * 
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 * - INVALID_FRIENDSHIP_CODE
 */
export async function addFriend(params: AddFriendParams): Promise<AddFriendResponse> {
    // Make sure both users exist
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    const loginNotExists = await recordDoesNotExist({value: params.userToBefriendLogin, column: "login", table: "users"})
    if (loginNotExists) return loginNotExists
    
    // Attempt to establish friendship in database while returning information
    // about how the attempt went and potentially about the friendship itself

    const query = await pool.query(`
        WITH matches(id, login) AS (
            SELECT u.id u.login FROM friendship_codes fc
            INNER JOIN users u ON u.id = fc.user_id
            WHERE 
                fc.code = $1
                AND u.login = $2
                AND fc.expires_at > now()
            LIMIT 1
        ),
        inserted(created_at) AS (
            INSERT INTO friends (user1_id, user2_id)
                SELECT LEAST(id, $3), GREATEST(id, $3)
                FROM matches
            ON CONFLICT DO NOTHING
            RETURNING created_at
        )
        SELECT 
            (m.id IS NOT NULL) AS code_valid,
            (i.created_at IS NOT NULL) AS row_inserted, 
            m.id AS friend_id,
            m.login AS friend_login,
            i.created_at AS friend_since
        FROM (SELECT 1) AS dummy
        LEFT JOIN matches m ON TRUE
        LEFT JOIN inserted i ON TRUE;
    `, [params.friendshipCode, params.userToBefriendLogin, params.userId])

    const {friendId, friendLogin, createdAt: friendSince, codeValid, rowInserted} = queryRowsToCamelCase(query.rows)[0]

    if (codeValid) {
        // If a row was inserted, that means the friendship has been established
        if (rowInserted) {
            return {
                friendData: {
                    id: friendId,
                    login: friendLogin,
                    friendSince: friendSince
                },
                status: "SUCCESS",
                message: `Added user with login of ${params.userToBefriendLogin} as a friend.`
            }
        } else {
            // If the friendship code was valid for the "passive" user, yet no insertion was performed,
            // that means they were already friends
            return {
                status: "SUCCESS_REDUNDANT",
                message: "Users are already friends."
            }
        }
    } else {
        // Otehrwise, the code is invalid for the "passive" user
        return {
            status: "INVALID_FRIENDSHIP_CODE",
            message: `Friendship code ${params.friendshipCode} is invalid for login ${params.userToBefriendLogin}.`
        }
    }
}


export type GetFriendsParams = {
    userId: number
    after: Date | null
}


export type GetFriendsResponse = {
    friends?: FriendData[]
} & ServiceResponse

/**
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function getFriends(params: GetFriendsParams): Promise<GetFriendsResponse> {
    const {userId, after} = params
    // Make sure user exists
    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists
    
    // Retrieve friendship codes
    const query = await pool.query(`
        SELECT u.id, u.login, f.created_at AS friend_since
        FROM users u
        INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id)
        WHERE
            u.id != $1
            AND $1 IN (f.user1_id, f.user2_id)
            AND ($2::TIMESTAMPTZ IS NULL OR f.created_at > $2::TIMESTAMPTZ)
        ORDER BY u.login ASC;
    `, [userId, after])

    const result = queryRowsToCamelCase(query.rows)

    return {
        friends: result,
        status: "SUCCESS",
        message: `Successfully retrieved friends for user with ID of ${userId}.`
    }
}

export type RemoveFriendParams = {
    userId: number
    friendId: number
}

export type RemoveFriendResponse = ServiceResponse

/**
 * Removes a friendship between user and their friend.
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 */
export async function removeFriend(params: RemoveFriendParams): Promise<RemoveFriendResponse> {
    const {userId, friendId} = params
    // Make sure user and friend exist
    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists

    const friendNotExists = await userDoesNotExist(friendId)
    if (friendNotExists) return friendNotExists

    const query = await pool.query(`
        DELETE FROM friends
        WHERE 
            $1 IN (user1_id, user2_id)
            AND $2 IN (user1_id, user2_id)
        ;
    `, [userId, friendId])

    if (query.rowCount ?? 0 > 0) {
        return {
            status: "SUCCESS",
            message: `Successfully removed friendship between user with IDs of ${userId} and ${friendId}.`
        }
    } else {
        return {
            status: "SUCCESS_REDUNDANT",
            message: `Users with IDs of ${userId} and ${friendId} are not friends.`
        }
    }
}


