import styles from "./_Header.module.css"

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
        <div className={styles["header"]}>
            <div className="flex justify-start">
                <button onClick={() => show.friendshipCodesSection.set(!showFriendshipCodes)} className="button-ghost w-60">
                    {`${showFriendshipCodes ? "Hide" : "Show"} friendship codes`}
                </button>
                <button onClick={() => show.friendsSection.set(!showFriends)} className="button-ghost w-50">
                    {`${showFriends ? "Hide" : "Show"} friends`}
                </button>
                <button onClick={() => show.chatroomsSection.set(!showChatrooms)} className="button-ghost w-50">
                    {`${showChatrooms ? "Hide" : "Show"} chatrooms`}
                </button>
            </div>

            <div className="flex justify-end gap-2">
                <button onClick={() => show.usersInChatroom.set(!showUsersInChatroom)} className="button-ghost w-80">
                    {`${showUsersInChatroom ? "Hide" : "Show"} chat members`}
                </button>

                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="button-secondary w-40">
                    {`${theme[0].toUpperCase()}${theme.substring(1)} mode`}
                </button>
                <button className="button-danger w-30">Log out</button>
            </div>
        </div>
    )
}