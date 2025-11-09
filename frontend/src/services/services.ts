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

export async function registerUser(login: string, password: string): Promise<APICallResult> {
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