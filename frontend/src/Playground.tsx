import { useEffect } from "react";
import Button from "./app/components/Button";
import Panel from "./app/components/Panel";
import { useTheme } from "./app/theme/theme";
import Input from "./app/components/Input";
import TextInput from "./app/components/TextInput";
import Label from "./app/components/Label";
import Title from "./app/components/text/Title";
import Heading from "./app/components/text/Heading";
import { twMerge } from "tailwind-merge";
import Txt from "./app/components/text/Txt";






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
                                <Label>Password</Label>
                                <Input type="password"></Input>
                                <Label>Level</Label>
                                <Input type="number"></Input>
                            </form>
                        </Panel>
                        <Panel variant="5" className="flex-1 max-h-20">
                            <TextInput maxHeight={20}></TextInput>
                        </Panel>
                    </Panel>
                </Panel>
            </Panel>
            <Panel variant="2" className="flex-1">
                <Title>The Modern Pirate</Title>
                <Heading variant="1">Chapter I</Heading>
                <Heading variant="2">The departure from Moss Dales</Heading>
                <p className={twMerge("font-thin", "font-bold", "font-thin", "italic")}>Hello</p>
                It was a quiet evening when the wind struck the surface.
                <Txt i>And it was</Txt> a <Txt b>very</Txt> <Txt b h>big problem.</Txt>
            </Panel>
        </Panel>
    )
}