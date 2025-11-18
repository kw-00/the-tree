import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

const currentPath = import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(currentPath, "src")
    }
  }
})
