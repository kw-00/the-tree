import { useState } from "react"
import CredentialForm from "../components/CredentialForm"

function LoginPage() {

    const handleSubmit = (login: string, password: string) => {

    }

    return (
        <>
            <div>
                <CredentialForm callback={handleSubmit} submitButtonText="Log in"/>
            </div>
        </>
    )
}

export default LoginPage