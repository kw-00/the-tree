import z from "zod"

const payloadSchemas = {
    serverMessage: z.object({
        type: z.literal("server"),
        code: z.literal(["not_in_room", "invalid_message"])
    }),

    chatMessage: z.object({
        type: z.literal("chat"),
        roomId: z.number().nonnegative(),
        content: z.string()
    }),
}


export function tryParsePayload<K extends keyof typeof payloadSchemas>(
            type: K, data: any
        ): z.infer<typeof payloadSchemas[K]> | undefined
{
    try {
        const parsed = payloadSchemas[type].parse(data) as any
        return parsed
    } catch {
        return undefined
    }
}

export type ServerMessagePayload = z.infer<typeof payloadSchemas.serverMessage>
export type ChatMessagePayload = z.infer<typeof payloadSchemas.chatMessage>

