# MotivIA — Generador de Textos Motivacionales

Aplicación web que genera textos motivacionales personalizados usando **Google Gemini 2.5 Flash**. El usuario completa un formulario con su contexto y recibe un mensaje motivador adaptado a su situación, tono e idioma.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Python 3.9+, Flask 2.x/3.x |
| IA | google-genai (`gemini-2.5-flash`) |
| Frontend | HTML5, CSS3 (vanilla), JavaScript (vanilla) |
| Comunicación | `fetch()` / JSON |

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Crear archivo de entorno
copy .env.example .env
# Editar .env y agregar tu GEMINI_API_KEY real

# 3. Ejecutar el servidor
python app.py

# 4. Abrir en el navegador
# http://localhost:5000
```

---

## 4.1 Parámetros de Entrada

Datos que el usuario proporciona a través del formulario web. El frontend los envía al endpoint `POST /generate` como JSON.

| Parámetro | Tipo | Descripción | Validaciones | Uso en el Prompt |
|---|---|---|---|---|
| `nombre` | Texto libre | Nombre del destinatario del mensaje motivacional | Obligatorio · mín. 2 chars · máx. 50 chars | Se inserta como sujeto del texto: *"para una persona llamada {nombre}"* |
| `situacion` | Texto libre (textarea) | Contexto o situación actual que enfrenta el usuario | Obligatorio · mín. 10 chars · máx. 300 chars | Describe el contexto en el prompt: *"Situación que enfrenta: {situacion}"* |
| `tono` | Selección de lista | Tono del mensaje generado | Obligatorio · valores: `Inspirador`, `Enérgico`, `Sereno`, `Humorístico` | Instrucción de estilo: *"Tono: {tono}"* |
| `idioma` | Selección de lista | Idioma en que se redacta la respuesta | Obligatorio · valores: `Español`, `Inglés`, `Francés` | Instrucción de idioma: *"Idioma de la respuesta: {idioma}"* |
| `longitud` | Selección de lista | Extensión aproximada del texto generado | Obligatorio · valores: `Corto` (~50 palabras), `Medio` (~100), `Largo` (~200) | Define extensión objetivo: *"Extensión: aproximadamente {N} palabras"* |

---

## 4.2 Parámetros de Salida

Respuesta JSON que el endpoint `/generate` retorna al frontend.

### Formato de respuesta

```json
{
  "texto_motivacional": "string o null",
  "parametros_usados": {
    "nombre": "string",
    "situacion": "string",
    "tono": "string",
    "idioma": "string",
    "longitud": "string"
  },
  "error": "string o null"
}
```

### Campos esperados

| Campo | Tipo | Descripción |
|---|---|---|
| `texto_motivacional` | `string \| null` | Texto motivacional generado por Gemini. `null` si hubo error. |
| `parametros_usados` | `object \| null` | Eco de los inputs recibidos (para mostrar chips de contexto). `null` si error de validación. |
| `parametros_usados.nombre` | `string` | Nombre del destinatario usado en la generación |
| `parametros_usados.situacion` | `string` | Situación recibida |
| `parametros_usados.tono` | `string` | Tono aplicado |
| `parametros_usados.idioma` | `string` | Idioma de la respuesta |
| `parametros_usados.longitud` | `string` | Extensión solicitada |
| `error` | `string \| null` | Mensaje de error descriptivo, `null` en caso de éxito |

### Códigos HTTP

| Código | Significado |
|---|---|
| `200 OK` | Generación exitosa |
| `400 Bad Request` | Parámetros inválidos o faltantes |
| `500 Internal Server Error` | Error de API key o comunicación con Gemini |

### Presentación visual

- **Éxito**: El texto aparece en una tarjeta con glassmorphism y tipografía destacada. Se muestran chips con los parámetros usados y un botón para copiar al portapapeles.
- **Carga**: Spinner animado con mensaje *"La IA está construyendo tu mensaje…"*
- **Error**: Tarjeta roja con el mensaje del campo `error` y botón para reintentar.

---

## Estructura del proyecto

```
TextosMotivadores/
├── app.py                  # Backend Flask + Gemini
├── requirements.txt        # Dependencias Python
├── .env.example            # Plantilla de variables de entorno
├── .env                    # (local, no subir a git)
├── templates/
│   └── index.html          # Interfaz principal
└── static/
    ├── css/
    │   └── style.css       # Estilos premium dark mode
    └── js/
        └── main.js         # Lógica del formulario y fetch()
```
