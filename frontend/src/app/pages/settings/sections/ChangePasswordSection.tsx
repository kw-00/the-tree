import Label from "@/app/components/label/Label";






export default function ChangePasswordSection() {
    return (
        <form className="v-stack surface-elevated gap-2">
            <h2 className="heading-2">Change password</h2>
            <fieldset className="v-stack gap-4">
                <Label className="v-stack gap-2">
                    Old password
                    <input type="password" className="input"/>
                </Label>
                <Label className="v-stack gap-2">
                    New password
                    <input type="password" className="input"/>
                </Label>
                <Label className="v-stack gap-2">
                    Confirm new password
                    <input type="password" className="input"/>
                </Label>
            </fieldset>
            <div className="h-stack justify-end">
                <button className="button-secondary" onClick={e => e.preventDefault()}>Change password</button>
            </div>
        </form>
    )
}