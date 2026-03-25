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


export const _getFriendshipCodesOptions = (after: string | null) => queryOptions({
    queryKey: FRIENDSHIP_CODES_QUERY_KEY,
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriendshipCodes({after})),
})

export const revokeFriendshipCode = mutationOptions({
    mutationFn: async (params: bs.RevokeFriendshipCodeParams) => throwErrorOnRequestFailure(() => bs.revokeFriendshipCode(params))
})

export const addFriend = mutationOptions({
    mutationFn: async (params: bs.AddFriendParams) => throwErrorOnRequestFailure(() => bs.addFriend(params))
})

export function useFriendsQuery() {
    const lastFetch = useRef<string | null>(null)
    const query = useQuery(_getFriendsOptions(lastFetch.current))
    return query
}

export const _getFriendsOptions = (after: string | null) => queryOptions({
    queryKey: ["friends"],
    queryFn: () => throwErrorOnRequestFailure(() => bs.getFriends({after})),
})

export const removeFriend = mutationOptions({
    mutationFn: async (params: bs.RemoveFriendParams) => throwErrorOnRequestFailure(() => bs.removeFriend(params))
})

