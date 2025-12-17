

import type { Req, Rep } from "./types"



export async function handleRequest(
    req: Req, rep: Rep, 
    requestHandler: (req: Req, res: Rep) => Promise<void>
) {
    try {
        await requestHandler(req, rep)
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

