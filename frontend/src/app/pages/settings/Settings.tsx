
import { Link } from "react-router-dom";
import ChangePasswordSection from "./sections/ChangePasswordSection";
import ChangeLoginSection from "./sections/ChangeLoginSection";



export default function Settings() {

    return (
        <div className="v-stack h-svh w-svw">
            {/* Header */}
            <div className="h-stack justify-end surface-base">
                <Link to="/dashboard" className="button-danger">back</Link>
            </div>
            {/* Content */}
            <div className="surface-base overflow-y-scroll grow">
                <div className="px-128">
                    <h1 className="heading-1">Settings</h1>
                    <div className="surface-sunken">
                        <div className="v-stack pb-8 gap-8">
                            <ChangePasswordSection/>
                            <ChangeLoginSection/>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}