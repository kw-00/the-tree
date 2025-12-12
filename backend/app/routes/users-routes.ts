import type { FastifyInstance } from "fastify/types/instance";
import type { Rep, Req } from "./public/types";
import { handleRequest } from "./_internal/utility";

import * as controller from "@/controllers/users-controller"
import { Config } from "@/config";


const basePath = Config.api.basePath + Config.api.users.basePath
const usersPaths = Config.api.users

export async function usersRoutes(fastify: FastifyInstance, options: object) {
    // Register User
    fastify.post(`${basePath}${usersPaths.registerUser}`, {
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
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                (req) => {
                    return req.body as any
                },
                controller.registerUser
            )
        }
    )

    // Change Login
    fastify.post(`${basePath}${usersPaths.changeLogin}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["login", "password"],
                    properties: {
                        login: {$ref: "common#/properties/login"},
                        password: {$ref: "common#/properties/password"},
                        newLogin: {$ref: "common#/properties/login"}
                    }
                }
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                (req) => {
                    return req.body as any
                }, 
                controller.changeLogin
            )
        }
    )

    // Change Password
    fastify.post(`${basePath}${usersPaths.changePassword}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["login", "password", "newPassword"],
                    properties: {
                        login: {$ref: "common#/properties/login"},
                        password: {$ref: "common#/properties/password"},
                        newPassword: {$ref: "common#/properties/password"}
                    }
                }
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                (req) => {
                    return req.body as any
                }, 
                controller.changeLogin
            )
        }
    )
}