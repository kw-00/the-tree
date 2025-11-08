import { FormEvent, useState } from "react"

type CredentialFormHandler = (login: string, password: string) => void

interface CredentialFormProps {
    callback: CredentialFormHandler
    submitButtonText: string
}

export default function CredentialForm({callback, submitButtonText}: CredentialFormProps) {

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        callback({login, password})
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label>
                    Login
                    <input type="text" onChange={e => setLogin(e.target.value)}/>
                </label>
                <label>
                    Password
                    <input type="password" onChange={e => setPassword(e.target.value)}/>
                </label>

                <button type="submit">{submitButtonText}</button>
            </form>
        </>
    )
}