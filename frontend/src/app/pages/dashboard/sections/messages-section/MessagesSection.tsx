import styles from "./_MessagesSection.module.css"
import TextInput from "@/app/components/text-input/TextInput"

import { useState } from "react"
import { useUIOptionsState } from "../../../../../state/ui/UIOptionsState"
import Messages from "./components/Messages"
import UsersInChatroom from "./components/UsersInChatroom"

import {sendMessage} from "@/api/domains/messages/chat-socket/chat-socket"






export default function MessagesSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const [message, setMessage] = useState("")

    const state = useUIOptionsState((state) => [state.layout.show.usersInChatroom])
    const show = state.layout.show

    return (
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            {/* Header */}
            <div className="surface-elevated">
                <h2 className="heading-2">Hog Rider Gang</h2>
            </div>
            <div className="v-stack grow">
                <div className="h-stack grow">
                    {/* Messages */}
                    <Messages/>

                    {show.usersInChatroom.get() && <UsersInChatroom/>}
                </div>

                <div className="v-stack surface-sunken gap-1">
                    <TextInput className={`${styles["message-input"]} input grow`} value={message} onChange={s => {
                        setMessage(s)
                    }}/>
                    <button 
                        className={`button-primary ${styles["send-button"]}`}
                        onClick={() => sendMessage(message, 1)}
                    >
                        Send
                    </button>
                </div>
            </div>

        </div>

    )

}