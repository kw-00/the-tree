import {API} from "./api"

const baseUrl = import.meta.env.VITE_API_BASE_URL


export type StandardResponseBody = {
    httpStatus: number
    status: string
    message: string
    [key: string]: any
}

export type RegisterUserResponseBody = {
    userId?: number
} & StandardResponseBody

export type AuthenticateUserResponseBody = RegisterUserResponseBody

export type AddFriendsToChatroomResponseBody = {
    added?: number[]
    skipped?: number[]
    notFound?: number[]
} & StandardResponseBody

export type GetFriendsResponseBody = {
    friends?: {id: number, login: string}[]
} & StandardResponseBody

export type CreateChatroomResponseBody = {
    chatroomId?: number
} & StandardResponseBody

export type GetConnectedChatroomsResponseBody = {
    connectedChatrooms?: {id: number, name: string}[]
} & StandardResponseBody


export type GetConversationResponseBody = {
    conversation?: {userId: number, userLogin: string, content: string}[]
} & StandardResponseBody

async function registerUser(login: string, password: string): Promise<RegisterUserResponseBody> {
    return _makeRequest(API.REGISTER_USER, {
        login: login,
        password: password
    })
}


export async function authenticateUser(login: string, password: string): Promise<AuthenticateUserResponseBody> {
    return _makeRequest(API.AUTHENTICATE_USER, {
        login: login,
        password: password
    }) 
}

export async function registerAndLogIn(login: string, password: string): Promise<RegisterUserResponseBody & AuthenticateUserResponseBody> {
    const registrationResult = await registerUser(login, password)
    if (registrationResult.httpStatus !== 200) {
        return registrationResult
    }
    return authenticateUser(login, password)
}

export async function logOut(): Promise<StandardResponseBody> {
    return _makeRequest(API.LOG_OUT)
}

export async function addFriend(userToBefriendLogin: string, friendshipCode: string): Promise<StandardResponseBody> {
    return _attemptAndRefreshToken(API.ADD_FRIEND, {
        userToBefriendLogin: userToBefriendLogin,
        friendshipCode: friendshipCode
    })
}

export async function getFriends(): Promise<GetFriendsResponseBody> {
    return _attemptAndRefreshToken(API.GET_FRIENDS)
}

export async function addFriendsToChatroom(friendIds: number[], chatroomId: number): Promise<AddFriendsToChatroomResponseBody> {
    return _attemptAndRefreshToken(API.ADD_FRIENDS_TO_CHATROOM, {
        friendIds: friendIds,
        chatroomId: chatroomId
    })
}

export async function createChatroom(chatroomName: string): Promise<CreateChatroomResponseBody> {
    return _attemptAndRefreshToken(API.CREATE_CHATROOM, {
        chatroomName: chatroomName
    })
}

export async function getConnectedChatrooms(after: Date): Promise<GetConnectedChatroomsResponseBody> {
    return _attemptAndRefreshToken(API.GET_CONNECTED_CHATROOMS, {
        after: after
    })
}

export async function createMessage(chatroomId: string, content: string): Promise<StandardResponseBody> {
    return _attemptAndRefreshToken(API.CREATE_MESSAGE, {
        chatroomId: chatroomId,
        content: content
    })
}

export async function getConversation(chatroomId: number): Promise<GetConversationResponseBody> {
    return await _attemptAndRefreshToken(API.GET_CONVERSATION, {chatroomId: chatroomId})
}


async function _attemptAndRefreshToken(endpointUrl: string, body?: object): Promise<StandardResponseBody> {
    let response = await _makeRequest(endpointUrl, body)
    if (response.httpStatus === 401) {
        const refreshAttemptResult = await _refreshToken()
        if (refreshAttemptResult.httpStatus === 200) {
            response = await _makeRequest(endpointUrl, body)
        }
    }
    return response
}

async function _refreshToken(): Promise<StandardResponseBody> {
    return await _makeRequest(API.REFRESH_TOKEN)
}

async function _makeRequest(endpointUrl: string, requestBody?: object): Promise<StandardResponseBody> {
    const response = await fetch(
        `${baseUrl}${endpointUrl}`, {
            method: "POST",
            headers: requestBody !== undefined ? {"Content-Type": "application/json"} : undefined,
            credentials: "include",
            body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined
        }
    )
    const body = await response.json()
    return body
}

