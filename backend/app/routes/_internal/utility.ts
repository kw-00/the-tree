import type { ControllerAuthResponse, ControllerFunction, ControllerResponse } from "@/controllers/public/types";
import type { Rep, Req } from "../types";



export async function handleRequest(req: Req, rep: Rep, paramExtractor: (req: Req) => any, controllerFunction: ControllerFunction<any, any, ControllerAuthResponse>) {
    try {
        const params = paramExtractor(req)
        const result = await controllerFunction(params)
        const {httpStatus, body, auth} = result
        if (auth !== undefined) {
            const tokenCookieOptions = {secure: true, httpOnly: true, sameSite: "strict"} as const
            rep.cookie("accessToken", auth.accessToken, tokenCookieOptions)
            rep.cookie("accessToken", auth.accessToken, tokenCookieOptions)
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


export const paramExtractor = (req: Req) => {
    return req.params
} 

export const bodyExtractor = (req: Req) => {
    return req.body
}

export const cookieExtractor = (req: Req) => {
    return req.cookies
}
