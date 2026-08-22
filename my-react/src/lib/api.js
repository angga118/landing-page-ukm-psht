const BASE = '/api'

/** Error thrown by api() on non-2xx responses. */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors || {}
  }
}

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })

  let payload = null
  try {
    payload = await res.json()
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.message || `Request gagal (${res.status})`,
      payload?.errors,
    )
  }
  return payload && payload.data !== undefined ? payload.data : payload
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (path, body) =>
    request(path, {
      method: 'DELETE',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
}
