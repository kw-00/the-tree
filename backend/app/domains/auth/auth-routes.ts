import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Req, Rep } from "../00-common/route/types";
import { handleRequest } from "../00-common/route/utility";
import z from "zod";
import { authenticateUser, createRefreshToken, revokeRefreshToken, verifyRefreshToken } from "./auth-service";
import { stMap } from "@/utilities/status-mapping";
import { AccessTokenManagement } from "@/utilities/access-token-management";



const basePath = Config.api.basePath + Config.api.auth.basePath
const authPaths = Config.api.auth

export async function authRoutes(fastify: FastifyInstance, options: object) {
    const tokenCookieOptions = {
        httpOnly: true, 
        secure: true, 
        sameSite: "strict", 
        expires: new Date(new Date().getTime() + new Date("1971").getTime()),
        path: "/"
    } as const

    // Log In
    const logInSchema = z.object({
        body: z.object({
            login: z.string()
                .min(Config.dataRules.users.login.minLength)
                .max(Config.dataRules.users.login.maxLength),
            password: z.string()
                .min(Config.dataRules.users.password.minLength)
                .max(Config.dataRules.users.password.maxLength)
        })
    })
    fastify.post(`${basePath}${authPaths.logIn}`, 
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
                        .cookie("accessToken", accessToken, tokenCookieOptions)
                        .cookie("refreshToken", refreshToken, tokenCookieOptions)
                        .send(dbResponse)
                }
            )
        }
    )
    
    // Refresh Token
    const refreshTokenSchema = z.object({
        cookies: z.object({
            refreshToken: z.uuidv4()
        })
    })
    fastify.post(`${basePath}${authPaths.refreshToken}`,
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
                        .cookie("accessToken", accessToken, tokenCookieOptions)
                        .cookie("refreshToken", refreshToken, tokenCookieOptions)
                    
                }
            )
        }
    )
    
    // Log Out
    const logOutSchema = z.object({
        cookies: z.object({
            refreshToken: z.uuidv4()
        })
    })
    fastify.post(`${basePath}${authPaths.logOut}`, {
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