import { makePOSTRequest } from "../00-common/service/utility"
import type { StandardResponse } from "../00-common/service/types"
import { ServerConfig } from "../../server-config"



const baseUrl = `${ServerConfig.baseUrl}${ServerConfig.api.path}${ServerConfig.api.users.path}`
const usersPaths = ServerConfig.api.users


export type RegisterUserParams = {
    login: string
    password: string
}

export type RegisterUserResponse = StandardResponse<"SUCCESS" | "LOGIN_IN_USE">

export async function registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    return makePOSTRequest(`${baseUrl}${usersPaths.registerUser.path}`, params)
}


export type ChangeLoginParams = {
    login: string
    password: string
    newLogin: string
}

export type ChangeLoginResponse = StandardResponse<"SUCCESS" | "INVALID_CREDENTIALS" | "NOT_FOUND" | "LOGIN_IN_USE">

export async function changeLogin(params: ChangeLoginParams): Promise<ChangeLoginResponse> {
    return makePOSTRequest(`${baseUrl}${usersPaths.changeLogin.path}`, params)
}


export type ChangePasswordParams = {
    login: string
    password: string
    newPassword: string
}

export type ChangePasswordResponse = StandardResponse<"SUCCESS" | "INVALID_CREDENTIALS" | "NOT_FOUND">

export async function changePassword(params: ChangePasswordParams): Promise<ChangePasswordResponse> {
    return makePOSTRequest(`${baseUrl}${usersPaths.changePassword.path}`, params)
}


