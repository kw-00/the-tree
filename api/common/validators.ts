import z from "zod";

const baseValidators = {
    timestamptz: z.iso.datetime({offset: true}),
    serialId: z.int().positive()
}

export default class CommonValidators {

    static user = {
        id: baseValidators.serialId,
        login: z.string().min(1).max(30),
        password: z.string().min(5).max(50)
    }

    static auth = {
        accessToken: z.string(),
        refreshToken: z.uuidv4()
    }

    static friendshipCode = {
        id: baseValidators.serialId,
        code: z.string().min(1).max(50)
    }

    static chatroom = {
        id: baseValidators.serialId,
        name: z.string().min(1).max(200)
    }

    static message = {
        id: baseValidators.serialId,
        content: z.string().min(1).max(5000)
    }
}
