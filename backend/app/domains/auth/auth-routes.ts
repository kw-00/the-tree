import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Req, Rep } from "../00-common/route/types";
import { handleRequest } from "../00-common/route/utility";
import z from "zod";
import { authenticateUser, createRefreshToken, revokeRefreshToken, verifyRefreshToken } from "./auth-service";
import { stMap } from "@/utilities/status-mapping";
import { AccessTokenManagement } from "@/utilities/access-token-management";
import validation from "../00-common/route/validation";



const basePath = Config.api.path + Config.api.auth.path
const authConfig = Config.api.auth

export async function authRoutes(fastify: FastifyInstance, options: object) {
    const accessCookieOptions = {
        httpOnly: true, 
        secure: true, 
        sameSite: "strict", 
        expires: new Date(new Date().getTime() + new Date("1971").getTime()),
        path: "/"
    } as const

    const refreshCookieOptions = {
        httpOnly: true, 
        secure: true, 
        sameSite: "strict", 
        expires: new Date(new Date().getTime() + new Date("1971").getTime()),
        path: `${Config.api.auth.path}`
    } as const

    // Log In
    const logInSchema = z.object({
        body: z.object({
            login: validation.users.login,
            password: validation.users.password
        })
    })
    fastify.post(`${basePath}${authConfig.logIn.path}`, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                async (req, rep) => {
                    const parsed = logInSchema.parse(req)
                    const dbResponse = await authenticateUser(parsed.body)
                    if (dbResponse.status !== "SUCCESS") {
                        rep.status(stMap[dbResponse.status]).send(dbResponse)
                        return
                    }
                    const userId = dbResponse.userId!
                    const createRefreshTokenResult = await createRefreshToken({
                        userId, 
                        validityPeriodSeconds: Config.tokens.refresh.validityPeriod
                    })
                    if (createRefreshTokenResult.status !== "SUCCESS") {
                        rep.status(stMap[createRefreshTokenResult.status]).send(createRefreshTokenResult)
                        return
                    }
                    const refreshToken = createRefreshTokenResult.refreshToken!
                    const accessToken = AccessTokenManagement.getToken(userId)
                    rep.status(200)
                        .cookie("accessToken", accessToken, accessCookieOptions)
                        .cookie("refreshToken", refreshToken, refreshCookieOptions)
                        .send(dbResponse)
                }
            )
        }
    )
    
    // Refresh Token
    const refreshTokenSchema = z.object({
        cookies: z.object({
            refreshToken: validation.auth.refreshToken
        })
    })
    fastify.post(`${basePath}${authConfig.refreshToken.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                async (req, rep) => {
                    const parsed = refreshTokenSchema.parse(req)
                    const verificationResult = await verifyRefreshToken({refreshToken: parsed.cookies.refreshToken})
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const creationResult = await createRefreshToken({userId, validityPeriodSeconds: Config.tokens.refresh.validityPeriod})
                    if (creationResult.status !== "SUCCESS") {
                        rep.status(stMap[creationResult.status]).send(creationResult)
                        return
                    }

                    const refreshToken = creationResult.refreshToken!
                    const accessToken = AccessTokenManagement.getToken(userId)
                    rep.status(200)
                        .cookie("accessToken", accessToken, accessCookieOptions)
                        .cookie("refreshToken", refreshToken, refreshCookieOptions)
                    
                }
            )
        }
    )
    
    // Log Out
    const logOutSchema = z.object({
        cookies: z.object({
            refreshToken: validation.auth.refreshToken
        })
    })
    fastify.post(`${basePath}${authConfig.logOut.path}`, {
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = logOutSchema.parse(req)
                    const result = await revokeRefreshToken({refreshToken: parsed.cookies.refreshToken})
                    rep.status(stMap[result.status]).send(result)
                }
            )
        }
    )
}