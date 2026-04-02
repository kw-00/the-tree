import z from "zod";



export class FieldValidators {
    static base = {
        timestamptz: z.iso.datetime({offset: true}),
        serialId: z.int().positive()
    }

    static user = {
        id: FieldValidators.base.serialId,
        login: z.string().min(1).max(30),
        password: z.string().min(5).max(50)
    }

    static auth = {
        accessToken: z.string(),
        refreshToken: z.uuidv4()
    }

    static friendshipCode = {
        id: FieldValidators.base.serialId,
        code: z.string().min(1).max(50)
    }

    static chatroom = {
        id: FieldValidators.base.serialId,
        name: z.string().min(1).max(200),
    }

    static message = {
        id: FieldValidators.base.serialId,
        content: z.string().min(1).max(5000)
    }
}


