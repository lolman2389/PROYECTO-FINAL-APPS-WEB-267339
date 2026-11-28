const token = localStorage.getItem("authToken");

function tokenVencido() {
  try {
    const parte = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const datos = JSON.parse(atob(parte));
    return datos.exp && datos.exp * 1000 < Date.now();
  } catch (e) {
    return false;
  }
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
const lista = document.getElementById("lista");
const vacio = document.getElementById("vacio");
const buscador = document.getElementById("buscador");
const total = document.getElementById("total");
const nombreUsuario = document.getElementById("nombreUsuario");
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const formProyecto = document.getElementById("formProyecto");
const guardar = document.getElementById("guardar");
const aviso = document.getElementById("aviso");

let proyectos = [];
let editandoId = null;

nombreUsuario.textContent = usuario.name || "";

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto || "";
  return div.innerHTML;
}

function mostrarAviso(texto, esError) {
  aviso.textContent = texto;
  aviso.className = "aviso visible" + (esError ? " error" : "");
  setTimeout(() => {
    aviso.className = "aviso";
  }, 3000);
}

function pintar() {
  const texto = buscador.value.toLowerCase();
  const filtrados = proyectos.filter((p) => {
    const tecnologias = (p.technologies || []).join(" ").toLowerCase();
    return p.title.toLowerCase().includes(texto) || tecnologias.includes(texto);
  });

  total.textContent = proyectos.length;
  lista.innerHTML = "";
  vacio.hidden = filtrados.length > 0;

  filtrados.forEach((p) => {
    const imagen = p.images && p.images[0];
    const portada = imagen
      ? `<div class="portada"><img src="${escapar(imagen)}" alt="${escapar(p.title)}" onerror="this.parentElement.remove()"></div>`
      : "";
    const chips = (p.technologies || [])
      .map((t) => `<span class="chip">${escapar(t)}</span>`)
      .join("");
    const repo = p.repository
      ? `<a class="repo" href="${escapar(p.repository)}" target="_blank" rel="noopener">Ver repositorio</a>`
      : "";

    const card = document.createElement("article");
    card.className = "proyecto";
    card.innerHTML = `
      ${portada}
      <div class="proyecto-info">
        <h3>${escapar(p.title)}</h3>
        <p class="descripcion">${escapar(p.description)}</p>
        <div class="chips">${chips}</div>
        ${repo}
      </div>
      <div class="acciones">
        <button class="btn btn-borde" data-editar="${p._id}">Editar</button>
        <button class="btn btn-rojo" data-eliminar="${p._id}">Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

async function cargar() {
  try {
    const datos = await obtenerProyectos();
    proyectos = Array.isArray(datos) ? datos : [];
    pintar();
  } catch (error) {
    if ([400, 401, 403].includes(error.status)) {
      cerrarSesion();
    } else {
      mostrarAviso(error.message, true);
    }
  }
}

function abrirModal(proyecto) {
  formProyecto.reset();
  if (proyecto) {
    editandoId = proyecto._id;
    modalTitulo.textContent = "Editar proyecto";
    formProyecto.titulo.value = proyecto.title;
    formProyecto.descripcion.value = proyecto.description;
    formProyecto.tecnologias.value = (proyecto.technologies || []).join(", ");
    formProyecto.repositorio.value = proyecto.repository || "";
    formProyecto.imagenes.value = (proyecto.images || []).join(", ");
  } else {
    editandoId = null;
    modalTitulo.textContent = "Nuevo proyecto";
  }
  modal.classList.add("abierto");
}

function cerrarModal() {
  modal.classList.remove("abierto");
}

function separar(texto) {
  return texto
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t !== "");
}

formProyecto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const proyecto = {
    title: formProyecto.titulo.value.trim(),
    description: formProyecto.descripcion.value.trim(),
    userId: usuario.id,
    technologies: separar(formProyecto.tecnologias.value),
    images: separar(formProyecto.imagenes.value)
  };
  const repositorio = formProyecto.repositorio.value.trim();
  if (repositorio) {
    proyecto.repository = repositorio;
  }

  guardar.disabled = true;
  try {
    if (editandoId) {
      await actualizarProyecto(editandoId, proyecto);
      mostrarAviso("Proyecto actualizado");
    } else {
      await crearProyecto(proyecto);
      mostrarAviso("Proyecto agregado");
    }
    cerrarModal();
    await cargar();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
  guardar.disabled = false;
});

lista.addEventListener("click", async (e) => {
  const idEditar = e.target.dataset.editar;
  const idEliminar = e.target.dataset.eliminar;

  if (idEditar) {
    abrirModal(proyectos.find((p) => p._id === idEditar));
  }

  if (idEliminar && confirm("¿Seguro que quieres eliminar este proyecto?")) {
    try {
      await eliminarProyecto(idEliminar);
      mostrarAviso("Proyecto eliminado");
      await cargar();
    } catch (error) {
      mostrarAviso(error.message, true);
    }
  }
});

document.getElementById("btnAgregar").addEventListener("click", () => abrirModal());
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);
document.getElementById("btnSalir").addEventListener("click", cerrarSesion);
buscador.addEventListener("input", pintar);
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    cerrarModal();
  }
});

cargar();
