import {API} from "./api"

const baseUrl = import.meta.env.VITE_API_BASE_URL

interface APICallResult {
    status: number,
    body: APICallResultBody
}


interface APICallResultBody {
    status: string,
    message: string
}


async function registerUser(login: string, password: string): Promise<APICallResult> {
    const response = await fetch(`${baseUrl}${API.REGISTER_USER}`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            login: login,
            password: password
        })
    })
    const {status} = response
    const body = await response.json()
    return {
        status: status,
        body: body
    }
}


export async function authenticateUser(login: string, password: string): Promise<APICallResult> {
    const response = await fetch(`${baseUrl}${API.AUTHENTICATE_USER}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            login: login,
            password: password
        })
    })

    const {status} = response
    const body = await response.json()
    return {
        status: status,
        body: body
    }
}

export async function registerAndLogIn(login: string, password: string): Promise<APICallResult> {
    const registrationResult = await registerUser(login, password)
    if (registrationResult.status !== 200) {
        return registrationResult
    }
    const authenticationResult = await authenticateUser(login, password)
    return authenticationResult
}

export async function logOutUser(): Promise<APICallResult> {
    const response = await fetch(`${baseUrl}${API.LOG_OUT_USER}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    const {status} = response
    const body = await response.json()
    return {
        status: status,
        body: body
    }
}


async function refreshToken(): Promise<APICallResult> {
    const response = await fetch(`${baseUrl}${API.REFRESH_TOKEN}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    const {status} = response
    const body = await response.json()

    return {
        status: status,
        body: body
    }
}


async function findConnectedUsers(): Promise<APICallResult> {
    const response = await fetch(`${baseUrl}${API.FIND_CONNECTED_USERS}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    const {status} = response
    const body = await response.json()

    return {
        status: status,
        body: body
    }
}

