import type { FastifyInstance } from "fastify/types/instance";
import type { Rep, Req } from "./types";
import { bodyExtractor, handleRequest } from "./_internal/utility";

import * as controller from "@/controllers/users-controller"
import { Config } from "@/config";


const basePath = Config.api.basePath + Config.api.users.basePath
const usersPaths = Config.api.users

export function usersRoutes(fastify: FastifyInstance, options: object) {
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
                bodyExtractor, controller.registerUser
            )
        }
    )

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
                bodyExtractor, controller.changeLogin
            )
        }
    )

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
                bodyExtractor, controller.changeLogin
            )
        }
    )
}