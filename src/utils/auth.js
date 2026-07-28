export function getToken() {
  return localStorage.getItem('token')
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.__refreshUser?.()
}

export function isTokenExpired(token = getToken()) {
  if (!token) return true

  try {
    const payload = token.split('.')[1]
    if (!payload) return true

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )
    const { exp } = JSON.parse(json)

    return typeof exp !== 'number' || Date.now() >= exp * 1000
  } catch {
    return true
  }
}
