import z from "zod"
import { ApiParserFactory } from "@/common/api-parsing"
import { FieldValidators } from "@/common/zod-schemas"

class Models {
    static messageData = z.object({
        id: FieldValidators.message.id,
        content: FieldValidators.message.content,
        userId: FieldValidators.user.id,
        userLogin: FieldValidators.user.login,
        chatroomId: FieldValidators.chatroom.id,
        createdAt: FieldValidators.base.timestamptz
    })

    static messagesPage = z.object({
        messagesData: z.array(Models.messageData),
        nextCursor: FieldValidators.message.id.nullable(),
        prevCursor: FieldValidators.message.id.nullable()
    })
}

export default class MessagesParser {
    static createMessage = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            chatroomId: FieldValidators.chatroom.id,
            content: FieldValidators.message.content
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                messageData: Models.messageData
            }),
            ["SUCCESS", "NOT_FOUND", "NOT_IN_CHATROOM"]
        )
    }

    static getNextMessages = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            chatroomId: FieldValidators.chatroom.id,
            after: FieldValidators.message.id,
            limit: z.int().positive()
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                page: Models.messagesPage
            }),
            ["SUCCESS", "NOT_FOUND", "NOT_IN_CHATROOM"]
        )
    }

        static getPreviousMessages = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            chatroomId: FieldValidators.chatroom.id,
            before: FieldValidators.message.id.nullable(),
            limit: z.int().positive()
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                page: Models.messagesPage
            }),
            ["SUCCESS", "NOT_FOUND", "NOT_IN_CHATROOM"]
        )
    }
}