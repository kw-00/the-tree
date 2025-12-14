import { ServerConfig } from "../server-config"
import { makePOSTRequest } from "./_utility"
import type { StandardResponse } from "./types"


const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.basePath}${ServerConfig.api.users.basePath}`
const usersPaths = ServerConfig.api.users


export type RegisterUserParams = {
    login: string
    password: string
}

export type RegisterUserResponse = StandardResponse<"SUCCESS" | "LOGIN_IN_USE">

export async function registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    return makePOSTRequest(`${baseUrl}${usersPaths.registerUser}`, params)
}


export type ChangeLoginParams = {
    login: string
    password: string
    newLogin: string
}

export type ChangeLoginResponse = StandardResponse<"SUCCESS" | "INVALID_CREDENTIALS" | "NOT_FOUND">

export async function changeLogin(params: ChangeLoginParams): Promise<ChangeLoginResponse> {
    return makePOSTRequest(`${baseUrl}${usersPaths.changeLogin}`, params)
}


export type ChangePasswordParams = {
    login: string
    password: string
    newPassword: string
}

export type ChangePasswordResponse = StandardResponse<"SUCCESS" | "INVALID_CREDENTIALS" | "NOT_FOUND">

export async function changePassword(params: ChangePasswordParams): Promise<ChangePasswordResponse> {
    return makePOSTRequest(`${baseUrl}${usersPaths.changePassword}`, params)
}


