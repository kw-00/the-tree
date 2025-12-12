import { Config } from "@/config";
import type { FastifyInstance } from "fastify";

export const sharedSchema = {
    $id: "common", 
    type: "object",
    properties: {
        login: {type: "string", 
            minLength: Config.dataRules.users.login.minLength, 
            maxLength: Config.dataRules.users.login.maxLength
        },
        password: {type: "string", 
            minLength: Config.dataRules.users.password.minLength, 
            maxLength: Config.dataRules.users.password.maxLength
        },
        chatroomName: {type: "string", 
            minLength: Config.dataRules.chatrooms.name.minLength, 
            maxLength: Config.dataRules.chatrooms.name.maxLength
        },
        friendshipCode: {type: "string", 
            minLength: Config.dataRules.friends.friendshipCode.minLength, 
            maxLength: Config.dataRules.friends.friendshipCode.maxLength
        },
        messageContent: {type: "string", 
            minLength: Config.dataRules.messages.content.minLength, 
            maxLength: Config.dataRules.messages.content.maxLength
        }
    }
}

