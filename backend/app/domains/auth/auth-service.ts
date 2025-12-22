import { DatabaseError } from "pg"
import { pgErrorCondition } from "../00-common/service/db-error-codes-mapping"
import { pool } from "../00-common/service/pool"
import type { ServiceResponse as ServiceResponse } from "../00-common/service/types"
import { queryRowsToCamelCase, userDoesNotExist } from "../00-common/service/utility"
import { AccessTokenManagement } from "@/utilities/access-token-management"



export type AuthenticateUserParams = {
    login: string
    password: string
}

export type AuthenticateUserResponse = {
    userId?: number
} & ServiceResponse

/**
 * Authenticates a user with login and password
 * 
 * 
 * Possible status values:
 * - SUCCESS
 * - INVALID_CREDENTIALS
 */
export async function authenticateUser(params: AuthenticateUserParams): Promise<AuthenticateUserResponse> {
    // Look for matching login and password among users
    const query = await pool.query(`
        SELECT id FROM users WHERE login = $1 AND password = $2;
    `, [params.login, params.password])

    // If no match is found, credentials are invalid
    if (query.rowCount === 0) {
        return {
            status: "INVALID_CREDENTIALS",
            message: "Login and password do not match"
        }
    } else {
        // Otherwise, success
        return {
            userId: query.rows[0]["id"],
            status: "SUCCESS",
            message: "Authentication successful."
        }
    }
}

export type VerifyRefreshTokenParams = {
    refreshToken: string
}

export type VerifyRefreshTokenResponse = {
    userId?: number
} & ServiceResponse

/**
 * Checks whether a refresh token is valid and marks it as used. 
 * If the token has been used already, revokes all tokens for the associated user.
 * This means the token may have been stolen.
 * 
 * Possible status values:
 * - SUCCESS
 * - REFRESH_TOKEN_INVALID
 * - REFRESH_TOKEN_REVOKED
 * - REFRESH_TOKEN_REUSE
 */
export async function verifyRefreshToken(params: VerifyRefreshTokenParams): Promise<VerifyRefreshTokenResponse> {

    const now = new Date()
    // Retrieve some info on the token and mark it as used if it is valid
    const query = await pool.query(`
        WITH updated AS (
            UPDATE refresh_tokens
            SET status = 'used'
            WHERE 
                uuid = $1
                AND status = 'default'
            RETURNING status, expires_at, user_id
        )
        SELECT 
            status, 
            (expires_at <= $2) AS expired,
            user_id
        FROM 
        (SELECT 1) AS dummy
        LEFT JOIN updated ON TRUE;
    `, [params.refreshToken, now])
    const {status, expired, userId} = queryRowsToCamelCase(query.rows)[0]

    // If no matching token was found, or it is expired, 
    // or has been revoked, then the token in question is invalid
    if (!status) {
        return {
            status: "REFRESH_TOKEN_INVALID",
            message: "Refresh token does not exist in database."
        }
    }

    if (expired) {
        return {
            status: "REFRESH_TOKEN_INVALID",
            message: "Refresh token is expired."
        }
    }

    if (status === "revoked") {
        return {
            status: "REFRESH_TOKEN_REVOKED",
            message: "Refresh token has been revoked."
        }
    }

    // If the token has already been used, it is invalid and may have been stolen.
    // Revoke all refresh tokens for the associated user
    if (status === "used") {
        await pool.query(`
            UPDATE refresh_tokens t
            SET status = 'revoked'
            WHERE user_id = (SELECT user_id FROM refresh_tokens WHERE uuid = $1);
        `, [params.refreshToken])

        return {
            status: "REFRESH_TOKEN_REUSE",
            message: "Refresh token has already been used. Revoking all refresh tokens for user."
        }
    }

    // If all checks succeed, token is valid
    return {
        userId: userId,
        status: "SUCCESS",
        message: "Refresh token is valid."
    }
}


export type CreateRefreshTokenParams = {
    userId: number
    validityPeriodSeconds: number
}

export type CreateRefreshTokenResponse = {
    refreshToken?: string
} & ServiceResponse

/**
 * Creates a refresh token for a specific user, with a mandatory validity period.
 * 
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - UUID_COLLISION
 */
export async function createRefreshToken(params: CreateRefreshTokenParams): Promise<CreateRefreshTokenResponse> {
    // Make sure user exists
    const notExists = await userDoesNotExist(params.userId)
    if (notExists) return notExists
    
    try {
        const expiryDate = new Date(new Date().getTime() + params.validityPeriodSeconds * 1000)
        // Create the refresh token
        const query = await pool.query(`
            INSERT INTO refresh_tokens (user_id, expires_at) 
            VALUES ($1, $2)
            RETURNING uuid;
        `, [params.userId, expiryDate])
        const uuid = query.rows[0]["uuid"]
        // Return the refresh token
        return {
            refreshToken: uuid,
            status: "SUCCESS",
            message: "Refresh token successfully created."
        }
    } catch (error) {
        if (error instanceof DatabaseError) {
            // If there is a unique_violation, that means the UUID happened to be in use
            if (error.code !== undefined && pgErrorCondition(error.code) === "unique_violation") {
                return {
                    status: "UUID_COLLISION",
                    message: "Refresh token UUID happened to collide with another."
                }
            }
        }
        throw error
    }
}

export type RevokeRefreshTokenParams = {
    refreshToken: string
}

export type RevokeRefreshTokenResponse = ServiceResponse

/**
 * Revokes a given refresh token.
 * 
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 */
export async function revokeRefreshToken(params: RevokeRefreshTokenParams): Promise<RevokeRefreshTokenResponse> {
    // Set the token status to "revoked"
    const query = await pool.query(`
        UPDATE refresh_tokens
        SET status = 'revoked'
        WHERE uuid = $1;
    `, [params.refreshToken])
    const found = query.rowCount ?? 0 > 0
    // If the token was found, success
    if (found) {
        return {
            status: "SUCCESS",
            message: "Refresh token revoked."
        }
    } else {
        // If the token was not found, return SUCCESS_REDUNDANT
        return {
            status: "SUCCESS_REDUNDANT",
            message: "Refresh token does not exist. No need to revoke it."
        }
    }
}

export type VerifyAccessTokenResponse = {
    userId?: number
} & ServiceResponse

/**
 * Possible status values:
 * - SUCCESS
 * - INVALID_ACCESS_TOKEN
 */
export function verifyAccessToken(accessToken: string): VerifyAccessTokenResponse {
    const result = AccessTokenManagement.verifyToken(accessToken)
    if (result !== null) return {
        userId: result.sub,
        status: "SUCCESS", 
        message: "Access token is valid."
    }
    return {
        status: "INVALID_ACCESS_TOKEN",
        message: "Status token is not valid."
    }
}