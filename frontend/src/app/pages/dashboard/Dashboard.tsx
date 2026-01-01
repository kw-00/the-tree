import Button from "@/app/components/button/Button";
import Panel from "@/app/components/panel/Panel";
import PanelWithHeader from "@/app/components/panel/PanelWithHeader";









export default function Dashboard() {
    const l = []
    while (l.length < 100) {
        l.push("What is up")
    }
    return (
        <>
            <Panel variant="1" className="h-svh flex">
                <Panel variant="5" className="w-40"></Panel>
                <PanelWithHeader className="flex-1">
                    <PanelWithHeader.Header>
                        <Panel variant="2">
                            <Button variant="secondary">Log out</Button>
                        </Panel>
                    </PanelWithHeader.Header>
                    <PanelWithHeader.Content>
                        Hellofsdfsdfs
                    </PanelWithHeader.Content>
                    <PanelWithHeader.Footer>
                        <Panel variant="2">
                            <Button variant="primary">Log out</Button>
                        </Panel>
                    </PanelWithHeader.Footer>
                </PanelWithHeader>
            </Panel>
        </>
    )
}