

import Guard from "@/app/layout/Guard";
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
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            <div className="v-stack surface-elevated gap-1">
                <span className="heading-3">Friends</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()} className="flex">
                    <input className="input grow"></input>
                </form>
            </div>
            {/* Friends */}
            <Guard>
                <div className="v-stack overflow-y-auto surface-sunken">
                    {friends.map((f, n) => <div key={n} className="surface-item">{f}</div>)}
                </div>
            </Guard>
        </div>
    )

}