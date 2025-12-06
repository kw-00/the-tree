const baseUrl = import.meta.env.VITE_API_BASE_URL

const API = {
    REGISTER_USER: "/register_user",
    AUTHENTICATE_USER: "/authenticate_user",
    REFRESH_TOKEN: "/refresh_token",
    LOG_OUT: "/log_out",
    ADD_FRIEND: "/add_friend",
    GET_FRIENDS: "/get_friends",
    ADD_FRIENDS_TO_CHATROOM: "/add_friends_to_chatroom",
    CREATE_CHATROOM: "/create_chatroom",
    GET_CONNECTED_CHATROOMS: "/get_connected_chatrooms",
    CREATE_MESSAGE: "/create_message",
    GET_CONVERSATION: "/get_conversation"

}
// Argument types
type RegisterUserParams = {
    login: string
    password: string
}

export type AuthenticateUserParams = {
    login: string
    password: string
}

export type RegisterAndLoginParams = RegisterUserParams

export type AddFriendParams = {
    userToBefriendLogin: string
    friendshipCode: string
}

export type AddFriendsToChatroomParams = {
    friendIds: number[]
    chatroomId: number
}

export type CreateChatroomParams = {
    chatroomName: string
}

export type GetConnectedChatroomsParams = {
    after?: Date
}

export type CreateMessageParams = {
    chatroomId: number
    content: string
}

export type GetConversationParams = {
    chatroomId: number
    before?: Date
    after?: Date
    nRows: number
    descending: boolean
}

// Response types
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

async function _registerUser({login, password}: RegisterUserParams): Promise<RegisterUserResponseBody> {
    return _makeRequest(API.REGISTER_USER, {login, password})
}


export async function authenticateUser({login, password}: AuthenticateUserParams): Promise<AuthenticateUserResponseBody> {
    return _makeRequest(API.AUTHENTICATE_USER, {login, password}) 
}

export async function registerAndLogIn({login, password}: RegisterAndLoginParams): Promise<RegisterUserResponseBody & AuthenticateUserResponseBody> {
    const registrationResult = await _registerUser({login, password})
    if (registrationResult.httpStatus !== 200) {
        return registrationResult
    }
    return authenticateUser({login, password})
}

export async function logOut(): Promise<StandardResponseBody> {
    return _makeRequest(API.LOG_OUT)
}

export async function addFriend({userToBefriendLogin, friendshipCode}: AddFriendParams): Promise<StandardResponseBody> {
    return _attemptAndRefreshToken(API.ADD_FRIEND, {userToBefriendLogin, friendshipCode})
}

export async function getFriends(): Promise<GetFriendsResponseBody> {
    return _attemptAndRefreshToken(API.GET_FRIENDS)
}

export async function addFriendsToChatroom({friendIds, chatroomId}: AddFriendsToChatroomParams): Promise<AddFriendsToChatroomResponseBody> {
    return _attemptAndRefreshToken(API.ADD_FRIENDS_TO_CHATROOM, {friendIds, chatroomId})
}

export async function createChatroom({chatroomName}: CreateChatroomParams): Promise<CreateChatroomResponseBody> {
    return _attemptAndRefreshToken(API.CREATE_CHATROOM, {chatroomName})
}

export async function getConnectedChatrooms({after}: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponseBody> {
    return _attemptAndRefreshToken(API.GET_CONNECTED_CHATROOMS, {after})
}

export async function createMessage({chatroomId, content}: CreateMessageParams): Promise<StandardResponseBody> {
    return _attemptAndRefreshToken(API.CREATE_MESSAGE, {chatroomId, content})
}

export async function getConversation({
        chatroomId, 
        before, 
        after, 
        nRows,
        descending}: GetConversationParams): Promise<GetConversationResponseBody> {
    return await _attemptAndRefreshToken(API.GET_CONVERSATION, {
        chatroomId,
        before,
        after,
        nRows,
        descending
    })
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

async function _makeRequest(endpointUrl: string, requestBody?: {[key: string]: any}): Promise<StandardResponseBody> {
    if (requestBody !== undefined) {
        for (const key in requestBody) {
            requestBody[key] ??= null
        }
    }

    const response = await fetch(
        `${baseUrl}${endpointUrl}`, {
            method: "POST",
            headers: requestBody !== undefined ? {"Content-Type": "application/json"} : undefined,
            credentials: "include",
            body: requestBody !== undefined ? JSON.stringify(requestBody) : JSON.stringify({})
        }
    )
    const body = await response.json()
    return body
}

