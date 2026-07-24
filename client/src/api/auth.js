const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5300'

export async function loginRequest({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
    throw new Error(msg || 'Correo o contraseña incorrectos')
  }

  return data
}
