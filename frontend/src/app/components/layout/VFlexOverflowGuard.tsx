import type { ReactNode } from "react"
import styles from "./_FlexOverflowGuard.module.css"







export default function FlexOverflowGuard({children}: {children: ReactNode}) {
    return (
        <div className={styles["outer-layer"]}>
            <div className={styles["inner-layer"]}>
                {children}
            </div>
        </div>
    )
}