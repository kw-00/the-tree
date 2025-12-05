
import * as dbi from "./database-interface";
import { AccessTokenManagement, AccessTokenPayload } from "../utilities/access-token-management";

export type RegisterUserParams = {
    login: string
    password: string
}

export type AuthenticateUserParams = RegisterUserParams

export type RefreshTokenParams = {
    refreshToken: string
}

export type LogOutParams = RefreshTokenParams

export type AddFriendParams = {
    accessToken: string
    userToBefriendLogin: string
    friendshipCode: string
}

export type GetFriendsParams = {
    accessToken: string
}

export type AddFriendsToChatroomParams = {
    accessToken: string
    friendIds: number[]
    chatroomId: number
}

export type CreateChatroomParams = {
    accessToken: string
    chatroomName: string
}

export type GetConnectedChatroomsParams = {
    accessToken: string
    after: Date | null
}

export type CreateMessageParams = {
    accessToken: string
    chatroomId: number
    content: string
}

export type GetConversationParams = {
    accessToken: string
    chatroomId: number
    before: Date | null
    after: Date | null
    nRows: number
    descending: boolean
}

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

export async function registerUser(params: RegisterUserParams): Promise<DatabaseServiceResponse> {
    return dbi.registerUser(params)
}

export async function authenticateUser(params: AuthenticateUserParams): Promise<DatabaseServiceResponse> {
    const authenticationResult = await dbi.authenticateUser(params)
    if (authenticationResult.httpStatus === 200) {
        const userId = authenticationResult.userId!
        const refreshTokenCreationResult = await dbi.createRefreshToken({
            userId: userId, 
            validityPeriodSeconds: Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD)
        })
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

export async function refreshToken(params: RefreshTokenParams): Promise<DatabaseServiceResponse> {
    const verificationResult = await dbi.verifyRefreshToken(params)
    if (verificationResult.httpStatus === 200) {
        const userId = verificationResult.userId!
        const creationResult = await dbi.createRefreshToken({
            userId: userId, 
            validityPeriodSeconds: Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD)
        })
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

export async function logOut(params: LogOutParams): Promise<DatabaseServiceResponse> {
    return await dbi.revokeRefreshToken(params)
}

export async function addFriend(params: AddFriendParams): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(params, dbi.addFriend)
}

export async function getFriends(params: GetFriendsParams): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(params, dbi.getFriends)
}

export async function addFriendsToChatroom(params: AddFriendsToChatroomParams): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(params, dbi.addFriendsToChatroom)
}

export async function createChatroom(params: CreateChatroomParams): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(params, dbi.createChatroom)
}

export async function getConnectedChatrooms(params: GetConnectedChatroomsParams): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(params, dbi.getConnectedChatrooms)
}

export async function createMessage(params: CreateMessageParams): Promise<DatabaseServiceResponse> {
    return _checkAccessTokenAndPerform(params, dbi.createMessage)
}

export async function getConversation(params: GetConversationParams): Promise<DatabaseServiceResponse> {

    return _checkAccessTokenAndPerform(params, dbi.getConversation)
}

async function _checkAccessTokenAndPerform<T extends {accessToken: string}>(
        params: T,
        callback: (params: Omit<T, "accessToken"> & {userId: number}) => Promise<DatabaseServiceResponse>): Promise<DatabaseServiceResponse> {
        
    const {accessToken, ...rest} = params
    const tokenVerificationResult = AccessTokenManagement.verifyToken(accessToken)
    if (tokenVerificationResult) {
        return await callback({userId: tokenVerificationResult.sub, ...rest})
    } else {
        return {
            httpStatus: 401,
            status: "INVALID_ACCESS_TOKEN",
            message: "Access token is not valid."
        }
    }
}
