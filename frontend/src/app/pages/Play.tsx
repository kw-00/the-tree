import Button from "@/app/components/button/Button";
import Panel from "@/app/components/panel/Panel";
import Input from "@/app/components/input/Input";
import Label from "@/app/components/label/Label";
import TextInput from "@/app/components/text-input/TextInput";
import { useState } from "react";










export default function Play() {
    const [friends,] = useState(() => {
        const fs = []
        while (fs.length < 100) {
            fs.push(["Frank", "Bob", "Martin", "Chris", "Matt", "Elliot"][Math.floor(Math.random() * 6)])
        }
        return fs
    })

    const [chatrooms,] = useState(() => {
        const cs = []
        while (cs.length < 100) {
            cs.push(["BBQ", "Reading club", "Project DataHoard", "Hog Rider Gang"][Math.floor(Math.random() * 4)])
        }
        return cs
    })

    const [messages,] = useState(() => {
        const ms = []
        while (ms.length < 100) {
            ms.push(["Hi!", "How are you?", "Fine, thank you!", "Hmm.", "Not bad.", "Been a while."][Math.floor(Math.random() * 6)])
        }
        return ms
    })



    return (
        <>
        <div className="h-svh w-svw flex">
            <div className="flex flex-1">
                <Panel variant="1" className="flex flex-1 flex-col">
                    <Panel variant="2">
                        Hello
                    </Panel>

                    <Panel variant="2" className="flex flex-1 min-h-0">
                        <div className="flex flex-1">
                            <div className="flex flex-1">
                                <Panel variant="3" className="flex flex-1">
                                    <Panel variant="4" className="overflow-y-auto flex-1 flex flex-col">
                                        {friends.map(f => <Panel variant="4">{f}</Panel>)}
                                    </Panel>
                                </Panel>
                            </div>
                        </div>
                    </Panel>   

                    <Panel variant="2">
                        Hello
                    </Panel>   
            

                </Panel>
            </div>
        </div>
        </>
    )
}