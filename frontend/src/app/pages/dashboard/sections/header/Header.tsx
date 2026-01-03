import styles from "./_Header.module.css"

import Button from "@/app/components/button/Button"
import Panel from "@/app/components/panel/Panel"
import { useTheme } from "@/app/theme/theme"
import { useDashboardState } from "../../DashboardState"





export default function Header() {
    const {theme, setTheme} = useTheme()
    const state = useDashboardState(() => [])

    const show = state.layout.show
    const showFriendshipCodes = show.friendshipCodesSection.get()
    const showFriends = show.friendsSection.get()
    const showChatrooms = show.chatroomsSection.get()
    const showUsersInChatroom = show.usersInChatroom.get()

    return (
        <Panel variant="3" className={styles["header"]}>
            <div className="flex justify-start">
                <Button variant="ghost" onClick={() => show.friendshipCodesSection.set(!showFriendshipCodes)} className="w-60">
                    {`${showFriendshipCodes ? "Hide" : "Show"} friendship codes`}
                </Button>
                <Button variant="ghost" onClick={() => show.friendsSection.set(!showFriends)} className="w-50">
                    {`${showFriends ? "Hide" : "Show"} friends`}
                </Button>
                <Button variant="ghost" onClick={() => show.chatroomsSection.set(!showChatrooms)} className="w-50">
                    {`${showChatrooms ? "Hide" : "Show"} chatrooms`}
                </Button>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => show.usersInChatroom.set(!showUsersInChatroom)} className="w-80">
                    {`${showUsersInChatroom ? "Hide" : "Show"} chat members`}
                </Button>

                <Button variant="secondary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-40">
                    {`${theme[0].toUpperCase()}${theme.substring(1)} mode`}
                </Button>
                <Button variant="danger" className="w-30">Log out</Button>
            </div>
        </Panel>
    )
}