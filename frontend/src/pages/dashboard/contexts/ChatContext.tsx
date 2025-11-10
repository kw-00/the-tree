import { createContext, useContext, useState } from "react"

interface ChatContextValue {
    currentRecipientId: number
    setCurrentRecipientId: React.Dispatch<React.SetStateAction<number>>
}

const ChatContext = createContext<ChatContextValue | null>(null)


export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [currentRecipientId, setCurrentRecipientId] = useState(-1)

    const value: ChatContextValue = { currentRecipientId, setCurrentRecipientId }

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

