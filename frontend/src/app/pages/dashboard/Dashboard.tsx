import Button from "@/app/components/button/Button";
import Panel from "@/app/components/panel/Panel";









export default function Dashboard() {
    const l = []
    while (l.length < 100) {
        l.push("What is up")
    }
    const headerHeight = 12
    return (
        <>
            {/* header */}
            <Panel variant="2" className={`h-${headerHeight} w-full flex justify-end fixed top-0`}>
                <Button variant="secondary">Log out</Button>
            </Panel>
            {/* Contents */}
            <div className={`pt-${headerHeight} h-svh w-full flex flex-row`}>
                <Panel variant="1" className="flex flex-1 flex-row">
                    <Panel variant="2" className="overflow-y-auto">
                        {l.map((el) => <Panel variant="5">{el}</Panel>)}
                    </Panel>
                    <Panel variant="3" className="overflow-y-auto">
                        {l.map((el) => <Panel variant="4">{el}</Panel>)}
                    </Panel>
                </Panel>
            </div>
        </>
    )
}