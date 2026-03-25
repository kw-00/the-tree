import { useFriendshipCodesQuery } from "@/api/domains/friends/friends-queries";
import { createFriendshipCode } from "@/api/domains/friends/friends-service";
import Label from "@/app/components/label/Label";
import { useState } from "react";






export default function FriendshipCodesSection() {
    const [code, setCode] = useState("")
    const [expiryDate, setExpiryDate] = useState("")

    const {isSuccess, data} = useFriendshipCodesQuery()

    const handleCreateFriendshipCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await createFriendshipCode({code, expiresAt: expiryDate.length > 0 ? new Date(expiryDate) : null})
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
                        <input type="date" className="input" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}/>
                    </Label>
                </fieldset>
                <div className="h-stack justify-end">
                    <button type="submit" className="button-secondary">Create friendship code</button>
                </div>
            </form>
            {
                isSuccess && data.friendshipCodesData.length > 0
                ?
                <div className="v-stack surface-sunken gap-sm">
                    {data.friendshipCodesData.map((fc, n) => <div className="surface-elevated">{`${fc.code}, ${fc.expiresAt}`}</div>)}
                </div>
                :
                <></>
            }

        </div>
    )
}