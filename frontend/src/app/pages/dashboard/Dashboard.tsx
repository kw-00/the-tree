import styles from "./_Dashboard.module.css"

import Button from "@/app/components/button/Button";
import Panel from "@/app/components/panel/Panel";
import Input from "@/app/components/input/Input";
import Label from "@/app/components/label/Label";
import TextInput from "@/app/components/text-input/TextInput";
import { useState } from "react";
import { useTheme } from "@/app/theme/theme";










export default function Dashboard() {
    const [friends,] = useState(() => {
        const fs = []
        while (fs.length < 100) {
            fs.push(["Frank", "Bob", "Martin", "Chris", "Matt", "Elliot"][Math.floor(Math.random() * 6)])
        }
        return fs
    })

    const [chatrooms,] = useState(() => {
        const cs = []
        while (cs.length < 100) {
            cs.push(["BBQ", "Reading club", "Project DataHoard", "Hog Rider Gang"][Math.floor(Math.random() * 4)])
        }
        return cs
    })

    const [messages,] = useState(() => {
        const ms = []
        while (ms.length < 100) {
            ms.push(["Hi!", "How are you?", "Fine, thank you!", "Hmm.", "Not bad.", "Been a while."][Math.floor(Math.random() * 6)])
        }
        return ms
    })

    const {theme, setTheme} = useTheme()

    return (
        <>
            <div className={styles["topmost-container"]}>
                {/* Header */}
                <Panel variant="3" className={styles["header"]}>
                    <Button variant="secondary">Log out</Button>
                    <Button variant="secondary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        {`${theme[0].toUpperCase()}${theme.substring(1)} mode`}
                        </Button>
                </Panel>
                {/* Content */}
                <Panel variant="1" className={styles["content"]}>
                    {/* Friends Section */}
                    <Panel variant="2" className={styles["friends-container"]}>
                        {/* Search Bar */}
                        <Panel variant="4">
                            <form onSubmit={e => e.preventDefault()}>
                                <Label className="flex flex-col justify-between gap-2">
                                    Search friends:
                                    <Input className="basis-2/3"></Input>
                                </Label>
                            </form>
                        </Panel>
                        {/* Friends */}
                        <Panel variant="3" className="overflow-y-auto">
                            {friends.map((f, n) => <Panel key={n} variant="5">{f}</Panel>)}
                        </Panel>
                    </Panel>

                    {/* Chatrooms Section */}
                    <Panel variant="2" className={styles["chatrooms-container"]}>
                        {/* Search Bar */}
                        <Panel variant="4">
                            <form onSubmit={e => e.preventDefault()}>
                                <Label className="flex flex-col justify-between gap-2">
                                    Search chatrooms:
                                    <Input className="basis-2/3"></Input>
                                </Label>
                            </form>
                        </Panel>
                        {/* Chatrooms */}
                        <Panel variant="3" className="overflow-y-auto">
                            {chatrooms.map((c, n) => <Panel key={n} variant="5">{c}</Panel>)}
                        </Panel>
                    </Panel>

                    {/* Nessages Section */}
                    <Panel variant="3" className={styles["messages-container"]}>
                        {/* Header */}
                        <Panel variant="4">
                            Hog Rider Gang
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

                </Panel>
            </div>
        </>
    )
}