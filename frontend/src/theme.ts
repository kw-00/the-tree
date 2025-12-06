
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import buttonRecipe from './recipes/components/Button'
import panelRecipe from "./recipes/components/panel/Panel"
import panelElementRecipe from "./recipes/components/panel/PanelElement"

const config = defineConfig({
  preflight: true,
  globalCss: {
    "*": {
      boxSizing: "border-box"
    },
    "body, html, #root": {
      display: "flex",
      flexDir: "row",
      overflow: "hidden",
      height: "100vh", 
      width: "100vw",
    }
  },
  theme: {
    tokens: {
      
    },
    recipes: {
      button: buttonRecipe,
      panel: panelRecipe,
      panelElement: panelElementRecipe
    }
  },
})

export default createSystem(defaultConfig, config)