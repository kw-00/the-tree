import styles from "./_MessagesSection.module.css"
import TextInput from "@/app/components/text-input/TextInput"
import Guard from "@/app/layout/Guard"

import { useState } from "react"






export default function MessagesSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const [messages,] = useState(() => {
    const ms = []
        while (ms.length < 100) {
            ms.push(["Hi!", "How are you?", "Fine, thank you!", "Hmm.", "Not bad.", "Been a while."][Math.floor(Math.random() * 6)])
        }
        return ms
    })

    return (
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            {/* Header */}
            <div className="surface-elevated">
                <span className="heading-2">Hog Rider Gang</span>
            </div>
            {/* Messages */}
            <Guard>
                <div className="v-stack overflow-y-auto surface-sunken flex-1">
                    {messages.map((m, n) => <div key={n} className="surface-elevated">{m}</div>)}
                </div>
            </Guard>

                <div className="v-stack surface-sunken">
                    <TextInput className={`${styles["message-input"]} input flex-1`}></TextInput>
                    <button className={`button-primary ${styles["send-button"]}`}>Send</button>
                </div>
        </div>
    )

}