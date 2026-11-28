if (localStorage.getItem("authToken")) {
  location.replace("home.html");
}

const form = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");
const boton = form.querySelector("button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "";
  mensaje.className = "mensaje";
  boton.disabled = true;
  boton.textContent = "Entrando...";

  try {
    const data = await iniciarSesion(form.correo.value.trim(), form.clave.value);
    localStorage.setItem("authToken", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      localStorage.removeItem("user");
    }
    location.href = "home.html";
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje error";
    boton.disabled = false;
    boton.textContent = "Entrar";
  }
});
