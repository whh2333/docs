import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const root = path.resolve(process.cwd())

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else if (entry.isFile() && p.endsWith('.mdx')) yield p
  }
}

function getLastCommitISO(file) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    return out || null
  } catch {
    return null
  }
}

function toYMD(iso) {
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  } catch {
    return iso
  }
}

function ensureFrontmatterUpdatedAt(src, iso) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return null
  const head = m[0]
  const body = src.slice(head.length)
  let yaml = m[1]
  if (/^updatedAt:\s*/m.test(yaml)) {
    yaml = yaml.replace(/^updatedAt:\s*.*$/m, `updatedAt: "${iso}"`)
  } else {
    yaml = yaml + `\nupdatedAt: "${iso}"`
  }
  const newHead = `---\n${yaml}\n---\n`
  let content = body
  // Accept both legacy HTML marker and MDX comment marker
  const markerRe = /^(?:<!-- UPDATED_AT -->|{\/\* UPDATED_AT \*\/})[\s\S]*?\n\n/m
  const line = `{/* UPDATED_AT */}\n_Updated: ${toYMD(iso)}_\n\n`
  if (markerRe.test(content)) {
    content = content.replace(markerRe, line)
  } else {
    content = line + content
  }
  return newHead + content
}

let changed = 0
for (const file of walk(root)) {
  const iso = getLastCommitISO(file)
  if (!iso) continue
  const src = fs.readFileSync(file, 'utf8')
  const out = ensureFrontmatterUpdatedAt(src, iso)
  if (out && out !== src) {
    fs.writeFileSync(file, out)
    changed++
  }
}

console.log(`Injected updatedAt into ${changed} files using local git (no GitHub API calls).`)
