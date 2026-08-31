# Generador de Planilla de Asistencia

Página web estática para generar, completar e imprimir una **planilla mensual de asistencia y registro de horarios**. Sirve como **formato referencial** de constancia de asistencia — no es un sistema oficial de control laboral ni reemplaza a los registros biométricos o institucionales.

## ¿Qué hace?

- Genera automáticamente los días de un mes/año elegidos, con su día de la semana correcto (calcula bisiestos y longitud de mes con `Date` nativo de JavaScript).
- Permite indicar un **horario establecido** (entrada/salida) que se usa para pre-llenar cada fila, y diferenciarlo claramente de la **marcación real** registrada, que el usuario introduce a mano.
- **Días a incluir:** puedes elegir qué días de la semana aparecen en la planilla (por ejemplo, excluir sábados y domingos, incluir solo sábado, o incluir todos los días). Hay tres botones rápidos (Lunes a viernes / Lunes a sábado / Todos los días) y también puedes marcar/desmarcar cada día individualmente — útil si un mes puntual hubo ingresos autorizados en sábado o domingo.
- **Rango de días del mes:** si el registro no cubre el mes completo (por ejemplo, un pasante que empezó el día 20), puedes indicar "Desde el día" y "Hasta el día"; si se dejan vacíos, se genera el mes completo.
- Cada día tiene una columna de **observación**, con opciones comunes (feriado, permiso de jornada completa, permiso de media jornada, ingreso/salida con permiso, "no hubo registro de marcación", "sin observación") y una opción **"Otra…"** para texto libre.
- Nunca asume que la ausencia de marcación significa inasistencia: la observación siempre queda a criterio del usuario.
- Incluye campos genéricos y vacíos para institución, nombre del pasante y C.I. — nada viene precargado.
- **Guía visual solo en pantalla:** los campos para completar (Institución, datos del pasante, mes/año, horario) tienen un resaltado suave y algunos llevan un asterisco de guía; ambos desaparecen automáticamente al imprimir o guardar como PDF, dejando solo el texto limpio. Lo mismo ocurre con la nota de ayuda bajo "Horario establecido".
- **Tamaño de papel:** selector en la barra de herramientas (A4 / Carta / Legal) que ajusta el `@page` de impresión antes de abrir el diálogo del navegador. El navegador respeta esto como sugerencia de tamaño en la vista previa, pero el tamaño final y el destino ("Guardar como PDF", una impresora física, etc.) siempre se eligen en el propio diálogo de impresión del navegador.
- Botón para **imprimir / guardar como PDF** (usa el diálogo de impresión del navegador) y botón para **limpiar** todos los datos (con confirmación previa).

## Qué se eliminó a propósito

Por ser un formato general, esta versión **no incluye** una sección de firma/responsable ni de lugar y fecha (nombre del responsable, cargo, institución repetida, "firma y sello", lugar de emisión). Si tu caso de uso sí necesita una firma física, puedes añadir esa sección editando `index.html` y `styles.css`, o pedir que se vuelva a incorporar.

## Qué NO hace

- No usa backend, base de datos, PHP, Python ni frameworks.
- No guarda información en ningún servidor ni servicio externo.
- No genera ni inventa marcaciones: siempre deben introducirse manualmente a partir de los registros reales de la institución.
- No certifica ni otorga validez legal u oficial al documento generado; es solo un formato de referencia.

## Estructura del proyecto

```
planilla-asistencia/
│
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
└── README.md
```

## Cómo usarlo

1. Abre `index.html` en el navegador (o publícalo con GitHub Pages, ver abajo).
2. Completa institución, datos del pasante, mes, año y horario establecido.
3. Presiona **"Generar planilla"** para crear las filas del mes seleccionado.
4. Completa manualmente las marcaciones reales y ajusta las observaciones donde corresponda.
5. Completa lugar, fecha y datos del responsable.
6. Presiona **"🖨 Imprimir planilla"** para imprimir o guardar como PDF desde el navegador.
7. Usa **"Limpiar formulario"** si quieres empezar de nuevo (pedirá confirmación antes de borrar todo).

## Cómo ejecutarlo localmente

No requiere instalación ni dependencias. Basta con abrir `index.html` directamente en un navegador, o servirlo con cualquier servidor estático simple, por ejemplo:

```bash
# Con Python
python3 -m http.server 8000

# Con Node (usando el paquete "serve")
npx serve .
```

Luego visita `http://localhost:8000` (o el puerto que corresponda).

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta (`index.html`, `assets/`, `README.md`) a la rama principal (por ejemplo `main`).
2. En el repositorio, ve a **Settings → Pages**.
3. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
4. Guarda los cambios. GitHub generará una URL pública, normalmente con el formato:
   `https://<tu-usuario>.github.io/<nombre-del-repositorio>/`
5. Una vez publicada, puedes generar un código QR que apunte a esa URL para facilitar el acceso al formato digital (esta versión no incluye un QR precargado porque la URL solo existe después de publicar).

## Privacidad

Todos los datos introducidos (nombres, C.I., horarios, observaciones, etc.) permanecen únicamente en el navegador del usuario mientras la página está abierta. No se envían a ningún servidor, API ni base de datos. Al cerrar o recargar la página, o al presionar "Limpiar formulario", los datos se pierden — si necesitas conservarlos, imprímelos o guárdalos como PDF antes de cerrar.

## Aviso

Este proyecto es un **formato referencial de constancia de asistencia y registro de horarios**. La validez oficial de cualquier registro de asistencia debe ser confirmada por la institución correspondiente; esta herramienta no sustituye los sistemas oficiales de control de asistencia.
