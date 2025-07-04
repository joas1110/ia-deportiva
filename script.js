let perfilActual = "invitado";
let data = [];

const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const listaHistorial = document.getElementById("lista-historial");
const listaLogros = document.getElementById("lista-logros");
const listaNuevas = document.getElementById("lista-nuevas");
const preguntasDisponibles = document.getElementById("preguntas-disponibles");
const botonBorrar = document.getElementById("borrar-todo");
const selectorPerfil = document.getElementById("perfil");

const sonidoClick = new Audio("sounds/click.mp3");
const sonidoLogro = new Audio("sounds/logro.mp3");

fetch("preguntas_respuestas.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    mostrarPreguntasDisponibles();
  });

function cargarDatos() {
  const historial = JSON.parse(localStorage.getItem("historial_" + perfilActual)) || [];
  const logros = JSON.parse(localStorage.getItem("logros_" + perfilActual)) || [];

  messagesEl.innerHTML = '<div class="bot-msg">Hola 👋 Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?</div>';
  listaHistorial.innerHTML = "";
  listaLogros.innerHTML = "";

  historial.forEach(p => agregarMensaje(p, "user"));
  logros.forEach(l => agregarLogro(l));
  actualizarListaHistorial(historial);
}

function guardarHistorial(historial) {
  localStorage.setItem("historial_" + perfilActual, JSON.stringify(historial));
}

function guardarLogros(logros) {
  localStorage.setItem("logros_" + perfilActual, JSON.stringify(logros));
}

chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const pregunta = input.value.trim();
  if (!pregunta) return;

  let historial = JSON.parse(localStorage.getItem("historial_" + perfilActual)) || [];
  agregarMensaje(pregunta, "user");
  historial.push(pregunta);
  guardarHistorial(historial);

  const respuesta = obtenerRespuesta(pregunta);
  setTimeout(() => agregarMensaje(respuesta, "bot"), 500);

  verificarLogros(historial);
  sonidoClick.play();
  input.value = "";
});

botonBorrar.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("historial_" + perfilActual);
  localStorage.removeItem("logros_" + perfilActual);
  messagesEl.innerHTML = '<div class="bot-msg">Hola 👋 Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?</div>';
  listaHistorial.innerHTML = "";
  listaLogros.innerHTML = "";
});

function obtenerRespuesta(preguntaUsuario) {
  const preguntaNormalizada = preguntaUsuario.toLowerCase();
  for (let item of data) {
    if (preguntaNormalizada.includes(item.pregunta.toLowerCase())) {
      const respuestas = item.respuestas;
      return respuestas[Math.floor(Math.random() * respuestas.length)];
    }
  }
  guardarPreguntaNoEncontrada(preguntaUsuario);
  return "No tengo una respuesta aún, pero pronto lo sabremos 😉.";
}

function agregarMensaje(texto, tipo) {
  const div = document.createElement("div");
  div.className = tipo === "user" ? "user-msg" : "bot-msg";
  div.textContent = texto;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function actualizarListaHistorial(historial) {
  listaHistorial.innerHTML = "";
  historial.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    listaHistorial.appendChild(li);
  });
}

function verificarLogros(historial) {
  const logros = [
    { cantidad: 1, texto: "🎉 ¡Primer paso: hiciste tu primera pregunta!" },
    { cantidad: 5, texto: "🔥 ¡5 preguntas respondidas!" },
    { cantidad: 10, texto: "🚀 ¡Modo experto desbloqueado!" }
  ];
  let desbloqueados = JSON.parse(localStorage.getItem("logros_" + perfilActual)) || [];
  logros.forEach((logro) => {
    if (historial.length === logro.cantidad && !desbloqueados.includes(logro.texto)) {
      agregarLogro(logro.texto);
      desbloqueados.push(logro.texto);
      guardarLogros(desbloqueados);
      sonidoLogro.play();
    }
  });
}

function agregarLogro(texto) {
  const li = document.createElement("li");
  li.textContent = texto;
  listaLogros.appendChild(li);
}

function guardarPreguntaNoEncontrada(pregunta) {
  let nuevas = JSON.parse(localStorage.getItem("nuevasPreguntas")) || [];
  nuevas.push(pregunta);
  localStorage.setItem("nuevasPreguntas", JSON.stringify(nuevas));
}

function mostrarPreguntasNuevas() {
  const nuevas = JSON.parse(localStorage.getItem("nuevasPreguntas")) || [];
  listaNuevas.innerHTML = "";
  nuevas.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    listaNuevas.appendChild(li);
  });
}

function mostrarPreguntasDisponibles() {
  preguntasDisponibles.innerHTML = "<h4>📚 Preguntas que podés hacer:</h4><ul>";
  data.forEach((item) => {
    preguntasDisponibles.innerHTML += `<li>${item.pregunta}</li>`;
  });
  preguntasDisponibles.innerHTML += "</ul>";
}

document.getElementById("chat-form").addEventListener("click", function (e) {
  if (e.target && e.target.id === "ver-nuevas") mostrarPreguntasNuevas();
  if (e.target && e.target.id === "ver-disponibles") mostrarPreguntasDisponibles();
});

selectorPerfil.addEventListener("change", () => {
  if (selectorPerfil.value === "nuevo") {
    const nuevoNombre = prompt("Ingresá un nombre para tu nuevo perfil:");
    if (nuevoNombre) {
      const option = document.createElement("option");
      option.text = nuevoNombre;
      option.value = nuevoNombre;
      selectorPerfil.add(option);
      selectorPerfil.value = nuevoNombre;
      perfilActual = nuevoNombre;
      cargarDatos();
    } else {
      selectorPerfil.value = perfilActual;
    }
  } else {
    perfilActual = selectorPerfil.value;
    cargarDatos();
  }
});

window.onload = () => {
  perfilActual = selectorPerfil.value || "invitado";
  cargarDatos();
};
