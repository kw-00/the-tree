import styles from "./_FriendshipCodesSection.module.css"

import { useState } from "react";





export default function FriendshipCodesSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {

    const [chatrooms,] = useState(() => {
        const fcs = []
        while (fcs.length < 10) {
            fcs.push(`#${Math.floor(Math.random() * 1000000)}`)
        }
        return fcs
    })

    return (
        <div className={`${styles["chatrooms-container"]} ${className ?? ""}`} {...rest}>
            <div className="surface-elevated flex flex-col gap-1">
                <span className="heading-3">Friendship codes</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()} className="flex">
                    <input className="input flex-1"></input>
                </form>
            </div>
            {/* Friendship Codes */}
            <div className="overflow-y-auto surface-sunken">
                {chatrooms.map((fc, n) => <div key={n} className="surface-elevated">{fc}</div>)}
            </div>
        </div>
    )
}
