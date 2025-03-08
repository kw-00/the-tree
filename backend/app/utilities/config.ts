import path from "path"
import fs from "fs"

const configPath = path.join(__dirname, "../config.json")
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))

export default config