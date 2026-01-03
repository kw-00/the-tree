import styles from "./_FriendshipCodesSection.module.css"

import { useState } from "react";





export default function FriendshipCodesSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {

    const [chatrooms,] = useState(() => {
        const cs = []
        while (cs.length < 10) {
            cs.push(`#${Math.floor(Math.random() * 1000000)}`)
        }
        return cs
    })

    return (
        <div className={`${styles["chatrooms-container"]} ${className ?? ""}`} {...rest}>
            <div className="surface-elevated flex flex-col gap-1">
                <span className="heading-3">Friendship codes</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()}>
                    <input className="input flex-1"></input>
                </form>
            </div>
            {/* Chatrooms */}
            <div className="overflow-y-auto surface-sunken">
                {chatrooms.map((c, n) => <div key={n} className="surface-elevated">{c}</div>)}
            </div>
        </div>
    )
}
