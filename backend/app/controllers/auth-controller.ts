import { simpleResponse } from "./general/_utility"
import { type ControllerResponse, type ControllerAuthResponse } from "./general/types"
import * as s from "@/database-service/auth-service"
import { AccessTokenManagement } from "@/utilities/access-token-management"
import { Config } from "@/config"


type LogInParams = s.AuthenticateUserParams
type LoginResponse = ControllerAuthResponse

export async function logIn(params: LogInParams): Promise<LoginResponse> {
    // Check login and passord
    const authenticationResult = await s.authenticateUser(params)
    if (authenticationResult.status !== "SUCCESS") return simpleResponse(authenticationResult)
    const userId = authenticationResult.userId!

    // Create refresh token
    const refreshResult = await s.createRefreshToken({userId, validityPeriodSeconds: Config.tokens.refresh.validityPeriod})
    if (refreshResult.status !== "SUCCESS") return simpleResponse(refreshResult)
    const refreshToken = refreshResult.refreshToken!


    return {
        httpStatus: 200,
        body: {
            status: "SUCCESS",
            message: "Successfully logged in."
        },
        auth: {
            accessToken: AccessTokenManagement.getToken(userId),
            refreshToken: refreshToken
        }
    }
}

type RefreshTokenParams = s.VerifyRefreshTokenParams
type RefreshTokenResponse = ControllerAuthResponse

export async function refreshToken(params: RefreshTokenParams): Promise<RefreshTokenResponse> {
    // Verify refresh token
    const verificationResult = await s.verifyRefreshToken(params)
    if (verificationResult.status !== "SUCCESS") return simpleResponse(verificationResult)
    const userId = verificationResult.userId!

    // Create new refresh token
    const refreshResult = await s.createRefreshToken({userId, validityPeriodSeconds: Config.tokens.refresh.validityPeriod})
    if (refreshResult.status !== "SUCCESS") return simpleResponse(refreshResult)
    const refreshToken = refreshResult.refreshToken!

    return {
        httpStatus: 200,
        body: {
            status: "SUCCESS",
            message: "Successfully refreshed token."
        },
        auth: {
            accessToken: AccessTokenManagement.getToken(userId),
            refreshToken: refreshToken
        }
    }
}

type LogOutParams = s.RevokeRefreshTokenParams
type LogOutResponse = ControllerResponse

export async function logOut(params: LogOutParams): Promise<LogOutResponse> {
    const tokenRevocationResult = await s.revokeRefreshToken(params)
    return simpleResponse(tokenRevocationResult)
}
