const USER_KEY = 'pc_cotiza_user'
const TOKEN_KEY = 'pc_cotiza_token'
const ROLE_COOKIE = 'pc_cotiza_role'

const setRoleCookie = role => {
  if (typeof document === 'undefined') return
  const value = role === 'ADMIN' ? 'ADMIN' : 'USER'
  document.cookie = `${ROLE_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

const clearRoleCookie = () => {
  if (typeof document === 'undefined') return
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserRole() {
  const user = getStoredUser()
  return user?.role === 'ADMIN' ? 'ADMIN' : 'USER'
}

export function isAdmin() {
  return getUserRole() === 'ADMIN'
}

export function setAuthSession({ accessToken, user }) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  setRoleCookie(user?.role)
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  clearRoleCookie()
}
