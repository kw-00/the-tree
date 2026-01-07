
import { useTheme } from "@/app/theme/theme"
import { useDashboardState } from "../../DashboardState"
import { Link, useNavigate } from "react-router-dom"





export default function Header({className, ...rest}: Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
    const {theme, setTheme} = useTheme()
    const state = useDashboardState((state) => {
        const show = state.layout.show
        return [
            show.friendshipCodesSection,
            show.friendsSection,
            show.chatroomsSection
        ]
    })

    const show = state.layout.show
    const showFriendshipCodes = show.friendshipCodesSection.get()
    const showFriends = show.friendsSection.get()
    const showChatrooms = show.chatroomsSection.get()
    const showUsersInChatroom = show.usersInChatroom.get()

    const sidebarStates = [show.friendshipCodesSection, show.friendsSection, show.chatroomsSection]
    const allHidden = !showFriendshipCodes && !showFriends && !showChatrooms
    const sidebarsOnClick = (e: any) => {
        e.preventDefault()
        if (!allHidden) {
            sidebarStates.forEach(s => s.set(false))
        } else {
            sidebarStates.forEach(s => s.set(true))
        }
    }

    const navigate = useNavigate()

    return (
        <div className={`h-stack justify-between surface-base gap-2 ${className ?? ""}`} {...rest}>
            <div className="h-stack justify-start flex-wrap gap-2">
                <button onClick={sidebarsOnClick} className="button-secondary w-40">
                    {`${!allHidden ? "Hide" : "Show"} all sidebars`}
                </button>
                <button onClick={() => show.friendshipCodesSection.set(!showFriendshipCodes)} className="button-ghost w-50">
                    {`${showFriendshipCodes ? "Hide" : "Show"} friendship codes`}
                </button>
                <button onClick={() => show.friendsSection.set(!showFriends)} className="button-ghost w-35">
                    {`${showFriends ? "Hide" : "Show"} friends`}
                </button>
                <button onClick={() => show.chatroomsSection.set(!showChatrooms)} className="button-ghost w-40">
                    {`${showChatrooms ? "Hide" : "Show"} chatrooms`}
                </button>
            </div>

            <div className="h-stack justify-end flex-wrap gap-2">
                <button onClick={() => show.usersInChatroom.set(!showUsersInChatroom)} className="button-text w-45">
                    {`${showUsersInChatroom ? "Hide" : "Show"} chat members`}
                </button>

                <button disabled={true} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="button-secondary">
                    {`${theme[0].toUpperCase()}${theme.substring(1)} mode`}
                </button>
                <Link to="/settings" className="button-ghost">Settings</Link>
                <button onClick={e => {
                    e.preventDefault()
                    navigate("/login")
                }} className="button-danger">Log out</button>
            </div>
        </div>
    )
}