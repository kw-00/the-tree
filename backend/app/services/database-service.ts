import { DatabaseError, Pool } from "pg"

import { AccessTokenManagement, AccessTokenPayload } from "../utilities/access-token-management"

type DatabaseQueryResponse = {
    httpStatus: number
    status: string
    message: string
}

type RefreshTokenFields = {
    refreshToken?: string
}

type GetFriendsFields = {
    friends?: {login: string}[]
}

type CreateChatroomFields = {
    chatroomId?: number
}

type GetConnectedChatroomsFields = {
    connectedChatrooms?: {id: number, name: string}[]
}

type GetConversationFields = {
    conversation?: {userId: number, userLogin: string, content: string}
}

const getGenericErrorResponse = () => {
    return {
        httpStatus: 500,
        status: "GENERIC_ERROR",
        message: "An error occured."
    }
}

const databaseCredentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
}

const pool = new Pool(databaseCredentials)

export default class DatabaseService {
    async registerUser(login: string, password: string): Promise<DatabaseQueryResponse> {
        const query = await pool.query("SELECT api.register_user($1, $2) AS result;", [login, password])
        return query.rows[0].result
    }

    async authenticateUser(login: string, password: string): Promise<DatabaseQueryResponse> {
        const result = await pool.query("SELECT api.authenticate_user($1, $1) AS result;", [login, password])
        return result.rows[0].result

    }

    async refreshToken(refreshToken: string): Promise<DatabaseQueryResponse & RefreshTokenFields> {
        try {
            const query = await pool.query("SELECT api.refresh_token($1, $1) AS result;", 
                [refreshToken, process.env.REFRESH_TOKEN_VALIDITY_PERIOD])
            const queryResult =  query.rows[0].result
            let result;
            if (queryResult.httpStatus === 200) {
                result = {
                    ...queryResult,
                    accessToken: AccessTokenManagement.getToken()
                }
            }
        } catch (error) {
            return getGenericErrorResponse()
        }
    }

    async logOutUser(refreshToken: string): Promise<DatabaseQueryResponse> {
        try {
            return getGenericErrorResponse()
        } catch (error) {
            return getGenericErrorResponse()
        }
    }

    async createMessage(accessToken: string, recipientId: number, content: string): Promise<DatabaseQueryResponse> {
        try {
            return getGenericErrorResponse()
        } catch (error) {
            return getGenericErrorResponse()
        }
        
    }

    async getConnectedChatrooms(accessToken: string): Promise<DatabaseQueryResponse & GetConnectedChatroomsFields> {
        try {
            return getGenericErrorResponse()
        } catch (error) {
            return getGenericErrorResponse()
        }
    }

    async getConversation(accessToken: string, otherUserId: number): Promise<DatabaseQueryResponse & GetConversationFields> {
        try {
            return getGenericErrorResponse()
        } catch (error) {
            return getGenericErrorResponse()
        }
    }

    _verifyAccessToken(accessToken: string): AccessTokenPayload {
        const accessTokenPayload = AccessTokenManagement.verifyToken(accessToken)
        if (accessTokenPayload === null) throw new Error("Invalid access token.")
        return accessTokenPayload
    }
}
