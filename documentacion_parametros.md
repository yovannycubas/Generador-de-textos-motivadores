# Documentación de Parámetros — MotivIA

Esta tabla describe los parámetros de entrada y salida utilizados en la aplicación de generación de textos motivacionales.

| Parámetro | Tipo | E/S | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **nombre** | Texto libre | Entrada | Sí | Nombre del destinatario para personalizar el mensaje. |
| **situacion** | Texto libre | Entrada | Sí | Descripción del contexto o reto que enfrenta el usuario. |
| **tono** | Lista (select) | Entrada | Sí | Estilo emocional del texto (Inspirador, Enérgico, Sereno, Humorístico). |
| **idioma** | Lista (select) | Entrada | Sí | Idioma de la respuesta (Español, Inglés, Francés). |
| **longitud** | Lista (select) | Entrada | Sí | Extensión deseada del mensaje (Corto, Medio, Largo). |
| **texto_motivacional** | Texto (JSON) | Salida | — | El mensaje motivador generado por Gemini 2.5 Flash. |
| **parametros_usados** | Objeto (JSON) | Salida | — | Eco de los parámetros de entrada procesados para confirmación en la UI. |
| **error** | Texto | Salida | — | Mensaje informativo si ocurre un error de validación o fallo con la API. |
