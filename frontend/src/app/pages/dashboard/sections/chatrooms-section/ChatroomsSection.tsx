
import { useChatroomQuery, useInvalidateChatroomsQuery } from "@/api/domains/chatrooms/chatrooms-queries";
import { leaveChatroom, type ChatroomData } from "@/api/domains/chatrooms/chatrooms-service";



function ChatroomsListItem({id, name}: ChatroomData) {
    const invalidate = useInvalidateChatroomsQuery()

    const handleRemoveClicked = async () => {
        const requestResult = await leaveChatroom({chatroomId: id})
        if (requestResult.status === "SUCCESS") {
            await invalidate()
        }
    }

    return (
        <div className="h-stack items-center surface-item">
            <div className="grow">
                {name}
            </div>
            <button className="button-danger" onClick={handleRemoveClicked}>
                Leave
            </button>
        </div>
    )
}

export default function ChatroomsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const {isSuccess, data} = useChatroomQuery()


    return (
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            <div className="v-stack surface-elevated gap-xs">
                <span className="heading-3">Chatrooms</span>
            </div>
            {/* Chatrooms */}
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {
                    isSuccess
                        ?
                        data.chatroomsData
                            .sort((c1, c2) => c1.name.localeCompare(c2.name))
                            .map((c, n) => <ChatroomsListItem key={n} {...c}/>)
                        :
                        "No success"
                }
            </div>
        </div>
    )
}
