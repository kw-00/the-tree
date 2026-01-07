import Label from "@/app/components/label/Label";






export default function ChangeLoginSection() {
    return (
        <form className="v-stack surface-elevated gap-sm">
            <h2 className="heading-2">Change login</h2>
            <fieldset className="v-stack gap-lg">
                <Label className="v-stack gap-sm">
                    New login
                    <input className="input"/>
                </Label>
                <Label className="v-stack gap-sm">
                    Password
                    <input type="password" className="input"/>
                </Label>
            </fieldset>
            <div className="h-stack justify-end">
                <button className="button-secondary" onClick={e => e.preventDefault()}>Change login</button>
            </div>
        </form>
    )
}