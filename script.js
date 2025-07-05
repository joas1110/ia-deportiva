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

// Cargar preguntas al iniciar
fetch("preguntas_respuestas.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    mostrarPreguntasDisponibles();
  });

window.onload = () => {
  perfilActual = selectorPerfil.value || "invitado";
  cargarDatos();
};

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
    } else {
      selectorPerfil.value = perfilActual;
    }
  } else {
    perfilActual = selectorPerfil.value;
  }
  cargarDatos();
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
  const preguntaNormalizada = preguntaUsuario.toLowerCase().trim();
  let mejorCoincidencia = null;
  let maxCoincidencia = 0;

  for (let item of data) {
    const preguntaBD = item.pregunta.toLowerCase().trim();

    // Nivel de coincidencia por palabras comunes
    const palabrasUsuario = preguntaNormalizada.split(" ");
    const palabrasBD = preguntaBD.split(" ");
    const coincidencias = palabrasUsuario.filter(palabra => palabrasBD.includes(palabra)).length;

    if (coincidencias > maxCoincidencia) {
      maxCoincidencia = coincidencias;
      mejorCoincidencia = item;
    }

    if (preguntaNormalizada === preguntaBD) {
      mejorCoincidencia = item;
      break;
    }
  }

  if (mejorCoincidencia) {
    const respuestas = mejorCoincidencia.respuestas;
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  }

  guardarPreguntaNoEncontrada(preguntaUsuario);
  return "No tengo una respuesta aún, pero pronto lo sabremos 😉.";
}

function guardarPreguntaNoEncontrada(pregunta) {
  let nuevas = JSON.parse(localStorage.getItem("nuevasPreguntas")) || [];
  nuevas.push(pregunta);
  localStorage.setItem("nuevasPreguntas", JSON.stringify(nuevas));
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
  historial.forEach(p => {
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

  logros.forEach(logro => {
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

function guardarHistorial(historial) {
  localStorage.setItem("historial_" + perfilActual, JSON.stringify(historial));
}

function guardarLogros(logros) {
  localStorage.setItem("logros_" + perfilActual, JSON.stringify(logros));
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
  preguntasDisponibles.innerHTML = "<h4>📚 Preguntas que podés hacer:</h4>";
  const ul = document.createElement("ul");

  data.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.pregunta;
    li.classList.add("pregunta-clickable");
    li.addEventListener("click", () => {
      input.value = item.pregunta;
      input.focus();
    });
    ul.appendChild(li);
  });

  preguntasDisponibles.appendChild(ul);
}

// Eventos botones
document.getElementById("ver-nuevas").addEventListener("click", mostrarPreguntasNuevas);
document.getElementById("ver-disponibles").addEventListener("click", mostrarPreguntasDisponibles);
