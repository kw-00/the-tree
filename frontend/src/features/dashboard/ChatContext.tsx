import { createContext, useContext, useState } from "react";


type ChatContextValue = {
    selectedChatroomId: number | null
    setSelectedChatroomId: React.Dispatch<React.SetStateAction<number | null>>
}

const ChatContext = createContext<ChatContextValue | null>(null)

type ChatProviderProps = {
    children: React.ReactNode
}

export function ChatProvider({children}: ChatProviderProps) {
    // Shared state for currently selected chatroom
    const [selectedChatroomId, setSelectedChatroomId] = useState<number | null>(null)

    return <ChatContext.Provider value={{selectedChatroomId, setSelectedChatroomId}}>{children}</ChatContext.Provider>
}

export function useChatContext() {
    const value = useContext(ChatContext)
    if (value === null) {
        throw new Error("Function \"useChatContext\" should be used within a ChatProvider.")
    }
    return value
}