

import {defineRecipe} from "@chakra-ui/react"



const buttonRecipe = defineRecipe({
    base: {
        display: "flex",
        px: "5",
        py: "2",
        rounded: "sm",
        fontWeight: "bold",
    },
    variants: {
        variant: {
            primary: {
                colorPalette: "teal",

                bg: "colorPalette.500",

                "&:hover": {
                    bg: "colorPalette.600"
                },

                "&:active": {
                    bg: "colorPalette.700"
                }
            },
            secondary: {
                colorPalette: "cyan",

                bg: "colorPalette",
                borderColor: "colorPalette.500",
                borderWidth: "medium",

                "&:hover": {
                    bg: "colorPalette.500",                    
                },

                "&:active": {
                    bg: "colorPalette.600",
                    borderColor: "colorPalette.600"
                }                
            },
            phantom: {
                colorPalette: "green",
                borderWidth: "thin",
                borderColor: "transparent",

                "&:hover": {
                    borderColor: "colorPalette.700",
                },

                "&:active": {
                    color: {base: "colorPalette.600"}
                }
            }
        }
    },
    defaultVariants: {
        variant: "primary",
    },
})


export default buttonRecipe