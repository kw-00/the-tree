import Label from "@/app/components/label/Label";
import { Link, useNavigate } from "react-router-dom";



const LogInForm = () => {
    const navigate = useNavigate()
    return (
        <>
            <h2 className="heading-2 self-center">Log in</h2>
            <form className="v-stack surface-elevated">
                <fieldset className="v-stack gap-xl brightness-150">
                    <Label className="v-stack gap-2">
                        Login
                        <input className="input grow"></input>
                    </Label>

                    <Label className="v-stack gap-2">
                        Password
                        <input type="password" className="input grow"></input>
                    </Label>
                </fieldset>
                <div className="px-5 py-3 self-end">
                    <button className="button-primary self-end"onClick={e => {
                        e.preventDefault()
                        navigate("/dashboard")
                    }}>Log in</button>
                </div>
            </form>
            <span className="self-center">New here? <Link to="/register" className="link">Register an account</Link></span>
        </>
    )
}

const RegisterForm = () => {
    const navigate = useNavigate()
    return (
        <>
            <h2 className="heading-2 self-center">Register an account</h2>
            <form className="v-stack surface-elevated">
                <fieldset className="v-stack gap-xl brightness-150">
                    <Label className="v-stack gap-sm">
                        Login
                        <input className="input grow"></input>
                    </Label>

                    <Label className="v-stack gap-sm">
                        Password
                        <input type="password" className="input grow"></input>
                    </Label>
                </fieldset>
                <div className="px-5 py-3 self-end">
                    <button className="button-primary"onClick={e => {
                        e.preventDefault()
                        navigate("/dashboard")
                    }}>Register account</button>
                </div>
            </form>
            <span className="self-center">Already registered? <Link to="/login" className="link">Log in</Link></span>
        </>
    )
}



export default function AuthPage({type}: {type: "logIn" | "register"}) {
    return (
        <div className="v-stack h-svh w-svw justify-center items-center">
            <h1 className="heading-1" style={{fontSize: "2rem"}}>{type === "logIn" ? "Welcome back!" : "Welcome!"}</h1>
            <div className="v-stack w-2xl surface-sunken brightness-75">
                <div className="v-stack p-5 gap-2">
                    {type === "logIn" ? <LogInForm/> : <RegisterForm/>}
                </div>
            </div>
        </div>
    )
}