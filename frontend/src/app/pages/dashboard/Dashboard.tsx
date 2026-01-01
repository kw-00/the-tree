import Button from "@/app/components/button/Button";
import Panel from "@/app/components/panel/Panel";
import HeaderFooterLayout from "@/app/components/layout/HeaderFooterLayout";










export default function Dashboard() {
    const l = []
    while (l.length < 100) {
        l.push("What is up")
    }
    return (
        <>
            <HeaderFooterLayout className="h-svh w-svw" headerGap={0.25}>
                <HeaderFooterLayout.Header>
                    <Panel variant="3">
                        <Button variant="secondary">Log out</Button>
                    </Panel>
                </HeaderFooterLayout.Header>
                <HeaderFooterLayout.Content className="flex">
                    <Panel variant="1" className="flex flex-1">
                        <Panel variant="2" className="flex-1 overflow-y-auto">
                            {l.map(m => <Panel variant="5">{m}</Panel>)}
                        </Panel>
                        <Panel variant="2" className="flex-1 overflow-y-auto">
                            {l.map(m => <Panel variant="5">{m}</Panel>)}
                        </Panel>

                    </Panel>
                </HeaderFooterLayout.Content>
            </HeaderFooterLayout>
        </>
    )
}