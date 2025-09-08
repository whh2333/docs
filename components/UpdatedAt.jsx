import React, { useEffect, useState } from 'react'

export default function UpdatedAt({
  path,
  owner = 'whh2333',
  repo = 'docs',
  branch = 'main',
  label = 'Updated'
}) {
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let resolved = path
    if (!resolved && typeof window !== 'undefined') {
      const pathname = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
      resolved = pathname.length ? `${pathname}.mdx` : 'index.mdx'
    }
    if (!resolved) return

    const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(
      resolved
    )}&sha=${encodeURIComponent(branch)}&per_page=1`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const date = data?.[0]?.commit?.committer?.date
        if (date) setUpdatedAt(new Date(date).toLocaleString())
      })
      .catch(() => {})
  }, [path, owner, repo, branch])

  if (!updatedAt) return null

  return (
    <div style={{ margin: '8px 0 16px', color: 'var(--mint-text-secondary, #6b7280)', fontSize: 14 }}>
      {label}: {updatedAt}
    </div>
  )
}
