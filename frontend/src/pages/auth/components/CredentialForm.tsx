import { useState } from "react"
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        callback(login, password)
    }

    return (
        <>
            <form onSubmit={handleSubmit} className={className}>
                <label className="width-auto padding-vertical-8">
                    Login
                    <input type="text" onChange={e => setLogin(e.target.value)} className="width-auto"/>
                </label>
                <label className="width-auto padding-vertical-8">
                    Password
                    <input type="password" onChange={e => setPassword(e.target.value)} className="width-auto"/>
                </label>

                <button type="submit" className="clickable-transparent clickable-border width-auto">{submitButtonText}</button>
            </form>
        </>
    )
}