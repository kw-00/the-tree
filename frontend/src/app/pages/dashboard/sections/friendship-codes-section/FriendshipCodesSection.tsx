import styles from "./_FriendshipCodesSection.module.css"

import Input from "@/app/components/input/Input";
import Panel from "@/app/components/panel/Panel";
import { useState } from "react";
import Heading from "@/app/components/typography/Heading";





export default function FriendshipCodesSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {

    const [chatrooms,] = useState(() => {
        const cs = []
        while (cs.length < 10) {
            cs.push(`#${Math.floor(Math.random() * 1000000)}`)
        }
        return cs
    })

    return (
        <Panel variant="2" className={`${styles["chatrooms-container"]} ${className ?? ""}`} {...rest}>
            <Panel variant="4" className="flex flex-col gap-1">
                <Heading variant="3">Friendship codes</Heading>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()}>
                    <Input className="flex-1"></Input>
                </form>
            </Panel>
            {/* Chatrooms */}
            <Panel variant="3" className="overflow-y-auto">
                {chatrooms.map((c, n) => <Panel key={n} variant="5">{c}</Panel>)}
            </Panel>
        </Panel>
    )
}
