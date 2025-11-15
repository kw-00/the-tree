

interface ChatListElementProps {
    recipientId: number
    recipientLogin: string
    isSelected: boolean
    onClick: () => void
}
export default function ChatListElement(props: ChatListElementProps) {
    return (
        <div>
            login: {props.recipientLogin}
        </div>
    )
}