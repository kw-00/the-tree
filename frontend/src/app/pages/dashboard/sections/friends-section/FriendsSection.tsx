import styles from "./_FriendsSection.module.css"

import Input from "@/app/components/input/Input";
import Panel from "@/app/components/panel/Panel";
import Label from "@/app/components/label/Label";
import { useState } from "react";





export default function FriendsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const [friends,] = useState(() => {
        const fs = []
        while (fs.length < 100) {
            fs.push(["Frank", "Bob", "Martin", "Chris", "Matt", "Elliot"][Math.floor(Math.random() * 6)])
        }
        return fs
    })

    return (
        <Panel variant="2" className={`${styles["friends-container"]} ${className ?? ""}`} {...rest}>
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
    )

}