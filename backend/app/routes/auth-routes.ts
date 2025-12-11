import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";


const basePath = Config.api.basePath
const authPaths = Config.api.auth

export async function authRoutes(fastify: FastifyInstance, options: object) {
    fastify.post(`${basePath}${authPaths.logIn}`, {
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
            await handleRequest(
                req, rep, 
                ["login", "password"],
                controller.authenticateUser
            )
        }
    )
    
    fastify.post(`${basePath}${authPaths.refreshToken}`, {
            schema: {
                body: {}
            }
        }, 
        async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
            await handleRequest(
                req, rep,
                ["refreshToken"],
                controller.refreshToken
            )
        }
    )
    
    fastify.post(`${basePath}${authPaths.logOut}`, {
            schema: {
                body: {}
            }
        }, 
        async (req: FastifyRequest<{Body: Record<string, any>}>, rep) => {
            await handleRequest(
                req, rep,
                ["refreshToken"],
                controller.logOut
            )
        }
    )
    
}