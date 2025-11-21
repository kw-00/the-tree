import { createContext, useContext, useEffect, useRef, useState } from "react"
import { findConnectedUsers, getConversation } from "@/services/services"

interface ChatContextValue {
    currentRecipient: {id: number, login: string} | null
    setCurrentRecipient: React.Dispatch<React.SetStateAction<{id: number, login: string} | null>>

    connectedUsers: {id: number, login: string}[]
    conversation: {senderId: number, senderLogin: string, content: string}[] | null
}

const ChatContext = createContext<ChatContextValue | null>(null)


export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [currentRecipient, setCurrentRecipient] = useState<{id: number, login: string} | null>(null)
    const [connectedUsers, setConnectedUsers] = useState<{id: number, login: string}[]>([])
    const [conversation, setConversation] = useState<{senderId: number, senderLogin: string, content: string}[] | null>(null)

    const currentRecipientRef = useRef(currentRecipient)
    useEffect(() => {currentRecipientRef.current = currentRecipient}, [currentRecipient])

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        const fetchUsersAndMessages = async (recipient: {id: number, login: string} | null) => {
            if (recipient === null) {
                timeoutId = setTimeout(() => {}, 5000)
                return
            }


            const findConnectedUsersResult = await findConnectedUsers()

            if (findConnectedUsersResult.status === 200) {
                const fetchedUsers = findConnectedUsersResult.body.connectedUsers
                setConnectedUsers(fetchedUsers as any)
            }

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
            timeoutId = setTimeout(() => fetchUsersAndMessages(currentRecipientRef.current), 2000)
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

