import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleRequest, validateAuth as parseAuth } from "./_internal/utility";
import * as controller from "@/controllers/chatrooms-controller"
import type { Rep, Req } from "./public/types";


const basePath = Config.api.basePath + Config.api.chatrooms
const chatroomsPaths = Config.api.chatrooms

export function chatroomsRoutes(fastify: FastifyInstance, options: object) {

    // Create Chatroom
    fastify.post(`${basePath}${chatroomsPaths.createChatroom}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: {$ref: "common#/properties/chatroomName"}
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
                controller.createChatroom
            )
        }
    )  

    // Get Connected Chatrooms
    fastify.post(`${basePath}${chatroomsPaths.getConnectedChatrooms}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["before", "after", "descending", "limit"],
                    properties: {
                        before: {type: "string", format: "date-time", nullable: true},
                        after: {type: "string", format: "date-time", nullable: true},
                        descending: {type: "boolean", nullable: true},
                        limit: {type: "number", nullable: true}
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
                controller.getConnectedChatrooms
            )
        }
    )  

    // Add Friends To Chatroom
    fastify.post(`${basePath}${chatroomsPaths.addFriendsToChatroom}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["friendIds"],
                    properties: {
                        friendIds: {
                            type: "array", 
                            items: {type: "integer"}
                        },
                        chatroomId: {type: "integer"}
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
                controller.addFriendsToChatroom
            )
        }
    )  

    // Leave Chatroom
    fastify.post(`${basePath}${chatroomsPaths.leaveChatroom}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["chatroomId"],
                    properties: {
                        chatroomId: {type: "integer"}
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
                controller.leaveChatroom
            )
        }
    )  
}
