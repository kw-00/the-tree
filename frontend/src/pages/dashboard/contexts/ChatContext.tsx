import { createContext, useContext, useEffect, useState } from "react"
import { findConnectedUsers, getConversation } from "@/services/services"

interface ChatContextValue {
    currentRecipientId: number
    setCurrentRecipientId: React.Dispatch<React.SetStateAction<number>>
    connectedUsers: {id: number, login: string}[]
    conversation: {senderId: number, content: string}[]
    getLogin: (id: number) => string | undefined
}

const ChatContext = createContext<ChatContextValue | null>(null)


export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [currentRecipientId, setCurrentRecipientId] = useState(-1)
    const [connectedUsers, setConnectedUsers] = useState<{id: number, login: string}[]>([])
    const [conversation, setConversation] = useState<{senderId: number, content: string}[]>([])

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        const fetchUsersAndMessages = async () => {
            const findConnectedUsersResult = await findConnectedUsers()

            if (findConnectedUsersResult.status === 200) {
                const fetchedUsers = findConnectedUsersResult.body.connectedUsers as any
                setConnectedUsers(fetchedUsers)
            }

            const getConversationResult = await getConversation(currentRecipientId)
            if (getConversationResult.status === 200) {
                const fetchedConversation = getConversationResult.body.conversation as any
                setConversation(fetchedConversation)
            }


            timeoutId = setTimeout(fetchUsersAndMessages, 2000)
        }
        fetchUsersAndMessages()
        return () => clearTimeout(timeoutId)
    }, [])

    const value: ChatContextValue = {
        currentRecipientId, 
        setCurrentRecipientId, 
        connectedUsers, 
        conversation,
        getLogin: (id: number) => {
            if (id === -1) return undefined
            return connectedUsers.filter((el) => id === el.id).slice(-1)[0].login
        }
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChatContext() {

    const context = useContext(ChatContext)

    if (!context) {
        throw new Error("Function useChatContext() must be used within a ChatProvider.")
    }
    return context
}

