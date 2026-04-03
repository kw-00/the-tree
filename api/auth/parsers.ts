import z from "zod"
import { FieldValidators } from "@/common/zod-schemas.js"
import { ApiParserFactory } from "@/common/api-parsing.js"

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

    static verifyAccessToken = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.refreshToken
        }), "access"),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                userId: FieldValidators.user.id
            }),
            ["SUCCESS", "INVALID_ACCESS_TOKEN"]
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

    static revokeRefreshToken = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            refreshToken: FieldValidators.auth.refreshToken
        }), "refresh"),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            ["SUCCESS", "SUCCESS_REDUNDANT"]
        )
    }
}
