import styles from "./_Settings.module.css"

import Panel from "@/app/components/panel/Panel"
import LinkButton from "@/app/components/button/LinkButton"





export default function Settings() {



    return (
        <div className={styles["topmost-container"]}>
            {/* Header */}
            <div className={styles.header}>
                <LinkButton variant="warning" to="/dashboard">back</LinkButton>
            </Panel>
            {/* Content */}
            <div className={styles.content}>
                <div></div>
            </Panel>

        </div>
    )
}