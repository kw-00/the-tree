import type { ControllerAuthResponse, ControllerFunction, ControllerResponse } from "@/controllers/public/types";
import type { Rep, Req } from "../types";



export function handleRequest<P>(req: Req, rep: Rep, paramExtractor: (req: Req) => P, controllerFunction: ControllerFunction<P, any, ControllerAuthResponse>) {
    try {
        const params = paramExtractor(req)
        const result = await controllerFunction(params)
        const {httpStatus, body, auth} = result
        if (auth !== undefined) {
            const tokenCookieOptions = {secure: true, httpOnly: true, sameSite: "strict"} as const
            rep.cookie("accessToken", auth.accessToken, tokenCookieOptions)
            rep.cookie("accessToken", auth.accessToken, tokenCookieOptions)
        }
    } catch (error) {
        if (error instanceof Error) {
            if (process.env.NODE_ENV === "development") {
                rep.
            }
        } 
    }
}