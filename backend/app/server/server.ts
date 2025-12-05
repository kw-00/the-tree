import "dotenv/config"

import https from "https"
import fs from "fs"
import * as controller from "../services/controller"
import type { DatabaseServiceResponse } from "../services/controller"

/////////////////////
import Fastify, { FastifyReply, FastifyRequest, RouteShorthandOptions } from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"



const fastify = Fastify({
    logger: false,
    https: {
        cert: fs.readFileSync("./cert/certificate.crt"),
        key: fs.readFileSync("./cert/key.pem")
    }
})

const API_PATH = "/api"

fastify.register(cors, {origin: true})
fastify.register(cookie, {hook: "onRequest", parseOptions: {}})


const minLoginLength = Number(process.env.LOGIN_LENGTH_MIN)
const maxLoginLength = Number(process.env.LOGIN_LENGTH_MAX)
const minPasswordLength = Number(process.env.PASSWORD_LENGTH_MIN)
const maxPasswordLength = Number(process.env.PASSWORD_LENGTH_MAX)
const minChatroomNameLength = Number(process.env.CHATROOM_NAME_LENGTH_MIN)
const maxChatroomNaameLength = Number(process.env.CHATROOM_NAME_LENGTH_MAX)
const minFriendshipCodeLength = Number(process.env.FRIENDSHIP_CODE_LENGTH_MIN)
const maxFriendshipCodeLength = Number(process.env.FRIENDSHIP_CODE_LENGTH_MAX)
const minMessageContentLength = Number(process.env.MESSAGE_CONTENT_LENGTH_MIN)
const maxMessageContentLength = Number(process.env.MESSAGE_CONTENT_LENGTH_MAX)


fastify.addSchema({
    $id: "common", 
    type: "object",
    properties: {
        login: {type: "string", minLength: minLoginLength, maxLength: maxLoginLength},
        password: {type: "string", minLength: minPasswordLength, maxLength: maxPasswordLength},
        chatroomName: {type: "string", minLength: minChatroomNameLength, maxLength: maxChatroomNaameLength},
        friendshipCode: {type: "string", minLength: minFriendshipCodeLength, maxLength: maxFriendshipCodeLength},
        messageContent: {type: "string", minLength: minMessageContentLength, maxLength: maxMessageContentLength}
    }
})

async function handleRequest<T extends DatabaseServiceResponse>(
        req: FastifyRequest<{Body: Record<string, any>}>, 
        res: FastifyReply, 
        callback: (params: {[key: string]: any} & any) => Promise<T>) {

    try {
        const body = req.body
        const cookies = req.cookies

        const bodyKeys = Object.keys(body)
        if (Object.keys(cookies).find(k => bodyKeys.includes(k))) {
            res.status(400).send({
                httpStatus: 400,
                status: "DUPLICATE_KEYS",
                message: "Body keys collide with cookie keys. Must be unique."
            })
        }
        const result = await callback({...body, ...cookies})
        res.status(result.httpStatus).send(result)
    } catch (error) {
        res.status(500).send({
            httpStatus: 500,
            status: "UNEXPECTED_ERROR",
            message: "An error occured",
            error: process.env.NODE_ENV === "development" && error instanceof Error? {
                error
            }
            :
            String(error)
        })
    }


}

fastify.post(`${API_PATH}/register_user`, {
        schema: {
            body: {
                type: "object",
                required: ["login", "password"],
                properties: {
                    login: {$ref: "common#/properties/login"},
                    password: {$ref: "common#/properties/password"}
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.registerUser)
    }
)

fastify.post(`${API_PATH}/authenticate_user`, {
        schema: {
            body: {
                type: "object",
                required: ["login", "password"],
                properties: {
                    login: {$ref: "common#/properties/login"},
                    password: {$ref: "common#/properties/password"}
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.authenticateUser)
    }
)

fastify.post(`${API_PATH}/refresh_token`, {
        schema: {
            body: {
                type: "object",
                required: [],
                properties: {}
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.refreshToken)
    }
)

fastify.post(`${API_PATH}/log_out`, {
        schema: {
            body: {
                type: "object",
                required: [],
                properties: {}
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.logOut)
    }
)

fastify.post(`${API_PATH}/add_friend`, {
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
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.addFriend)
    }
)

fastify.post(`${API_PATH}/get_friends`, {
        schema: {
            body: {
                type: "object",
                required: [],
                properties: {}
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.getFriends)
    }
)


fastify.post(`${API_PATH}/add_friends_to_chatroom`, {
        schema: {
            body: {
                type: "object",
                required: ["friendIds", "chatroomId"],
                properties: {
                    friendIds: {
                        type: "array",
                        items: {type: "number"}
                    },
                    chatroomId: {type: "number"}
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.addFriendsToChatroom)
    }
)


fastify.post(`${API_PATH}/create_chatroom`, {
        schema: {
            body: {
                type: "object",
                required: ["chatroomName"],
                properties: {
                    chatroomName: {$ref: "common#/properties/chatroomName"},
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.createChatroom)
    }
)


fastify.post(`${API_PATH}/get_connected_chatrooms`, {
        schema: {
            body: {
                type: "object",
                required: ["after"],
                properties: {
                    after: {type: "string", format: "date-time", nullable: true}
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.getConnectedChatrooms)
    }
)

fastify.post(`${API_PATH}/create_message`, {
        schema: {
            body: {
                type: "object",
                required: ["chatroomId", "content"],
                properties: {
                    chatroomId: {type: "number"},
                    content: {$ref: "common#/properties/messageContent"}
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.createMessage)
    }
)

fastify.post(`${API_PATH}/get_conversation`, {
        schema: {
            body: {
                type: "object",
                required: ["chatroomId", "before", "after", "nRows", "descending"],
                properties: {
                    chatroomId: {type: "number"},
                    before: {type: "string", format: "date-time", nullable: true},
                    after: {type: "string", format: "date-time", nullable: true},
                    nRows: {type: "number"},
                    descending: {type: "boolean"}
                }
            }
        }
    }, 
    async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
        await handleRequest(req, rep, controller.getConversation)
    }
)




fastify.listen({port: 3000})

