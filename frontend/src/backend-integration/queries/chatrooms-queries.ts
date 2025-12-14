import { infiniteQueryOptions, mutationOptions, type QueryFunctionContext } from "@tanstack/react-query"
import * as bs from "../backendService/chatrooms-service"
import { throwErrorOnRequestFailure } from "./_utility"
import { ServerConfig } from "../server-config"
import type { InfiniteScrollPageParam } from "./types"


export const createChatroom = mutationOptions({
    mutationFn: async (params: bs.CreateChatroomParams) => throwErrorOnRequestFailure(() => bs.createChatroom(params))
})

export const getConnectedChatrooms = infiniteQueryOptions({
    queryKey: ["chatrooms"],
    queryFn: fetchChatrooms,
    getNextPageParam: (lastPage) => {
        const date = lastPage[lastPage.length - 1].joinedAt
        return {
            date: date,
            direction: "before"
        }
    },
    getPreviousPageParam: (firstPage) => {
        const date = firstPage[0].joinedAt
        return {
            date: date,
            direction: "after"
        }
    },
    initialPageParam: {date: new Date(), direction: "before"}
})


export const addFriendsToChatroom = mutationOptions({
    mutationFn: async (params: bs.AddFriendsToChatroomParams) => throwErrorOnRequestFailure(() => bs.addFriendsToChatroom(params))
})


export const leaveChatroom = mutationOptions({
    mutationFn: async (params: bs.LeaveChatroomParams) => throwErrorOnRequestFailure(() => bs.leaveChatroom(params))
})

async function fetchChatrooms(context: QueryFunctionContext) {
    const {date, direction} = context.pageParam as InfiniteScrollPageParam
    const limit = ServerConfig.fetchingRules.chatrooms.limit

    let result;
    if (direction === "before") {
        result = await throwErrorOnRequestFailure(() => bs.getConnectedChatrooms({
            before: date,
            descending: true,
            limit: limit
        }))
    } else {
        result = await throwErrorOnRequestFailure(() => bs.getConnectedChatrooms({
            after: date, 
            descending: false,
            limit: limit
        }))
    }

    return result.chatroomsData!
}


