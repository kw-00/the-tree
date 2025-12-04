import { useMutation, useQuery, type QueryKey, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as ss from "@/services/server-service"


class ServerServiceError<T extends ss.StandardResponseBody> extends Error {
    response
    
    constructor(response: T) {
        super(response.message)
        this.response = response
    }
}

const defaultQueryOptions: Partial<UseQueryOptions> = {

}

const defaultMutationOptions: Partial<UseMutationOptions> = {
    
}

type KeyFactory<T> = (params: T) => QueryKey

function createKeyFactory<T>(fn: (params: T) => QueryKey): KeyFactory<T> {
    return fn
}

export const keyFactories = {
    friends: createKeyFactory(() => ["friends"]),
    chatrooms: createKeyFactory(() =>  ["chatrooms"]),
    conversations: createKeyFactory((params: {chatroomId: number}) => ["conversations", params.chatroomId]),
}

function createUseQueryFactory<T extends ss.StandardResponseBody, K, P>(
        request: (params: P) => Promise<T>, 
        keyFactory: KeyFactory<K>, 
        options?: UseQueryOptions) {
            
    return (kfParams: K, fnParams: P) => useQuery({
        queryKey: keyFactory(kfParams),
        queryFn: () =>  throwErrorOnRequestFailure(() => request(fnParams)),
        ...defaultQueryOptions,
        ...options
    })
}

function createUseMutationFactory<T extends ss.StandardResponseBody, P>(
        request: (params: P) => Promise<T>, 
        options?: UseMutationOptions) {
            
    return () => useMutation<unknown, Error, P, unknown>({
        // @ts-ignore
        mutationFn: (params: P) => throwErrorOnRequestFailure(() => request(params)),
        ...defaultMutationOptions,
        ...options
    })
}

async function throwErrorOnRequestFailure
        <T extends ss.StandardResponseBody>(request: () => Promise<T>): Promise<T> {
    const result = await request()
    if (result.httpStatus === 200) {
        return result
    } else {
        throw new ServerServiceError(result)
    }
}

export const registerAndLogin = createUseMutationFactory(ss.registerAndLogIn)
export const authenticateUser = createUseMutationFactory(ss.authenticateUser)
export const logOut = createUseMutationFactory(ss.logOut)
export const addFriend = createUseMutationFactory(ss.addFriend)
export const getFriends = createUseQueryFactory(ss.getFriends, keyFactories.friends)
export const addFriendsToChatroom = createUseMutationFactory(ss.addFriendsToChatroom)
export const createChatroom = createUseMutationFactory(ss.createChatroom)
export const getConnectedChatrooms = createUseQueryFactory(ss.getConnectedChatrooms, keyFactories.chatrooms)
export const createMessage = createUseMutationFactory(ss.createMessage)
export const getConversation = createUseQueryFactory(ss.getConversation, keyFactories.conversations)