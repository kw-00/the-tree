import { infiniteQueryOptions, mutationOptions, queryOptions } from "@tanstack/react-query"
import { ServerConfig } from "../../server-config"
import * as bs from "./friends-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"


export const createFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.CreateFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.createFriendshipCode(params))
})

export const getFriendshipCodes = queryOptions({
    queryKey: ["friendshipCodes"],
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriendshipCodes()),
})

export const revokeFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.RevokeFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.revokeFriendshipCode(params))
})

export const addFriend = mutationOptions({
    mutationFn: async (params: bs.AddFriendParams) => throwErrorOnRequestFailure(() => bs.addFriend(params))
})

export const getFriends = queryOptions({
    queryKey: ["friends"],
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriends())
})

export const removeFriend = mutationOptions({
    mutationFn: async (params: bs.RemoveFriendParams) => throwErrorOnRequestFailure(() => bs.removeFriend(params))
})

