import { useId, useState } from "react"
import type { FormEvent } from "react"

type CredentialFormHandler = (login: string, password: string) => void

interface CredentialFormProps {
    callback: CredentialFormHandler
    submitButtonText: string

    className?: string
}

export default function CredentialForm({callback, submitButtonText, className}: CredentialFormProps) {

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const loginId = useId()
    const passwordId = useId()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        callback(login, password)
    }

    return (
        <>
            <form onSubmit={handleSubmit} className={className}>
                <div className="h-cont jst-sb fl-gr-0 pad-v-3xs">
                    <label className="fl-bs-sm">Login</label>
                    <input type="text" onChange={e => setLogin(e.target.value)} className="fl-bs-l fl-gr-1"/>
                </div>

                <div className="h-cont jst-sb fl-gr-0 pad-v-3xs">
                    <label className="fl-bs-sm">Password</label>
                    <input type="password" onChange={e => setPassword(e.target.value)} className="fl-bs-l fl-gr-1"/>
                </div>


                <button type="submit" className="clickable-transparent clickable-border w-a fl-bs-xs font-l">{submitButtonText}</button>
            </form>
        </>
    )
}