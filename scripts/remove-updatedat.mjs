import fs from 'fs'
import path from 'path'

const root = path.resolve(process.cwd())

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else if (entry.isFile() && p.endsWith('.mdx')) yield p
  }
}

let changed = 0
for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8')
  const before = src
  src = src.replace(/\n?import\s+\{\s*UpdatedAt\s*\}\s+from\s+'[^']*components\/UpdatedAt[^']*'\s*\n?/g, '\n')
  src = src.replace(/\n?<UpdatedAt\s*\/>\s*\n?/g, '\n')
  if (src !== before) {
    fs.writeFileSync(file, src)
    changed++
  }
}

console.log(`Removed UpdatedAt from ${changed} files`)
