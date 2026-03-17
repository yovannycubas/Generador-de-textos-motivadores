/**
 * MotivIA — main.js
 * Maneja la interacción del formulario, llamadas fetch() al backend,
 * y el renderizado dinámico del resultado o errores.
 */

// ── Referencias a elementos del DOM ──────────────────────────────────────────
const form            = document.getElementById("motivationForm");
const submitBtn       = document.getElementById("submitBtn");
const loadingState    = document.getElementById("loadingState");
const resultSection   = document.getElementById("resultSection");
const resultText      = document.getElementById("resultText");
const resultParams    = document.getElementById("resultParams");
const errorState      = document.getElementById("errorState");
const errorMessage    = document.getElementById("errorMessage");
const copyBtn         = document.getElementById("copyBtn");
const copyBtnText     = document.getElementById("copyBtnText");
const generateAgainBtn = document.getElementById("generateAgainBtn");
const dismissErrorBtn = document.getElementById("dismissErrorBtn");
const situacionInput  = document.getElementById("situacion");
const charCount       = document.getElementById("situacion-count");

// ── Contador de caracteres del textarea ──────────────────────────────────────
situacionInput.addEventListener("input", () => {
  const len = situacionInput.value.length;
  charCount.textContent = `${len} / 300`;
  charCount.className = "char-count";
  if (len >= 280) charCount.classList.add("limit");
  else if (len >= 230) charCount.classList.add("warn");
});

// ── Validación del formulario en el cliente ───────────────────────────────────
/**
 * Valida un campo y muestra/oculta su mensaje de error.
 * @param {string} fieldId - ID del input
 * @param {string} errorId - ID del span de error
 * @param {Function} check - Función que retorna un mensaje de error o "" si es válido
 * @returns {boolean}
 */
function validateField(fieldId, errorId, check) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  const msg = check(field.value.trim());
  if (msg) {
    field.classList.add("is-error");
    errorEl.textContent = msg;
    errorEl.classList.add("visible");
    return false;
  } else {
    field.classList.remove("is-error");
    errorEl.textContent = "";
    errorEl.classList.remove("visible");
    return true;
  }
}

function validateAll() {
  const v1 = validateField("nombre", "nombre-error", (v) => {
    if (!v) return "El nombre es obligatorio.";
    if (v.length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (v.length > 50) return "El nombre no puede superar los 50 caracteres.";
    return "";
  });
  const v2 = validateField("situacion", "situacion-error", (v) => {
    if (!v) return "La situación es obligatoria.";
    if (v.length < 10) return "Describe tu situación con al menos 10 caracteres.";
    if (v.length > 300) return "La situación no puede superar los 300 caracteres.";
    return "";
  });
  const v3 = validateField("tono", "tono-error", (v) => (!v ? "Elige un tono." : ""));
  const v4 = validateField("idioma", "idioma-error", (v) => (!v ? "Elige un idioma." : ""));
  const v5 = validateField("longitud", "longitud-error", (v) => (!v ? "Elige la extensión." : ""));

  return v1 && v2 && v3 && v4 && v5;
}

// Limpiar error al escribir/cambiar
["nombre", "situacion", "tono", "idioma", "longitud"].forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", () => {
    el.classList.remove("is-error");
    const errEl = document.getElementById(`${id}-error`);
    if (errEl) { errEl.textContent = ""; errEl.classList.remove("visible"); }
  });
  el.addEventListener("change", () => {
    el.classList.remove("is-error");
    const errEl = document.getElementById(`${id}-error`);
    if (errEl) { errEl.textContent = ""; errEl.classList.remove("visible"); }
  });
});

// ── Mostrar / ocultar secciones ───────────────────────────────────────────────
function showLoading() {
  loadingState.classList.remove("hidden");
  resultSection.classList.add("hidden");
  errorState.classList.add("hidden");
}

function showResult(data) {
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");

  // Texto principal
  resultText.textContent = data.texto_motivacional;

  // Chips de parámetros usados
  const params = data.parametros_usados;
  resultParams.innerHTML = "";
  if (params) {
    const labels = {
      nombre: "👤 Para",
      tono: "🎨 Tono",
      idioma: "🌐 Idioma",
      longitud: "📏 Extensión",
    };
    Object.entries(labels).forEach(([key, label]) => {
      if (params[key]) {
        const chip = document.createElement("span");
        chip.className = "param-chip";
        chip.innerHTML = `${label}: <strong>${params[key]}</strong>`;
        resultParams.appendChild(chip);
      }
    });
  }

  resultSection.classList.remove("hidden");

  // Scroll suave hacia el resultado
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function showError(msg) {
  loadingState.classList.add("hidden");
  resultSection.classList.add("hidden");
  errorMessage.textContent = msg;
  errorState.classList.remove("hidden");
}

function resetUI() {
  loadingState.classList.add("hidden");
  resultSection.classList.add("hidden");
  errorState.classList.add("hidden");
}

// ── Envío del formulario ──────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validar en cliente
  if (!validateAll()) return;

  // Deshabilitar botón y mostrar spinner
  submitBtn.disabled = true;
  showLoading();

  // Recoger datos
  const payload = {
    nombre:    document.getElementById("nombre").value.trim(),
    situacion: document.getElementById("situacion").value.trim(),
    tono:      document.getElementById("tono").value,
    idioma:    document.getElementById("idioma").value,
    longitud:  document.getElementById("longitud").value,
  };

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      showError(data.error || `Error del servidor (${response.status}). Intenta de nuevo.`);
    } else {
      showResult(data);
    }
  } catch (networkErr) {
    showError(
      "No se pudo conectar con el servidor. Verifica tu conexión y que el servidor Flask esté corriendo."
    );
  } finally {
    submitBtn.disabled = false;
  }
});

// ── Copiar al portapapeles ────────────────────────────────────────────────────
copyBtn.addEventListener("click", async () => {
  const texto = resultText.textContent;
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    copyBtn.classList.add("copied");
    copyBtnText.textContent = "¡Copiado!";
    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtnText.textContent = "Copiar";
    }, 2000);
  } catch {
    // Fallback para navegadores sin Clipboard API
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    copyBtnText.textContent = "¡Copiado!";
    setTimeout(() => { copyBtnText.textContent = "Copiar"; }, 2000);
  }
});

// ── Botón "Generar otro" ──────────────────────────────────────────────────────
generateAgainBtn.addEventListener("click", () => {
  resetUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("nombre").focus();
});

// ── Descartar error ───────────────────────────────────────────────────────────
dismissErrorBtn.addEventListener("click", () => {
  resetUI();
});
