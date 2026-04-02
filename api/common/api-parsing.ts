import z from "zod"

/**
 * Maps response codes from database services and controllers to relevant HTTP status.
 */
export const STATUS_MAP = {
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

type ResponseStatus = keyof typeof STATUS_MAP

export const SUCCESS_STATUS_VALUES = [
    "SUCCESS", "SUCCESS_REDUNDANT"
] as const

export const ERROR_STATUS_VALUES: Exclude<ResponseStatus, typeof SUCCESS_STATUS_VALUES[number]>[]
    = Object.keys(STATUS_MAP).filter((s: any) => !SUCCESS_STATUS_VALUES.includes(s)) as any



type SuccessStatus<S extends ResponseStatus> = S & ("SUCCESS" | "SUCCESS_REDUNDANT")

type ErrorStatus<S extends ResponseStatus> = Exclude<S, SuccessStatus<S>>

type SuccessResponseSchema<S extends ResponseStatus, SuccessFields extends z.ZodObject> 
    = z.ZodIntersection<
    z.ZodObject<
        {
            status: z.ZodLiteral<SuccessStatus<S>>
            message: z.ZodString
        }
    >,
    SuccessFields
>


type ErrorResponseSchema<S extends ResponseStatus> = z.ZodObject<{
    status: z.ZodLiteral<ErrorStatus<S>>
    message: z.ZodString
}>

type ApiResponseSchema<S extends ResponseStatus, SuccessFields extends z.ZodObject> 
    = z.ZodUnion<[SuccessResponseSchema<S, SuccessFields>, ErrorResponseSchema<S>]>



export class ApiParserFactory {
    static createRequestParser<R>(
        schema: z.ZodType<R>, 
        tokenType?: "access" | "refresh")
    : (request: {body?: Record<string, string>, cookies?: Record<string, string>}) => R {

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

    static createResponseParser<
        S extends ResponseStatus, 
        SuccessFieldsShape extends z.core.$ZodShape,
        SuccessFields extends z.ZodObject<SuccessFieldsShape>,

    >(successFieldsSchema: SuccessFields, possibleStatus: S[]): (response: any) => z.infer<ApiResponseSchema<S, SuccessFields>> {
        const possibleSuccessStatus: SuccessStatus<S>[] 
            = possibleStatus.filter((s: any) => SUCCESS_STATUS_VALUES.includes(s)) as any
        const possibleErrorStatus: ErrorStatus<S> 
            = possibleStatus.filter((s: any) => !possibleSuccessStatus.includes(s)) as any

        
        const successSchema = z.intersection(
            z.object({
                status: z.literal(possibleSuccessStatus),
                message: z.string()
            }),
            successFieldsSchema
        )
        
        const errorSchema = z.object({
            status: z.literal(possibleErrorStatus),
            message: z.string()
        })

        const fullSchema = z.union([successSchema, errorSchema])
        return (response) => fullSchema.parse(response)
    }
}


