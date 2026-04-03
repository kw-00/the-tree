import z from "zod"
import { FieldValidators } from "@/common/zod-schemas"
import { ApiParserFactory } from "@/common/api-parsing"


const models = {
    friendshipCodeData: z.object({
        id: FieldValidators.friendshipCode.id,
        code: FieldValidators.friendshipCode.code,
        expiresAt: FieldValidators.base.timestamptz,
        createdAt: FieldValidators.base.timestamptz
    }),

    friendData: z.object({
        id: FieldValidators.user.id,
        login: FieldValidators.user.login,
        friendSince: FieldValidators.base.timestamptz
    })
}

export default class FriendsParsers {
    static createFriendshipCode = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            code: FieldValidators.friendshipCode.code,
            expiresAt: FieldValidators.base.timestamptz.nullable()
        })),
        
        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                friendshipCodeData: models.friendshipCodeData
            }),
            ["SUCCESS", "NOT_FOUND"]
        )
    }
    
    static getFriendshipCodes = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            after: FieldValidators.base.timestamptz
        })),
        
        parseResponse: ApiParserFactory.createResponseParser(
            z.object({     
                friendshipCodesData: z.array(models.friendshipCodeData)
            }),
            ["SUCCESS", "NOT_FOUND"]
        )
    }

    static revokeFriendshipCode = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            code: FieldValidators.friendshipCode.id
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            [
                "SUCCESS", 
                "SUCCESS_REDUNDANT", 
                "NOT_FOUND", 
                "NOT_OWNER_OF_FRIENDSHIP_CODE"
            ]
        )
    }

    static addFriend = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            userToBefriendLogin: FieldValidators.user.login,
            friendshipCode: FieldValidators.friendshipCode.code
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                friendData: models.friendData
            }),
            [
                "SUCCESS",
                "SUCCESS_REDUNDANT",
                "NOT_FOUND",
                "INVALID_FRIENDSHIP_CODE"
            ]
        )
    }

    static getFriends = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            after: FieldValidators.base.timestamptz.nullable()
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                friends: z.array(models.friendData)
            }),
            ["SUCCESS", "NOT_FOUND"]
        )
    }

    static removeFriends = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            friendId: FieldValidators.user.id
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            ["SUCCESS", "SUCCESS_REDUNDANT", "NOT_FOUND"]
        )
    }
}