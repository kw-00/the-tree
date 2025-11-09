import CredentialForm from "../components/CredentialForm"


export default function LoginPage() {

    const handleSubmit = async (login: string, password: string) => {

    }

    return (
        <>
            <div>
                <CredentialForm callback={handleSubmit} submitButtonText="Log in"/>
            </div>
        </>
    )
}