import React from 'react'

type UpdatedAtProps = {
  path?: string
  owner?: string
  repo?: string
  branch?: string
  label?: string
}

export function UpdatedAt({
  path,
  owner = 'whh2333',
  repo = 'docs',
  branch = 'main',
  label = 'Updated'
}: UpdatedAtProps) {
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let resolvedPath = path
    if (!resolvedPath && typeof window !== 'undefined') {
      // Convert route to repo file path (assumes routes mirror repo structure)
      const pathname = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
      resolvedPath = pathname.length ? `${pathname}.mdx` : 'index.mdx'
    }
    if (!resolvedPath) return

    const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(
      resolvedPath
    )}&sha=${encodeURIComponent(branch)}&per_page=1`

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`)
        const data = await res.json()
        const date: string | undefined = data?.[0]?.commit?.committer?.date
        if (date) setUpdatedAt(new Date(date).toLocaleString())
      })
      .catch((e) => {
        setError(e?.message || 'fetch failed')
      })
  }, [path, owner, repo, branch])

  if (!updatedAt) return null

  return (
    <div style={{ margin: '8px 0 16px', color: 'var(--mint-text-secondary, #6b7280)', fontSize: 14 }}>
      {label}: {updatedAt}
    </div>
  )
}

export default UpdatedAt
