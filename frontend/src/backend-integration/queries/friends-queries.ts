import { infiniteQueryOptions, mutationOptions, type QueryFunctionContext } from "@tanstack/react-query"
import * as bs from "../backend-service/friends-service"
import { throwErrorOnRequestFailure } from "./_utility"
import { ServerConfig } from "../server-config"
import type { InfiniteScrollPageParam } from "./types"


export const createFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.CreateFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.createFriendshipCode(params))
})

export const getFriendshipCodes = infiniteQueryOptions({
    queryKey: ["friendshipCodes"],
    queryFn: fetchFriendshipCodes,
    getNextPageParam: (lastPage) => {
        const date = lastPage[0].createdAt
        return {
            date: date,
            direction: "after"
        }
    },
    getPreviousPageParam: (firstPage) => {
        const date = firstPage[firstPage.length - 1].createdAt
        return {
            date: date,
            direction: "before"
        }
    },
    initialPageParam: {date: new Date(), direction: "before"}
})

export const revokeFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.RevokeFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.revokeFriendshipCode(params))
})

export const addFriend = mutationOptions({
    mutationFn: async (params: bs.AddFriendParams) => throwErrorOnRequestFailure(() => bs.addFriend(params))
})

export const getFriends = infiniteQueryOptions({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    getNextPageParam: (lastPage) => {
        const date = lastPage[0].friendSince
        return {
            date: date,
            direction: "after"
        }
    },
    getPreviousPageParam: (firstPage) => {
        const date = firstPage[firstPage.length - 1].friendSince
        return {
            date: date,
            direction: "before"
        }
    },
    initialPageParam: {date: new Date(), direction: "before"}
})

export const removeFriend = mutationOptions({
    mutationFn: async (params: bs.RemoveFriendParams) => throwErrorOnRequestFailure(() => bs.removeFriend(params))
})

async function fetchFriendshipCodes(context: QueryFunctionContext) {
    const {date, direction} = context.pageParam as InfiniteScrollPageParam
    const limit = ServerConfig.fetchingRules.friends.friendshipCodes.limit

    let result;
    if (direction === "before") {
        result = await throwErrorOnRequestFailure(() => bs.getFriendshipCodes({
            before: date,
            descending: true,
            limit: limit
        }))
    } else {
        result = await throwErrorOnRequestFailure(() => bs.getFriendshipCodes({
            after: date, 
            descending: false,
            limit: limit
        }))
    }

    result.friendshipCodesData?.sort((fc1, fc2) => fc1.id - fc2.id)
    return result.friendshipCodesData!
}

async function fetchFriends(context: QueryFunctionContext) {
    const {date, direction} = context.pageParam as InfiniteScrollPageParam
    const limit = ServerConfig.fetchingRules.friends.friendshipCodes.limit

    let result;
    if (direction === "before") {
        result = await throwErrorOnRequestFailure(() => bs.getFriends({
            before: date,
            descending: true,
            limit: limit
        }))
    } else {
        result = await throwErrorOnRequestFailure(() => bs.getFriends({
            after: date, 
            descending: false,
            limit: limit
        }))
    }

    result.friendsData?.sort((f1, f2) => f1.friendSince > f2.friendSince ? 1 : -1)
    return result.friendsData!
}

