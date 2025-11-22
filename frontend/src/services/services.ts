import {API} from "./api"

const baseUrl = import.meta.env.VITE_API_BASE_URL

export type APICallResult<T> = {
    status: number,
    body: T
}


export type StandardBody = {
    status: string,
    message: string
}

export type FindConnectedUsersFields = {
    connectedUsers?: {id: string, login: string}[]
}

export type GetConversationFields = {
    conversation: {senderId: number, senderLogin: string, content: string}[]
}


async function registerUser(login: string, password: string): Promise<APICallResult<StandardBody>> {
    return await makeRequest(API.REGISTER_USER, {
        login: login,
        password: password
    })
}


export async function authenticateUser(login: string, password: string): Promise<APICallResult<StandardBody>> {
    return await makeRequest(API.AUTHENTICATE_USER, {
        login: login,
        password: password
    }) 
}

export async function registerAndLogIn(login: string, password: string): Promise<APICallResult<StandardBody>> {
    const registrationResult = await registerUser(login, password)
    if (registrationResult.status !== 200) {
        return registrationResult
    }
    const authenticationResult = await authenticateUser(login, password)
    return authenticationResult
}

export async function logOutUser(): Promise<APICallResult<StandardBody>> {
    return await makeRequest(API.LOG_OUT_USER)
}


export async function findConnectedUsers(): Promise<APICallResult<StandardBody & FindConnectedUsersFields>> {
    return await attemptAndRefreshToken(API.FIND_CONNECTED_USERS)
}

export async function getConversation(otherUserId: number): Promise<APICallResult<StandardBody & GetConversationFields>> {
    return await attemptAndRefreshToken(API.GET_CONVERSATION, {otherUserId: otherUserId})
}

export async function createMessage(recipientId: number, content: string): Promise<APICallResult<StandardBody>> {
    return await attemptAndRefreshToken(API.CREATE_MESSAGE, {
        recipientId: recipientId,
        content: content
    })
}

async function refreshToken(): Promise<APICallResult<StandardBody>> {
    return await makeRequest(API.REFRESH_TOKEN)
}

async function attemptAndRefreshToken(endpointUrl: string, body?: object): Promise<APICallResult<StandardBody & any>> {
    let response = await makeRequest(endpointUrl, body)
    if (response.status === 401) {
        const refreshAttemptResult = await refreshToken()
        if (refreshAttemptResult.status === 200) {
            response = await makeRequest(endpointUrl, body)
        }
    }
    return response
}

async function makeRequest(endpointUrl: string, requestBody?: object): Promise<APICallResult<StandardBody & any>> {
    const response = await fetch(
        `${baseUrl}${endpointUrl}`, {
            method: "POST",
            headers: requestBody !== undefined ? {"Content-Type": "application/json"} : undefined,
            credentials: "include",
            body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined
        }
    )
    const {status} = response
    const body = await response.json()

    return {
        status: status,
        body: body
    }
}

