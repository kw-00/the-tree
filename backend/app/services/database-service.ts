import { Pool } from "pg";
import DatabaseInterface from "./database-interface";
import { AccessTokenManagement, AccessTokenPayload } from "../utilities/access-token-management";

export type DatabaseServiceResponse = {
    httpStatus: number
    status: string
    message: string
    auth?: {
        accessToken: string
        refreshToken: string
    }
    [key: string]: any
}


export default class DatabaseService {
    dbi: DatabaseInterface

    constructor(pool: Pool) {
        this.dbi = new DatabaseInterface(pool)
    }

    async registerUser(login: string, password: string): Promise<DatabaseServiceResponse> {
        return this.dbi.registerUser(login, password)
    }

    async authenticateUser(login: string, password: string): Promise<DatabaseServiceResponse> {
        const authenticationResult = await this.dbi.authenticateUser(login, password)
        if (authenticationResult.httpStatus === 200) {
            const userId = authenticationResult.userId!
            const refreshTokenCreationResult = await this.dbi.createRefreshToken(userId, Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD))
            if (refreshTokenCreationResult.httpStatus === 200) {
                const {refreshToken, ...rest} = refreshTokenCreationResult
                return {
                    ...rest,
                    auth: {
                        accessToken: AccessTokenManagement.getToken(userId),
                        refreshToken: refreshToken!
                    }
                }
            } else {
                return refreshTokenCreationResult
            }
        } else {
            return authenticationResult
        }
    }

    async refreshToken(refreshToken: string): Promise<DatabaseServiceResponse> {
        const verificationResult = await this.dbi.verifyRefreshToken(refreshToken)
        if (verificationResult.httpStatus === 200) {
            const userId = verificationResult.userId!
            const creationResult = await this.dbi.createRefreshToken(userId, Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD))
            if (creationResult.httpStatus === 200) {
                const {refreshToken, ...rest} = creationResult
                return {
                    ...rest,
                    auth: {
                        accessToken: AccessTokenManagement.getToken(userId),
                        refreshToken: refreshToken!
                    }
                }
            } else {
                return creationResult
            }

        } else {
            return verificationResult
        }
    }

    async logOut(refreshToken: string): Promise<DatabaseServiceResponse> {
        return await this.dbi.revokeRefreshToken(refreshToken)
    }

    async addFriend(accessToken: string, userToBefriendLogin: string, friendshipCode: string): Promise<DatabaseServiceResponse> {
        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.addFriend(payload.sub, userToBefriendLogin, friendshipCode))
    }

    async getFriends(accessToken: string): Promise<DatabaseServiceResponse> {
        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.getFriends(payload.sub))
    }

    async addUsersToChatroom(accessToken: string, friendIds: number[], chatroomId: number): Promise<DatabaseServiceResponse> {
        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.addUsersToChatroom(payload.sub, friendIds, chatroomId))
    }

    async createChatroom(accessToken: string, name: string): Promise<DatabaseServiceResponse> {
        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.createChatroom(payload.sub, name))
    }

    async getConnectedRooms(accessToken: string, after: Date): Promise<DatabaseServiceResponse> {
        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.getConnectedChatrooms(payload.sub, after))
    }

    async createMessage(accessToken: string, chatroomId: number, content: string): Promise<DatabaseServiceResponse> {
        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.createMessage(payload.sub, chatroomId, content))
    }

    async getConversation(
            accessToken: string, 
            chatroomId: number,
            before: Date | null,
            after: Date | null,
            nRows: number,
            descending: boolean): Promise<DatabaseServiceResponse> {

        return this._checkAccessTokenAndPerform(accessToken, (payload) => this.dbi.getConversation(payload.sub, chatroomId, before, after, nRows, descending))
    }

    async _checkAccessTokenAndPerform(
            accessToken: string, 
            callback: (payload: AccessTokenPayload) => Promise<DatabaseServiceResponse>): Promise<DatabaseServiceResponse> {

        const tokenVerificationResult = AccessTokenManagement.verifyToken(accessToken)
        if (tokenVerificationResult) {
            return await callback(tokenVerificationResult)
        } else {
            return {
                httpStatus: 401,
                status: "INVALID_ACCESS_TOKEN",
                message: "Access token is not valid."
            }
        }
    }
}