import type { User } from "@/pages/dashboard/contexts/ChatContext"


interface ChatListElementProps {
    recipient: User
    isSelected: boolean
    onClick: () => void
}
export default function ChatListElement(props: ChatListElementProps) {
    return (
        <div onClick={props.onClick}>
            login: {props.recipient.login}
        </div>
    )
}