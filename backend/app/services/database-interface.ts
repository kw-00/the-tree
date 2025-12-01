import {Pool} from "pg"

type StandardResponse = {
    httpStatus: number
    status: string
    message: string
}

type RegisterUserResponse = {
    userId?: number
} & StandardResponse

type AuthenticateUserResponse = RegisterUserResponse

type VerifyRefreshTokenResponse = {
    userId?: number
} & StandardResponse

type CreateRefreshTokenResponse = {
    refreshToken?: string
} & StandardResponse

type GetFriendsResponse = {
    friends?: {id: number, login: string}[]
} & StandardResponse

type AddUsersToChatroomResponse = {
    added?: number[],
    skipped?: number[],
    notFound?: number[]
} & StandardResponse

type CreateChatroomResponse = {
    chatroomId?: number
} & StandardResponse

type GetConnectedChatroomsResponse = {
    connectedChatrooms?: {id: number, name: string}[]
} & StandardResponse

type GetConversationResponse = {
    conversation?: {userId: number, userLogin: string, content: string}
} & StandardResponse


export default class DatabaseInterface {
    pool

    constructor(pool: Pool) {
        this.pool = pool
    }



    async callAPI(functionName: string, ...parameters: any[]): Promise<StandardResponse & any[]> {
        const placeholders = Array.from(parameters.keys())
            .map(v => v + 1)
            .map(v => `$${v}`)
            .join(", ")
        const query = await pool.query(`SELECT api.${functionName}(${placeholders}) AS result;`, [parameters])
        return query.rows[0].result
    }
    async registerUser(login: string, password: string): Promise<RegisterUserResponse> {
        return this.callAPI("register_user", login, password)
    }

    async authenticateUser(login: string, password: string): Promise<AuthenticateUserResponse> {
        return this.callAPI("authenticate_user", login, password)
    }

    async verifyRefreshToken(refreshToken: string): Promise<VerifyRefreshTokenResponse> {
        return this.callAPI("verify_refresh_token", refreshToken)
    }

    async createRefreshToken(userId: number, validityPeriodSeconds: number): Promise<CreateRefreshTokenResponse> {
        return this.callAPI("create_refresh_token", userId, validityPeriodSeconds)
    }

    async revokeRefreshToken(refreshToken: string): Promise<StandardResponse> {
        return this.callAPI("revoke_refresh_token", refreshToken)
    }

    async addFriend(userId: number, userToBefriendLogin: string, friendshipCode: string): Promise<StandardResponse> {
        return this.callAPI("add_friend", userId, userToBefriendLogin, friendshipCode)
    }

    async getFriends(userId: number): Promise<GetFriendsResponse> {
        return this.callAPI("get_friends", userId)
    }

    async addUsersToChatroom(userId: number, friendIds: number[], chatroomId: number): Promise<AddUsersToChatroomResponse> {
        return this.callAPI("add_users_to_chatroom", userId, friendIds, chatroomId)
    }

    async createChatroom(userId: number, name: string): Promise<CreateChatroomResponse> {
        return this.callAPI("create_chatroom", userId, name)
    }

    async getConnectedChatrooms(userId: number, after: Date): Promise<GetConnectedChatroomsResponse> {
        return this.callAPI("get_connected_chatrooms", userId, after)
    }

    async createMessage(userId: number, chatroomId: number, content: string): Promise<StandardResponse> {
        return this.callAPI("create_message", userId, chatroomId, content)
    }

    async getConversation(
            userId: number, chatroomId: number, 
            before: Date | null, after: Date | null, 
            nRows: number, descending: boolean): Promise<GetConversationResponse> {

        return this.callAPI("get_conversation", userId, chatroomId, before, after, nRows, descending)
    }
}
