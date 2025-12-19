import { infiniteQueryOptions, mutationOptions, queryOptions } from "@tanstack/react-query"
import { ServerConfig } from "../../server-config"
import * as bs from "./friends-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"


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

type GetFriendsPageParam = {cursor: string | null, direction: "next" | "previous"} | undefined

export const getFriends = (boundary: string | null) => infiniteQueryOptions({
    queryKey: ["friends"],
    queryFn: async (context) => {
        const pageParam = context.pageParam!
        if (pageParam.direction === "next") {
            const res = await throwErrorOnRequestFailure(() => bs.getNextFriends({
                cursor: pageParam.cursor!, 
                limit: ServerConfig.api.messages.getNextMessages.maxBatchSize,
                boundary: boundary
            }))
            return res.page!
        } else {
            const res = await throwErrorOnRequestFailure(() => bs.getPreviousFriends({
                cursor: pageParam.cursor,
                limit: ServerConfig.api.messages.getPreviousMessages.maxBatchSize,
            }))
            return res.page!
        }
    },
    getNextPageParam: (lastPage) => {
        const cursor = lastPage.nextCursor
        const hasNextPage = lastPage.hasNextPage
        return (hasNextPage ? {cursor: cursor, direction: "next"} : undefined) as GetFriendsPageParam
    },
    getPreviousPageParam: (firstPage) => {
        const cursor = firstPage.prevCursor
        const hasPrevPage = firstPage.hasPrevPage
        return (hasPrevPage ? {cursor: cursor, direction: "previous"} : undefined) as GetFriendsPageParam
    },
    initialPageParam: {cursor: null, direction: "previous"} as GetFriendsPageParam
})

export const removeFriend = mutationOptions({
    mutationFn: async (params: bs.RemoveFriendParams) => throwErrorOnRequestFailure(() => bs.removeFriend(params))
})

