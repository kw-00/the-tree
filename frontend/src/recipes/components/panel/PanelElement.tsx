import { defineRecipe } from "@chakra-ui/react";



const panelElementRecipe = defineRecipe({
    base: {
        py: "1",
        borderColor: "inherit"
    },
    variants: {
        variant: {
            element: {
                borderYWidth: "thin",
            },
            header: {
                borderBottomWidth: "thin"
            },
            footer: {
                borderTopWidth: "thin"
            },
            container: {}
        },
        clickable: {
            true: {
                "&:hover": {
                    bgColor: "bg.emphasized",
                },
                "&:active": {
                    bgColor: "gray.emphasized"
                }
            },
            false: {}
        }
    },
    defaultVariants: {
        variant: "element",
        clickable: false
    }
})

export default panelElementRecipe