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
            <HeaderFooterLayout className="h-svh w-svw">
                <HeaderFooterLayout.Header>
                    <Panel variant="2">
                        <Button variant="secondary">Log out</Button>
                    </Panel>
                </HeaderFooterLayout.Header>
                <HeaderFooterLayout.Content>
                    <Panel variant="1">
                        
                    </Panel>
                </HeaderFooterLayout.Content>
            </HeaderFooterLayout>
        </>
    )
}