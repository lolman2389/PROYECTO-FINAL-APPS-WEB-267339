const token = localStorage.getItem("authToken");

function tokenVencido() {
  const datos = datosToken(token);
  return datos.exp && datos.exp * 1000 < Date.now();
}

function cerrarSesion() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  location.replace("login.html");
}

if (!token || tokenVencido()) {
  cerrarSesion();
} else {
  document.body.classList.remove("oculto");
}

const usuario = obtenerUsuario();
const modal = document.getElementById("modal");
const formProyecto = document.getElementById("formProyecto");

document.getElementById("nombreUsuario").textContent = usuario.name || "";

function abrirModal() {
  modal.classList.add("abierto");
}

function cerrarModal() {
  modal.classList.remove("abierto");
}

formProyecto.addEventListener("submit", (e) => {
  e.preventDefault();
});

document.getElementById("btnAgregar").addEventListener("click", abrirModal);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);
document.getElementById("btnSalir").addEventListener("click", cerrarSesion);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    cerrarModal();
  }
});
