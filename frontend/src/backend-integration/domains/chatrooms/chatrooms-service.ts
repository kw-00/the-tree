import { attemptAndRefreshToken } from "../00-common/service/utility"
import type { StandardResponse } from "../00-common/service/types"
import { ServerConfig } from "../../server-config"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.path}${ServerConfig.api.chatrooms.path}`
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
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.createChatroom.path}`, params)
}


export type GetConnectedChatroomsParams = {}
export type GetConnectedChatroomsResponse = {
    chatroomsData?: ChatroomData[]
} & StandardResponse<"SUCCESS" | "NOT_FOUND">

export async function getChatrooms(params: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponse> {
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.getChatrooms.path}`, params)
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
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.addFriendsToChatroom.path}`, params)
}


export type LeaveChatroomParams = {
    chatroomId: number
}
export type LeaveChatroomResponse = StandardResponse<"SUCCESS" | "SUCCESS_REDUNDANT" | "NOT_FOUND">

export async function leaveChatroom(params: LeaveChatroomParams): Promise<LeaveChatroomResponse> {
    return attemptAndRefreshToken(`${baseUrl}${chatroomsPaths.leaveChatroom.path}`, params)
}
