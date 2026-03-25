import { mutationOptions, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import * as bs from "./friends-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"
import { useRef } from "react"

const FRIENDSHIP_CODES_QUERY_KEY = ["friendshipCodes"]

export const createFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.CreateFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.createFriendshipCode(params))
})

export function useFriendshipCodesQuery() {
    const lastFetch = useRef<string | null>(null)
    const query = useQuery(_getFriendshipCodesOptions(lastFetch.current))
    return query
}

export function useInvalidateFriendshipCodesQuery() {
    const queryClient = useQueryClient()
    return async () => await queryClient.invalidateQueries({queryKey: FRIENDSHIP_CODES_QUERY_KEY})
}


const _getFriendshipCodesOptions = (after: string | null) => queryOptions({
    queryKey: FRIENDSHIP_CODES_QUERY_KEY,
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriendshipCodes({after})),
})


const FRIENDS_QUERY_KEY = ["friends"]

export function useFriendsQuery() {
    const lastFetch = useRef<string | null>(null)
    const query = useQuery(_getFriendsOptions(lastFetch.current))
    return query
}

export function useInvalidateFriendsQuery() {
    const queryClient = useQueryClient()
    return async () => queryClient.invalidateQueries({queryKey: FRIENDS_QUERY_KEY})
}

const _getFriendsOptions = (after: string | null) => queryOptions({
    queryKey: FRIENDS_QUERY_KEY,
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriends({after})),
})


