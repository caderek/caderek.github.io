import marked from "marked"
import fs from "fs"
import path from "path"
import { multi, method } from "@arrows/multimethod"
import { rail } from "@arrows/composition"
import getAllFiles from "./helpers/getAllFiles.js"
import handlebars from "handlebars"

const TYPES = {
  page: "page",
  template: "template",
  other: "other",
}

const readFile = (file) => {
  return { file, content: fs.readFileSync(file).toString() }
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

const fixLinks = (content) => {
  return content.replace(/(]\(\s*\.\.\/)|(]\(\s*\/src)/g, "](/")
}

const formatDate = (date) => {
  const [y, m, d] = date.split("-").map(Number)

  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][m - 1]

  return `${month} ${d}, ${y}`
}

const extractVars = ({ file, content }) => {
  const matches = content.match(/<!--\s*\$.+:.+-->/gi) || []

  matches.forEach((match) => {
    content = content.replace(match, "")
  })

  const pairs = matches.map((match) => {
    const [name, value] = match
      .replace(/(<!--)|(-->)/g, "")
      .split(":")
      .map((x) => x.trim())

    return [name.slice(1), value]
  })

  const vars = Object.fromEntries(pairs)
  const fileName = path.parse(file).name

  vars.formattedDate = vars.date ? formatDate(vars.date) : null
  vars.path = vars.path ? vars.path.replace(/\$file/, fileName) : fileName

  return { content, vars }
}

const getArticlesSummary = () => {
  const articles = getAllFiles("src/pages/articles")

  return articles
    .map((file) => {
      const rawContent = fs.readFileSync(file, { encoding: "utf8" })
      const { content, vars } = extractVars({ file, content: rawContent })
      const firstParagraph = content.trim().split("\n")[0]

      return { ...vars, firstParagraph }
    })
    .sort((a, b) => (a.date > a.date === b.date ? 0 : a.date > b.date ? -1 : 1))
}

const embedInTemplate = ({ content, vars }) => {
  const articles = getArticlesSummary()
  const data = { ...vars, content, articles, recent: articles.slice(0, 5) }
  const template = vars.template ?? "index"
  const templateSrc = path.join("src", "templates", `${template}.html`)
  const templateContent = readFile(templateSrc).content
  const compiled = handlebars.compile(templateContent)
  const pageContent = compiled(data)

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
  ({ content, vars }) => ({ content: fixLinks(content), vars }),
  ({ content, vars }) => ({ content: marked(content), vars }),
  embedInTemplate,
  savePage,
)

const buildHTMLPage = (file) => {
  console.dir(`Building page from html: ${file}`)
}

const buildFromHTMLTemplate = (file) => {
  console.dir(`Building from html template: ${file}`)
  const pages = getAllFiles("src/pages")

  pages.forEach(buildPage)

  return "docs"
}

const buildPage = multi(
  (file) => {
    const type = getType(file)
    const ext = file.split(".").slice(-1)[0]
    return [type, ext]
  },
  method([TYPES.page, "md"], buildMarkdownPage),
  method([TYPES.page, "html"], buildHTMLPage),
  method((file) => {
    throw new Error(`FIle "${file}" not supported`)
  }),
)

export { buildPage, buildFromHTMLTemplate, getType, TYPES }
