import z from "zod"

/**
 * Maps response codes from database services and controllers to relevant HTTP status.
 */
export const statusMap = {
    "SUCCESS": 200,
    "SUCCESS_REDUNDANT": 200,
    "NULL_PARAMETER": 400,
    "INVALID_CREDENTIALS": 401,
    "INVALID_ACCESS_TOKEN": 401,
    "REFRESH_TOKEN_INVALID": 401,
    "REFRESH_TOKEN_REUSE": 401,
    "REFRESH_TOKEN_REVOKED": 401,
	"NOT_IN_CHATROOM": 403,
	"INVALID_FRIENDSHIP_CODE": 403,
    "NOT_OWNER_OF_FRIENDSHIP_CODE": 403,
    "NOT_FOUND": 404,
    "UUID_COLLISION": 409,
    "LOGIN_IN_USE": 409,
    "BEFRIENDING_SELF": 409,
}

export type ResponseStatus = keyof typeof statusMap

export class CommonSchemas {
    static basicResponse<S extends ResponseStatus>(possibleStatus: S[]) {
        return z.object({
            status: z.literal(possibleStatus),
            message: z.string()
        })
    }
}

type SuccessStatus<S extends ResponseStatus> = S & ("SUCCESS" | "SUCCESS_REDUNDANT")

type ErrorStatus<S extends ResponseStatus> = Exclude<S, SuccessStatus<S>>

type SuccessResponse<S extends ResponseStatus, Fields> = {
    status: SuccessStatus<S>
    message: string
} & Required<Fields>

type ErrorResponse<S extends ResponseStatus> = {
    status: ErrorStatus<S>
    message: string
}

export type ApiResponse<S extends ResponseStatus, Fields> = SuccessResponse<S, Fields> | ErrorResponse<S>

