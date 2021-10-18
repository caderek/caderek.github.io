import marked from "marked"
import fs from "fs"
import path from "path"
import { multi, method } from "@arrows/multimethod"
import { rail } from "@arrows/composition"

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

const fixLinks = (text) => {
  return text
    .replace(/(\(\s*\.\.\/)|(\(\s*\/src)/g, "(/")
    .replace(/(src\s*=\s*["']\s*\/src\/)|(src\s*=\s*["']\s*\.\.\/)/, 'src="/')
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
  ({ text, vars }) => ({ text: fixLinks(text), vars }),
  ({ text, vars }) => ({ text: marked(text), vars }),
  embedInTemplate,
  savePage,
)

const buildHTMLPage = (file) => {
  console.dir(`Building page from html: ${file}`)
}

const buildFromHTMLTemplate = (file) => {
  console.dir(`Building from html template: ${file}`)
}

const buildPage = multi(
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

export default buildPage
