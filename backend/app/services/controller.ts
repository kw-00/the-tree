
import * as dbi from "./database-interface";
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

export async function registerUser(login: string, password: string): Promise<DatabaseServiceResponse> {
    return dbi.registerUser(login, password)
}

export async function authenticateUser(login: string, password: string): Promise<DatabaseServiceResponse> {
    const authenticationResult = await dbi.authenticateUser(login, password)
    if (authenticationResult.httpStatus === 200) {
        const userId = authenticationResult.userId!
        const refreshTokenCreationResult = await dbi.createRefreshToken(userId, Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD))
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

export async function refreshToken(refreshToken: string): Promise<DatabaseServiceResponse> {
    const verificationResult = await dbi.verifyRefreshToken(refreshToken)
    if (verificationResult.httpStatus === 200) {
        const userId = verificationResult.userId!
        const creationResult = await dbi.createRefreshToken(userId, Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD))
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

export async function logOut(refreshToken: string): Promise<DatabaseServiceResponse> {
    return await dbi.revokeRefreshToken(refreshToken)
}

export async function addFriend(accessToken: string, userToBefriendLogin: string, friendshipCode: string): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.addFriend(payload.sub, userToBefriendLogin, friendshipCode))
}

export async function getFriends(accessToken: string): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.getFriends(payload.sub))
}

export async function addFriendsToChatroom(accessToken: string, friendIds: number[], chatroomId: number): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.addFriendsToChatroom(payload.sub, friendIds, chatroomId))
}

export async function createChatroom(accessToken: string, chatroomName: string): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.createChatroom(payload.sub, chatroomName))
}

export async function getConnectedChatrooms(accessToken: string, after: Date | null): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.getConnectedChatrooms(payload.sub, after))
}

export async function createMessage(accessToken: string, chatroomId: number, content: string): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.createMessage(payload.sub, chatroomId, content))
}

export async function getConversation(
        accessToken: string, 
        chatroomId: number,
        before: Date | null,
        after: Date | null,
        nRows: number,
        descending: boolean): Promise<DatabaseServiceResponse> {

    return _checkAccessTokenAndPerform(accessToken, (payload) => dbi.getConversation(payload.sub, chatroomId, before, after, nRows, descending))
}

async function _checkAccessTokenAndPerform(
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
