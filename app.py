"""
Generador de Textos Motivacionales
===================================
Backend Flask que actúa como intermediario entre el frontend y la API de Google Gemini.

PARÁMETROS DE ENTRADA (recibidos por POST /generate como JSON):
  - nombre     (str): Nombre del destinatario. Obligatorio, 2-50 caracteres.
  - situacion  (str): Contexto o situación actual del usuario. Obligatorio, 10-300 caracteres.
  - tono       (str): Tono del mensaje. Valores permitidos: "Inspirador", "Enérgico", "Sereno", "Humorístico".
  - idioma     (str): Idioma de la respuesta. Valores permitidos: "Español", "Inglés", "Francés".
  - longitud   (str): Extensión deseada. Valores permitidos: "Corto", "Medio", "Largo".

PARÁMETROS DE SALIDA (JSON retornado al frontend):
  - texto_motivacional (str | null): Texto generado por Gemini. Null si hubo error.
  - parametros_usados  (dict | null): Eco de los inputs recibidos. Null si hubo error de validación.
  - error              (str | null): Mensaje de error si ocurrió uno, null en caso de éxito.
"""

import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

# Carga variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Constantes de validación
# ---------------------------------------------------------------------------
TONOS_VALIDOS = ["Inspirador", "Enérgico", "Sereno", "Humorístico"]
IDIOMAS_VALIDOS = ["Español", "Inglés", "Francés"]
LONGITUDES_VALIDAS = {
    "Corto": "aproximadamente 50 palabras",
    "Medio": "aproximadamente 100 palabras",
    "Largo": "aproximadamente 200 palabras",
}

# ---------------------------------------------------------------------------
# Cliente Gemini
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def get_gemini_client():
    """Crea y retorna un cliente de Gemini con la API key del entorno."""
    if not GEMINI_API_KEY:
        raise EnvironmentError(
            "GEMINI_API_KEY no está configurada. "
            "Crea un archivo .env con tu clave API."
        )
    return genai.Client(api_key=GEMINI_API_KEY)


# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Sirve la página principal de la aplicación."""
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """
    Endpoint principal de generación de texto motivacional.

    Recibe: JSON con los parámetros del formulario.
    Retorna: JSON con el texto generado o un mensaje de error.
    """
    data = request.get_json(silent=True)

    # --- 1. Validar que se recibió JSON ---
    if not data:
        return jsonify({
            "texto_motivacional": None,
            "parametros_usados": None,
            "error": "No se recibieron datos JSON en la solicitud."
        }), 400

    # --- 2. Extraer parámetros ---
    nombre    = str(data.get("nombre", "")).strip()
    situacion = str(data.get("situacion", "")).strip()
    tono      = str(data.get("tono", "")).strip()
    idioma    = str(data.get("idioma", "")).strip()
    longitud  = str(data.get("longitud", "")).strip()

    # --- 3. Validaciones de cada parámetro ---
    errores = []

    # Nombre: obligatorio, 2-50 caracteres
    if not nombre:
        errores.append("El campo 'nombre' es obligatorio.")
    elif len(nombre) < 2:
        errores.append("El 'nombre' debe tener al menos 2 caracteres.")
    elif len(nombre) > 50:
        errores.append("El 'nombre' no puede superar los 50 caracteres.")

    # Situación: obligatoria, 10-300 caracteres
    if not situacion:
        errores.append("El campo 'situación' es obligatorio.")
    elif len(situacion) < 10:
        errores.append("La 'situación' debe tener al menos 10 caracteres.")
    elif len(situacion) > 300:
        errores.append("La 'situación' no puede superar los 300 caracteres.")

    # Tono: debe ser uno de los valores permitidos
    if tono not in TONOS_VALIDOS:
        errores.append(f"El 'tono' debe ser uno de: {', '.join(TONOS_VALIDOS)}.")

    # Idioma: debe ser uno de los valores permitidos
    if idioma not in IDIOMAS_VALIDOS:
        errores.append(f"El 'idioma' debe ser uno de: {', '.join(IDIOMAS_VALIDOS)}.")

    # Longitud: debe ser uno de los valores permitidos
    if longitud not in LONGITUDES_VALIDAS:
        errores.append(f"La 'longitud' debe ser uno de: {', '.join(LONGITUDES_VALIDAS.keys())}.")

    if errores:
        return jsonify({
            "texto_motivacional": None,
            "parametros_usados": None,
            "error": " | ".join(errores)
        }), 400

    # --- 4. Construir el prompt para Gemini ---
    extension_desc = LONGITUDES_VALIDAS[longitud]

    prompt = (
        f"Eres un coach motivacional experto. Tu tarea es escribir un texto motivacional "
        f"personalizado para una persona llamada {nombre}.\n\n"
        f"Situación o contexto que enfrenta: {situacion}\n\n"
        f"Instrucciones de estilo:\n"
        f"- Tono: {tono}\n"
        f"- Idioma de la respuesta: {idioma}\n"
        f"- Extensión: {extension_desc}\n\n"
        f"Escribe únicamente el texto motivacional, sin introducciones, sin explicaciones "
        f"adicionales, sin comillas ni encabezados. Solo el mensaje directo para {nombre}."
    )

    # --- 5. Llamar a la API de Gemini ---
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        texto_generado = response.text.strip()

    except EnvironmentError as env_err:
        return jsonify({
            "texto_motivacional": None,
            "parametros_usados": None,
            "error": str(env_err)
        }), 500

    except Exception as api_err:
        return jsonify({
            "texto_motivacional": None,
            "parametros_usados": None,
            "error": f"Error al comunicarse con la API de Gemini: {str(api_err)}"
        }), 500

    # --- 6. Retornar resultado exitoso ---
    parametros_usados = {
        "nombre": nombre,
        "situacion": situacion,
        "tono": tono,
        "idioma": idioma,
        "longitud": longitud,
    }

    return jsonify({
        "texto_motivacional": texto_generado,
        "parametros_usados": parametros_usados,
        "error": None
    }), 200


# ---------------------------------------------------------------------------
# Punto de entrada
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
