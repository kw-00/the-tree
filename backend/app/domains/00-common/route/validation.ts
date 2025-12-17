import z from "zod";



const validation = {
    common: {
        timestamptz: z.iso.datetime({offset: true})
    },
    auth: {
        accessToken: z.string(),
        refreshToken: z.uuidv4()
    },
    users: {
        id: z.int().positive(),
        login: z.string().min(3).max(30),
        password: z.string().min(3).max(50)
    },
    friends: {
        friendshipCode: {
            id: z.int().positive(),
            code: z.string().min(1).max(50),
        }
    },
    chatrooms: {
        id: z.int().positive(),
        name: z.string().min(1).max(200)
    },
    messages: {
        id: z.int().positive(),
        message: z.string().min(1).max(5000)
    }
}

export default validation