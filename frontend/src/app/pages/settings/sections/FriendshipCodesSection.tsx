import { useFriendshipCodesQuery, useInvalidateFriendshipCodesQuery } from "@/api/domains/friends/friends-queries";
import { createFriendshipCode, revokeFriendshipCode, type FriendshipCodeData } from "@/api/domains/friends/friends-service";
import Label from "@/app/components/label/Label";
import { useState } from "react";


function FriendshipCodeItem({id, code, expiresAt}: FriendshipCodeData) {
    const invalidate = useInvalidateFriendshipCodesQuery()

    const handleRemoveClick = async () => {
        const requestResult = await revokeFriendshipCode({friendshipCodeId: id})
        if (requestResult.status === "SUCCESS") {
            await invalidate()
        }
    }

    return (
        <div className="h-stack surface-elevated justify-evenly">
            <div className="h-stack items-center grow">
                {code}
            </div>
            <div className="h-stack items-center grow">
                {expiresAt !== null ? expiresAt : "No expiry date"}
            </div>
            <button className="button-danger" onClick={handleRemoveClick}>
                Delete
            </button>
        </div>
    )
}


export default function FriendshipCodesSection() {
    const [code, setCode] = useState("")
    const [expiresAt, setExpiresAt] = useState("")

    const {isSuccess, data, } = useFriendshipCodesQuery()
    const invalidate = useInvalidateFriendshipCodesQuery()

    const handleCreateFriendshipCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const requestResult = await createFriendshipCode({code, expiresAt: expiresAt.length > 0 ? new Date(expiresAt).toISOString() : null})
        if (requestResult.status === "SUCCESS") {
            await invalidate()
        }
    }

    return (
        <div className="v-stack surface-elevated gap-lg">
            <form className="v-stack gap-sm" onSubmit={handleCreateFriendshipCodeSubmit}>
                <h2 className="heading-2">Add friendship code</h2>
                <fieldset className="v-stack gap-lg">
                    <Label className="v-stack gap-sm">
                        Code
                        <input className="input" value={code} onChange={e => setCode(e.target.value)}/>
                    </Label>
                    <Label className="v-stack gap-sm">
                        Expiry date
                        <input type="date" className="input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}/>
                    </Label>
                </fieldset>
                <div className="h-stack justify-end">
                    <button type="submit" className="button-secondary">Create friendship code</button>
                </div>
            </form>
            {
                isSuccess && data.friendshipCodesData.length > 0
                ?
                <div className="v-stack gap-sm contrast-75">
                    {data.friendshipCodesData.sort((fc1, fc2) => fc1.code.localeCompare(fc2.code)).map((fc, n) => <FriendshipCodeItem key={n} {...fc}/>)}
                </div>
                :
                <></>
            }

        </div>
    )
}