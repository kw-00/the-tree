import { mutationOptions, queryOptions, type QueryKey, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query"
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

const keyFactories = {
    friends: createKeyFactory((_: {}) => ["friends"]),
    chatrooms: createKeyFactory((_: {}) =>  ["chatrooms"]),
    conversations: createKeyFactory((params: {chatroomId: number}) => ["conversations", params.chatroomId]),
}

function createUseQueryFactory<T extends ss.StandardResponseBody, K, P>(
        request: (params: P) => Promise<T>, 
        keyFactory: KeyFactory<K>) {
            
    return (kfParams: K, fnParams: P, options?: Partial<UseQueryOptions>) => queryOptions<T, Error, T, readonly unknown[]>({
        queryKey: keyFactory(kfParams),

        // @ts-ignore
        queryFn: () =>  throwErrorOnRequestFailure(() => request(fnParams)),
        ...defaultQueryOptions,
        ...options
    })

}

function createUseMutationFactory<T extends ss.StandardResponseBody, P>(
        request: (params: P) => Promise<T>) {
            
    return (options?: Partial<UseMutationOptions>) => mutationOptions<T, Error, P, unknown>({
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

const keyFactoryMapping = new Map()
keyFactoryMapping.set(getFriends, keyFactories.friends)
keyFactoryMapping.set(getConnectedChatrooms, keyFactories.chatrooms)
keyFactoryMapping.set(getConversation, keyFactories.conversations)

export const keyFactory = (useQueryFactory: ReturnType<typeof createUseQueryFactory<any, any, any>>) => {
    return keyFactoryMapping.get(useQueryFactory)
}