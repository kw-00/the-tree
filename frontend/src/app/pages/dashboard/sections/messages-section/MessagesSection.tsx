import styles from "./_MessagesSection.module.css"
import TextInput from "@/app/components/text-input/TextInput"
import Guard from "@/app/layout/Guard"

import { useState } from "react"
import { useDashboardState } from "../../DashboardState"






export default function MessagesSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const [messages,] = useState(() => {
    const ms = []
        while (ms.length < 100) {
            ms.push(["Hi!", "How are you?", "Fine, thank you!", "Hmm.", "Not bad.", "Been a while."][Math.floor(Math.random() * 6)])
        }
        return ms
    })

    const [friends,] = useState(() => {
        const fs = []
        while (fs.length < 50) {
            fs.push(["Frank", "Bob", "Martin", "Chris", "Matt", "Elliot"][Math.floor(Math.random() * 6)])
        }
        return fs
    })

    const state = useDashboardState((state) => [state.layout.show.usersInChatroom])
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
                    <div className="v-stack grow basis-5/6">
                        <Guard>
                            <div className="v-stack overflow-y-auto surface-sunken grow">
                                {messages.map((m, n) => <div key={n} className="surface-elevated">{m}</div>)}
                            </div>
                        </Guard>
                    </div>

                    {show.usersInChatroom.get() &&
                    <div className="v-stack grow">
                        <div className="surface-elevated">
                            <h3 className="heading-3">Chatroom members</h3>
                        </div>
                        <Guard>
                            <div className="v-stack overflow-y-auto surface-sunken grow">
                                {friends.map((f, n) => <div key={n} className="surface-elevated">{f}</div>)}
                            </div>
                        </Guard>
                    </div>}
                </div>

                <div className="v-stack surface-sunken gap-1">
                    <TextInput className={`${styles["message-input"]} input grow`}></TextInput>
                    <button className={`button-primary ${styles["send-button"]}`}>Send</button>
                </div>
            </div>

        </div>

    )

}