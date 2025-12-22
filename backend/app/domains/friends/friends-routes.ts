import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Req, Rep } from "../00-common/route/types";
import { handleRequest } from "../00-common/route/utility";
import z from "zod";
import validation from "../00-common/route/validation";
import { verifyAccessToken } from "../auth/auth-service";
import { stMap } from "@/utilities/status-mapping";
import { addFriend, createFrienshipCode, getFriendshipCodes, getFriends, removeFriend, revokeFriendshipCode } from "./friends-service";

const basePath = Config.api.path + Config.api.friends.path
const friendsConfig = Config.api.friends

export async function friendsRoutes(fastify: FastifyInstance, options: object) {

    // Create Friendship Code
    const createFriendshipCodeSchema = z.object({
        body: z.object({
            code: validation.friends.friendshipCode.code,
            expiresAt: validation.common.timestamptz.optional()
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${friendsConfig.createFriendshipCode.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = createFriendshipCodeSchema.parse(req)
                    const {code, expiresAt} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await createFrienshipCode({userId, code, ...(expiresAt && {expiresAt: new Date(expiresAt)})})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  

    // Get Friendship Codes
    const getFriendshipCodesSchema = z.object({
        body: z.object({
            after: z.iso.datetime({offset: true})
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${friendsConfig.getFriendshipCodes.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = getFriendshipCodesSchema.parse(req)
                    const {after} = parsed.body
                    const {accessToken} = parsed.cookies
                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await getFriendshipCodes({userId,  after: after ? new Date(after) : null})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  

    // Revoke Friendship Code
    const revokeFriendshipCodeSchema = z.object({
        body: z.object({
            friendshipCodeId: validation.friends.friendshipCode.id
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        }) 
    })
    fastify.post(`${basePath}${friendsConfig.revokeFriendshipCode.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = revokeFriendshipCodeSchema.parse(req)
                    const {friendshipCodeId} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!

                    const dbResult = await revokeFriendshipCode({userId, friendshipCodeId})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  

    // Add Friend
    const addFriendSchema = z.object({
        body: z.object({
            userToBefriendLogin: validation.users.login,
            friendshipCode: validation.friends.friendshipCode.code
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${friendsConfig.addFriend.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = addFriendSchema.parse(req)
                    const {userToBefriendLogin, friendshipCode} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await addFriend({userId, userToBefriendLogin, friendshipCode})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )

    // Get Next Friends
    const getFriendsSchema = z.object({
        body: z.object({
            after: z.iso.datetime({offset: true})
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${friendsConfig.getFriends.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = getFriendsSchema.parse(req)
                    const {after} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!

                    const dbResult = await getFriends({userId, after: after ? new Date(after) : null})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  


    // Remove Friend
    const removeFriendSchema = z.object({
        body: z.object({
            friendId: validation.users.id
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${friendsConfig.removeFriend.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = removeFriendSchema.parse(req)
                    const {friendId} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await removeFriend({userId, friendId})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  
}
