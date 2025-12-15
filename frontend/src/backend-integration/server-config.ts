import raw from "@/backend-integration/server-config.json" with {type: "json"}


import z from "zod"

const Schema = z.object({
    baseUrl: z.string(),
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
            getFriends: z.string().startsWith("/"),
            removeFriend: z.string().startsWith("/")
        }),
        chatrooms: z.object({
            basePath: z.string().startsWith("/"),
            createChatroom: z.string().startsWith("/"),
            getConnectedChatrooms: z.string().startsWith("/"),
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
                maxLength: z.int().positive()
            })
        }),
        messages: z.object({
            content: z.object({
                minLength: z.int().positive(),
                maxLength: z.int().positive()
            })
        })
    }),
    fetchingRules: z.object({
        friends: z.object({
            friendshipCodes: z.object({
                limit: z.int().positive()
            })
        }),
        chatrooms: z.object({
            limit: z.int().positive()
        }),
        messages: z.object({
            limit: z.int().positive()
        })
    })
})

export const ServerConfig = await Schema.parseAsync(raw)

