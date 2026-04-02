import z from "zod"
import { FieldValidators } from "../common/zod-schemas"
import { ApiParserFactory } from "../common/api-parsing"

export default class AuthParsers {
    static authenticateUser = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            login: FieldValidators.user.login,
            password: FieldValidators.user.password
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                userId: FieldValidators.user.id
            }),
            ["SUCCESS", "INVALID_CREDENTIALS"]
        )
    }

    static refreshToken = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            refreshToken: FieldValidators.auth.refreshToken
        }), "refresh"),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({

            })
        )
    }
}

function f(schema: z.ZodType<{userId: number}>) {

}

const parse = AuthParsers.authenticateUser.parseResponse({})
if (parse.status === "INVALID_CREDENTIALS") {
    parse.userId
}