import { makePOSTRequest } from "@/backend-integration/00-common/service/utility"
import type { StandardResponse } from "@/backend-integration/00-common/service/types"
import { ServerConfig } from "../../server-config"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.path}${ServerConfig.api.auth.path}`
const authPaths = ServerConfig.api.auth

export type LogInParams = {
    login: string
    password: string
}

export type LogInResponse = StandardResponse<
    "SUCCESS" 
    | "INVALID_CREDENTIALS" 
    | "NOT_FOUND" 
    | "UUID_COLLISION"
>

export async function logIn(params: LogInParams): Promise<LogInResponse> {
    return makePOSTRequest(`${baseUrl}${authPaths.logIn.path}`, params)
}

export type RefreshTokenParams = {}

export type RefreshTokenResponse = StandardResponse<
    "SUCCESS"
    | "REFRESH_TOKEN_INVALID"
    | "REFRESH_TOKEN_REVOKED"
    | "REFRESH_TOKEN_REUSE"
    | "NOT_FOUND"
    | "UUID_COLLISION"
>

export async function refreshToken(params: RefreshTokenParams): Promise<RefreshTokenResponse> {
    return makePOSTRequest(`${baseUrl}${authPaths.refreshToken.path}`, params)
}

export type LogOutParams = {}

export type LogOutResponse = StandardResponse<
    "SUCCESS" 
    | "SUCCESS_REDUNDANT"
>

export async function logOut(params: LogOutParams): Promise<LogOutResponse> {
    return makePOSTRequest(`${baseUrl}${authPaths.logOut.path}`, params)
}