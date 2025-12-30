import Label from "./app/components/label/Label"
import { useEffect } from "react"
import { twMerge } from "tailwind-merge"
import Button from "./app/components/button/Button"
import Input from "./app/components/input/Input"
import Panel from "./app/components/panel/Panel"
import TextInput from "./app/components/text-input/TextInput"
import Heading from "./app/components/typography/Heading"
import Title from "./app/components/typography/Title"
import Txt from "./app/components/typography/Txt"
import { useTheme } from "./app/theme/theme"






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
                <Panel variant="3" className="flex flex-1 flex-col justify-evenly gap-5">
                    <div className="flex flex-row justify-evenly align-center gap-2">
                        <Button variant="primary" onClick={() => theme === "light" ?  setTheme("dark") : setTheme("light")}>Hello</Button>
                        <Button variant="secondary">Hello</Button>
                        <Button variant="ghost">Hello</Button>
                        <Button variant="warning">Hello</Button>
                        <Button variant="danger">Hello</Button>
                    </div>

                    <Panel variant="4" className="flex flex-1">
                        <Panel variant="5" className="flex-1">
                            <form>
                                <Label>Password</Label>
                                <Input type="password"></Input>
                                <Label>Level</Label>
                                <Input type="number"></Input>
                            </form>
                        </Panel>
                        <Panel variant="5" className="flex-1 max-h-50">
                            <TextInput className="min-h-1 max-h-full"></TextInput>
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