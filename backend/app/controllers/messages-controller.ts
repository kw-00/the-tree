import * as s from "@/database-service/messages-service"
import { accessToIdThenCall } from "./_internal/utility"
import type { AccessTokenParams, ControllerResponse } from "./public/types"


export type CreateMessageParams = AccessTokenParams<s.CreateMessageParams>
export type CreateMessageResponse = ControllerResponse<s.CreateMessageResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
    return accessToIdThenCall(params, s.createMessage)
}


export type GetMessagesParams = AccessTokenParams<s.GetNextMessagesParams>
export type GetMessagesResponse = ControllerResponse<s.GetNextMessagesResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function getMessages(params: GetMessagesParams): Promise<GetMessagesResponse> {
    return accessToIdThenCall(params, s.getNextMessages)
}
