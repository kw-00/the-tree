import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleRequest, validateAuth as parseAuth } from "./_internal/utility";
import * as controller from "@/controllers/friends-controller"
import type { Rep, Req } from "./public/types";


const basePath = Config.api.basePath + Config.api.friends.basePath
const friendsPaths = Config.api.friends

export async function friendsRoutes(fastify: FastifyInstance, options: object) {

    // Create Friendship Code
    fastify.post(`${basePath}${friendsPaths.createFriendshipCode}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["code", "expiresAt"],
                    properties: {
                        code: {$ref: "common#/properties/friendshipCode"},
                        expiresAt: {type: "string", format: "date-time", nullable: true},
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
                controller.createFriendshipCode
            )
        }
    )  

    // Get Friendship Codes
    fastify.post(`${basePath}${friendsPaths.getFriendshipCodes}`, {
            schema: {
                body: {
                    type: "object",
                    properties: {
                        before: {type: "string", format: "date-time"},
                        after: {type: "string", format: "date-time",},
                        descending: {type: "boolean"},
                        limit: {type: "integer"}
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

    // Revoke Friendship Code
    fastify.post(`${basePath}${friendsPaths.revokeFriendshipCode}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["friendshipCodeId"],
                    properties: {
                        friendshipCodeId: {type: "integer"},
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
                controller.revokeFriendshipCode
            )
        }
    )  

    // Add Friend
    fastify.post(`${basePath}${friendsPaths.addFriend}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["userToBefriendLogin", "friendshipCode"],
                    properties: {
                        userToBefriendLogin: {$ref: "common#/properties/login"},
                        friendshipCode: {$ref: "common#/properties/friendshipCode"}
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
                controller.addFriend
            )
        }
    )

    // Get Friends
    fastify.post(`${basePath}${friendsPaths.getFriends}`, {
            schema: {
                body: {
                    properties: {
                        before: {type: "string", format: "date-time"},
                        after: {type: "string", format: "date-time"},
                        descending: {type: "boolean"},
                        limit: {type: "integer"}
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
                controller.getFriends
            )
        }
    )  

    // Remove Friend
    fastify.post(`${basePath}${friendsPaths.removeFriend}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["friendId"],
                    properties: {
                        friendId: {type: "integer"}
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
                controller.removeFriend
            )
        }
    )  
}
