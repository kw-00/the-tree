import { ServerConfig } from "../server-config"
import { attemptAndRefreshToken } from "./_utility"
import type { PaginationParams, StandardResponse } from "./types"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.basePath}${ServerConfig.api.messages.basePath}`
const messagesPaths = ServerConfig.api.messages

export type MessageData = {
    id: number
    content: string
    userId: number
    userLogin: string
    createdAt: Date
}

export type CreateMessageParams = {
    chatroomId: number
    content: string
}

export type CreateMessageResponse = {
    messageData?: MessageData
} & StandardResponse<"SUCCESS" | "NOT_FOUND" | "NOT_IN_CHATROOM">

export async function createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
    return attemptAndRefreshToken(`${baseUrl}${messagesPaths.createMessage}`, params)
}


export type GetMessagesParams = {
    chatroomId: number
} & PaginationParams

export type GetMessagesResponse = {
    messagesData?: MessageData[]
} & StandardResponse<"SUCCESS" | "NOT_FOUND" | "NOT_IN_CHATROOM">

export async function getMessages(params: GetMessagesParams): Promise<GetMessagesResponse> {
    return attemptAndRefreshToken(`${baseUrl}${messagesPaths.getMessages}`, params)
}