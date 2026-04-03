import z from "zod"
import { FieldValidators } from "@/common/zod-schemas"
import { ApiParserFactory } from "@/common/api-parsing"

export default class AuthParsers {
    static authenticateUser = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            credentials: FieldValidators.auth.credentials,
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
            z.object(),
            [
                "SUCCESS",
                "REFRESH_TOKEN_INVALID",
                "REFRESH_TOKEN_REVOKED",
                "REFRESH_TOKEN_REUSE",
                "NOT_FOUND",
                "UUID_COLLISION",
            ]
        )
    }
}
