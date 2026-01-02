import { useRef } from "react"


type DashboardState = {
    layout: {
        show: {
            friendshipCodesSection: boolean
            friendsSection: boolean
            chatroomsSection: boolean
            usersInChatroom: boolean
        }
    }
}

class DashboardStateStore {
    state: DashboardState = {
        layout: {
            show: {
                friendshipCodesSection: false,
                friendsSection: false,
                chatroomsSection: false,
                usersInChatroom: false
            }
        }
    }
}

export function useDashboardState() {
    const storeRef = useRef(new DashboardStateStore)
    return storeRef.current
}