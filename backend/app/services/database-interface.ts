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

type AddFriendsToChatroomResponse = {
    added?: number[],
    skipped?: number[],
    notFound?: number[]
} & StandardResponse

type GetFriendsResponse = {
    friends?: {id: number, login: string}[]
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

const databaseCredentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
}

const pool = new Pool(databaseCredentials)

async function _callAPI(functionName: string, ...parameters: any[]): Promise<StandardResponse & any[]> {
    const placeholders = Array.from(parameters.keys())
        .map(v => v + 1)
        .map(v => `$${v}`)
        .join(", ")
    const query = await pool.query(`SELECT api.${functionName}(${placeholders}) AS result;`, parameters)
    return query.rows[0].result
}
export async function registerUser(login: string, password: string): Promise<RegisterUserResponse> {
    return _callAPI("register_user", login, password)
}

export async function authenticateUser(login: string, password: string): Promise<AuthenticateUserResponse> {
    return _callAPI("authenticate_user", login, password)
}

export async function verifyRefreshToken(refreshToken: string): Promise<VerifyRefreshTokenResponse> {
    return _callAPI("verify_refresh_token", refreshToken)
}

export async function createRefreshToken(userId: number, validityPeriodSeconds: number): Promise<CreateRefreshTokenResponse> {
    return _callAPI("create_refresh_token", userId, validityPeriodSeconds)
}

export async function revokeRefreshToken(refreshToken: string): Promise<StandardResponse> {
    return _callAPI("revoke_refresh_token", refreshToken)
}

export async function addFriend(userId: number, userToBefriendLogin: string, friendshipCode: string): Promise<StandardResponse> {
    return _callAPI("add_friend", userId, userToBefriendLogin, friendshipCode)
}

export async function getFriends(userId: number): Promise<GetFriendsResponse> {
    return _callAPI("get_friends", userId)
}

export async function addFriendsToChatroom(userId: number, friendIds: number[], chatroomId: number): Promise<AddFriendsToChatroomResponse> {
    return _callAPI("add_friends_to_chatroom", userId, friendIds, chatroomId)
}

export async function createChatroom(userId: number, chatroomName: string): Promise<CreateChatroomResponse> {
    return _callAPI("create_chatroom", userId, chatroomName)
}

export async function getConnectedChatrooms(userId: number, after: Date | null): Promise<GetConnectedChatroomsResponse> {
    return _callAPI("get_connected_chatrooms", userId, after)
}

export async function createMessage(userId: number, chatroomId: number, content: string): Promise<StandardResponse> {
    return _callAPI("create_message", userId, chatroomId, content)
}

export async function getConversation(
        userId: number, chatroomId: number, 
        before: Date | null, after: Date | null, 
        nRows: number, descending: boolean): Promise<GetConversationResponse> {

    return _callAPI("get_conversation", userId, chatroomId, before, after, nRows, descending)
}

