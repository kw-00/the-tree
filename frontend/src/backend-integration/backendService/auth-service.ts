import { ServerConfig } from "../server-config"
import { makePOSTRequest } from "./_utility"
import type { StandardResponse } from "./types"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.basePath}${ServerConfig.api.auth.basePath}`
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
    return makePOSTRequest(`${baseUrl}${authPaths.logIn}`, params)
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
    return makePOSTRequest(`${baseUrl}${authPaths.refreshToken}`, params)
}

export type LogOutParams = {}

export type LogOutResponse = StandardResponse<
    "SUCCESS" 
    | "SUCCESS_REDUNDANT"
>

export async function logOut(params: LogOutParams): Promise<LogOutResponse> {
    return makePOSTRequest(`${baseUrl}${authPaths.logOut}`, params)
}