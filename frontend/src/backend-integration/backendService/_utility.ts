import { refreshToken } from "./auth-service"
import type { StandardResponse } from "./types"


export async function makePOSTRequest(endpointUrl: string, requestBody?: {[key: string]: any}): Promise<StandardResponse<any>> {
    if (requestBody !== undefined) {
        for (const key in requestBody) {
            requestBody[key] ??= null
        }
    }

    const response = await fetch(
        endpointUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: requestBody !== undefined ? JSON.stringify(requestBody) : JSON.stringify({})
        }
    )
    const body = await response.json()
    return body
}

export async function attemptAndRefreshToken(endpointUrl: string, body: object): Promise<StandardResponse<any>> {
    let response = await makePOSTRequest(endpointUrl, body)
    if (response.status !== "SUCCESS") {
        const refreshAttemptResult = await refreshToken({})
        if (refreshAttemptResult.status === "SUCCESS") {
            response = await makePOSTRequest(endpointUrl, body)
        }
    }
    return response
}

