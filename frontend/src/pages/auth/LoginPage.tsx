import { authenticateUser } from "@/services/services"
import CredentialForm from "./components/CredentialForm"
import { useNavigate } from "react-router-dom"
import NavigationButton from "@/components/NavigationButton"


export default function LoginPage() {

    const navigate = useNavigate()

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await authenticateUser(login, password)

        const {status} = apiCallResult
        if (status === 200) {
            navigate("/dashboard")
        }
    }

    return (
        <>
            <div className="bg-1 v-container align-items-center">
                <div className="bg-1 v-container width-384 padding-32 align-items-center">
                    <div><h1>Welcome back!</h1></div>
                    <div className="v-container width-full">
                        <CredentialForm callback={handleSubmit} className="v-stack justify-content-center width-full" submitButtonText="Log in"/>
                    </div>
                    <div className="bg-2 width-full">
                        <NavigationButton path="/register" className="clickable-contrasting width-full">Register instead</NavigationButton>
                    </div>
                </div>
            </div>
        </>
    )
}