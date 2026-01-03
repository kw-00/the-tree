import styles from "./_FriendsSection.module.css"

import { useState } from "react";


export default function FriendsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const [friends,] = useState(() => {
        const fs = []
        while (fs.length < 50) {
            fs.push(["Frank", "Bob", "Martin", "Chris", "Matt", "Elliot"][Math.floor(Math.random() * 6)])
        }
        return fs
    })

    return (
        <div className={`${styles["friends-container"]} ${className ?? ""}`} {...rest}>
            <div className="surface-elevated flex flex-col gap-1">
                <span className="heading-3">Friends</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()}>
                    <input className="input"></input>
                </form>
            </div>
            {/* Friends */}
            <div className="overflow-y-auto surface-sunken">
                {friends.map((f, n) => <div key={n} className="surface-elevated">{f}</div>)}
            </div>
        </div>
    )

}