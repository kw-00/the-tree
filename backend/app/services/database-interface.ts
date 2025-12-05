import {Pool} from "pg"


// Define param types
export type RegisterUserParams = {
    login: string
    password: string
}

export type AuthenticateUserParams = RegisterUserParams

export type RefreshTokenParams = {
    refreshToken: string
}

export type CraeteRefreshTokenParams = {
    userId: number
    validityPeriodSeconds: number
}

export type RevokeRefreshTokenParams = RefreshTokenParams

export type AddFriendParams = {
    userId: number
    userToBefriendLogin: string
    friendshipCode: string
}

export type GetFriendsParams = {
    userId: number
}

export type AddFriendsToChatroomParams = {
    userId: number
    friendIds: number[]
    chatroomId: number
}

export type CreateChatroomParams = {
    userId: number
    chatroomName: string
}

export type GetConnectedChatroomsParams = {
    userId: number
    after: Date | null
}

export type CreateMessageParams = {
    userId: number
    chatroomId: number
    content: string
}

export type GetConversationParams = {
    userId: number
    chatroomId: number
    before: Date | null
    after: Date | null
    nRows: number
    descending: boolean
}

// Define response types
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

async function _callAPI(functionName: string, params: {[keys: string]: any}): Promise<StandardResponse & any[]> {
    const placeholders = Object.keys(params)
        .map((k, n) => n + 1)
        .map(v => `$${v}`)
        .join(", ")
    const query = await pool.query(`SELECT api.${functionName}(${placeholders}) AS result;`, Object.values(params))
    return query.rows[0].result
}
export async function registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    return _callAPI("register_user", params)
}

export async function authenticateUser(params: AuthenticateUserParams): Promise<AuthenticateUserResponse> {
    return _callAPI("authenticate_user", params)
}

export async function verifyRefreshToken(params: RefreshTokenParams): Promise<VerifyRefreshTokenResponse> {
    return _callAPI("verify_refresh_token", params)
}

export async function createRefreshToken(params: CraeteRefreshTokenParams): Promise<CreateRefreshTokenResponse> {
    return _callAPI("create_refresh_token", params)
}

export async function revokeRefreshToken(params: RevokeRefreshTokenParams): Promise<StandardResponse> {
    return _callAPI("revoke_refresh_token", params)
}

export async function addFriend(params: AddFriendParams): Promise<StandardResponse> {
    return _callAPI("add_friend", params)
}

export async function getFriends(params: GetFriendsParams): Promise<GetFriendsResponse> {
    return _callAPI("get_friends", params)
}

export async function addFriendsToChatroom(params: AddFriendsToChatroomParams): Promise<AddFriendsToChatroomResponse> {
    return _callAPI("add_friends_to_chatroom", params)
}

export async function createChatroom(params: CreateChatroomParams): Promise<CreateChatroomResponse> {
    return _callAPI("create_chatroom", params)
}

export async function getConnectedChatrooms(params: GetConnectedChatroomsParams): Promise<GetConnectedChatroomsResponse> {
    return _callAPI("get_connected_chatrooms", params)
}

export async function createMessage(params: CreateMessageParams): Promise<StandardResponse> {
    return _callAPI("create_message", params)
}

export async function getConversation(params: GetConversationParams): Promise<GetConversationResponse> {

    return _callAPI("get_conversation", params)
}

