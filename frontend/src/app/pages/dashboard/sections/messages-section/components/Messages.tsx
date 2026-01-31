import { useState } from "react"








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
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {messages.map((item, key) => <div key={key} className="surface-item">{item}</div>)}
            </div>
        </div>
    )
}