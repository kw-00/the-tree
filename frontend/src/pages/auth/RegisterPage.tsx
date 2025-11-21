import { useNavigate } from "react-router-dom"
import CredentialForm from "./components/CredentialForm"
import { registerAndLogIn } from "@/services/services"
import NavigationButton from "@/components/NavigationButton"

export default function RegisterPage() {
    const navigate = useNavigate()

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await registerAndLogIn(login, password)

        const {status} = apiCallResult
        if (status === 200) {
            navigate("/dashboard")
        }
    }

    return (
        <>
            <div className="bg-1 v-container align-items-center">
                <div className="bg-1 v-container width-384 padding-32 align-items-center">
                    <div><h1>Welcome!</h1></div>
                    <div className="v-container width-full">
                        <CredentialForm callback={handleSubmit} className="v-stack justify-content-center width-full" submitButtonText="Register account"/>
                    </div>
                    <div className="bg-2 width-full">
                        <NavigationButton path="/login" className="clickable-contrasting width-full">Login instead</NavigationButton>
                    </div>
                </div>
            </div>
        </>
    )
}
