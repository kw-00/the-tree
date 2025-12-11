import raw from "@/config.json" assert {type: "json"}


import z, { maxLength, minLength } from "zod"


const Schema = z.object({
    tokens: z.object({
        access: z.object({
            validityPeriod: z.int().positive()
        }),
        refresh: z.object({
            validityPeriod: z.int().positive()
        })
    }),
    dataRules: z.object({
        login: z.object({
            minLength: z.int().positive(),
            maxLength: z.int().positive()
        }),
        password: z.object({
            minLength: z.int().positive(),
            maxLength: z.int().positive()
        }),
        friendshipCode: z.object({
            minLength: z.int().positive(),
            maxLength: z.int().positive()
        }),
        chatroomName: z.object({
            minLength: z.int().positive(),
            maxLenght: z.int().positive()
        }),
        message: z.object({
            minLength: z.int().positive(),
            maxLength: z.int().positive()
        })
    })
})

export const Config = await Schema.parseAsync(raw)

