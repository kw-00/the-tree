import z from "zod"
import { ApiParserFactory } from "@/common/api-parsing.js"
import { FieldValidators } from "@/common/zod-schemas.js"



export default class UsersParsers {
    static registerUser = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            login: FieldValidators.user.login,
            password: FieldValidators.user.password
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            ["SUCCESS", "LOGIN_IN_USE"]
        )
    }

    static changeLogin = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            credentials: FieldValidators.auth.credentials,
            newLogin: FieldValidators.user.login
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            ["SUCCESS", "NOT_FOUND", "LOGIN_IN_USE"]
        )
    }

    static changePassword = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            credentials: FieldValidators.auth.credentials,
            newLogin: FieldValidators.user.login
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            ["SUCCESS", "NOT_FOUND", "LOGIN_IN_USE"]
        )
    }
}