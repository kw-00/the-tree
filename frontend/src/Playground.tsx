import { useEffect } from "react";
import Button from "./app/components/Button";
import Panel from "./app/components/Panel";
import { useTheme } from "./app/theme/theme";
import Input from "./app/components/Input";
import TextInput from "./app/components/TextInput";






export default function Playground() {
    const {theme, setTheme} = useTheme()
    useEffect(() => {
        setTheme("dark")
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
                <Panel variant="3" className="flex-1">
                    <Button variant="primary" onClick={() => theme === "light" ?  setTheme("dark") : setTheme("light")}>Hello</Button>
                    <Button variant="secondary">Hello</Button>
                    <Button variant="ghost">Hello</Button>
                    <Button variant="warning">Hello</Button>
                    <Button variant="danger">Hello</Button>
                    <Panel variant="4" className="flex flex-1">
                        Hello
                        <Panel variant="5" className="flex-1">
                            <form>
                                <label>Password</label>
                                <Input type="password"></Input>
                            </form>
                        </Panel>
                        <Panel variant="5" className="flex-1 h-100">
                            <TextInput maxHeight={30}></TextInput>
                        </Panel>
                    </Panel>
                </Panel>
            </Panel>
            <Panel variant="2" className="flex-1"></Panel>
        </Panel>
    )
}