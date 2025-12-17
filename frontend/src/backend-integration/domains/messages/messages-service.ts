import { attemptAndRefreshToken } from "@/backend-integration/00-common/service/utility"
import type { StandardResponse } from "@/backend-integration/00-common/service/types"
import { ServerConfig } from "../../server-config"



const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.path}${ServerConfig.api.messages.path}`
const messagesPaths = ServerConfig.api.messages

export type MessageData = {
    id: number
    content: string
    userId: number
    userLogin: string
    chatroomId: number
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
    return attemptAndRefreshToken(`${baseUrl}${messagesPaths.createMessage.path}`, params)
}


export type GetNextMessagesParams = {
    chatroomId: number
    cursor: number
    limit: number
    boundary?: number
}

export type MessagesPage = {
    messagesData: MessageData[]
    nextCursor: number | undefined
    prevCursor: number | undefined
    hasNextPage: boolean
    hasPrevPage: boolean
}

export type GetMessagesResponse = {
    page?: MessagesPage
} & StandardResponse<"SUCCESS" | "NOT_FOUND" | "NOT_IN_CHATROOM">

export async function getNextMessages(params: GetNextMessagesParams): Promise<GetMessagesResponse> {
    return attemptAndRefreshToken(`${baseUrl}${messagesPaths.getNextMessages.path}`, params)
}

export type GetPreviousMessagesParams = {
    chatroomId: number
    cursor?: number
    limit: number
}

export async function getPreviousMessages(params: GetPreviousMessagesParams): Promise<GetMessagesResponse> {
    return attemptAndRefreshToken(`${baseUrl}${messagesPaths.getPreviousMessages.path}`, params)
}