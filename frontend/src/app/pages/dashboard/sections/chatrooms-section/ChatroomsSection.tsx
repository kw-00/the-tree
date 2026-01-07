
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
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            <div className="v-stack surface-elevated gap-xs">
                <span className="heading-3">Chatrooms</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()} className="flex">
                    <input className="input grow"></input>
                </form>
            </div>
            {/* Chatrooms */}
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {chatrooms.map((c, n) => <div key={n} className="surface-item">{c}</div>)}
            </div>
        </div>
    )
}
