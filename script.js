// URL de tu backend en Render
const BACKEND_URL = "https://visualmusic-backend-1.onrender.com";

// --- Preparación del canvas ---
const canvas = document.getElementById("canvas");
const ctx    = canvas.getContext("2d");
canvas.width  = window.innerWidth * 0.9;  // Coincide con el 90vw de CSS
canvas.height = window.innerHeight * 0.6; // Coincide con el 60vh de CSS

const instrumentoColor = {
  drums:  "#FF0055",
  bass:   "#66FF00",
  piano:  "#00D1FF",
  vocals: "#FFD700",
  other:  "#AAAAAA"
};

let notas       = [];
const activeNotas = [];
let tiempoInicio = null;

// Mapea pitch (40–90) a posición vertical
function pitchToY(pitch) {
  const [min, max] = [40, 90];
  const norm = (pitch - min) / (max - min);
  return canvas.height - norm * canvas.height;
}

// Loop de dibujo
function update() {
  if (!tiempoInicio) return;
  const now = performance.now()/1000 - tiempoInicio;
  // Fat semi-trasparente
  ctx.fillStyle = "rgba(248,247,242,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Activar notas según tiempo de inicio
  notas.forEach(n => {
    if (!n.activa && n.start <= now) {
      n.activa = true;
      n.x      = Math.random() * canvas.width;
      n.y      = pitchToY(n.pitch);
      n.size   = 10 + Math.random()*10;
      activeNotas.push(n);
    }
  });

  // Dibujar notas activas
  for (let i = activeNotas.length-1; i>=0; i--) {
    const n = activeNotas[i];
    const dur = n.end - n.start;
    const prog = (now - n.start)/dur;
    if (prog > 1) {
      activeNotas.splice(i,1);
      continue;
    }
    ctx.beginPath();
    ctx.fillStyle = instrumentoColor[n.instrument]||"#000";
    ctx.globalAlpha = 1 - prog;
    ctx.arc(n.x, n.y, n.size, 0, 2*Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(update);
}

// Inicia la animación con los datos recibidos
function iniciarVisualizacion(datos) {
  notas = datos.map(n => ({ ...n, activa: false }));
  tiempoInicio = performance.now()/1000;
  update();
}

// --- Manejo de fichero y botón ---

const fileInput  = document.getElementById("file-upload");
const btnSelect  = document.getElementById("btn-select");
const fileNameEl = document.getElementById("file-name");
const btnGen     = document.getElementById("generar");

// Abrir dialogo de selección
btnSelect.addEventListener("click", () => fileInput.click());
// Mostrar nombre
fileInput.addEventListener("change", () => {
  fileNameEl.textContent = fileInput.files[0]?.name || "Ningún archivo seleccionado";
});

// Al hacer clic en Generar
btnGen.addEventListener("click", async () => {
  const f = fileInput.files[0];
  if (!f) {
    alert("Por favor selecciona primero un archivo de audio.");
    return;
  }

  btnGen.disabled = true;
  btnGen.textContent = "Procesando...";

  const form = new FormData();
  form.append("audio", f);

  try {
    const resp = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: form
    });
    const json = await resp.json();
    if (!resp.ok) {
      alert("Error del backend: " + json.error);
    } else {
      iniciarVisualizacion(json);
    }
  } catch (err) {
    alert("Error al conectar con el backend.");
    console.error(err);
  } finally {
    btnGen.disabled = false;
    btnGen.textContent = "Generar Visualización";
  }
});
