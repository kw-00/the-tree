import panelRecipe from "@/recipes/components/panel/Panel";
import { chakra, type BoxProps } from "@chakra-ui/react";
import type { PanelVariantProps } from "node_modules/@chakra-ui/react/dist/types/styled-system/generated/recipes.gen";


export type PanelProps = PanelVariantProps & BoxProps

const recipe = panelRecipe
const Panel = chakra("div", recipe)
export default Panel