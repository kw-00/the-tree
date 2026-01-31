import Label from "@/app/components/label/Label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "@/api/domains/auth/auth-service"
import * as usersService from "@/api/domains/users/users-service"



const LogInForm = () => {
    const navigate = useNavigate()

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const handleLogInClicked = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        const response = await authService.logIn({login, password})
        if (response.status === "SUCCESS") {
            navigate("/dashboard")
        } else {
            alert(response.status)
        }
    }

    return (
        <>
            <h2 className="heading-2 self-center">Log in</h2>
            <form className="v-stack surface-elevated">
                <fieldset className="v-stack gap-xl">
                    <Label className="v-stack gap-2">
                        Login
                        <input className="input grow" value={login} onChange={e => setLogin(e.target.value)}></input>
                    </Label>

                    <Label className="v-stack gap-2">
                        Password
                        <input type="password" className="input grow" value={password} onChange={e => setPassword(e.target.value)}></input>
                    </Label>
                </fieldset>
                <div className="px-5 py-3 self-end">
                    <button className="button-primary self-end" onClick={handleLogInClicked}>Log in</button>
                </div>
            </form>
            <span className="self-center">New here? <Link to="/register" className="link">Register an account</Link></span>
        </>
    )
}

const RegisterForm = () => {
    const navigate = useNavigate()

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const handleRegisterClicked = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        const response = await usersService.registerUser({login, password})
        if (response.status === "SUCCESS") {
            navigate("/dashboard")
        } else {
            alert(response.status)
        }
    }

    return (
        <>
            <h2 className="heading-2 self-center">Register an account</h2>
            <form className="v-stack surface-elevated">
                <fieldset className="v-stack gap-xl">
                    <Label className="v-stack gap-sm">
                        Login
                        <input className="input grow" value={login} onChange={e => setLogin(e.target.value)}></input>
                    </Label>

                    <Label className="v-stack gap-sm">
                        Password
                        <input type="password" className="input grow" value={password} onChange={e => setPassword(e.target.value)}></input>
                    </Label>
                </fieldset>
                <div className="px-5 py-3 self-end">
                    <button className="button-primary" onClick={handleRegisterClicked}>Register account</button>
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
            <div className="v-stack w-2xl surface-sunken">
                <div className="v-stack p-5 gap-2">
                    {type === "logIn" ? <LogInForm/> : <RegisterForm/>}
                </div>
            </div>
        </div>
    )
}