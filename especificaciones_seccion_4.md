# Especificaciones Técnico-Funcionales: MotivIA

Este documento detalla los parámetros de entrada y salida de la aplicación, cumpliendo con los requisitos de documentación de la Sección 4.

---

## 4.1 TABLA DE PARÁMETROS DE ENTRADA
Datos proporcionados por el usuario a través del formulario web para la generación del contenido.

| Nombre del parámetro | Tipo de dato | Obligatorio | Rango / Validaciones | Función / Uso en el prompt |
| :--- | :--- | :--- | :--- | :--- |
| **nombre** | Texto libre | Sí | 2 a 50 caracteres | Identifica al destinatario. Se usa en el prompt como: *"redacta para una persona llamada {nombre}"*. |
| **situacion** | Texto libre (textarea) | Sí | 10 a 300 caracteres | Contexto del usuario. Se usa en el prompt como: *"Situación que enfrenta: {situacion}"*. |
| **tono** | Selección (Lista) | Sí | Inspirador, Enérgico, Sereno, Humorístico | Define el estilo. Se instruye a la IA: *"Usa un tono {tono}"*. |
| **idioma** | Selección (Lista) | Sí | Español, Inglés, Francés | Determina el idioma de salida directo de la IA. |
| **longitud** | Selección (Lista) | Sí | Corto, Medio, Largo | Define la meta de extensión (aprox. 50, 100 o 200 palabras). |

---

## 4.2 TABLA DE PARÁMETROS DE SALIDA
Datos devueltos por el servidor (backend) y presentados visualmente al usuario.

| Nombre del campo | Tipo | Formato | Descripción y Presentación Visual |
| :--- | :--- | :--- | :--- |
| **texto_motivacional** | String | Texto Plano (vía JSON) | El mensaje generado por Gemini. Se presenta dentro de una tarjeta con diseño glassmorphism y tipografía display. |
| **parametros_usados** | Object | JSON Estructurado | Objeto con los datos procesados. Se presentan como "chips" informativos debajo del texto generado. |
| **error** | String | Texto Plano (vía JSON) | Mensaje de error técnico o de validación. Se presenta en una tarjeta de alerta con fondo rojo si la solicitud falla. |

---

### Notas Técnicas Adicionales
- **Comunicación:** La transferencia se realiza mediante peticiones `POST` asíncronas (`fetch`) con cuerpo en formato JSON.
- **Manejo de Errores:** En caso de error de red o de la API de Gemini, la aplicación captura la excepción y muestra el parámetro `error` para informar al usuario sin romper la interfaz.
