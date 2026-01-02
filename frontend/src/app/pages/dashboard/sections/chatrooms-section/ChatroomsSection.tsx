import styles from "./_ChatroomsSection.module.css"

import Input from "@/app/components/input/Input";
import Panel from "@/app/components/panel/Panel";
import Label from "@/app/components/label/Label";
import { useState } from "react";





export default function ChatroomsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {

    const [chatrooms,] = useState(() => {
        const cs = []
        while (cs.length < 30) {
            cs.push(["BBQ", "Reading club", "Project DataHoard", "Hog Rider Gang"][Math.floor(Math.random() * 4)])
        }
        return cs
    })

    return (
        <Panel variant="2" className={`${styles["chatrooms-container"]} ${className ?? ""}`} {...rest}>
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
    )
}
