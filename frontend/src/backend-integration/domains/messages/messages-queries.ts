import { infiniteQueryOptions, mutationOptions } from "@tanstack/react-query"
import * as bs from "./messages-service"
import { throwErrorOnRequestFailure } from "../../00-common/queries/utility"
import { ServerConfig } from "../../server-config"


export const createMessage = mutationOptions({
    mutationFn: async (params: bs.CreateMessageParams) => throwErrorOnRequestFailure(() => bs.createMessage(params))
})

type GetFriendsPageParam = {cursor: number | undefined, direction: "next" | "previous"} | undefined
export const getMessages = (chatroomId: number | null, boundary: number | undefined) => infiniteQueryOptions({
    queryKey: ["friends", chatroomId],
    queryFn: async (context) => {
        const pageParam = context.pageParam!
        if (pageParam.direction === "next") {
            const res = await throwErrorOnRequestFailure(() => bs.getNextMessages({
                chatroomId: chatroomId!,
                cursor: pageParam.cursor!, 
                limit: ServerConfig.api.friends.getNextFriends.maxBatchSize,
                boundary: boundary
            }))
            return res.page!
        } else {
            const res = await throwErrorOnRequestFailure(() => bs.getPreviousMessages({
                chatroomId: chatroomId!,
                cursor: pageParam.cursor!,
                limit: ServerConfig.api.friends.getPreviousFriends.maxBatchSize,
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
    initialPageParam: {cursor: undefined, direction: "next"} as GetFriendsPageParam,
    enabled: !!chatroomId
})



