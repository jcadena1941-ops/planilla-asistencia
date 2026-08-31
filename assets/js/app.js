/* =========================================================
   Generador de Planilla de Asistencia — lógica
   Sin backend. Todo ocurre en el navegador del usuario.
   ========================================================= */

(function () {
  "use strict";

  // ---------------------------------------------------------------
  // Datos de referencia (solo para cálculo, no son valores por defecto
  // de ningún campo del usuario)
  // ---------------------------------------------------------------
  const NOMBRES_DIAS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // Tamaños de página soportados por el selector "Tamaño de papel".
  // Los valores coinciden con las palabras clave que entiende CSS @page.
  const TAMANIOS_PAPEL = {
    A4: "A4",
    Letter: "letter",
    Legal: "legal",
  };

  // ---------------------------------------------------------------
  // Referencias al DOM
  // ---------------------------------------------------------------
  const el = {
    btnGenerar: document.getElementById("btnGenerar"),
    btnLimpiar: document.getElementById("btnLimpiar"),
    btnImprimir: document.getElementById("btnImprimir"),
    mensaje: document.getElementById("mensaje"),

    mes: document.getElementById("mes"),
    anio: document.getElementById("anio"),
    horarioEntradaGlobal: document.getElementById("horarioEntradaGlobal"),
    horarioSalidaGlobal: document.getElementById("horarioSalidaGlobal"),

    diaDesde: document.getElementById("diaDesde"),
    diaHasta: document.getElementById("diaHasta"),

    cuerpoTabla: document.getElementById("cuerpoTabla"),
    plantillaObservacion: document.getElementById("plantillaObservacion"),

    hoja: document.getElementById("hoja"),

    tamanioPapel: document.getElementById("tamanioPapel"),
    estiloPagina: document.getElementById("estiloPagina"),
  };

  const checksDia = document.querySelectorAll(".check-dia");
  const botonesPreset = document.querySelectorAll(".chip");

  // ---------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------

  function pad2(numero) {
    return String(numero).padStart(2, "0");
  }

  function mostrarMensaje(texto, tipo) {
    el.mensaje.textContent = texto;
    el.mensaje.classList.remove("error", "exito");
    if (tipo) {
      el.mensaje.classList.add(tipo);
    }
    if (texto) {
      window.clearTimeout(mostrarMensaje._t);
      mostrarMensaje._t = window.setTimeout(() => {
        el.mensaje.textContent = "";
        el.mensaje.classList.remove("error", "exito");
      }, 6000);
    }
  }

  function horaEsValida(valor) {
    if (valor === "" || valor == null) return true; // vacío es aceptable
    return REGEX_HORA.test(valor.trim());
  }

  // Calcula cuántos días tiene un mes, respetando años bisiestos.
  // Usamos el "día 0 del mes siguiente", que JavaScript resuelve
  // automáticamente como el último día del mes buscado.
  function diasEnMes(anio, mesIndex) {
    return new Date(anio, mesIndex + 1, 0).getDate();
  }

  function diasSemanaIncluidos() {
    const seleccionados = new Set();
    checksDia.forEach((chk) => {
      if (chk.checked) seleccionados.add(parseInt(chk.value, 10));
    });
    return seleccionados;
  }

  // ---------------------------------------------------------------
  // Días a incluir: botones de preselección
  // ---------------------------------------------------------------

  function aplicarPreset(preset) {
    checksDia.forEach((chk) => {
      const valor = parseInt(chk.value, 10); // 0=domingo ... 6=sábado
      if (preset === "laboral") {
        chk.checked = valor >= 1 && valor <= 5;
      } else if (preset === "sabado") {
        chk.checked = valor !== 0;
      } else if (preset === "todos") {
        chk.checked = true;
      }
    });
  }

  // ---------------------------------------------------------------
  // Tamaño de papel para impresión
  // ---------------------------------------------------------------

  function actualizarEstiloPagina() {
    const clave = el.tamanioPapel.value;
    const tamanio = TAMANIOS_PAPEL[clave] || "A4";
    el.estiloPagina.textContent =
      "@page { size: " + tamanio + " portrait; margin: 14mm 12mm; }";
  }

  // ---------------------------------------------------------------
  // Construcción de una fila de la tabla
  // ---------------------------------------------------------------

  function crearFila(anio, mesIndex, dia, horarioEntrada, horarioSalida) {
    const fecha = new Date(anio, mesIndex, dia);
    const nombreDia = NOMBRES_DIAS[fecha.getDay()];
    const textoFecha = `${pad2(dia)}/${pad2(mesIndex + 1)}/${anio} – ${nombreDia}`;

    const fila = document.createElement("tr");

    // Fecha (no editable: se calcula automáticamente)
    const tdFecha = document.createElement("td");
    tdFecha.className = "celda-fecha";
    tdFecha.textContent = textoFecha;
    fila.appendChild(tdFecha);

    // Horario de entrada (editable, pre-llenado con el horario establecido)
    fila.appendChild(crearCeldaInput(horarioEntrada, "Horario de entrada"));

    // Marcación de entrada (siempre vacía; la introduce el usuario)
    fila.appendChild(crearCeldaInput("", "Marcación de entrada"));

    // Horario de salida (editable, pre-llenado)
    fila.appendChild(crearCeldaInput(horarioSalida, "Horario de salida"));

    // Marcación de salida (siempre vacía)
    fila.appendChild(crearCeldaInput("", "Marcación de salida"));

    // Observación (select + campo "otra")
    fila.appendChild(crearCeldaObservacion());

    return fila;
  }

  function crearCeldaInput(valorInicial, etiquetaAccesible) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.value = valorInicial || "";
    input.setAttribute("aria-label", etiquetaAccesible);
    input.placeholder = "HH:MM";

    input.addEventListener("blur", function () {
      if (!horaEsValida(input.value)) {
        input.style.outline = "1px solid #b3261e";
        mostrarMensaje(
          "Revisa el formato de hora (HH:MM) en una de las celdas.",
          "error"
        );
      } else {
        input.style.outline = "";
      }
    });

    td.appendChild(input);
    return td;
  }

  function crearCeldaObservacion() {
    const td = document.createElement("td");
    td.className = "celda-observacion";

    const fragmento = el.plantillaObservacion.content.cloneNode(true);
    const select = fragmento.querySelector(".select-observacion");
    const inputOtra = fragmento.querySelector(".input-observacion-otra");

    select.value = "Sin observación";

    select.addEventListener("change", function () {
      if (select.value === "__otra__") {
        inputOtra.classList.remove("oculto");
        inputOtra.focus();
      } else {
        inputOtra.classList.add("oculto");
        inputOtra.value = "";
      }
    });

    td.appendChild(select);
    td.appendChild(inputOtra);
    return td;
  }

  // ---------------------------------------------------------------
  // Acción: Generar planilla
  // ---------------------------------------------------------------

  function generarPlanilla() {
    const mesValor = el.mes.value;
    const anioValor = el.anio.value;

    if (mesValor === "" || anioValor === "") {
      mostrarMensaje("Selecciona el mes y el año antes de generar la planilla.", "error");
      return;
    }

    const mesIndex = parseInt(mesValor, 10);
    const anio = parseInt(anioValor, 10);

    if (Number.isNaN(anio) || anio < 1900 || anio > 2100) {
      mostrarMensaje("Introduce un año válido.", "error");
      return;
    }

    const horarioEntrada = el.horarioEntradaGlobal.value.trim();
    const horarioSalida = el.horarioSalidaGlobal.value.trim();

    if (!horaEsValida(horarioEntrada) || !horaEsValida(horarioSalida)) {
      mostrarMensaje(
        "El horario establecido debe tener formato HH:MM (o dejarse vacío).",
        "error"
      );
      return;
    }

    const totalDias = diasEnMes(anio, mesIndex);

    // Rango de días dentro del mes (para meses en los que el registro
    // no cubre el mes completo, por ejemplo un ingreso a mitad de mes).
    let inicio = el.diaDesde.value === "" ? 1 : parseInt(el.diaDesde.value, 10);
    let fin = el.diaHasta.value === "" ? totalDias : parseInt(el.diaHasta.value, 10);

    if (Number.isNaN(inicio) || inicio < 1) inicio = 1;
    if (Number.isNaN(fin) || fin > totalDias) fin = totalDias;

    if (inicio > totalDias || fin < 1 || inicio > fin) {
      mostrarMensaje(
        `El rango de días no es válido para ese mes (tiene ${totalDias} días).`,
        "error"
      );
      return;
    }

    const semanaIncluida = diasSemanaIncluidos();
    if (semanaIncluida.size === 0) {
      mostrarMensaje("Selecciona al menos un día de la semana para incluir.", "error");
      return;
    }

    // Limpiar tabla actual
    el.cuerpoTabla.innerHTML = "";

    const fragmentoTabla = document.createDocumentFragment();
    let filasGeneradas = 0;

    for (let dia = inicio; dia <= fin; dia++) {
      const diaSemana = new Date(anio, mesIndex, dia).getDay();
      if (!semanaIncluida.has(diaSemana)) continue; // día excluido por el filtro
      fragmentoTabla.appendChild(
        crearFila(anio, mesIndex, dia, horarioEntrada, horarioSalida)
      );
      filasGeneradas++;
    }

    if (filasGeneradas === 0) {
      el.cuerpoTabla.innerHTML =
        '<tr class="fila-vacia"><td colspan="6">Ningún día del rango elegido coincide con los días de la semana seleccionados.</td></tr>';
      mostrarMensaje("No se generó ninguna fila con esta configuración.", "error");
      return;
    }

    el.cuerpoTabla.appendChild(fragmentoTabla);
    mostrarMensaje(`Planilla generada: ${filasGeneradas} día(s).`, "exito");
  }

  // ---------------------------------------------------------------
  // Acción: Limpiar formulario
  // ---------------------------------------------------------------

  function limpiarFormulario() {
    const confirmado = window.confirm(
      "¿Está seguro de que desea limpiar todos los datos?"
    );
    if (!confirmado) return;

    // Restablecer todos los inputs, selects y textareas de la hoja
    const campos = el.hoja.querySelectorAll("input, select, textarea");
    campos.forEach((campo) => {
      if (campo.type === "checkbox") {
        return; // los checkboxes de días se restablecen aparte
      }
      if (campo.tagName === "SELECT") {
        campo.selectedIndex = 0;
      } else {
        campo.value = "";
      }
    });

    // Restablecer los días de la semana a su configuración inicial (L-V)
    aplicarPreset("laboral");

    // Restaurar la tabla a su estado inicial (vacío)
    el.cuerpoTabla.innerHTML =
      '<tr class="fila-vacia" id="filaVacia"><td colspan="6">Selecciona el mes y el año, ajusta los días a incluir si hace falta, y presiona "Generar planilla".</td></tr>';

    mostrarMensaje("Formulario limpiado.", "exito");
  }

  // ---------------------------------------------------------------
  // Acción: Imprimir
  // ---------------------------------------------------------------

  function imprimirPlanilla() {
    actualizarEstiloPagina(); // por si el usuario cambió el tamaño y no disparó "change"
    window.print();
  }

  // ---------------------------------------------------------------
  // Inicialización
  // ---------------------------------------------------------------

  function init() {
    el.btnGenerar.addEventListener("click", generarPlanilla);
    el.btnLimpiar.addEventListener("click", limpiarFormulario);
    el.btnImprimir.addEventListener("click", imprimirPlanilla);

    el.tamanioPapel.addEventListener("change", actualizarEstiloPagina);
    actualizarEstiloPagina(); // aplica el tamaño por defecto (A4) al cargar

    botonesPreset.forEach((btn) => {
      btn.addEventListener("click", () => aplicarPreset(btn.dataset.preset));
    });

    [el.horarioEntradaGlobal, el.horarioSalidaGlobal].forEach((input) => {
      input.addEventListener("blur", function () {
        if (!horaEsValida(input.value)) {
          mostrarMensaje("El formato de hora debe ser HH:MM.", "error");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
