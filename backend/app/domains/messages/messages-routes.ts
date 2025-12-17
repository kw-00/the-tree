import { Config } from "@/config";
import { stMap } from "@/utilities/status-mapping";
import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import type { Req, Rep } from "../00-common/route/types";
import { handleRequest } from "../00-common/route/utility";
import validation from "../00-common/route/validation";
import { verifyAccessToken } from "../auth/auth-service";
import { createMessage, getNextMessages, getPreviousMessages } from "./messages-service";


const basePath = Config.api.path + Config.api.messages.path
const messagesConfig = Config.api.messages

export async function messagesRoutes(fastify: FastifyInstance, options: object) {

    // Create Message
    const createMessageSchema = z.object({
        body: z.object({
            chatroomId: validation.chatrooms.id,
            content: validation.messages.content
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${messagesConfig.createMessage.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = createMessageSchema.parse(req)
                    const {chatroomId, content} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!

                    const dbResult = await createMessage({userId, chatroomId, content})
                    rep.status(stMap[dbResult.status]).send(dbResult)                   
                }
            )
        }
    )  

    // Get Next Messages
    const getNextMessagesSchema = z.object({
        body: z.object({
            chatroomId: validation.chatrooms.id,
            cursor: validation.messages.id,
            limit: z.int().positive().lt(messagesConfig.getNextMessages.maxBatchSize),
            boundary: validation.messages.id
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${messagesConfig.getNextMessages.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = getNextMessagesSchema.parse(req)
                    const {chatroomId, cursor, limit, boundary} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!

                    const dbResult = await getNextMessages({chatroomId, userId, cursor, limit, boundary})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  


    // Get Previous Messages
    const getPreviousMessagesSchema = z.object({
        body: z.object({
            chatroomId: validation.chatrooms.id,
            cursor: validation.messages.id.optional(),
            limit: z.int().positive().lt(messagesConfig.getPreviousMessages.maxBatchSize),
        }),
        cookies: z.object({
            accessToken: validation.auth.accessToken
        })
    })
    fastify.post(`${basePath}${messagesConfig.getPreviousMessages.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                async (req, rep) => {
                    const parsed = getPreviousMessagesSchema.parse(req)
                    const {chatroomId, cursor, limit} = parsed.body
                    const {accessToken} = parsed.cookies

                    const verificationResult = verifyAccessToken(accessToken)
                    if (verificationResult.status !== "SUCCESS") {
                        rep.status(stMap[verificationResult.status]).send(verificationResult)
                        return
                    }
                    const userId = verificationResult.userId!

                    const dbResult = await getPreviousMessages({chatroomId, userId, ...(cursor && {cursor: cursor}), limit})
                    rep.status(stMap[dbResult.status]).send(dbResult)
                }
            )
        }
    )  
}
