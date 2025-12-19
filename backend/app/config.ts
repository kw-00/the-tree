import raw from "@/config.json" assert {type: "json"}


import z from "zod"


const Schema = z.object({
    api: z.object({
        path: z.string().startsWith("/"),
        auth: z.object({
            path: z.string().startsWith("/"),
            logIn: z.object({
                path: z.string().startsWith("/")
            }),
            refreshToken: z.object({
                path: z.string().startsWith("/")
            }),
            logOut: z.object({
                path: z.string().startsWith("/")
            })
        }),
        users: z.object({
            path: z.string().startsWith("/"),
            registerUser: z.object({
                path: z.string().startsWith("/")
            }),
            changeLogin: z.object({
                path: z.string().startsWith("/")
            }),
            changePassword: z.object({
                path: z.string().startsWith("/")
            })
        }),
        friends: z.object({
            path: z.string().startsWith("/"),
            createFriendshipCode: z.object({
                path: z.string().startsWith("/")
            }),
            getFriendshipCodes: z.object({
                path: z.string().startsWith("/")
            }),
            revokeFriendshipCode: z.object({
                path: z.string().startsWith("/")
            }),
            addFriend: z.object({
                path: z.string().startsWith("/")
            }),
            getFriends: z.object({
                path: z.string().startsWith("/"),
                maxBatchSize: z.int().positive()
            }),
            removeFriend: z.object({
                path: z.string().startsWith("/")
            })
        }),
        chatrooms: z.object({
            path: z.string().startsWith("/"),
            createChatroom: z.object({
                path: z.string().startsWith("/")
            }),
            getChatrooms: z.object({
                path: z.string().startsWith("/")
            }),
            addFriendsToChatroom: z.object({
                path: z.string().startsWith("/")
            }),
            leaveChatroom: z.object({
                path: z.string().startsWith("/")
            })
        }),
        messages: z.object({
            path: z.string().startsWith("/"),
            createMessage: z.object({
                path: z.string().startsWith("/")
            }),
            getNextMessages: z.object({
                path: z.string().startsWith("/"),
                maxBatchSize: z.int().positive()
            }),
            getPreviousMessages: z.object({
                path: z.string().startsWith("/"),
                maxBatchSize: z.int().positive()
            })
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

