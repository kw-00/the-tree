import type { FastifyInstance } from "fastify/types/instance";
import { Config } from "@/config";
import z from "zod";
import type { Req, Rep } from "../00-common/route/types";
import { handleRequest } from "../00-common/route/utility";
import validation from "../00-common/route/validation";
import { changeLogin, changePassword, registerUser } from "./users-service";
import { stMap } from "@/utilities/status-mapping";
import { authenticateUser } from "../auth/auth-service";


const basePath = Config.api.path + Config.api.users.path
const usersConfig = Config.api.users

export async function usersRoutes(fastify: FastifyInstance, options: object) {
    // Register User
    const registerUserSchema = z.object({
        body: z.object({
            login: validation.users.login,
            password: validation.users.password
        })
    })

    fastify.post(`${basePath}${usersConfig.registerUser.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                async (req, rep) => {
                    const {login, password} = registerUserSchema.parse(req).body
                    const result = await registerUser({login, password})
                    rep.status(stMap[result.status]).send(result)
                }
            )
        }
    )

    // Change Login
    const changeLoginSchema = z.object({
        body: z.object({
            login: validation.users.login,
            password: validation.users.password,
            newLogin: validation.users.login
        })
    })

    fastify.post(`${basePath}${usersConfig.changeLogin.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                async (req, rep) => {
                    const {login, password, newLogin} = changeLoginSchema.parse(req).body
                    const authenticationResult = await authenticateUser({login, password})
                    if (authenticationResult.status !== "SUCCESS") {
                        rep.status(stMap[authenticationResult.status]).send(authenticationResult)
                        return
                    }
                    const userId = authenticationResult.userId!
                    const changeResult = await changeLogin({userId, newLogin})
                    rep.status(stMap[changeResult.status]).send(changeResult)
                }
            )
        }
    )
    // Change Password
    const changePasswordSchema = z.object({
        body: z.object({
            login: validation.users.login,
            password: validation.users.password,
            newPassword: validation.users.login
        })
    })

    fastify.post(`${basePath}${usersConfig.changePassword.path}`,
        async (req: Req, rep: Rep) => {
            await handleRequest(
                req, rep, 
                async (req, rep) => {
                    const {login, password, newPassword} = changePasswordSchema.parse(req).body
                    const authenticationResult = await authenticateUser({login, password})
                    if (authenticationResult.status !== "SUCCESS") {
                        rep.status(stMap[authenticationResult.status]).send(authenticationResult)
                        return
                    }
                    const userId = authenticationResult.userId!
                    const changeResult = await changePassword({userId, newPassword})
                    rep.status(stMap[changeResult.status]).send(changeResult)
                }
            )
        }
    )
}