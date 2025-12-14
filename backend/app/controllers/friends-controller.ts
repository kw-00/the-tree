import * as s from "@/database-service/friends-service"
import { accessToIdThenCall } from "./_internal/utility"
import type { AccessTokenParams, ControllerResponse } from "./public/types"




export type CreateFriendshipCodeParams = AccessTokenParams<s.CreateFriendshipCodeParams>
export type CreateFriendshipCodeResponse = ControllerResponse<s.CreateFriendshipCodeResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function createFriendshipCode(params: CreateFriendshipCodeParams): Promise<CreateFriendshipCodeResponse> {
    return accessToIdThenCall(params, s.createFrienshipCode)
}


export type GetFriendshipCodesParams = AccessTokenParams<s.GetFriendshipCodesParams>
export type GetFriendshipCodesResponse = ControllerResponse<s.GetFriendshipCodesResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function getFriendshipCodes(params: GetFriendshipCodesParams): Promise<GetFriendshipCodesResponse> {
    return accessToIdThenCall(params, s.getFriendshipCodes)
}

export type RevokeFriendshipCodeParams = AccessTokenParams<s.RevokeFriendshipCodeParams>
export type RevokeFriendshipCodeResponse = ControllerResponse<s.RevokeFriendshipCodeResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 * - NOT_OWNER_OF_FRIENDSHIP_CODE
 */
export async function revokeFriendshipCode(params: RevokeFriendshipCodeParams): Promise<RevokeFriendshipCodeResponse> {
    return accessToIdThenCall(params, s.revokeFriendshipCode)
}


export type AddFriendParams = AccessTokenParams<s.AddFriendParams>
export type AddFriendResponse = ControllerResponse<s.AddFriendResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 * - INVALID_FRIENDSHIP_CODE
 */
export async function addFriend(params: AddFriendParams): Promise<AddFriendResponse> {
    return accessToIdThenCall(params, s.addFriend)
}


export type GetFriendsParams = AccessTokenParams<s.GetFriendsParams>
export type GetFriendsResponse = ControllerResponse<s.GetFriendsResponse>


/**
 * Possible status values:
 * - SUCCESS
 * - NOT_FOUND
 */
export async function getFriends(params: GetFriendsParams): Promise<GetFriendsResponse> {
    return accessToIdThenCall(params, s.getFriends)
}


export type RemoveFriendParams = AccessTokenParams<s.RemoveFriendParams>
export type RemoveFriendResponse = ControllerResponse<s.RemoveFriendResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - SUCCESS_REDUNDANT
 * - NOT_FOUND
 */
export async function removeFriend(params: RemoveFriendParams): Promise<RemoveFriendResponse> {
    return accessToIdThenCall(params, s.removeFriend)
}
