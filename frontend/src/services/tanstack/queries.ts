import { mutationOptions, queryOptions } from "@tanstack/react-query"
import * as serverService from "@/services/server/server-service"


type QueryKeys = {
    [key: string]: any
}

export const KEYS: QueryKeys = {
    FRIENDS: ["friends"],
    CHATROOMS: ["chatrooms"],
    CONVERSATIONS: ["conversations"],
}

class ServerServiceError<T extends serverService.StandardResponseBody> extends Error {
    response
    
    constructor(response: T, message?: string) {
        super(message)
        this.response = response
    }
}


async function throwErrorOnRequestFailure<T extends serverService.StandardResponseBody>(request: () => Promise<T>, message?: string): Promise<T> {
    const result = await request()
    if (result.httpStatus === 200) {
        return result
    } else {
        throw new ServerServiceError(result, message)
    }
}

export function registerAndLoginOptions(login: string, password: string) {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(() => serverService.registerAndLogIn(login, password))
    })
}

export function authenticateUserOptions(login: string, password: string) {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(() => serverService.authenticateUser(login, password))
    })
}

export function logOutOptions() {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(serverService.logOut)
    })
}

export function addFriendOptions(userToBefriendLogin: string, friendshipCode: string) {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(() => serverService.addFriend(userToBefriendLogin, friendshipCode))
    })
}

export function getFriendsOptions() {
    return queryOptions({
        queryKey: KEYS.FRIENDS,
        queryFn: () => throwErrorOnRequestFailure(serverService.getFriends)
    })
}

export function addFriendsToChatroomOptions(friendIds: number[], chatroomId: number) {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(() => serverService.addFriendsToChatroom(friendIds, chatroomId))
    })
}

export function createChatroomOptions(chatroomName: string) {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(() => serverService.createChatroom(chatroomName))
    })
}

export function getConnectedChatroomsOptions(after: Date | null) {
    return queryOptions({
        queryKey: KEYS.CHATROOMS,
        queryFn: () => throwErrorOnRequestFailure(() => serverService.getConnectedChatrooms(after))
    })
}

export function createMessageOptions(chatroomId: number, content: string) {
    return mutationOptions({
        mutationFn: () => throwErrorOnRequestFailure(() => serverService.createMessage(chatroomId, content))
    })
}


type GetConversationParams = {
    chatroomId: number
    before: Date | null | undefined
    after: Date | null | undefined
    nRows: number
    descending: boolean
}
export function getConversationOptions({chatroomId, before, after, nRows, descending}: GetConversationParams) {
    return queryOptions({
        queryKey: KEYS.CONVERSATIONS.concat(chatroomId),
        queryFn: () => throwErrorOnRequestFailure(() => serverService.getConversation(chatroomId, before ?? null, after ?? null, nRows, descending))
    })
}