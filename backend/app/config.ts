import raw from "@/config.json" assert {type: "json"}


import z from "zod"


const Schema = z.object({
    api: z.object({
        basePath: z.string().startsWith("/"),
        auth: z.object({
            basePath: z.string().startsWith("/"),
            logIn: z.string().startsWith("/"),
            refreshToken: z.string().startsWith("/"),
            logOut: z.string().startsWith("/")
        }),
        users: z.object({
            basePath: z.string().startsWith("/"),
            registerUser: z.string().startsWith("/"),
            changeLogin: z.string().startsWith("/"),
            changePassword: z.string().startsWith("/")
        }),
        friends: z.object({
            basePath: z.string().startsWith("/"),
            createFriendshipCode: z.string().startsWith("/"),
            getFriendshipCodes: z.string().startsWith("/"),
            revokeFriendshipCode: z.string().startsWith("/"),
            addFriend: z.string().startsWith("/"),
            getNextFriends: z.string().startsWith("/"),
            getPreviousFriends: z.string().startsWith("/"),
            removeFriend: z.string().startsWith("/")
        }),
        chatrooms: z.object({
            basePath: z.string().startsWith("/"),
            createChatroom: z.string().startsWith("/"),
            getChatrooms: z.string().startsWith("/"),
            addFriendsToChatroom: z.string().startsWith("/"),
            leaveChatroom: z.string().startsWith("/")
        }),
        messages: z.object({
            basePath: z.string().startsWith("/"),
            createMessage: z.string().startsWith("/"),
            getMessages: z.string().startsWith("/")
        })
    }),
    tokens: z.object({
        access: z.object({
            validityPeriod: z.int().positive()
        }),
        refresh: z.object({
            validityPeriod: z.int().positive()
        })
    })
})

export const Config = await Schema.parseAsync(raw)

