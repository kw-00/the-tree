import { defineRecipe } from "@chakra-ui/react";

const clickableRecipe = defineRecipe({
    base: {
        colorPalette: "bg",
        bg: "colorPalette",
        "&:hover": {
            bg: "colorPalette.subtle"
        },
        "&:active": {
            bg: "colorPalette.muted"
        }
    },
    variants: {
        variant: {

        }
    }
})

export default clickableRecipe