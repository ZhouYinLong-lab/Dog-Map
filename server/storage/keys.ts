import path from 'node:path'

export function normalizeObjectKey(key: string) {
  const normalized = key.replaceAll('\\', '/').replace(/^\/+/, '')
  if (!normalized || normalized.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error('Invalid storage object key')
  }
  return normalized
}

export function resolveSafePath(root: string, key: string) {
  const safeKey = normalizeObjectKey(key)
  const resolvedRoot = path.resolve(root)
  const resolvedPath = path.resolve(resolvedRoot, safeKey)
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error('Storage object path escapes configured root')
  }
  return resolvedPath
}

export function publicObjectPath(baseUrl: string, key: string) {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  return `${normalizedBase}/${normalizeObjectKey(key).split('/').map(encodeURIComponent).join('/')}`
}
