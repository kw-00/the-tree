import { ServerConfig } from "../server-config"
import { attemptAndRefreshToken } from "./_utility"
import type { PaginationParams, StandardResponse } from "./types"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.basePath}${ServerConfig.api.friends.basePath}`
const friendsPaths = ServerConfig.api.friends

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
    code: string
    expiresAt?: Date
}
export type CreateFriendshipCodeResponse = StandardResponse<"SUCCESS" | "NOT_FOUND">


export async function createFriendshipCode(params: CreateFriendshipCodeParams): Promise<CreateFriendshipCodeResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.createFriendshipCode}`, params)
}


export type GetFriendshipCodesParams = PaginationParams
export type GetFriendshipCodesResponse = StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function getFriendshipCodes(params: GetFriendshipCodesParams): Promise<GetFriendshipCodesResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.getFriendshipCodes}`, params)
}

export type RevokeFriendshipCodeParams = {
    friendshipCodeId: number
}
export type RevokeFriendshipCodeResponse = StandardResponse<
    "SUCCESS" 
    | "SUCCESS_REDUNDANT"
    | "NOT_FOUND"
    | "NOT_OWNER_OF_FRIENDSHIP_CODE"
>

export async function revokeFriendshipCode(params: RevokeFriendshipCodeParams): Promise<RevokeFriendshipCodeResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.revokeFriendshipCode}`, params)
}


export type AddFriendParams = {
    userToBefriendLogin: string
    friendshipCode: string
}
export type AddFriendResponse = StandardResponse<
    "SUCCESS" 
    | "SUCCESS_REDUNDANT"
    | "NOT_FOUND"
    | "INVALID_FRIENDSHIP_CODE"
>

export async function addFriend(params: AddFriendParams): Promise<AddFriendResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.addFriend}`, params)
}


export type GetFriendsParams = PaginationParams
export type GetFriendsResponse = StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function getFriends(params: GetFriendsParams): Promise<GetFriendsResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.getFriends}`, params)
}


export type RemoveFriendParams = {
    friendId: number
}
export type RemoveFriendResponse = StandardResponse<"SUCCESS" | "SUCCESS_REDUNDANT" | "NOT_FOUND">

export async function removeFriend(params: RemoveFriendParams): Promise<RemoveFriendResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.removeFriend}`, params)
}
