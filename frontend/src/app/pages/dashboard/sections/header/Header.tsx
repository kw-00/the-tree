import styles from "./_Header.module.css"

import Button from "@/app/components/button/Button"
import Panel from "@/app/components/panel/Panel"
import { useTheme } from "@/app/theme/theme"
import { useDashboardState } from "../../DashboardState"





export default function Header() {
    const {theme, setTheme} = useTheme()
    const state = useDashboardState(() => [])

    const show = state.layout.show

    return (
        <Panel variant="3" className={styles["header"]}>
            <Button variant="warning">Log out</Button>
            <Button variant="secondary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {`${theme[0].toUpperCase()}${theme.substring(1)} mode`}
            </Button>
            <Button variant="ghost" onClick={() => show.friendshipCodesSection.set(!show.friendshipCodesSection.get())}>
                Show/hide friendship codes
            </Button>
        </Panel>
    )
}