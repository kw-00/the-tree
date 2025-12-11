import * as s from "@/database-service/messages-service"
import { accessToIdThenCall, type AccessTokenParams, type ControllerResponse } from "./general/utility"

export type CreateMessageParams = AccessTokenParams<s.CreateMessageParams>
export type CreateMessageResponse = ControllerResponse<s.CreateMessageResponse>

export async function createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
    return accessToIdThenCall(params, s.createMessage)
}


export type GetMessagesParams = AccessTokenParams<s.GetMessagesParams>
export type GetMessagesResponse = ControllerResponse<s.GetMessagesResponse>

export async function getMessages(params: GetMessagesParams): Promise<GetMessagesResponse> {
    return accessToIdThenCall(params, s.getMessages)
}
