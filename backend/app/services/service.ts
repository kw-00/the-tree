

export default interface Service {
    registerUser(login: string, password: string): Promise<void>
    authenticateUser(login: string, password: string): Promise<{accessToken: string, refreshToken: string}>
    refreshToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string } | null>
    createMessage(accessToken: string, recipientId: number, content: string): Promise<void>
    findConnectedUsers(accessToken: string): Promise<{ id: number, login: string }[]>
    getConversation(accessToken: string, otherUserId: number): Promise<{ senderId: number, content: string }[]>
}