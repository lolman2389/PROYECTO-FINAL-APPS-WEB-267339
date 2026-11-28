if (localStorage.getItem("authToken")) {
  location.replace("home.html");
}

const form = document.getElementById("formRegister");
const mensaje = document.getElementById("mensaje");
const boton = form.querySelector("button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "";
  mensaje.className = "mensaje";
  boton.disabled = true;
  boton.textContent = "Creando cuenta...";

  const usuario = {
    name: form.nombre.value.trim(),
    email: form.correo.value.trim(),
    itsonId: form.itsonId.value.trim(),
    password: form.clave.value
  };

  try {
    await registrarUsuario(usuario);
    mensaje.textContent = "Cuenta creada, te llevamos al login...";
    mensaje.className = "mensaje ok";
    setTimeout(() => {
      location.href = "login.html";
    }, 1500);
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje error";
    boton.disabled = false;
    boton.textContent = "Crear cuenta";
  }
});
