import fs from 'fs'
import path from 'path'

const root = path.resolve(process.cwd())

const keepPaths = new Set([
  'en/help-center/pricing/pricing.mdx',
  'en/help-center/pricing/credits-price.mdx',
  'zh/help-center/pricing/pricing.mdx',
  'zh/help-center/pricing/credits-price.mdx'
].map((p) => path.join(root, p)))

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else if (entry.isFile() && p.endsWith('.mdx')) yield p
  }
}

function stripUpdated(src) {
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fm) return null
  let headYaml = fm[1]
  let changed = false
  if (/^updatedAt:\s*/m.test(headYaml)) {
    headYaml = headYaml.replace(/^updatedAt:\s*.*\n?/m, '')
    changed = true
  }
  const newHead = `---\n${headYaml.trimEnd()}\n---\n`
  let body = src.slice(fm[0].length)
  // Remove the visible Updated line inserted by our script
  const markerRe = /^(?:\{\/\* UPDATED_AT \*\/\}|<!-- UPDATED_AT -->)\n_Updated: .*?_\n\n/m
  if (markerRe.test(body)) {
    body = body.replace(markerRe, '')
    changed = true
  }
  return changed ? newHead + body : null
}

let changedCount = 0
for (const file of walk(root)) {
  if (keepPaths.has(file)) continue
  const src = fs.readFileSync(file, 'utf8')
  const out = stripUpdated(src)
  if (out) {
    fs.writeFileSync(file, out)
    changedCount++
  }
}

console.log(`Removed updated date from ${changedCount} files (kept pricing docs).`)
