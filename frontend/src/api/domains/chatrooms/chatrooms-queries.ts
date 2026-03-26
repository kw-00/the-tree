import { mutationOptions, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import * as bs from "./chatrooms-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"
import { useRef } from "react"

const CHATROOMS_QUERY_KEY = ["chatrooms"]

export const createChatroom = mutationOptions({
    mutationFn: async (params: bs.CreateChatroomParams) => throwErrorOnRequestFailure(() => bs.createChatroom(params))
})


export function useChatroomQuery() {
    const lastFetch = useRef<string | null>(null)
    const query = useQuery(_getChatroomsOptions(lastFetch.current))
    return query
}

export function useInvalidateChatroomsQuery() {
    const queryClient = useQueryClient()
    return async () => await queryClient.invalidateQueries({queryKey: CHATROOMS_QUERY_KEY})
}

const _getChatroomsOptions = (after: string | null) => queryOptions({
    queryKey: CHATROOMS_QUERY_KEY,
    queryFn: () => throwErrorOnRequestFailure(() => bs.getChatrooms({after})),
})

