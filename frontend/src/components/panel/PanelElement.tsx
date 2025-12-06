import panelElementRecipe from "@/recipes/components/panel/PanelElement";
import { chakra, type BoxProps } from "@chakra-ui/react";
import type { PanelElementVariantProps } from "node_modules/@chakra-ui/react/dist/types/styled-system/generated/recipes.gen";


export type PanelElementProps = PanelElementVariantProps & BoxProps

const recipe = panelElementRecipe
const PanelElement = chakra("div", recipe)
export default PanelElement