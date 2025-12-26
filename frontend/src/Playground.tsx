import { useEffect } from "react";
import Button from "./app/components/Button";
import Panel from "./app/components/Panel";
import { useTheme } from "./app/theme/theme";






export default function Playground() {
    const {setTheme} = useTheme()
    useEffect(() => {
        setTheme("light")
    }, [])
    return (
        <Panel variant="1" className="flex flex-row justify-between size-full">
            <Panel variant="2" className="flex-1 flex">
                <Panel variant="3" className="flex-1">
                    Hello
                    Hello
                    <br/>
                    Hmm
                    <br/>
                    Hello
                    Hello
                    <br/>
                    Hmm
                <br/>
                    Hello
                    Hello
                    <br/>
                    Hmm
                <br/>
                    Hello
                    Hello
                    <br/>
                    Hmm
                <br/>
                    Hello
                    Hello
                    <br/>
                    Hmm
                </Panel>
                <Panel variant="3" className="flex-1"><Button variant="outline">Hello</Button></Panel>
            </Panel>
            <Panel variant="2" className="flex-1"></Panel>
        </Panel>
    )
}