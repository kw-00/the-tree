import { DatabaseError } from "pg"
import { DBServiceResponse, pool, userDoesNotExist } from "./general/utility"
import { pgErrorCondition } from "./general/db-error-codes-mapping"


type AuthenticateUserParams = {
    login: string
    password: string
}

type AuthenticateUserResponse = {
    userId?: number
} & DBServiceResponse

export async function authenticateUser(params: AuthenticateUserParams): Promise<AuthenticateUserResponse> {
    const query = await pool.query(`
        SELECT id FROM users WHERE login = $1 AND password = $2;
    `, [params.login, params.password])
    if (query.rowCount === 0) {
        return {
            status: "INVALID_CREDENTIALS",
            message: "Login and passsword do not match"
        }
    } else {
        return {
            userId: query.rows[0]["id"],
            status: "SUCCESS",
            message: "Authentication successful."
        }
    }
}

type VerifyRefreshTokenParams = {
    refreshToken: string
}

type VerifyRefreshTokenResponse = {
    userId?: number
} & DBServiceResponse

export async function verifyRefreshToken(params: VerifyRefreshTokenParams): Promise<VerifyRefreshTokenResponse> {

    const now = new Date()
    const query = await pool.query(`
        WITH old(status) AS (
            SELECT status
            FROM refresh_tokens 
            WHERE 
                uuid = $1
                AND expires_at > $2
            LIMIT 1
        ),
        new AS (
            UPDATE refresh_tokens
            SET status = 'used'
            WHERE 
                uuid = $1
                AND expires_at > $2
                AND status = 'default'
            RETURNING 1
        )
        SELECT (SELECT status FROM old) AS status, EXISTS (SELECT 1 FROM new) AS isValid;
    `, [params.refreshToken, now])

    const status = query.rows[0]["status"]
    const isValid = query.rows[0]["isValid"]

    if (status === undefined) {
        return {
            status: "REFRESH_TOKEN_INVALID_OR_EXPIRED",
            message: "Refresh token does not exist in database."
        }
    }

    if (status !== "revoked" && !isValid) {
        await pool.query(`
            WITH rt(user_id) AS (
                SELECT user_id
                FROM refresh_tokens
                WHERE 
                    uuid = $1 
                    AND expires_at > $2
                LIMIT 1
            )
            UPDATE refresh_tokens t
            SET status = 'revoked'
            WHERE user_id = (SELECT user_id FROM rt);
        `, [params.refreshToken, now])

        return {
            status: "REFRESH_TOKEN_REUSE",
            message: "Refresh token has already been used. Revoking all refresh tokens for user."
        }
    }

    if (status === "revoked") {
        return {
            status: "REFRESH_TOKEN_REVOKED",
            message: "Refresh token has been revoked."
        }
    }

    return {
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
} & DBServiceResponse


export async function createRefreshToken(params: CreateRefreshTokenParams): Promise<CreateRefreshTokenResponse> {
    const notExists = await userDoesNotExist(params.userId)
    if (notExists) return notExists
    
    try {
        const expiryDate = new Date(new Date().getTime() + params.validityPeriodSeconds * 1000)
        const query = await pool.query(`
            INSERT INTO refresh_tokens (user_id, expires_at) 
            VALUES ($1, $2)
            RETURNING uuid;
        `, [params.userId, expiryDate])
        const uuid = query.rows[0]["uuid"]
        return {
            status: "SUCCESS",
            message: "Refresh token successfully created."
        }
    } catch (error) {
        if (error instanceof DatabaseError) {
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

export type RevokeRefreshTokenResponse = DBServiceResponse

export async function revokeRefreshToken(params: RevokeRefreshTokenParams): Promise<RevokeRefreshTokenResponse> {
    const query = await pool.query(`
        WITH updated AS (
            UPDATE refresh_tokens
            SET status = 'revoked'
            WHERE uuid = $1
            RETURNING 1
        )
        SELECT EXISTS (SELECT 1 FROM updated LIMIT 1) AS found;
    `, [params.refreshToken])
    const found = query.rows[0]["found"]
    if (found) {
        return {
            status: "SUCCESS",
            message: "Refresh token revoked."
        }
    } else {
        return {
            status: "SUCCESS_REDUNDANT",
            message: "Refresh token does not exist. No need to revoke it."
        }
    }
}