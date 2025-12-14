import { infiniteQueryOptions, mutationOptions, type QueryFunctionContext } from "@tanstack/react-query"
import * as bs from "../backendService/messages-service"
import { throwErrorOnRequestFailure } from "./_utility"
import { ServerConfig } from "../server-config"
import type { InfiniteScrollPageParam } from "./types"


export const createMessage = mutationOptions({
    mutationFn: async (params: bs.CreateMessageParams) => throwErrorOnRequestFailure(() => bs.createMessage(params))
})

export const getMessages = (chatroomId: number) => infiniteQueryOptions({
    queryKey: ["chatrooms", chatroomId],
    queryFn: getFetchMessagesFunction(chatroomId),
    getNextPageParam: (lastPage) => {
        const date = lastPage[lastPage.length - 1].createdAt
        return {
            date: date,
            direction: "before"
        }
    },
    getPreviousPageParam: (firstPage) => {
        const date = firstPage[0].createdAt
        return {
            date: date,
            direction: "after"
        }
    },
    initialPageParam: {date: new Date(), direction: "before"}
})

const getFetchMessagesFunction = (chatroomId: number) => async function fetchMessages(context: QueryFunctionContext) {
    const {date, direction} = context.pageParam as InfiniteScrollPageParam
    const limit = ServerConfig.fetchingRules.messages.limit

    let result;
    if (direction === "before") {
        result = await throwErrorOnRequestFailure(() => bs.getMessages({
            chatroomId: chatroomId,
            before: date,
            descending: true,
            limit: limit
        }))
    } else {
        result = await throwErrorOnRequestFailure(() => bs.getMessages({
            chatroomId: chatroomId,
            after: date, 
            descending: false,
            limit: limit
        }))
    }

    return result.messagesData!
}


