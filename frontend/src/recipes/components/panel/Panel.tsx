import { defineRecipe } from "@chakra-ui/react";



const panelRecipe = defineRecipe({
    base: {
        borderRadius: "md",
        borderWidth: "thin",
        borderColor: {base: "gray.700", _dark: "gray.200"}
    },
    variants: {
        variant: {
            primary: {
                backgroundColor: "bg.muted",
                borderColor: "border"
            },
            secondary: {
                backgroundColor: "bg.subtle",
                borderColor: "border.muted"
            },
            subtle: {
                backgroundColor: "bg",
                borderColor: "subtle"
            }
        },
        layout: {
            box: {},
            vstack: {
                display: "flex",
                alignItems: "stretch",
                flexDir: "column"
            },
            hstack: {
                display: "flex",
                alignItems: "stretch",
                flexDir: "row"
            }
        }
    }
})

export default panelRecipe
