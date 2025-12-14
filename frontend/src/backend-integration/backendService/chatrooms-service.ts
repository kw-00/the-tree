import { ServerConfig } from "../server-config"
import { attemptAndRefreshToken } from "./_utility"
import type { PaginationParams, StandardResponse } from "./types"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.basePath}${ServerConfig.api.chatrooms.basePath}`
const chatroomsPaths = ServerConfig.api.chatrooms

export type ChatroomData = {
    id: number
    name: string
    joinedAt: Date
}

export type CreateChatroomParams = {
    chatroomName: string
}
export type CreateChatroomResponse = {
    chatroomData?: ChatroomData
} & StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function createChatroom(params: CreateChatroomParams): Promise<CreateChatroomResponse> {
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.createChatroom}`, params)
}


export type GetConnectedChatroomsParams = PaginationParams
export type GetConnectedChatroomsResponse = {
    chatroomsData?: ChatroomData[]
} & StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function getConnectedChatrooms(params: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponse> {
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.getConnectedChatrooms}`, params)
}


export type AddFriendsToChatroomParams = {
    friendIds: number[]
    chatroomId: number
}
export type AddFriendsToChatroomResponse = {
    added?: number[]
    skipped?: number[]
    notFound?: number[]
} & StandardResponse<"SUCCESS" | "NOT_FOUND" | "NOT_IN_CHATROOM">

export async function addFriendsToChatroom(params: AddFriendsToChatroomParams): Promise<AddFriendsToChatroomResponse> {
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.addFriendsToChatroom}`, params)
}


export type LeaveChatroomParams = {
    chatroomId: number
}
export type LeaveChatroomResponse = StandardResponse<"SUCCESS" | "SUCCESS_REDUNDANT" | "NOT_FOUND">

export async function leaveChatroom(params: LeaveChatroomParams): Promise<LeaveChatroomResponse> {
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.leaveChatroom}`, params)
}
