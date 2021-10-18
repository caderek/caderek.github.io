import chokidar from "chokidar"
import { execSync } from "child_process"
import logUpdate from "log-update"
import kleur from "kleur"

const DIR = "src"

console.log(`Watching ${DIR}...`)

const update = (path, output) => {
  const outPath = output
    .toString()
    .split("\n")
    .filter((x) => x !== "")
    .slice(-1)

  console.log(kleur.green(`Compiled ${path} to ${outPath}`))
}

chokidar
  .watch(DIR)
  .on("ready", () => {
    const output = execSync(`npm run dev`)
    update("all pages", output)
  })
  .on("change", (path) => {
    const output = execSync(`npm run dev ${path}`)
    update(path, output)
  })
