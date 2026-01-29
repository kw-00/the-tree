import { useState } from "react"
import InfiniteVirtualization from "@/app/components/big-lists/InfiniteVirtualization"








export default function Messages() {
    const [messages,] = useState(() => {
        const ms = []
        while (ms.length < 1000) {
            ms.push(["Hi!", "How are you?", "Fine, thank you!", "Hmm.", "Not bad.", "Been a while."][Math.floor(Math.random() * 6)])
        }
        return ms
    })

    return (
        <div className="v-stack grow basis-5/6">
            <InfiniteVirtualization className="v-stack overflow-y-auto surface-sunken grow contain-size"
            itemValues={messages}
            itemFactory={(item, key) => <div key={key} className="surface-item">{item}</div>}
            loadedCount={50}
            initialCursor={0}>
            </InfiniteVirtualization>
        </div>
    )
}