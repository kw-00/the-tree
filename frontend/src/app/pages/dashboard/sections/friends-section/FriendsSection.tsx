import styles from "./_FriendsSection.module.css"

import Input from "@/app/components/input/Input";
import Panel from "@/app/components/panel/Panel";
import { useState } from "react";
import Heading from "@/app/components/typography/Heading";





export default function FriendsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const [friends,] = useState(() => {
        const fs = []
        while (fs.length < 50) {
            fs.push(["Frank", "Bob", "Martin", "Chris", "Matt", "Elliot"][Math.floor(Math.random() * 6)])
        }
        return fs
    })

    return (
        <Panel variant="3" className={`${styles["friends-container"]} ${className ?? ""}`} {...rest}>
            <Panel variant="4" className="flex flex-col gap-1">
                <Heading variant="3">Friends</Heading>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()}>
                    <Input className="flex-1"></Input>
                </form>
            </Panel>
            {/* Friends */}
            <Panel variant="3" className="overflow-y-auto">
                {friends.map((f, n) => <Panel key={n} variant="5">{f}</Panel>)}
            </Panel>
        </Panel>
    )

}