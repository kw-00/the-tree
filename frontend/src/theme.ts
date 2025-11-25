
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import buttonRecipe from './recipes/Button'

const config = defineConfig({
  preflight: true,
  globalCss: {
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
    }
  }
})

export default createSystem(defaultConfig, config)