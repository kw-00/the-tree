import { DatabaseError, Pool } from "pg"

import Service from "./service"
import * as appErrors from "../app-errors/errors"
import { AccessTokenManagement, AccessTokenPayload } from "../utilities/access-token-management"

const databaseCredentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
}

const pool = new Pool(databaseCredentials)

export default class DatabaseService implements Service {
    async registerUser(login: string, password: string): Promise<void> {
        try {
            await pool.query("SELECT api.register_user($1, $2);", [login, password])
        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P1001") {
                    throw new appErrors.LoginInUseError(error.message)
                }
            }
            throw new appErrors.GenericError("An error occurred.", error as Error)

        }
    }

    async authenticateUser(login: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const authenticationResult = await pool.query("SELECT api.authenticate_user($1, $2);", [login, password])
            const userId = authenticationResult.rows[0].authenticate_user as number

            return await this._getTokenPair(userId)
        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P1000") {
                    throw new appErrors.PkInUseError(error.message)
                } else if (error.code === "P2000") {
                    throw new appErrors.AuthenticationFailedError(error.message)
                }
            }
            throw new appErrors.GenericError("An error occurred.", error as Error)
        }

    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const verificationResult = await pool.query("SELECT api.verify_refresh_token($1);", [refreshToken])
            const userId = verificationResult.rows[0].verify_refresh_token as number

            return await this._getTokenPair(userId)


        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P3000") {
                    throw new appErrors.InvalidAccessTokenError(error.message)
                } else if (error.code === "P3001") {
                    throw new appErrors.RefreshTokenExpiredError(error.message)
                } else if (error.code === "P3002") {
                    await pool.query("SELECT api.revoke_related_tokens($1);", [refreshToken])
                    throw new appErrors.RefreshTokenReuseError(error.message)
                } else if (error.code === "P3003") {
                    throw new appErrors.RefreshTokenRevokedError(error.message)
                }
            }
            throw new appErrors.GenericError("An error occurred.", error as Error)
        }
    }

    async logOutUser(refreshToken: string): Promise<void> {
        try {
            await pool.query("SELECT api.revoke_token($1);", [refreshToken])
        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P4002") {
                    throw new appErrors.RefreshTokenNotFoundError(error.message)
                }
            }
            throw new appErrors.GenericError("An error occurred.", error as Error)
        }
    }

    async createMessage(accessToken: string, recipientId: number, content: string): Promise<void> {
        try {
            const accessTokenPayload = this._verifyAccessToken(accessToken)
            
            await pool.query("SELECT api.create_message($1, $2, $3);", [accessTokenPayload.sub, recipientId, content])
        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P4001") throw new appErrors.UserNotFoundError(error.message)
            }
            if (error instanceof appErrors.AppError) throw error;
            throw new appErrors.GenericError("An error occurred.", error as Error)
        }
        
    }

    async findConnectedUsers(accessToken: string): Promise<{ id: number; login: string }[]> {
        try {
            const accessTokenPayload = this._verifyAccessToken(accessToken)

            const result = await pool.query("SELECT * FROM api.find_connected_users($1);", [accessTokenPayload.sub])
            return result.rows

        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P4001") throw new appErrors.UserNotFoundError(error.message)
            }
            if (error instanceof appErrors.AppError) throw error
            throw new appErrors.GenericError("An error occurred.", error as Error)
        }
    }

    async getConversation(accessToken: string, otherUserId: number): Promise<{ senderId: number, content: string }[]> {
        try {
            const accessTokenPayload = this._verifyAccessToken(accessToken)

            const result = await pool.query("SELECT * FROM api.get_conversation($1, $2);", [accessTokenPayload.sub, otherUserId])
            const camelCaseResult: {senderId: number, content: string}[] = []
            for (const message of result.rows) {
                const {sender_id, content} = message
                camelCaseResult.push({
                    senderId: sender_id,
                    content: content
                })
            }
            return camelCaseResult

        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.code === "P4001") throw new appErrors.UserNotFoundError(error.message)
            }
            if (error instanceof appErrors.AppError) throw error
            throw new appErrors.GenericError("An error occurred.", error as Error)
        }
    }

    _verifyAccessToken(accessToken: string): AccessTokenPayload {
        const accessTokenPayload = AccessTokenManagement.verifyToken(accessToken)
        if (accessTokenPayload === null) throw new appErrors.InvalidAccessTokenError("Invalid access token.")
        return accessTokenPayload
    }

    async _getTokenPair(userId: number): Promise<{ accessToken: string, refreshToken: string }> {
        const refreshResult = await pool.query("SELECT api.create_refresh_token($1, $2);", [userId, process.env.REFRESH_TOKEN_VALIDITY_PERIOD])
        const refreshToken = refreshResult.rows[0].create_refresh_token as string

        const accessToken = AccessTokenManagement.getToken(userId)

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }

    }
}
