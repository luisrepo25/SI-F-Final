export async function apiFetch(url: string, options: RequestInit = {}) {
  let access = localStorage.getItem("access")
  const refresh = localStorage.getItem("refresh")

  if (!access) {
    throw new Error("No hay sesión iniciada")
  }

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    Authorization: `Bearer ${access}`,
  }

  let resp = await fetch(url, { ...options, headers })

  // Si expira el token, intentamos refrescar
  if (resp.status === 401 && refresh) {
    const refreshResp = await fetch("http://127.0.0.1:8000/api/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })

    if (refreshResp.ok) {
      const data = await refreshResp.json()
      localStorage.setItem("access", data.access)

      // Reintentamos con el nuevo token
      const newHeaders = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.access}`,
      }
      resp = await fetch(url, { ...options, headers: newHeaders })
    } else {
      throw new Error("Sesión expirada, vuelve a iniciar sesión")
    }
  }

  return resp
}
