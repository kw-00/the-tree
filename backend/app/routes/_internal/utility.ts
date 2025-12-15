import type { ControllerAuthResponse, ControllerFunction, ControllerResponse } from "@/controllers/public/types";
import type { Rep, Req } from "../public/types";

import z from "zod"



export async function handleRequest<P>(
    req: Req, rep: Rep, 
    paramExtractor: (req: Req) => P,
    controllerFunction: ControllerFunction<P, any, ControllerAuthResponse>
) {
    try {
        const params = paramExtractor(req)
        const result = await controllerFunction(params)
        const {httpStatus, body, auth} = result
        if (auth !== undefined) {
            const tokenCookieOptions = {secure: true, httpOnly: true, sameSite: "strict", expires: new Date("2030"), path: "/"} as const
            rep.cookie("accessToken", auth.accessToken, tokenCookieOptions)
            rep.cookie("refreshToken", auth.refreshToken, tokenCookieOptions)
        }
        rep.status(httpStatus).send(body)

    } catch (error) {
        if (error instanceof Error && process.env.NODE_ENV === "development") {
            rep.status(500).send({
                status: "UNEXPECTED_ERROR",
                error: {
                    name: error.name,
                    cause: error.cause,
                    message: error.message,
                    stack: error.stack
                }
            })
        } else {
            rep.status(500).send({
                status: "UNEXPECTED_ERROR",
                message: "An error occurred."
            })
        } 
    }
}

const authSchemas = {
    access: z.object({
        accessToken: z.jwt()
    }),
    refresh: z.object({
        refreshToken: z.uuidv4()
    })
}

type AuthSchemaKey = keyof typeof authSchemas

export function validateAuth<T extends AuthSchemaKey>(req: Req, type: T = "access" as T): z.infer<typeof authSchemas[T]> {
    let auth;
    switch (type) {
        case "access":
            auth = {accessToken: req.cookies.accessToken}
            break
        case "refresh":
            auth = {refreshToken: req.cookies.refreshToken}
            break
    }
    const schema = authSchemas[type]
    return schema.parse(auth) as any
}


