import fs from 'fs'
import path from 'path'

const root = path.resolve(process.cwd())
const componentsPath = path.join(root, 'components', 'UpdatedAt')

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(p)
    } else if (entry.isFile() && p.endsWith('.mdx')) {
      yield p
    }
  }
}

let changed = 0
for (const file of walk(root)) {
  const src = fs.readFileSync(file, 'utf8')
  if (src.includes('components/UpdatedAt') || src.includes('<UpdatedAt')) continue
  const fm = src.match(/^---[\s\S]*?---\n/)
  if (!fm) continue
  const relImport = path
    .relative(path.dirname(file), componentsPath)
    .replace(/\\/g, '/')
  const importStmt = `import { UpdatedAt } from '${relImport}'\n\n<UpdatedAt />\n\n`
  const out = src.replace(fm[0], fm[0] + importStmt)
  fs.writeFileSync(file, out)
  changed++
}

console.log(`Injected UpdatedAt into ${changed} files`)
