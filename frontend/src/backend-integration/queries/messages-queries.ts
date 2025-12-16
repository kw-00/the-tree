import { infiniteQueryOptions, mutationOptions, QueryClient, type InfiniteData, type QueryFunctionContext } from "@tanstack/react-query"
import * as bs from "../backend-service/messages-service"
import { throwErrorOnRequestFailure } from "./_utility"
import { ServerConfig } from "../server-config"
import type { InfiniteScrollPageParam } from "./types"


export const createMessage = mutationOptions({
    mutationFn: async (params: bs.CreateMessageParams) => throwErrorOnRequestFailure(() => bs.createMessage(params))
})

export const getMessages = (chatroomId: number | null) => infiniteQueryOptions({
    queryKey: ["chatrooms", chatroomId, "messages"],
    queryFn: getFetchMessagesFunction(chatroomId!),
    getNextPageParam: (lastPage) => {
        return lastPage.nextCursor
    },
    getPreviousPageParam: (firstPage) => {
        return firstPage.prevCursor
    },
    initialPageParam: {date: new Date(), direction: "before"},
    enabled: !!chatroomId
})

const getFetchMessagesFunction = (chatroomId: number) => async function fetchMessages(context: QueryFunctionContext) {
    const {date, direction} = context.pageParam as InfiniteScrollPageParam
    const limit = ServerConfig.fetchingRules.messages.limit

    let result;
    if (direction === "before") {
        result = await throwErrorOnRequestFailure(() => bs.getMessages({
            chatroomId: chatroomId,
            before: date,
            descending: false,
            limit: limit
        }))
    } else {
        result = await throwErrorOnRequestFailure(() => bs.getMessages({
            chatroomId: chatroomId,
            after: date, 
            descending: true,
            limit: limit
        }))
    }
    const messages = result.messagesData!
    
    let nextCursor: any = {
        date: new Date(messages[0].createdAt.getTime() + 1),
        direction: "after"
    }
    
    let prevCursor: any = {
        date: messages[messages.length - 1].createdAt,
        direction: "before"
    }
    console.log(nextCursor)
    messages.sort((m1, m2) => m1.id - m2.id)
    return {
        messages: messages,
        nextCursor: nextCursor,
        prevCursor: prevCursor
    }
}


