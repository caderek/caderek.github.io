import marked from "marked"
import fs from "fs"
import path from "path"
import { multi, method } from "@arrows/multimethod"
import { rail, tap } from "@arrows/composition"

const changedFile = process.argv[2]

const TYPES = {
  page: "page",
  template: "template",
  other: "other",
}

const readFile = (path) => {
  return fs.readFileSync(path).toString()
}

const savePage = ({ url, pageContent }) => {
  const urlChunks = url.split("/").filter((chunk) => chunk !== "")
  const dir = path.join("docs", ...urlChunks)
  const file = path.join(dir, "index.html")

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(file, pageContent)

  return file
}

const extractVars = (text) => {
  const matches = text.match(/<!--.+:.+-->/gi) || []

  matches.forEach((match) => {
    text = text.replace(match, "")
  })

  const pairs = matches.map((match) => {
    const [name, value] = match
      .replace(/(<!--)|(-->)/g, "")
      .split(":")
      .map((x) => x.trim())

    return [name.toLowerCase(), value]
  })

  const vars = Object.fromEntries(pairs)

  return { text, vars }
}

const embedInTemplate = ({ text, vars }) => {
  const template = vars.template ?? "index"
  const title = vars.title ?? ""

  const templateSrc = path.join("src", "templates", `${template}.html`)

  const templateContent = readFile(templateSrc)

  const pageContent = templateContent
    .replace(/{title}/i, title)
    .replace(/{content}/i, text)

  return { pageContent, url: vars.path }
}

const getType = multi(
  method(/^src[/\\]templates/, TYPES.template),
  method(/^src[/\\]pages/, TYPES.page),
  method(TYPES.other),
)

const buildMarkdownPage = rail(
  readFile,
  extractVars,
  ({ text, vars }) => ({ text: marked(text), vars }),
  embedInTemplate,
  savePage,
  (file) => console.log(file),
)

const buildHTMLPage = (file) => {
  console.dir(`Building page from html: ${file}`)
}

const buildFromHTMLTemplate = (file) => {
  console.dir(`Building from html template: ${file}`)
}

const buildOne = multi(
  (file) => {
    const type = getType(file)
    const ext = file.split(".").slice(-1)[0]
    return [type, ext]
  },
  method([TYPES.page, "md"], buildMarkdownPage),
  method([TYPES.page, "html"], buildHTMLPage),
  method([TYPES.template, "html"], buildFromHTMLTemplate),
  method((file) => {
    throw new Error(`FIle "${file}" not supported`)
  }),
)

const getAllPages = (location) => {
  const entities = fs.readdirSync(location, { withFileTypes: true })

  const files = entities
    .filter((entity) => entity.isFile())
    .map((entity) => path.join(location, entity.name))

  const dirs = entities
    .filter((entity) => entity.isDirectory())
    .map((entity) => entity.name)

  return [
    ...files,
    ...dirs.map((dir) => getAllPages(path.join(location, dir))).flat(),
  ]
}

const buildAll = () => {
  const root = path.join("src", "pages")
  const pages = getAllPages(root)

  console.log(pages)
  console.log("docs")
}

if (changedFile) {
  buildOne(changedFile)
} else {
  buildAll()
}
