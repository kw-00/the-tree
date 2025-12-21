import { mutationOptions, queryOptions } from "@tanstack/react-query"
import * as bs from "./chatrooms-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"



export const createChatroom = mutationOptions({
    mutationFn: async (params: bs.CreateChatroomParams) => throwErrorOnRequestFailure(() => bs.createChatroom(params))
})

export const getChatrooms = (after: Date | null) => queryOptions({
    queryKey: ["chatrooms"],
    queryFn: () => throwErrorOnRequestFailure(() => bs.getChatrooms({after})),
})


export const addFriendsToChatroom = mutationOptions({
    mutationFn: async (params: bs.AddFriendsToChatroomParams) => throwErrorOnRequestFailure(() => bs.addFriendsToChatroom(params))
})


export const leaveChatroom = mutationOptions({
    mutationFn: async (params: bs.LeaveChatroomParams) => throwErrorOnRequestFailure(() => bs.leaveChatroom(params))
})


