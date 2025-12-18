import type { StandardResponse } from "../00-common/service/types"
import { ServerConfig } from "../../server-config"
import { attemptAndRefreshToken } from "../00-common/service/utility"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.path}${ServerConfig.api.friends.path}`
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
export type CreateFriendshipCodeResponse = {
    friendshipCodeData?: FriendshipCodeData
} & StandardResponse<"SUCCESS" | "NOT_FOUND">


export async function createFriendshipCode(params: CreateFriendshipCodeParams): Promise<CreateFriendshipCodeResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.createFriendshipCode.path}`, params)
}


export type GetFriendshipCodesParams = {}
export type GetFriendshipCodesResponse = {
    friendshipCodesData?: FriendshipCodeData[]
} & StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function getFriendshipCodes(params: GetFriendshipCodesParams): Promise<GetFriendshipCodesResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.getFriendshipCodes.path}`, params)
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
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.revokeFriendshipCode.path}`, params)
}


export type AddFriendParams = {
    userToBefriendLogin: string
    friendshipCode: string
}
export type AddFriendResponse = {
    friendData?: FriendData
} & StandardResponse<
    "SUCCESS" 
    | "SUCCESS_REDUNDANT"
    | "NOT_FOUND"
    | "INVALID_FRIENDSHIP_CODE"
>

export async function addFriend(params: AddFriendParams): Promise<AddFriendResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.addFriend.path}`, params)
}


export type GetNextFriendsParams = {
    cursor: string | null
    limit: number
}

export type FriendsPage = {
    friendsData: FriendData[]
    nextCursor: string | null
    prevCursor: string | null
    hasNextPage: boolean
    hasPrevPage: boolean
}

export type GetFriendsResponse = {
    page?: FriendsPage
} & StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function getNextFriends(params: GetNextFriendsParams): Promise<GetFriendsResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.getNextFriends.path}`, params)
}

export type GetPreviousFriendsParams = {
    cursor: string
    limit: number
    boundary: string | null
}

export async function getPreviousFriends(params: GetPreviousFriendsParams): Promise<GetFriendsResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.getPreviousFriends.path}`, params)
}


export type RemoveFriendParams = {
    friendId: number
}
export type RemoveFriendResponse = StandardResponse<"SUCCESS" | "SUCCESS_REDUNDANT" | "NOT_FOUND">

export async function removeFriend(params: RemoveFriendParams): Promise<RemoveFriendResponse> {
    return attemptAndRefreshToken(`${baseUrl}${friendsPaths.removeFriend.path}`, params)
}
