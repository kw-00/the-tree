import { createContext, useContext, useEffect, useRef, useState } from "react"
import { findConnectedUsers, getConversation } from "@/services/services"

interface ChatContextValue {
    currentRecipient: User | null
    setCurrentRecipient: React.Dispatch<React.SetStateAction<User | null>>

    connectedUsers: User[]
    conversation: ConversationElement[] | null
}

export type User = {
    id: number,
    login: string
}

export type ConversationElement = {
    senderId: number,
    senderLogin: string,
    content: string
}

const ChatContext = createContext<ChatContextValue | null>(null)


export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [currentRecipient, setCurrentRecipient] = useState<User | null>(null)
    const [connectedUsers, setConnectedUsers] = useState<User[]>([])
    const [conversation, setConversation] = useState<ConversationElement[] | null>(null)

    const currentRecipientRef = useRef(currentRecipient)
    useEffect(() => {currentRecipientRef.current = currentRecipient}, [currentRecipient])

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        const fetchUsersAndMessages = async (recipient: User | null) => {
            const findConnectedUsersResult = await findConnectedUsers()

            if (findConnectedUsersResult.status === 200) {
                const fetchedUsers = findConnectedUsersResult.body.connectedUsers
                setConnectedUsers(fetchedUsers as any)
            }

            if (recipient !== null) {
                const getConversationResult = await getConversation(recipient.id)
                if (getConversationResult.status === 200) {
                    const fetchedConversation = getConversationResult.body.conversation
                    setConversation(fetchedConversation)
                }
                console.log(getConversationResult)

                console.log(currentRecipient)
                console.log(recipient)
                console.log(currentRecipientRef.current)
                console.log()
            }
            timeoutId = setTimeout(() => fetchUsersAndMessages(currentRecipientRef.current), 10000)
        }

        fetchUsersAndMessages(currentRecipient)
        return () => clearTimeout(timeoutId)
    }, [])

    const value: ChatContextValue = {
        currentRecipient, 
        setCurrentRecipient, 
        connectedUsers, 
        conversation
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

