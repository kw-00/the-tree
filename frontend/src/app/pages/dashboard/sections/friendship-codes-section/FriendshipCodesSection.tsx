
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
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            <div className="surface-elevated flex flex-col gap-xs">
                <span className="heading-3">Friendship codes</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()} className="flex">
                    <input className="input grow"></input>
                </form>
            </div>
            {/* Friendship Codes */}
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {chatrooms.map((fc, n) => <div key={n} className="surface-item">{fc}</div>)}
            </div>
        </div>
    )
}
