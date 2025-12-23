import { useTheme } from "../theme/theme"



const classes = {
    base: "px-6 py-2 rounded-md",
    full: {
        dark: ""
    }
}

export default function Button(props: React.HTMLAttributes<HTMLButtonElement>) {
    const {theme} = useTheme()


    return (
        <button className="
            px-6 py-2 rounded-md
            bg-emerald-500 
            hover:bg-emerald-600
            active:bg-emerald-700 
            duration-200

        "
        {...props}>

        </button>
    )
}




