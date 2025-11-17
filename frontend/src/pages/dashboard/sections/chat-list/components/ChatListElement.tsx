

interface ChatListElementProps {
    recipientId: number
    recipientLogin: string
    isSelected: boolean
    onClick: () => void
}
export default function ChatListElement(props: ChatListElementProps) {
    return (
        <div onClick={props.onClick}>
            login: {props.recipientLogin}
        </div>
    )
}