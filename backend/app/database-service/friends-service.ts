import { DBServiceResponse, PaginationParams, pool, recordDoesNotExist, userDoesNotExist } from "./general/utility"


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
    expiryDate?: Date
}

export type CreateFriendshipCodeResponse = {
    friendshipCodeData?: FriendshipCodeData
} & DBServiceResponse

/**
 * Creates a friendship code for a given user. Expiry date is optional.
 */
export async function createFrienshipCode(params: CreateFriendshipCodeParams): Promise<CreateFriendshipCodeResponse> {
    // Make sure user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    // Create friendship code
    const query = await pool.query(`
        INSERT INTO friendship_codes (user_id, code, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id, code, expires_at AS expiresAt, created_at AS createdAt;
    `, [params.userId, params.code, params.expiryDate])

    const {id, code, expiresAt, createdAt} = query.rows[0]

    return {
        friendshipCodeData: {id, code, expiresAt, createdAt},
        status: "SUCCESS",
        message: "Friendship code created."
    }
}

export type GetFriendshipCodesParams = {
    userId: number
} & PaginationParams

export type GetFriendshipCodesResponse = {
    friendshipCodes?: FriendshipCodeData[]
} & DBServiceResponse

/**
 * Retrieves friendship codes for a given user.
 * 
 * Accepts ```PaginationParams```.
 */
export async function getFriendshipCodes(params: GetFriendshipCodesParams): Promise<GetFriendshipCodesResponse> {
    const {userId, before, after, descending, limit} = params
    // Make sure user exists
    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists
    
    // Retrieve friendship codes
    const query = await pool.query(`
        SELECT fc.id, fc.code, fc.expires_at AS expiresAt, fc.created_at AS createdAt
        FROM friendship_codes fc
        INNER JOIN users u ON u.id = fc.user_id
        WHERE
            u.id = $1
            AND fc.expires_at > now()
            AND ($2 IS NULL OR fc.created_at < $2)
            AND ($3 IS NULL OR fc.created_at > $3)
        ORDER BY 
            CASE WHEN $4 THEN fc.created_at END DESC
            fc.created_at ASC
        LIMIT $5;
    `, [userId, before, after, descending, limit])

    return {
        friendshipCodes: query.rows,
        status: "SUCCESS",
        message: `Successfully retrieved friendship codes for user with ID of ${userId}.`
    }
}

export type RevokeFriendshipCodeParams = {
    userId: number
    friendshipCodeId: string
}

export type RevokeFriendshipCodeResponse = DBServiceResponse

/**
 * Revokes (invalidates) a friendship code on behalf of a given user.
 * Only works if the user in fact owns the friendship code.
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
            EXISTS (SELECT 1 FROM updated) AS isUpdated
        ;
    `, [params.userId, params.friendshipCodeId])

    const {belongs, isUpdated} = query.rows[0]

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
} & DBServiceResponse

/**
 * Establishes a friendship between two users, using a friendship code.
 * 
 * One user is "active", meaning the friendship code is used on their behalf.
 * The other is "passive". They issued the friendship code.
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
            EXISTS (SELECT 1 FROM matches) AS codeValid, 
            EXISTS (SELECT 1 FROM inserted) AS rowInserted
            (SELECT id FROM matches) AS friendId,
            (SELECT login FROM matches) AS friendLogin,
            (SELECT created_at FROM inserted) AS friendSince
        ;
    `, [params.friendshipCode, params.userToBefriendLogin, params.userId])

    const {friendId, friendLogin, createdAt: friendSince, codeValid, rowInserted} = query.rows[0]

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
} & PaginationParams

export type GetFriendsResponse = {
    friends?: FriendData[]
} & DBServiceResponse

/**
 * Retrieves all friends of a given user.
 * 
 * Accepts ```PaginationParams```.
 */
export async function getFriends(params: GetFriendsParams): Promise<GetFriendsResponse> {
    const {userId, before, after, descending, limit} = params
    // Make sure the user exists
    const userNotExists = await userDoesNotExist(userId)
    if (userNotExists) return userNotExists
    
    // Retrieve friends
    const query = await pool.query(`
        SELECT u.id, u.login, f.created_at AS friendSince
        FROM users u
        INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id)
        WHERE
            $1 IN (f.user1_id, f.user2_id)
            AND u.id != $1
            AND ($2 IS NULL OR f.created_at < $2)
            AND ($3 IS NULL OR f.created_at > $3)
        ORDER BY 
            CASE WHEN $4 THEN f.created_at END DESC
            fc.created_at ASC
        LIMIT $5;
    `, [userId, before, after, descending, limit])

    return {
        friends: query.rows,
        status: "SUCCESS",
        message: `Successfully retrieved friends for user with ID of ${userId}.`
    }
}
