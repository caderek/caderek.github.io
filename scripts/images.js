import fs from "fs"
import path from "path"

const BASE = path.join("docs", "images")

const moveImage = async (input) => {
  const destination = path.join(BASE, path.basename(input))

  if (!fs.existsSync(BASE)) {
    fs.mkdirSync(BASE, { recursive: true })
  }

  fs.copyFileSync(input, destination)

  return destination
}

export default moveImage
