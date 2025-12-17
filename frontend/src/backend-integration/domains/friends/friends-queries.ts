import { infiniteQueryOptions, mutationOptions, queryOptions } from "@tanstack/react-query"
import { ServerConfig } from "../../server-config"
import * as bs from "./friends-service"
import { throwErrorOnRequestFailure } from "@/backend-integration/00-common/queries/utility"


export const createFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.CreateFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.createFriendshipCode(params))
})

export const getFriendshipCodes = queryOptions({
    queryKey: ["friendshipCodes"],
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriendshipCodes({})),
})

export const revokeFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.RevokeFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.revokeFriendshipCode(params))
})

export const addFriend = mutationOptions({
    mutationFn: async (params: bs.AddFriendParams) => throwErrorOnRequestFailure(() => bs.addFriend(params))
})

type GetFriendsPageParam = {cursor: string | undefined, direction: "next" | "previous"} | undefined

export const getFriends = (boundary: string | undefined) => infiniteQueryOptions({
    queryKey: ["friends"],
    queryFn: async (context) => {
        const pageParam = context.pageParam!
        if (pageParam.direction === "next") {
            const res = await throwErrorOnRequestFailure(() => bs.getNextFriends({
                cursor: pageParam.cursor, 
                limit: ServerConfig.api.friends.getNextFriends.maxBatchSize
            }))
            return res.page!
        } else {
            const res = await throwErrorOnRequestFailure(() => bs.getPreviousFriends({
                cursor: pageParam.cursor!,
                limit: ServerConfig.api.friends.getPreviousFriends.maxBatchSize,
                boundary: boundary
            }))
            return res.page!
        }
    },
    getNextPageParam: (lastPage) => {
        const cursor = lastPage.nextCursor
        return (cursor ? {cursor: cursor, direction: "next"} : undefined) as GetFriendsPageParam
    },
    getPreviousPageParam: (lastPage) => {
        const cursor = lastPage.prevCursor
        return (cursor ? {cursor: cursor, direction: "previous"} : undefined) as GetFriendsPageParam
    },
    initialPageParam: {cursor: undefined, direction: "next"} as GetFriendsPageParam
})

export const removeFriend = mutationOptions({
    mutationFn: async (params: bs.RemoveFriendParams) => throwErrorOnRequestFailure(() => bs.removeFriend(params))
})

