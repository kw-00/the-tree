import Label from "@/app/components/label/Label";






export default function ChangePasswordSection() {
    return (
        <form className="v-stack surface-elevated gap-sm">
            <h2 className="heading-2">Change password</h2>
            <fieldset className="v-stack gap-lg">
                <Label className="v-stack gap-sm">
                    Old password
                    <input type="password" className="input"/>
                </Label>
                <Label className="v-stack gap-sm">
                    New password
                    <input type="password" className="input"/>
                </Label>
                <Label className="v-stack gap-sm">
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