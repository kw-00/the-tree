import * as s from "@/database-service/friends-service"
import { accessToIdThenCall } from "./_internal/utility"
import type { AccessTokenParams, ControllerResponse } from "./public/types"




export type CreateFriendshipCodeParams = AccessTokenParams<s.CreateFriendshipCodeParams>
export type CreateFriendshipCodeResponse = ControllerResponse<s.CreateFriendshipCodeResponse>


export async function createFrienshipCode(params: CreateFriendshipCodeParams): Promise<CreateFriendshipCodeResponse> {
    return accessToIdThenCall(params, s.createFrienshipCode)
}


export type GetFriendshipCodesParams = AccessTokenParams<s.GetFriendshipCodesParams>
export type GetFriendshipCodesResponse = ControllerResponse<s.GetFriendshipCodesResponse>

export async function getFriendshipCodes(params: GetFriendshipCodesParams): Promise<GetFriendshipCodesResponse> {
    return accessToIdThenCall(params, s.getFriendshipCodes)
}

export type RevokeFriendshipCodeParams = AccessTokenParams<s.RevokeFriendshipCodeParams>
export type RevokeFriendshipCodeResponse = ControllerResponse<s.RevokeFriendshipCodeResponse>

export async function revokeFriendshipCode(params: RevokeFriendshipCodeParams): Promise<RevokeFriendshipCodeResponse> {
    return accessToIdThenCall(params, s.revokeFriendshipCode)
}


export type AddFriendParams = AccessTokenParams<s.AddFriendParams>
export type AddFriendResponse = ControllerResponse<s.AddFriendResponse>

export async function addFriend(params: AddFriendParams): Promise<AddFriendResponse> {
    return accessToIdThenCall(params, s.addFriend)
}


export type GetFriendsParams = AccessTokenParams<s.GetFriendsParams>
export type GetFriendsResponse = ControllerResponse<s.GetFriendsResponse>

export async function getFriends(params: GetFriendsParams): Promise<GetFriendsResponse> {
    return accessToIdThenCall(params, s.getFriends)
}
