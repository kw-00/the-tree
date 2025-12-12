import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleRequest, validateAuth as parseAuth } from "./_internal/utility";
import * as controller from "@/controllers/friends-controller"
import type { Rep, Req } from "./public/types";


const basePath = Config.api.basePath + Config.api.messages
const messagesPaths = Config.api.messages

export function messagesRoutes(fastify: FastifyInstance, options: object) {

    // Create Message
    fastify.post(`${basePath}${messagesPaths.createMessage}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["chatroomId", "content"],
                    properties: {
                        chatroomId: {type: "integer"},
                        content: {$ref: "common#/properties/messageContent"}
                    }
                }
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                (req) => {
                    const auth = parseAuth(req, "access")
                    return {
                        ...req.body as any,
                        ...auth
                    }
                },
                controller.createFrienshipCode
            )
        }
    )  

    // Get Messages
    fastify.post(`${basePath}${messagesPaths.getMessages}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["chatroomId", "before", "after", "descending", "limit"],
                    properties: {
                        chatroomId: {type: "integer"},
                        before: {type: "string", format: "date-time", nullable: true},
                        after: {type: "string", format: "date-time", nullable: true},
                        descending: {type: "boolean", nullable: true},
                        limit: {type: "integer", nullable: true}
                    }
                }
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                (req) => {
                    const auth = parseAuth(req, "access")
                    return {
                        ...req.body as any,
                        ...auth
                    }
                },
                controller.getFriendshipCodes
            )
        }
    )  
}
