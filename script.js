let contador = parseInt(localStorage.getItem("contador")) || 0;
let historialGuardado = JSON.parse(localStorage.getItem("historial")) || [];

const contadorEl = document.querySelector(".contador");
const historialEl = document.querySelector(".historial");
const logroEl = document.querySelector(".logro");
const btnSumar = document.getElementById("incrementar");
const btnReiniciar = document.getElementById("reiniciar");

// Sonidos
const clickSound = new Audio("sounds/click.mp3");
const logroSound = new Audio("sounds/logro.mp3");

// Mostrar contador al cargar
contadorEl.textContent = contador;

// Mostrar historial guardado
historialGuardado.forEach(texto => {
  const li = document.createElement("li");
  li.textContent = texto;
  historialEl.appendChild(li);
});

// Mostrar logro guardado
const logroGuardado = localStorage.getItem("logro");
if (logroGuardado) {
  logroEl.textContent = logroGuardado;
}

// Botón para sumar
btnSumar.addEventListener("click", () => {
  contador++;
  contadorEl.textContent = contador;
  clickSound.play();

  const texto = `Clic número ${contador}`;
  const li = document.createElement("li");
  li.textContent = texto;
  historialEl.appendChild(li);

  historialGuardado.push(texto);
  localStorage.setItem("contador", contador);
  localStorage.setItem("historial", JSON.stringify(historialGuardado));

  mostrarLogro(contador);
});

// Botón para reiniciar
btnReiniciar.addEventListener("click", () => {
  contador = 0;
  contadorEl.textContent = contador;
  historialEl.innerHTML = "";
  historialGuardado = [];

  logroEl.textContent = "";
  localStorage.removeItem("contador");
  localStorage.removeItem("historial");
  localStorage.removeItem("logro");
});

// Mostrar logros
function mostrarLogro(contador) {
  let logroTexto = "";

  if (contador === 10) {
    logroTexto = "🏅 ¡Primer logro: 10 clics!";
  } else if (contador === 25) {
    logroTexto = "🎖️ ¡Gran avance: 25 clics!";
  } else if (contador === 50) {
    logroTexto = "🏆 ¡Leyenda de los clics: 50!";
  }

  if (logroTexto) {
    logroEl.textContent = logroTexto;
    localStorage.setItem("logro", logroTexto);
    logroSound.play();
  }
}
