const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

async function peticion(ruta, opciones = {}) {
  const headers = { "Content-Type": "application/json" };

  const res = await fetch(API_BASE + ruta, { ...opciones, headers });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    let texto = "Ocurrió un error, intenta de nuevo";
    if (typeof data === "string") {
      texto = data;
    } else if (data && (data.message || data.error)) {
      texto = data.message || data.error;
    }
    const error = new Error(texto);
    error.status = res.status;
    throw error;
  }

  return data;
}

function registrarUsuario(usuario) {
  return peticion("/auth/register", {
    method: "POST",
    body: JSON.stringify(usuario)
  });
}

function iniciarSesion(email, password) {
  return peticion("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

function datosToken(token) {
  try {
    const parte = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(parte));
  } catch (e) {
    return {};
  }
}

function obtenerUsuario() {
  try {
    const guardado = JSON.parse(localStorage.getItem("user"));
    if (guardado && typeof guardado === "object") {
      return guardado;
    }
  } catch (e) {}

  const datos = datosToken(localStorage.getItem("authToken"));
  return {
    id: datos.id || datos._id || datos.userId || datos.sub,
    name: datos.name,
    email: datos.email
  };
}
