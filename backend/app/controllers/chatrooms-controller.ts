import * as s from "@/database-service/chatrooms-service"
import { accessToIdThenCall } from "./_internal/utility"
import type { AccessTokenParams, ControllerResponse } from "./public/types"



export type CreateChatroomParams = AccessTokenParams<s.CreateChatroomParams>
export type CreateChatroomResponse = ControllerResponse<s.CreateChatroomResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function createChatroom(params: CreateChatroomParams): Promise<CreateChatroomResponse> {
    return accessToIdThenCall(params, s.createChatroom)
}


export type GetConnectedChatroomsParams = AccessTokenParams<s.GetConnectedChatroomsParams>
export type GetConnectedChatroomsResponse = ControllerResponse<s.GetConnectedChatroomsResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function getConnectedChatrooms(params: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponse> {
    return accessToIdThenCall(params, s.getConnectedChatrooms)
}


export type AddFriendsToChatroomParams = AccessTokenParams<s.AddFriendsToChatroomParams>
export type AddFriendsToChatroomResponse = ControllerResponse<s.AddFriendsToChatroomResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 * - NOT_IN_CHATROOM
 */
export async function addFriendsToChatroom(params: AddFriendsToChatroomParams): Promise<AddFriendsToChatroomResponse> {
    return accessToIdThenCall(params, s.addFriendsToChatroom)
}


export type LeaveChatroomParams = AccessTokenParams<s.LeaveChatroomParams>
export type LeaveChatroomResponse = ControllerResponse<s.LeaveChatroomResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_IN_CHATROOM
 * - NOT_FOUND
 */
export async function leaveChatroom(params: LeaveChatroomParams): Promise<LeaveChatroomResponse> {
    return accessToIdThenCall(params, s.leaveChatroom)
}

