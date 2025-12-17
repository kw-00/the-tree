import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import type { Req, Rep } from "../00-common/route/types";
import { handleRequest } from "../00-common/route/utility";
import validation from "../00-common/route/validation";
import { addFriendsToChatroom, createChatroom, getChatrooms, leaveChatroom } from "./chatrooms-service";
import { verifyAccessToken } from "../auth/auth-service";
import { stMap } from "@/utilities/status-mapping";


const basePath = Config.api.path + Config.api.chatrooms.path
const chatroomsConfig = Config.api.chatrooms

export async function chatroomsRoutes(fastify: FastifyInstance, options: object) {

    // Create Chatroom
    const createChatroomSchema = z.object({
        body: z.object({
            name: validation.chatrooms.name
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${chatroomsConfig.createChatroom.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = createChatroomSchema.parse(req)
                    const jwtVerification = verifyAccessToken(parsed.cookies.accessToken)
                    if (jwtVerification.status !== "SUCCESS") {
                        rep.status(stMap[jwtVerification.status]).send(jwtVerification)
                        return
                    }
                    const userId = jwtVerification.userId!
                    const dbResult = await createChatroom({userId, chatroomName: parsed.body.name})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  

    // Get Connected Chatrooms
    const getChatroomsSchema = z.object({
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${chatroomsConfig.getChatrooms.path}`, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const {accessToken} = getChatroomsSchema.parse(req).cookies
                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await getChatrooms({userId})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  

    // Add Friends To Chatroom
    const addFriendsToChatroomSchema = z.object({
        body: z.object({
            friendIds: z.array(validation.users.id),
            chatroomId: validation.chatrooms.id
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${chatroomsConfig.addFriendsToChatroom.path}`, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = addFriendsToChatroomSchema.parse(req)
                    const {friendIds, chatroomId} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await addFriendsToChatroom({userId, friendIds, chatroomId})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  

    // Leave Chatroom
    const leaveChatroomSchema = z.object({
        body: z.object({
            chatroomId: validation.chatrooms.id
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${chatroomsConfig.leaveChatroom.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = leaveChatroomSchema.parse(req)
                    const {chatroomId} = parsed.body
                    const {accessToken} = parsed.cookies
                    
                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!
                    const dbResult = await leaveChatroom({userId, chatroomId})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  
}
