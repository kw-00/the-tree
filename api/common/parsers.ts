import z from "zod"
import { ApiResponse, ResponseStatus } from "./response-management";


class ApiParsers {
    static createResponseParser<S extends ResponseStatus, Fields, R extends ApiResponse<S, Fields>>(schema: z.ZodType<R>): (response: any) => R {
        return (response) => schema.parse(response)
    }

    static createRequestParser<R>(schema: z.ZodType<R>, tokenType?: "access" | "refresh"): (request: {body?: Record<string, string>, cookies?: Record<string, string>}) => R {
        return (request) => {
            let requestWithPossibleAuth = typeof request.body === "object" ? request.body : {}
            if (tokenType !== undefined) {
                const tokenKey = `${tokenType}Token`
                const token = request.cookies?.[tokenKey]

                if (token === undefined) {
                    throw new Error(
                        `tokenType is declared as \"${tokenType}\", yet request does not contain ${tokenKey} in cookies.`
                        + ` Could not extract ${tokenKey} from cookies.`
                    )
                }
                requestWithPossibleAuth[tokenKey] = token
            }
            return schema.parse(requestWithPossibleAuth)
        }
    }
}