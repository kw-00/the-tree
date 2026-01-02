import styles from "./_Header.module.css"

import Button from "@/app/components/button/Button"
import Panel from "@/app/components/panel/Panel"
import { useTheme } from "@/app/theme/theme"





export default function Header() {
    const {theme, setTheme} = useTheme()

    return (
        <Panel variant="3" className={styles["header"]}>
            <Button variant="secondary">Log out</Button>
            <Button variant="secondary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {`${theme[0].toUpperCase()}${theme.substring(1)} mode`}
                </Button>
        </Panel>
    )
}