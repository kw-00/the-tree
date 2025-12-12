import { Config } from "@/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { bodyExtractor, cookieExtractor, handleRequest } from "./_internal/utility";
import * as controller from "@/controllers/auth-controller"
import type { Rep, Req } from "./types";


const basePath = Config.api.basePath + Config.api.auth.basePath
const authPaths = Config.api.auth

export function authRoutes(fastify: FastifyInstance, options: object) {
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
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                bodyExtractor, controller.logIn
            )
        }
    )
    
    fastify.post(`${basePath}${authPaths.refreshToken}`, {
            schema: {
                body: {}
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                cookieExtractor, controller.refreshToken
            )
        }
    )
    
    fastify.post(`${basePath}${authPaths.logOut}`, {
            schema: {
                body: {}
            }
        }, 
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                cookieExtractor, controller.logOut
            )
        }
    )
    
}