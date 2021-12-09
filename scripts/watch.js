import fs from "fs"
import kleur from "kleur"
import { multi, method } from "@arrows/multimethod"
import getAllFiles from "./helpers/getAllFiles.js"
import { buildPage, buildFromHTMLTemplate, getType, TYPES } from "./pages.js"
import moveImage from "./images.js"

const DIR = "src"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const handleFile = multi(
  method(/^src[/\\]images/, moveImage),
  method(/^src[/\\]pages/, buildPage),
  method(/^src[/\\]templates/, buildFromHTMLTemplate),
  method(() => null),
)

const watch = async () => {
  const modified = Object.fromEntries(
    getAllFiles(DIR).map((file) => [
      file,
      getType(file) === TYPES.template ? fs.statSync(file).mtimeMs : 0,
    ]),
  )

  while (true) {
    const files = getAllFiles(DIR)

    for (const file of files) {
      const lastModified = fs.statSync(file).mtimeMs

      if (!modified[file] || lastModified > modified[file]) {
        modified[file] = lastModified
        const output = await handleFile(file)

        if (output !== null) {
          console.log(kleur.green(`Compiled ${file} to ${output}`))
        }
      }
    }

    await sleep(1000)
  }
}

watch()
