import { MutationAware } from "@/utils/MutationAware"
import { useEffect, useReducer } from "react"


type DashboardState = Readonly<{
    layout: Readonly<{
        show: Readonly<{
            friendshipCodesSection: MutationAware<boolean>
            friendsSection: MutationAware<boolean>
            chatroomsSection: MutationAware<boolean>
            usersInChatroom: MutationAware<boolean>
        }>
    }>
}>

class DashboardStateStore {
    readonly state: DashboardState = {
        layout: {
            show: {
                friendshipCodesSection: new MutationAware(false),
                friendsSection: new MutationAware(false),
                chatroomsSection: new MutationAware(false),
                usersInChatroom: new MutationAware(false)
            }
        }
    }
}

const globalState = new DashboardStateStore()

export function useDashboardState(selector: (state: DashboardState) => MutationAware<any>[]) {
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    const state = globalState.state
    const unsubFns: (() => void)[] = []
    useEffect(() => {
        selector(state).forEach(el => {
            unsubFns.push(el.subscribe(() => forceUpdate()))
        })
        return () => unsubFns.forEach(unsub => unsub())
    }, [])
    return globalState.state
}