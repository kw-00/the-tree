import styles from "./_TextInput.module.css"

import TextEditor from "./_internal/TextEditor"


export type TextInputProps = {
    className?: string
    style?: React.CSSProperties
    onChange?: (text: string) => void
}

/**
 * Make sure to specify max-height through Tailwind or style, so that the TextInput
 * does not grow indefinitely instead of becoming scrollable when content expands.
 */
export default function TextInput({className, style, onChange}: TextInputProps) {

    return (
        <TextEditor 
        onChange={(text) => {
            if (onChange) {
                onChange(text)
            }
        }}
        className={`${styles.TextInput} ${className ?? ""}`}
        style={{outline: "none", ...style}}
        />
    )
}