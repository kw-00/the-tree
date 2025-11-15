import { createContext, useContext, useEffect, useState } from "react"
import { findConnectedUsers } from "@/services/services"

interface ChatContextValue {
    currentRecipientId: number
    setCurrentRecipientId: React.Dispatch<React.SetStateAction<number>>
    connectedUsers: {id: number, login: string}[]
}

const ChatContext = createContext<ChatContextValue | null>(null)


export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [currentRecipientId, setCurrentRecipientId] = useState(-1)
    const [connectedUsers, setConnectedUsers] = useState([])

    useEffect(() => {
        var timeoutId: ReturnType<typeof setTimeout>

        const fetchConnectedUsers = async () => {
            const apiCallResult = await findConnectedUsers()
            const {status} = apiCallResult

            if (status === 200) {
                const fetchedUsers = apiCallResult.body.connectedUsers
                if (fetchedUsers !== undefined) {
                    setConnectedUsers(fetchedUsers as any)
                }
            }
            timeoutId = setTimeout(fetchConnectedUsers, 2000)
        }
        fetchConnectedUsers()
        return () => clearTimeout(timeoutId)
    })

    const value: ChatContextValue = {currentRecipientId, setCurrentRecipientId, connectedUsers}

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

