let historial = JSON.parse(localStorage.getItem("historial")) || [];
let logrosDesbloqueados = JSON.parse(localStorage.getItem("logros")) || [];
let data = [];

const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const listaHistorial = document.getElementById("lista-historial");
const listaLogros = document.getElementById("lista-logros");
const listaNuevas = document.getElementById("lista-nuevas");
const botonBorrar = document.getElementById("borrar-todo");

// Sonidos
const sonidoClick = new Audio("sounds/click.mp3");
const sonidoLogro = new Audio("sounds/logro.mp3");

// Cargar preguntas/respuestas
fetch("preguntas_respuestas.json")
  .then(res => res.json())
  .then(json => data = json);

// Mostrar historial guardado
historial.forEach((item) => agregarMensaje(item, "user"));
actualizarListaHistorial();

// Mostrar logros guardados
logrosDesbloqueados.forEach((l) => agregarLogro(l));

// Escuchar envío del chat
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const pregunta = input.value.trim();
  if (!pregunta) return;

  agregarMensaje(pregunta, "user");
  historial.push(pregunta);
  localStorage.setItem("historial", JSON.stringify(historial));

  const respuesta = obtenerRespuesta(pregunta);
  setTimeout(() => agregarMensaje(respuesta, "bot"), 500);

  verificarLogros();
  sonidoClick.play();
  input.value = "";
});

// Borrar todo
botonBorrar.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  historial = [];
  logrosDesbloqueados = [];
  messagesEl.innerHTML = '<div class="bot-msg">Hola 👋 Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?</div>';
  listaHistorial.innerHTML = "";
  listaLogros.innerHTML = "";
});

// Obtener respuesta
function obtenerRespuesta(preguntaUsuario) {
  const preguntaNormalizada = preguntaUsuario.toLowerCase();

  for (let item of data) {
    if (preguntaNormalizada.includes(item.pregunta.toLowerCase())) {
      return item.respuesta;
    }
  }

  guardarPreguntaNoEncontrada(preguntaUsuario);
  return "No tengo una respuesta aún, pero pronto lo sabremos 😉.";
}

// Agregar mensaje al chat
function agregarMensaje(texto, tipo) {
  const div = document.createElement("div");
  div.className = tipo === "user" ? "user-msg" : "bot-msg";
  div.textContent = texto;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  if (tipo === "user") actualizarListaHistorial();
}

// Actualizar historial visual
function actualizarListaHistorial() {
  listaHistorial.innerHTML = "";
  historial.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    listaHistorial.appendChild(li);
  });
}

// Logros por cantidad de preguntas
function verificarLogros() {
  const logros = [
    { cantidad: 1, texto: "🎉 ¡Primer paso: hiciste tu primera pregunta!" },
    { cantidad: 5, texto: "🔥 ¡5 preguntas respondidas!" },
    { cantidad: 10, texto: "🚀 ¡Modo experto desbloqueado!" }
  ];

  logros.forEach((logro) => {
    if (historial.length === logro.cantidad && !logrosDesbloqueados.includes(logro.texto)) {
      agregarLogro(logro.texto);
      logrosDesbloqueados.push(logro.texto);
      localStorage.setItem("logros", JSON.stringify(logrosDesbloqueados));
      sonidoLogro.play();
    }
  });
}

// Mostrar logro
function agregarLogro(texto) {
  const li = document.createElement("li");
  li.textContent = texto;
  listaLogros.appendChild(li);
}

// Preguntas nuevas no reconocidas
function guardarPreguntaNoEncontrada(pregunta) {
  let nuevas = JSON.parse(localStorage.getItem("nuevasPreguntas")) || [];
  nuevas.push(pregunta);
  localStorage.setItem("nuevasPreguntas", JSON.stringify(nuevas));
}

// Mostrar preguntas nuevas
function mostrarPreguntasNuevas() {
  const nuevas = JSON.parse(localStorage.getItem("nuevasPreguntas")) || [];
  listaNuevas.innerHTML = "";
  nuevas.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    listaNuevas.appendChild(li);
  });
}
