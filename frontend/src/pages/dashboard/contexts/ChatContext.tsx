import { createContext, useContext, useEffect, useRef, useState } from "react"
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

    const currentRecipientIdRef = useRef(currentRecipientId)
    useEffect(() => {currentRecipientIdRef.current = currentRecipientId}, [currentRecipientId])

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        const fetchUsersAndMessages = async (recipientId: number) => {
            const findConnectedUsersResult = await findConnectedUsers()

            if (findConnectedUsersResult.status === 200) {
                const fetchedUsers = findConnectedUsersResult.body.connectedUsers as any
                setConnectedUsers(fetchedUsers)
            }

            const getConversationResult = await getConversation(recipientId)
            if (getConversationResult.status === 200) {
                const fetchedConversation = getConversationResult.body.conversation as any
                setConversation(fetchedConversation)
            }
            console.log(getConversationResult)

            console.log(currentRecipientId)
            console.log(recipientId)
            console.log(currentRecipientIdRef.current)
            console.log()
            timeoutId = setTimeout(() => fetchUsersAndMessages(currentRecipientIdRef.current), 2000)
        }
        fetchUsersAndMessages(currentRecipientId)
        return () => clearTimeout(timeoutId)
    }, [])

    const value: ChatContextValue = {
        currentRecipientId, 
        setCurrentRecipientId, 
        connectedUsers, 
        conversation,
        getLogin: (id: number) => {
            const possibleLogins = connectedUsers.filter((el) => id === el.id)
            if (possibleLogins.length > 0) return possibleLogins.slice(-1)[0].login
            else return undefined
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

