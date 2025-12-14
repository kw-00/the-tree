
import * as s from "@/database-service/users-service"
import * as authService from "@/database-service/auth-service"
import { dbServiceToController, simpleResponse } from "./_internal/utility"
import type { ControllerResponse, CredentialParams } from "./public/types"


export const registerUser = dbServiceToController(s.registerUser)


export type  ChangeLoginParams = CredentialParams<s.ChangeLoginParams>
export type  ChangeLoginReponse = ControllerResponse<s.ChangeLoginResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - INVALID_CREDENTIALS
 * - NOT_FOUND
 */
export async function changeLogin(params: ChangeLoginParams): Promise<ChangeLoginReponse> {
    const {login, password, newLogin} = params
    const authenticationResult = await authService.authenticateUser({login, password})
    if (authenticationResult.status !== "SUCCESS") return simpleResponse(authenticationResult)
    const userId = authenticationResult.userId!

    const changeResult = await s.changeLogin({userId, newLogin})
    return simpleResponse(changeResult)

}

export type  ChangePasswordParams = CredentialParams<s.ChangePasswordParams>
export type  ChangePasswordReponse = ControllerResponse<s.ChangePasswordResponse>

/**
 * Possible status values:
 * - SUCCESS
 * - INVALID_CREDENTIALS
 * - NOT_FOUND
 */
export async function changePassword(params: ChangePasswordParams): Promise<ChangePasswordReponse> {
    const {login, password, newPassword} = params
    const authenticationResult = await authService.authenticateUser({login, password})
    if (authenticationResult.status !== "SUCCESS") return simpleResponse(authenticationResult)
    const userId = authenticationResult.userId!

    const changeResult = await s.changePassword({userId, newPassword})
    return simpleResponse(changeResult)

}