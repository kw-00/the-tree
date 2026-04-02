import z from "zod";
import { ApiParserFactory } from "../../common/api-parsing";
import { FieldValidators } from "../../common/zod-schemas";

const models = {
    chatroomData: z.object({
        id: FieldValidators.chatroom.id,
        name: FieldValidators.chatroom.name,
        joinedAt: FieldValidators.base.timestamptz
    })
}

export default class ChatroomsParsers{
    static createChatroom = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            chatroomName: FieldValidators.chatroom.name
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                chatroomData: models.chatroomData
            }),
            ["SUCCESS", "NOT_FOUND"]
        )
    }

    static getChatrooms = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            after: FieldValidators.base.timestamptz
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                chatroomsData: z.array(
                    z.object({
                        id: FieldValidators.chatroom.id,
                        name: FieldValidators.chatroom.name,
                        joinedAt: FieldValidators.base.timestamptz
                    })
                )
            }),
            ["SUCCESS", "NOT_FOUND"]
        )
    }

    static addFriendsToChatroom = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            friendIds: z.array(FieldValidators.user.id),
            chatroomId: FieldValidators.chatroom.id
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object({
                added: z.array(FieldValidators.user.id),
                skipped: z.array(FieldValidators.user.id),
                notFound: z.array(FieldValidators.user.id)
            }),
            ["SUCCESS", "NOT_FOUND", "NOT_IN_CHATROOM"]
        )
    }

    static leaveChatroom = {
        parseRequest: ApiParserFactory.createRequestParser(z.object({
            accessToken: FieldValidators.auth.accessToken,
            chatroomId: FieldValidators.chatroom.id
        })),

        parseResponse: ApiParserFactory.createResponseParser(
            z.object(),
            ["SUCCESS", "SUCCESS_REDUNDANT", "NOT_FOUND"]
        )
    }
}