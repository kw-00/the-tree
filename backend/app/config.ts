import raw from "@/config.json" assert {type: "json"}


import z from "zod"


const Schema = z.object({
    api: z.object({
        basePath: z.string().startsWith("/"),
        auth: z.object({
            logIn: z.string().startsWith("/"),
            refreshToken: z.string().startsWith("/"),
            logOut: z.string().startsWith("/")
        }),
        user: z.object({
            registerUser: z.string().startsWith("/"),
            changeLogin: z.string().startsWith("/"),
            changePassword: z.string().startsWith("/")
        }),
        friends: z.object({
            createFriendshipToken: z.string().startsWith("/"),
            getFriendshipCodes: z.string().startsWith("/"),
            revokeFriendshipCode: z.string().startsWith("/"),
            addFriend: z.string().startsWith("/"),
            getFriends: z.string().startsWith("/"),
            removeFriend: z.string().startsWith("/")
        }),
        chatrooms: z.object({
            createChatroom: z.string().startsWith("/"),
            getConnectedChatrooms: z.string().startsWith("/"),
            addFriendsToChatroom: z.string().startsWith("/"),
            leaveChatroom: z.string().startsWith("/")
        }),
        messages: z.object({
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
    }),
    dataRules: z.object({
        users: z.object({
            login: z.object({
                minLength: z.int().positive(),
                maxLength: z.int().positive()
            }),
            password: z.object({
                minLength: z.int().positive(),
                maxLength: z.int().positive()
            })
        }),
        friends: z.object({
            friendshipCode: z.object({
                minLength: z.int().positive(),
                maxLength: z.int().positive()
            })
        }),
        chatrooms: z.object({
            name: z.object({
                minLength: z.int().positive(),
                maxLenght: z.int().positive()
            })
        }),
        messages: z.object({
            messageContent: z.object({
            minLength: z.int().positive(),
            maxLength: z.int().positive()
        })
        })
    })
})

export const Config = await Schema.parseAsync(raw)

