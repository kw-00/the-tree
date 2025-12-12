import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleRequest, validateAuth } from "./_internal/utility";
import * as controller from "@/controllers/auth-controller"
import type { Rep, Req } from "./public/types";


const basePath = Config.api.basePath + Config.api.auth.basePath
const authPaths = Config.api.auth

export async function authRoutes(fastify: FastifyInstance, options: object) {
    // Log In
    fastify.post(`${basePath}${authPaths.logIn}`, {
            schema: {
                body: {
                    type: "object",
                    required: ["login", "password"],
                    properties: {
                        login: {$ref: "common#/properties/login"},
                        password: {$ref: "common#/properties/password"}
                    }
                },
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                (req) => {
                    return {
                        login: req.body.login,
                        password: req.body.password
                    }
                },
                controller.logIn
            )
        }
    )
    
    // Refresh Token
    fastify.post(`${basePath}${authPaths.refreshToken}`, {
            schema: {
                body: {}
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                (req) => {
                    const auth = validateAuth(req, "refresh")
                    return auth
                },
                controller.refreshToken
            )
        }
    )
    
    // Log Out
    fastify.post(`${basePath}${authPaths.logOut}`, {
            schema: {
                body: {}
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep,
                (req) => {
                    const auth = validateAuth(req, "refresh")
                    return auth
                },
                controller.logOut
            )
        }
    )
}