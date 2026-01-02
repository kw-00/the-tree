import Button from "@/app/components/button/Button"
import Panel from "@/app/components/panel/Panel"
import TextInput from "@/app/components/text-input/TextInput"
import Heading from "@/app/components/typography/Heading"
import styles from "./_MessagesSection.module.css"

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
        <Panel variant="3" className={`${styles["messages-container"]} ${className ?? ""}`} {...rest}>
            {/* Header */}
            <Panel variant="4">
                <Heading variant="2">Hog Rider Gang</Heading>
            </Panel>
            {/* Messages */}
            <Panel variant="3" className="overflow-y-auto">
                {messages.map((m, n) => <Panel key={n} variant="5">{m}</Panel>)}
            </Panel>
            <div>
                <TextInput className={styles["message-input"]}></TextInput>
                <Button variant="primary" className={styles["send-button"]}>Send</Button>
            </div>
        </Panel>
    )

}