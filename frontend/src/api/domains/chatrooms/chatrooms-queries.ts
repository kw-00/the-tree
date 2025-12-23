import { mutationOptions, queryOptions, useQuery } from "@tanstack/react-query"
import * as bs from "./chatrooms-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"
import { useRef } from "react"


export const createChatroom = mutationOptions({
    mutationFn: async (params: bs.CreateChatroomParams) => throwErrorOnRequestFailure(() => bs.createChatroom(params))
})


export function useChatroomQuery() {
    const lastFetch = useRef<Date | null>(null)
    const query = useQuery(_getChatroomsOptions(lastFetch.current))
    return query
}

export const _getChatroomsOptions = (after: Date | null) => queryOptions({
    queryKey: ["chatrooms"],
    queryFn: () => throwErrorOnRequestFailure(() => bs.getChatrooms({after})),
})

export const addFriendsToChatroom = mutationOptions({
    mutationFn: async (params: bs.AddFriendsToChatroomParams) => throwErrorOnRequestFailure(() => bs.addFriendsToChatroom(params))
})


export const leaveChatroom = mutationOptions({
    mutationFn: async (params: bs.LeaveChatroomParams) => throwErrorOnRequestFailure(() => bs.leaveChatroom(params))
})


